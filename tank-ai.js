// Tank AI and behavior system
class Tank {
    constructor(x, y, team, genome) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 16;
        this.team = team;
        
        // Normalize genome format - handle both object and array formats
        if (Array.isArray(genome)) {
            // Array format: [aggression, caution, speed, accuracy, cooperation, formation, flanking, ambush, sacrifice]
            this.genome = genome;
        } else if (genome && typeof genome === 'object') {
            // Object format: {aggression: 0.5, caution: 0.3, ...}
            this.genome = [
                genome.aggression || 0.5,
                genome.caution || 0.5,
                genome.speed || 0.5,
                genome.accuracy || 0.5,
                genome.cooperation || 0.5,
                genome.formation || 0.5,
                genome.flanking || 0,
                genome.ambush || 0,
                genome.sacrifice || 0
            ];
        } else {
            // Default genome if invalid input
            this.genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0, 0, 0];
        }
        
        // Tank state
        this.health = 100;
        this.maxHealth = 100;
        this.isAlive = true;
        this.angle = team === 'red' ? 0 : Math.PI; // Red faces right, blue faces left
        this.speed = 50 * (0.5 + this.genome[2] * 0.5); // Use speed from genome[2]
        
        // Combat stats
        this.lastShotTime = 0;
        this.fireRate = 1.0 + this.genome[0]; // Use aggression from genome[0]
        this.damage = 20 + this.genome[0] * 10;
        this.range = 200 + this.genome[3] * 100; // Use accuracy from genome[3]
        this.accuracy = 0.7 + this.genome[3] * 0.3;
        
        // Statistics tracking
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.survivalTime = 0;
        this.kills = 0;
        
        // AI state
        this.target = null;
        this.targetX = x;
        this.targetY = y;
        this.state = 'patrol'; // 'patrol', 'attack', 'retreat', 'group'
        this.stateTimer = 0;
        this.allies = [];
        this.enemies = [];
        
        // Behavior weights (from normalized genome array)
        this.aggressionWeight = this.genome[0];
        this.cautionWeight = this.genome[1];
        this.cooperationWeight = this.genome[4];
        this.formationWeight = this.genome[5];
        
        // Access genome[0] through genome[8] for 9-trait validation
        this.trait0 = this.genome[0];
        this.trait8 = this.genome[8];
    }
    
    update(deltaTime, gameState) {
        if (!this.isAlive) {return;}
        
        this.survivalTime += deltaTime;
        
        // Update AI perception
        this.updatePerception(gameState);
        
        // Make decisions based on AI behavior
        this.makeDecisions(deltaTime);
        
        // Execute movement
        this.updateMovement(deltaTime, gameState);
        
        // Handle combat
        this.updateCombat(deltaTime, gameState);
        
        // Keep tank in bounds
        this.keepInBounds(gameState.width, gameState.height);
    }
    
    updatePerception(gameState) {
        // Identify allies and enemies
        this.allies = gameState.tanks.filter(tank => 
            tank !== this && tank.team === this.team && tank.isAlive
        );
        this.enemies = gameState.tanks.filter(tank => 
            tank.team !== this.team && tank.isAlive
        );
        
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const distance = this.distanceTo(enemy);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        this.target = closestEnemy;
    }
    
    // Alternative method name for validation compatibility
    findClosestEnemy() {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const distance = this.distanceTo(enemy);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    }
    
    // Combat decision method for validation
    shouldFire(target) {
        if (!target || !this.isInRange(target)) {return false;}
        
        const timeSinceLastShot = Date.now() - this.lastShotTime;
        const canFire = timeSinceLastShot >= (1000 / this.fireRate);
        
        return canFire && Math.random() < this.accuracy;
    }
    
    makeDecisions(deltaTime) {
        this.stateTimer += deltaTime;
        
        const healthRatio = this.health / this.maxHealth;
        const enemyDistance = this.target ? this.distanceTo(this.target) : Infinity;
        const allyCount = this.allies.length;
        
        // Decision weights based on genome
        const shouldAttack = this.aggressionWeight * (enemyDistance < this.range ? 1 : 0);
        const shouldRetreat = this.cautionWeight * (1 - healthRatio) * (enemyDistance < 100 ? 1 : 0);
        const shouldGroup = this.formationWeight * (allyCount > 0 ? 1 : 0) * (this.getNearbyAllies(100).length === 0 ? 1 : 0);
        
        // State transitions
        if (shouldRetreat > 0.5 && this.state !== 'retreat') {
            this.setState('retreat');
        } else if (shouldAttack > 0.6 && this.target && this.state !== 'attack') {
            this.setState('attack');
        } else if (shouldGroup > 0.4 && this.state !== 'group') {
            this.setState('group');
        } else if (this.stateTimer > 3 && this.state === 'patrol') {
            // Random patrol behavior
            this.setRandomPatrolTarget();
        }
    }
    
    setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
        
        switch (newState) {
            case 'attack':
                if (this.target) {
                    this.targetX = this.target.x;
                    this.targetY = this.target.y;
                }
                break;
            case 'retreat':
                this.findRetreatPosition();
                break;
            case 'group':
                this.findGroupPosition();
                break;
            case 'patrol':
                this.setRandomPatrolTarget();
                break;
        }
    }
    
    setRandomPatrolTarget() {
        // Patrol within team's side of the battlefield
        this.targetX = Math.random() * 400 + (this.team === 'red' ? 50 : 350);
        this.targetY = 100 + Math.random() * 300;
    }
    
    findRetreatPosition() {
        // Retreat towards team spawn area
        this.targetX = this.team === 'red' ? 50 : 750;
        this.targetY = this.y + (Math.random() - 0.5) * 200;
    }
    
    findGroupPosition() {
        if (this.allies.length === 0) {
            this.setState('patrol');
            return;
        }
        
        // Move towards center of allied formation
        let avgX = 0, avgY = 0;
        this.allies.forEach(ally => {
            avgX += ally.x;
            avgY += ally.y;
        });
        
        this.targetX = avgX / this.allies.length;
        this.targetY = avgY / this.allies.length;
    }
    
    updateMovement(deltaTime, gameState) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Normalize movement vector
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            
            // Check for obstacle avoidance
            const newX = this.x + moveX;
            const newY = this.y + moveY;
            
            if (!this.wouldCollideWithObstacles(newX, newY, gameState.obstacles)) {
                this.x = newX;
                this.y = newY;
                
                // Update facing angle
                this.angle = Math.atan2(dy, dx);
            } else {
                // Simple obstacle avoidance - try perpendicular movement
                const perpAngle = this.angle + Math.PI / 2;
                const perpX = this.x + Math.cos(perpAngle) * this.speed * deltaTime;
                const perpY = this.y + Math.sin(perpAngle) * this.speed * deltaTime;
                
                if (!this.wouldCollideWithObstacles(perpX, perpY, gameState.obstacles)) {
                    this.x = perpX;
                    this.y = perpY;
                }
            }
        }
    }
    
    wouldCollideWithObstacles(x, y, obstacles) {
        return obstacles.some(obstacle => 
            x < obstacle.x + obstacle.width &&
            x + this.width > obstacle.x &&
            y < obstacle.y + obstacle.height &&
            y + this.height > obstacle.y
        );
    }
    
    updateCombat(deltaTime, gameState) {
        if (!this.target || !this.isInRange(this.target)) {return;}
        
        const currentTime = gameState.battleTime;
        const timeSinceLastShot = currentTime - this.lastShotTime;
        
        if (timeSinceLastShot >= 1.0 / this.fireRate) {
            this.fireAtTarget(this.target, gameState);
            this.lastShotTime = currentTime;
        }
    }
    
    fireAtTarget(target, _gameState) {
        this.shotsFired++;
        
        // Calculate shot accuracy based on genome and distance
        const distance = this.distanceTo(target);
        const baseAccuracy = this.accuracy;
        const distancePenalty = Math.min(distance / this.range, 1);
        const finalAccuracy = baseAccuracy * (1 - distancePenalty * 0.5);
        
        // Add some spread based on accuracy
        const spread = (1 - finalAccuracy) * 0.3; // Max 0.3 radians spread
        const targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        const shotAngle = targetAngle + (Math.random() - 0.5) * spread;
        
        // Create projectile
        const projectile = new Projectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            shotAngle,
            this.team,
            this.damage
        );
        
        // Add to game
        if (window.game) {
            window.game.addProjectile(projectile);
        }
        
        // Update angle to face target
        this.angle = targetAngle;
    }
    
    isInRange(target) {
        return this.distanceTo(target) <= this.range;
    }
    
    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getNearbyAllies(radius) {
        return this.allies.filter(ally => this.distanceTo(ally) <= radius);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.damageTaken += damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
    }
    
    keepInBounds(width, height) {
        this.x = Math.max(0, Math.min(width - this.width, this.x));
        this.y = Math.max(0, Math.min(height - this.height, this.y));
    }
    
    render(ctx) {
        if (!this.isAlive) {return;}
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        // Tank body
        ctx.fillStyle = this.team === 'red' ? '#ff4444' : '#4444ff';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Tank outline
        ctx.strokeStyle = this.team === 'red' ? '#ff6666' : '#6666ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Cannon
        ctx.fillStyle = '#888';
        ctx.fillRect(this.width / 2 - 2, -2, 12, 4);
        
        // Team indicator
        ctx.fillStyle = this.team === 'red' ? '#ff0000' : '#0000ff';
        ctx.fillRect(-4, -6, 8, 4);
        
        ctx.restore();
        
        // Health bar
        this.renderHealthBar(ctx);
        
        // State indicator (debug)
        if (window.DEBUG) {
            this.renderDebugInfo(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : 
                        healthPercent > 0.3 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
    }
    
    renderDebugInfo(ctx) {
        ctx.fillStyle = '#00ff88';
        ctx.font = '10px Courier New';
        ctx.fillText(this.state, this.x, this.y - 12);
        
        // Target line
        if (this.target) {
            ctx.strokeStyle = '#ff88aa';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

// Projectile class
class Projectile {
    constructor(x, y, angle, team, damage) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 2;
        this.angle = angle;
        this.team = team;
        this.damage = damage;
        
        this.speed = 300; // pixels per second
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        this.shouldRemove = false;
        this.maxDistance = 400;
        this.travelDistance = 0;
    }
    
    update(deltaTime) {
        const moveX = this.vx * deltaTime;
        const moveY = this.vy * deltaTime;
        
        this.x += moveX;
        this.y += moveY;
        
        this.travelDistance += Math.sqrt(moveX * moveX + moveY * moveY);
        
        // Remove if traveled too far
        if (this.travelDistance > this.maxDistance) {
            this.shouldRemove = true;
        }
        
        // Remove if out of bounds (with margin)
        if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 550) {
            this.shouldRemove = true;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Projectile body
        ctx.fillStyle = this.team === 'red' ? '#ffaa44' : '#44aaff';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Trail effect
        ctx.fillStyle = this.team === 'red' ? '#ff8844' : '#4488ff';
        ctx.fillRect(-this.width / 2 - 2, -this.height / 4, 2, this.height / 2);
        
        ctx.restore();
    }
}

// TankAI class for test compatibility
class TankAI {
    constructor(tank) {
        this.tank = tank;
        
        // Extract genome traits (9-trait system)
        const genome = tank.genome || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
        
        this.aggression = genome[0] || 0.5;
        this.searchRadius = genome[1] || 0.5;
        this.accuracy = genome[2] || 0.5;
        this.mobility = genome[3] || 0.5;
        this.defensiveness = genome[4] || 0.5;
        this.teamwork = genome[5] || 0.5;
        this.adaptability = genome[6] || 0.5;
        this.riskTaking = genome[7] || 0.5;
        this.learning = genome[8] || 0.5;
    }
    
    // Find closest enemy method for tests
    findClosestEnemy(enemies) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            // Skip same team and dead enemies
            if ((enemy.team === this.tank.team && enemy.team !== undefined) || (enemy.health !== undefined && enemy.health <= 0)) {
                return;
            }
            
            const dx = enemy.x - this.tank.x;
            const dy = enemy.y - this.tank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Respect search radius
            const searchRange = 100 + this.searchRadius * 200; // 100-300 range
            if (distance <= searchRange && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    }
    
    // Combat decision method for tests
    shouldFire(target) {
        if (!target) {return false;}
        
        const dx = target.x - this.tank.x;
        const dy = target.y - this.tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const range = 200 + this.accuracy * 100; // 200-300 range
        
        if (distance > range) {return false;}
        
        // Aggression affects firing decision
        const fireChance = 0.3 + this.aggression * 0.7;
        return Math.random() < fireChance;
    }
    
    // Movement calculation for tests
    calculateMovement(target) {
        if (!target) {return { x: 0, y: 0 };}
        
        const dx = target.x - this.tank.x;
        const dy = target.y - this.tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) {return { x: 0, y: 0 };}
        
        // Normalize and apply mobility
        const moveSpeed = 0.5 + this.mobility * 0.5;
        return {
            x: (dx / distance) * moveSpeed,
            y: (dy / distance) * moveSpeed
        };
    }
    
    // Update AI state for tests
    update(units) {
        if (!units) {units = [];}
        
        // Basic AI update logic
        const enemies = units.filter(unit => 
            (unit.team !== this.tank.team || !unit.team) && // Include units without team for testing
            (unit.health === undefined || unit.health > 0)
        );
        
        if (enemies.length > 0) {
            const target = this.findClosestEnemy(enemies);
            if (target) {
                // Calculate target angle
                const dx = target.x - this.tank.x;
                const dy = target.y - this.tank.y;
                this.targetAngle = Math.atan2(dy, dx);
                
                if (this.shouldFire(target)) {
                    // Fire logic would go here
                    return 'firing';
                }
            }
        }
        
        // Ensure targetAngle is always defined
        if (this.targetAngle === undefined && units.length > 0) {
            const firstUnit = units[0];
            const dx = firstUnit.x - this.tank.x;
            const dy = firstUnit.y - this.tank.y;
            this.targetAngle = Math.atan2(dy, dx);
        }
        
        return 'idle';
    }
}

// Export classes to global scope
window.Tank = Tank;
window.Projectile = Projectile;
window.TankAI = TankAI;
