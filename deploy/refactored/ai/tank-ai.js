/**
 * Tank AI Behavior System
 * Handles decision making, target selection, and state management
 * Separated from tank entity for better organization and testability
 */

class TankAI {
    constructor(tankEntity) {
        this.tank = tankEntity;
        this.perception = {
            visibleEnemies: [],
            nearbyAllies: [],
            obstacles: [],
            hill: null
        };
        
        // Decision making state
        this.decisionCooldown = 0;
        this.lastDecisionTime = 0;
        this.engagementRange = this.tank.range * 0.8; // Prefer to engage within 80% of max range
        
        // Movement and pathfinding
        this.pathfinding = {
            currentPath: [],
            pathIndex: 0,
            lastPathUpdate: 0,
            isPathBlocked: false
        };
    }
    
    /**
     * Update AI behavior
     */
    update(deltaTime, gameState) {
        if (!this.tank.isAlive) {
            return;
        }
        
        // Update perception
        this.updatePerception(gameState);
        
        // Make decisions based on current state and perception
        this.makeDecisions(deltaTime, gameState);
        
        // Update state timer
        this.tank.stateTimer += deltaTime;
    }
    
    /**
     * Update tank's perception of the environment
     */
    updatePerception(gameState) {
        const tanks = gameState.tanks || [];
        
        // Separate allies and enemies
        this.tank.allies = tanks.filter(tank => tank.team === this.tank.team && tank.isAlive && tank !== this.tank);
        this.tank.enemies = tanks.filter(tank => tank.team !== this.tank.team && tank.isAlive);
        
        // Find visible enemies (those with line of sight)
        this.perception.visibleEnemies = this.tank.enemies.filter(enemy => {
            const distance = this.tank.distanceTo(enemy);
            if (distance > this.tank.range) {
                return false;
            }
            return CollisionUtils.hasLineOfSight(this.tank, enemy, gameState.obstacles);
        });
        
        // Find nearby allies for coordination
        this.perception.nearbyAllies = this.tank.allies.filter(ally => {
            return this.tank.distanceTo(ally) < this.tank.range;
        });
        
        // Store reference to obstacles and hill
        this.perception.obstacles = gameState.obstacles || [];
        this.perception.hill = gameState.hill;
    }
    
    /**
     * Make AI decisions based on current state and perception
     * Decisions (state changes/targeting) run at lower frequency, but movement executes every frame
     */
    makeDecisions(deltaTime, gameState) {
        // Update decisions less frequently for performance
        this.decisionCooldown -= deltaTime;
        if (this.decisionCooldown <= 0) {
            this.decisionCooldown = 0.1; // Decide every 100ms
            const newState = this.chooseBehavior(gameState);
            this.tank.setState(newState);
            if (GAME_CONFIG.DEBUG && GAME_CONFIG.DEBUG.LOG_AI_DECISIONS) {
                // Debug logging removed for performance
            }
        }
        
        // Always execute behavior logic each frame for smooth movement
        switch (this.tank.state) {
            case TANK_STATES.PATROL:
                this.behaviorPatrol(deltaTime, gameState);
                break;
            case TANK_STATES.ATTACK:
                this.behaviorAttack(deltaTime, gameState);
                break;
            case TANK_STATES.RETREAT:
                this.behaviorRetreat(deltaTime, gameState);
                break;
            case TANK_STATES.GROUP:
                this.behaviorGroup(deltaTime, gameState);
                break;
            case TANK_STATES.SEEK_HILL:
                this.behaviorSeekHill(deltaTime, gameState);
                break;
            case TANK_STATES.DEFEND_HILL:
                this.behaviorDefendHill(deltaTime, gameState);
                break;
        }
    }
    
    /**
     * Choose the most appropriate behavior based on current situation
     */
    chooseBehavior(gameState) {
        const weights = this.tank.behaviorWeights;
        
        // Health-based decisions
        const healthPercent = this.tank.health / this.tank.maxHealth;
        if (healthPercent < 0.3 && weights.caution > 0.6) {
            return TANK_STATES.RETREAT;
        }
        
        // Enemy engagement decisions
        if (this.perception.visibleEnemies.length > 0) {
            const closestEnemy = this.findClosestEnemy();
            const distance = this.tank.distanceTo(closestEnemy);
            
            if (distance <= this.engagementRange) {
                return TANK_STATES.ATTACK;
            }
        }
        
        // King of the Hill decisions
        if (this.perception.hill && gameState.gameMode === 'king_of_hill') {
            const hillDistance = this.tank.distanceTo(this.perception.hill);
            const hillRadius = this.perception.hill.radius || 60;
            
            if (hillDistance <= hillRadius * 2) {
                if (weights.hillPriority > 0.5 || this.perception.hill.controllingTeam !== this.tank.team) {
                    return TANK_STATES.SEEK_HILL;
                } else {
                    return TANK_STATES.DEFEND_HILL;
                }
            }
        }
        
        // Cooperation decisions
        if (weights.cooperation > 0.6 && this.perception.nearbyAllies.length === 0) {
            return TANK_STATES.GROUP;
        }
        
        // Default to patrol if no specific behavior is needed
        return TANK_STATES.PATROL;
    }
    
    /**
     * Patrol behavior - move around looking for enemies or objectives
     */
    behaviorPatrol(deltaTime, gameState) {
        // Move towards a patrol point or explore the battlefield
        if (!this.hasValidMovementTarget()) {
            this.setPatrolTarget(gameState);
        }
        
        this.moveTowardsTarget(deltaTime);
        
        // Switch to attack if enemies are spotted
        if (this.perception.visibleEnemies.length > 0) {
            const closestEnemy = this.findClosestEnemy();
            this.tank.setTarget(closestEnemy);
        } else {
            // No enemies visible while patrolling; ensure no stale target
            this.tank.setTarget(null);
        }
    }
    
    /**
     * Attack behavior - engage visible enemies
     */
    behaviorAttack(deltaTime, gameState) {
        if (this.perception.visibleEnemies.length === 0) {
            this.tank.setTarget(null);
            return;
        }
        
        // Select best valid target
        let target = this.selectBestTarget();
        if (!target || !target.isAlive) {
            this.tank.setTarget(null);
            return;
        }
        
        // If target moved out of LOS/range, drop it
        const inRange = this.tank.distanceTo(target) <= this.tank.range;
        const hasLOS = CollisionUtils.hasLineOfSight(this.tank, target, gameState.obstacles);
        if (!inRange || !hasLOS) {
            this.tank.setTarget(null);
            return;
        }
        
        this.tank.setTarget(target);
        
        const distance = this.tank.distanceTo(target);
        // Move to optimal engagement range
        if (distance > this.engagementRange) {
            this.moveTowardsTarget(deltaTime, target);
        } else if (distance < this.engagementRange * 0.5 && this.tank.behaviorWeights.caution > 0.4) {
            this.moveAwayFromTarget(deltaTime, target);
        }
        
        // Aim and fire
        this.aimAtTarget(target);
    }
    
    /**
     * Retreat behavior - move away from danger
     */
    behaviorRetreat(deltaTime, gameState) {
        // Find safest direction to retreat
        const retreatTarget = this.findRetreatPosition(gameState);
        this.tank.targetX = retreatTarget.x;
        this.tank.targetY = retreatTarget.y;
        
        this.moveTowardsTarget(deltaTime);
        
        // Continue retreating until health improves or threat decreases
        const healthPercent = this.tank.health / this.tank.maxHealth;
        if (healthPercent > 0.5 && this.perception.visibleEnemies.length === 0) {
            // Can switch back to other behaviors
            this.tank.setState(TANK_STATES.PATROL);
        }
    }
    
    /**
     * Group behavior - move towards allies for coordination
     */
    behaviorGroup(deltaTime, _gameState) {
        if (this.perception.nearbyAllies.length > 0) {
            // Already grouped, switch to patrol
            this.tank.setState(TANK_STATES.PATROL);
            return;
        }
        
        // Move towards closest ally
        const closestAlly = this.findClosestAlly();
        if (closestAlly) {
            this.tank.targetX = closestAlly.x;
            this.tank.targetY = closestAlly.y;
            this.moveTowardsTarget(deltaTime);
        }
    }
    
    /**
     * Seek hill behavior - move towards the hill objective
     */
    behaviorSeekHill(deltaTime, _gameState) {
        if (!this.perception.hill) {
            this.tank.setState(TANK_STATES.PATROL);
            return;
        }
        
        this.tank.targetX = this.perception.hill.x;
        this.tank.targetY = this.perception.hill.y;
        this.moveTowardsTarget(deltaTime);
        
        // Switch to defend if we reach the hill
        const distance = this.tank.distanceTo(this.perception.hill);
        if (distance <= this.perception.hill.radius) {
            this.tank.setState(TANK_STATES.DEFEND_HILL);
        }
    }
    
    /**
     * Defend hill behavior - maintain position near hill and engage enemies
     */
    behaviorDefendHill(deltaTime, gameState) {
        if (!this.perception.hill) {
            this.tank.setState(TANK_STATES.PATROL);
            return;
        }
        
        // Stay near hill center
        const hillDistance = this.tank.distanceTo(this.perception.hill);
        if (hillDistance > this.perception.hill.radius * 1.5) {
            this.tank.targetX = this.perception.hill.x;
            this.tank.targetY = this.perception.hill.y;
            this.moveTowardsTarget(deltaTime);
        }
        
        // Engage enemies approaching the hill
        const enemiesNearHill = this.perception.visibleEnemies.filter(enemy => {
            return enemy.distanceTo ? enemy.distanceTo(this.perception.hill) < this.perception.hill.radius * 2 : false;
        });
        
        if (enemiesNearHill.length > 0) {
            let target = this.selectBestTarget(enemiesNearHill);
            if (!target || !target.isAlive) {
                this.tank.setTarget(null);
                return;
            }
            const inRange = this.tank.distanceTo(target) <= this.tank.range;
            const hasLOS = CollisionUtils.hasLineOfSight(this.tank, target, gameState.obstacles);
            if (!inRange || !hasLOS) {
                this.tank.setTarget(null);
                return;
            }
            this.tank.setTarget(target);
            this.aimAtTarget(target);
        } else {
            this.tank.setTarget(null);
        }
    }
    
    /**
     * Find the closest enemy tank
     */
    findClosestEnemy() {
        if (this.perception.visibleEnemies.length === 0) {
            return null;
        }
        
        return this.perception.visibleEnemies.reduce((closest, enemy) => {
            const distance = this.tank.distanceTo(enemy);
            const closestDistance = this.tank.distanceTo(closest);
            return distance < closestDistance ? enemy : closest;
        });
    }
    
    /**
     * Find the closest ally tank
     */
    findClosestAlly() {
        if (this.tank.allies.length === 0) {
            return null;
        }
        
        return this.tank.allies.reduce((closest, ally) => {
            const distance = this.tank.distanceTo(ally);
            const closestDistance = this.tank.distanceTo(closest);
            return distance < closestDistance ? ally : closest;
        });
    }
    
    /**
     * Select the best target from available enemies
     */
    selectBestTarget(enemies = this.perception.visibleEnemies) {
        if (enemies.length === 0) {
            return null;
        }
        
        // Score targets based on multiple factors
        const scoredTargets = enemies.map(enemy => {
            const distance = this.tank.distanceTo(enemy);
            const healthPercent = enemy.health / enemy.maxHealth;
            
            // Prefer closer, weaker enemies
            const distanceScore = 1.0 - (distance / this.tank.range);
            const healthScore = 1.0 - healthPercent;
            
            return {
                enemy,
                score: distanceScore * 0.6 + healthScore * 0.4
            };
        });
        
        // Return highest scored target
        return scoredTargets.reduce((best, current) => {
            return current.score > best.score ? current : best;
        }).enemy;
    }
    
    /**
     * Move towards current target position
     */
    moveTowardsTarget(deltaTime, target = null) {
        const targetX = target ? target.x : this.tank.targetX;
        const targetY = target ? target.y : this.tank.targetY;
        
        const dx = targetX - this.tank.x;
        const dy = targetY - this.tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) { // Don't move if very close to target
            const moveX = (dx / distance) * this.tank.speed * deltaTime;
            const moveY = (dy / distance) * this.tank.speed * deltaTime;
            
            const oldX = this.tank.x;
            const oldY = this.tank.y;
            
            // Calculate new position
            const newX = this.tank.x + moveX;
            const newY = this.tank.y + moveY;
            
            // Check for collisions with obstacles using top-left coordinates
            // TankEntity.x/y are top-left; keep consistency with rendering and bounds checks
            const tankBounds = {
                x: newX,
                y: newY,
                width: this.tank.width,
                height: this.tank.height
            };
            
            // Check if new position would collide with any obstacles
            let collision = false;
            if (this.perception.obstacles) {
                for (const obstacle of this.perception.obstacles) {
                    if (CollisionUtils.isColliding(tankBounds, obstacle)) {
                        collision = true;
                        break;
                    }
                }
            }
            
            // Only move if no collision
            if (!collision) {
                this.tank.x = newX;
                this.tank.y = newY;
                this.tank.angle = Math.atan2(dy, dx);
                
                // Update entity position to match AI changes
                // this.tank is the TankEntity already; no nested entity exists in this context
                // Ensure spawn positions remain for battle start detection
                // No changes to spawnX/spawnY here
                
                // Debug logging removed for performance
                // Debug logging removed for performance
            } else {
                // Debug logging removed for performance
                // Try to find alternate path around obstacle
                this.findAlternatePath(targetX, targetY);
            }
        }
    }
    
    /**
     * Move away from target (retreat movement)
     */
    moveAwayFromTarget(deltaTime, target) {
        const dx = this.tank.x - target.x;
        const dy = this.tank.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveX = (dx / distance) * this.tank.speed * deltaTime;
            const moveY = (dy / distance) * this.tank.speed * deltaTime;
            
            this.tank.x += moveX;
            this.tank.y += moveY;
            this.tank.angle = Math.atan2(dy, dx);
        }
    }
    
    /**
     * Aim tank towards target
     */
    aimAtTarget(target) {
        if (!target || !target.isAlive) {
            this.tank.setTarget(null);
            return;
        }
        this.tank.angle = this.tank.angleTo(target);
    }
    
    /**
     * Find a safe retreat position
     */
    findRetreatPosition(gameState) {
        // Move away from enemies towards battlefield edge
        const enemies = this.perception.visibleEnemies;
        if (enemies.length === 0) {
            // Just move to center if no enemies visible
            return {
                x: gameState.width / 2,
                y: gameState.height / 2
            };
        }
        
        // Calculate average enemy position
        const avgEnemyX = enemies.reduce((sum, enemy) => sum + enemy.x, 0) / enemies.length;
        const avgEnemyY = enemies.reduce((sum, enemy) => sum + enemy.y, 0) / enemies.length;
        
        // Move in opposite direction
        const dx = this.tank.x - avgEnemyX;
        const dy = this.tank.y - avgEnemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const retreatDistance = 200; // Move 200 pixels away
            return {
                x: MathUtils.clamp(this.tank.x + (dx / distance) * retreatDistance, 0, gameState.width),
                y: MathUtils.clamp(this.tank.y + (dy / distance) * retreatDistance, 0, gameState.height)
            };
        }
        
        return { x: this.tank.x, y: this.tank.y };
    }
    
    /**
     * Set a new patrol target
     */
    setPatrolTarget(gameState) {
        // Generate a random patrol point, but prefer areas with tactical value
        if (this.perception.hill && Math.random() < this.tank.behaviorWeights.objectiveFocus) {
            // Patrol around the hill
            const angle = Math.random() * Math.PI * 2;
            const distance = this.perception.hill.radius * (2 + Math.random() * 2);
            this.tank.targetX = this.perception.hill.x + Math.cos(angle) * distance;
            this.tank.targetY = this.perception.hill.y + Math.sin(angle) * distance;
        } else {
            // Random patrol point
            this.tank.targetX = Math.random() * gameState.width;
            this.tank.targetY = Math.random() * gameState.height;
        }
        
        // Ensure target is within bounds
        this.tank.targetX = MathUtils.clamp(this.tank.targetX, 50, gameState.width - 50);
        this.tank.targetY = MathUtils.clamp(this.tank.targetY, 50, gameState.height - 50);
    }
    
    /**
     * Check if tank has a valid movement target
     */
    hasValidMovementTarget() {
        const distance = MathUtils.distance(this.tank.x, this.tank.y, this.tank.targetX, this.tank.targetY);
        return distance > 20; // Target is far enough to be worth moving towards
    }
    
    /**
     * Find alternate path around obstacles
     */
    findAlternatePath(targetX, targetY) {
        // Simple pathfinding: try moving perpendicular to blocked direction
        const dx = targetX - this.tank.x;
        const dy = targetY - this.tank.y;
        
        // Try perpendicular directions
        const perpX1 = this.tank.x - dy * 0.1; // 90 degrees
        const perpY1 = this.tank.y + dx * 0.1;
        const perpX2 = this.tank.x + dy * 0.1; // -90 degrees
        const perpY2 = this.tank.y - dx * 0.1;
        
        // Choose the perpendicular direction that's closer to the target
        const dist1 = Math.sqrt((perpX1 - targetX) ** 2 + (perpY1 - targetY) ** 2);
        const dist2 = Math.sqrt((perpX2 - targetX) ** 2 + (perpY2 - targetY) ** 2);
        
        if (dist1 < dist2) {
            this.tank.targetX = perpX1;
            this.tank.targetY = perpY1;
        } else {
            this.tank.targetX = perpX2;
            this.tank.targetY = perpY2;
        }
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TankAI };
} else {
    window.TankAI = TankAI;
}
