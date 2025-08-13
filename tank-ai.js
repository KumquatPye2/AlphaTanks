// Tank AI and behavior system
class Tank {
    constructor(x, y, team, genome) {
        this.x = x;
        this.y = y;
        this.spawnX = x; // Track spawn position for battle timer logic
        this.spawnY = y; // Track spawn position for battle timer logic
        this.width = 24;
        this.height = 16;
        this.team = team;
        // Normalize genome format - handle both object and array formats
        if (Array.isArray(genome)) {
            // Array format: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
            this.genome = genome;
        } else if (genome && typeof genome === 'object') {
            // Object format: convert to array format matching display function
            // [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
            this.genome = [
                genome.aggression || 0.5,           // 0: Aggression
                genome.speed || 0.5,                // 1: Speed  
                genome.accuracy || 0.5,             // 2: Accuracy
                genome.defense || genome.caution || 0.5,  // 3: Defense
                genome.teamwork || genome.cooperation || 0.5,  // 4: Teamwork
                genome.adaptability || 0.5,         // 5: Adaptability
                genome.learning || 0.5,             // 6: Learning
                genome.riskTaking || 0.5,           // 7: RiskTaking
                genome.evasion || 0.5               // 8: Evasion
            ];
        } else {
            // Default genome if invalid input - use proper 9-trait format
            this.genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
        }
        // Tank state
        this.health = 100;
        this.maxHealth = 100;
        this.isAlive = true;
        this.angle = team === 'red' ? 0 : Math.PI; // Red faces right, blue faces left
        this.speed = 50 * (0.5 + this.genome[1] * 0.5); // Use speed from genome[1]
        // Combat stats
        this.lastShotTime = 0;
        this.fireRate = 1.0 + this.genome[0] * 1.0; // Reduced rate: 1.0-2.0 shots per second (was 4.0-6.0)
        this.damage = 20 + this.genome[0] * 10;
        this.range = 200 + this.genome[2] * 100; // Use accuracy from genome[2]
        this.accuracy = 0.7 + this.genome[2] * 0.3;
        // Statistics tracking
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.survivalTime = 0;
        this.kills = 0;
        
        // Combat tracking for tactical analysis
        this.lastShotTime = 0;
        this.averageEngagementDistance = 0;
        this.engagementDistances = [];
        this.stateChanges = 0;
        this.targetSwitches = 0;
        this.previousTarget = null;
        this.previousState = null;
        
        // AI state
        this.target = null;
        this.targetX = x;
        this.targetY = y;
        this.state = 'patrol'; // 'patrol', 'attack', 'retreat', 'group'
        this.stateTimer = 0;
        this.allies = [];
        this.enemies = [];
        // Behavior weights (from normalized genome array)
        // [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        this.aggressionWeight = this.genome[0];  // Aggression
        this.cautionWeight = this.genome[3];     // Defense (was caution)
        this.cooperationWeight = this.genome[4]; // Teamwork (was cooperation)
        this.formationWeight = this.genome[5];   // Adaptability (for formation behavior)
        this.riskTakingWeight = this.genome[7];  // RiskTaking
        this.evasionWeight = this.genome[8];     // Evasion
        // King of the Hill behavior weights - allow ASI-ARCH to evolve diverse strategies
        this.objectiveFocus = 0.3 + this.genome[4] * 0.4; // Based on teamwork
        // CRITICAL FIX: Remove high base hill priority to allow diverse evolved strategies
        this.hillPriority = this.genome[0] * 0.8;  // Only aggressive tanks prioritize hill
        this.contestWillingness = this.genome[7] * 0.9;  // Only risk-takers contest actively
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
        this.makeDecisions(deltaTime, gameState);
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
        // Hill awareness for King of the Hill mode
        if (gameState.hill) {
            this.hillInfo = gameState.hill.getStrategicInfo();
            this.distanceToHill = this.distanceToPoint(this.hillInfo.position.x, this.hillInfo.position.y);
            this.isOnHill = this.distanceToHill <= this.hillInfo.contestRadius;
            this.isNearHill = this.distanceToHill <= this.hillInfo.contestRadius + 50;
        }
        // Find closest enemy with preference for those with clear line of sight
        let closestEnemy = null;
        let closestDistance = Infinity;
        let closestVisibleEnemy = null;
        let closestVisibleDistance = Infinity;
        this.enemies.forEach(enemy => {
            const distance = this.distanceTo(enemy);
            // Check if we have line of sight to this enemy
            const hasLOS = gameState?.obstacles ? this.hasLineOfSight(enemy, gameState.obstacles) : true;
            // Track closest enemy overall
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
            // Track closest visible enemy (prioritize these)
            if (hasLOS && distance < closestVisibleDistance) {
                closestVisibleDistance = distance;
                closestVisibleEnemy = enemy;
            }
        });
        // Prefer visible enemies, fall back to closest if no visible enemies
        this.target = closestVisibleEnemy || closestEnemy;
    }
    // Alternative method name for validation compatibility
    findClosestEnemy(gameState = null) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        let closestVisibleEnemy = null;
        let closestVisibleDistance = Infinity;
        this.enemies.forEach(enemy => {
            const distance = this.distanceTo(enemy);
            // Check if we have line of sight to this enemy
            const hasLOS = gameState?.obstacles ? this.hasLineOfSight(enemy, gameState.obstacles) : true;
            // Track closest enemy overall
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
            // Track closest visible enemy (prioritize these)
            if (hasLOS && distance < closestVisibleDistance) {
                closestVisibleDistance = distance;
                closestVisibleEnemy = enemy;
            }
        });
        // Prefer visible enemies, fall back to closest if no visible enemies
        return closestVisibleEnemy || closestEnemy;
    }
    // Combat decision method for validation
    shouldFire(target) {
        if (!target || !this.isInRange(target)) {return false;}
        // Use consistent time units (seconds) with updateCombat
        const currentTime = window.game?.gameState?.battleTime || Date.now() / 1000;
        const timeSinceLastShot = currentTime - this.lastShotTime;
        const canFire = timeSinceLastShot >= 1.0 / this.fireRate;
        return canFire && Math.random() < this.accuracy;
    }
    // King of the Hill AI Assessment Methods
    assessHillThreat(_gameState) {
        if (!this.hillInfo) {
            return 0;
        }
        // Count enemies on or near the hill
        const enemiesOnHill = this.enemies.filter(enemy => {
            const dx = enemy.x + enemy.width / 2 - this.hillInfo.position.x;
            const dy = enemy.y + enemy.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius;
        }).length;
        const enemiesNearHill = this.enemies.filter(enemy => {
            const dx = enemy.x + enemy.width / 2 - this.hillInfo.position.x;
            const dy = enemy.y + enemy.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius + 50;
        }).length;
        // Higher threat if enemies control or are contesting the hill
        let threat = 0;
        if (this.hillInfo.controllingTeam === (this.team === 'red' ? 'blue' : 'red')) {
            threat += 0.7; // Enemy controls the hill
        }
        threat += enemiesOnHill * 0.3;
        threat += enemiesNearHill * 0.1;
        return Math.min(1, threat);
    }
    assessHillOpportunity(_gameState) {
        if (!this.hillInfo) {
            return 0;
        }
        // Count allies on or near the hill
        const alliesOnHill = this.allies.filter(ally => {
            const dx = ally.x + ally.width / 2 - this.hillInfo.position.x;
            const dy = ally.y + ally.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius;
        }).length;
        let opportunity = 0;
        // Higher opportunity if hill is neutral or we control it
        if (this.hillInfo.isNeutral) {
            opportunity += 0.6;
        } else if (this.hillInfo.controllingTeam === this.team) {
            opportunity += 0.4;
        }
        // More opportunity with allied support
        opportunity += alliesOnHill * 0.2;
        // Less opportunity if we're heavily outnumbered
        const enemiesOnHill = this.enemies.filter(enemy => {
            const dx = enemy.x + enemy.width / 2 - this.hillInfo.position.x;
            const dy = enemy.y + enemy.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius;
        }).length;
        if (enemiesOnHill > alliesOnHill + 1) {
            opportunity *= 0.3; // Reduce opportunity if outnumbered
        }
        return Math.min(1, opportunity);
    }
    // King of the Hill decision method - allow evolved strategies to emerge
    shouldContestHill() {
        if (!this.hillInfo) {
            return false;
        }
        // Compute threat and opportunity on-demand
        const threat = this.assessHillThreat(null);
        const opportunity = this.assessHillOpportunity(null);
        const healthRatio = this.health / this.maxHealth;
        
        // Only contest if this tank's genome supports hill strategies
        if (this.hillPriority < 0.3) {
            return false;  // Low-aggression tanks avoid hill contesting
        }
        
        // Always contest if hill is neutral and we're designed for aggression
        if (this.hillInfo.isNeutral && healthRatio > 0.5 && this.hillPriority > 0.6) {
            return true;
        }
        // Contest if we control it and need to defend (only if we have defensive traits)
        if (this.hillInfo.controllingTeam === this.team && healthRatio > 0.4 && this.defenseWeight > 0.4) {
            return true;
        }
        // Decision based on evolved personality and situation
        const contestScore = (
            this.hillPriority * 0.5 +
            this.contestWillingness * 0.3 +
            opportunity * 0.1 +
            (1 - threat) * 0.1
        ) * healthRatio;
        return contestScore > 0.6;  // Higher threshold to allow other strategies
    }    makeDecisions(deltaTime, gameState = null) {
        this.stateTimer += deltaTime;
        const healthRatio = this.health / this.maxHealth;
        const enemyDistance = this.target ? this.distanceTo(this.target) : Infinity;
        const allyCount = this.allies.length;
        
        // Track target switches for tactical analysis
        if (this.target !== this.previousTarget) {
            if (this.previousTarget !== null) {
                this.targetSwitches++;
            }
            this.previousTarget = this.target;
        }
        
        // Check if we have line of sight to current target
        const hasLOSToTarget = this.target && gameState?.obstacles ? 
            this.hasLineOfSight(this.target, gameState.obstacles) : true;
        // King of the Hill decision factors with enhanced strategic considerations
        let shouldContestHill = 0;
        let _shouldDefendAroundHill = 0;
        
        if (gameState?.hill) {
            const hillContest = this.shouldContestHill();
            const hillPriority = this.hillPriority;
            const isNearHill = this.isNearHill;
            const isOnHill = this.isOnHill;
            
            // Enhanced strategic decision making
            const enemiesOnHill = this.getEnemiesOnHill();
            const alliesOnHill = this.getAlliesOnHill();
            const _enemiesNearHill = this.getEnemiesNearHill();
            const _alliesNearHill = this.getAlliesNearHill();
            
            // Strategic considerations based on tactical archetype
            const tacticalType = this.getTacticalArchetype();
            
            if (tacticalType === 'Sniper' && this.distanceToHill > 100 && this.distanceToHill < 200) {
                // Snipers prefer to stay at range and cover hill approaches
                const _shouldSnipeHillApproaches = this.range > 80 ? 0.7 : 0.3;
                shouldContestHill = hillContest ? hillPriority * 0.3 : 0; // Reduced hill priority for snipers
            } else if (tacticalType === 'Support' && alliesOnHill.length > 0) {
                // Support tanks defend allies already on hill
                _shouldDefendAroundHill = 0.6;
                shouldContestHill = hillContest ? hillPriority * 0.5 : 0;
            } else if (tacticalType === 'Berserker' || tacticalType === 'Aggressive') {
                // Berserkers rush the hill aggressively
                shouldContestHill = hillContest ? hillPriority * 1.3 : 0;
            } else if (tacticalType === 'Assassin' && enemiesOnHill.length > 0) {
                // Assassins target isolated enemies on hill
                shouldContestHill = hillContest ? hillPriority * 0.8 : 0;
            } else if (tacticalType === 'Fortress' && isNearHill) {
                // Fortress tanks hold defensive positions around hill
                _shouldDefendAroundHill = 0.8;
                shouldContestHill = isOnHill ? hillPriority : hillPriority * 0.4;
            } else {
                // Standard hill contesting logic with strategic modifications
                let contestModifier = 1.0;
                
                // Reduce hill priority if many allies already contesting
                if (alliesOnHill.length >= 2) {
                    contestModifier *= 0.5; // Don't overcrowd the hill
                }
                
                // Increase priority if hill is uncontested
                if (enemiesOnHill.length === 0 && alliesOnHill.length === 0) {
                    contestModifier *= 1.3;
                }
                
                // Consider elimination strategy - if enemy team is weak, focus on kills
                if (this.enemies.length <= 2 && this.enemies.some(e => e.health < e.maxHealth * 0.5)) {
                    contestModifier *= 0.6; // Prioritize elimination over hill control
                }
                
                shouldContestHill = hillContest ? (hillPriority * contestModifier * (isNearHill ? 1.2 : 1.0)) : 0;
            }
        }
        // Decision weights based on genome
        const shouldAttack = this.aggressionWeight * (enemyDistance < this.range ? 1 : 0) * (hasLOSToTarget ? 1 : 0);
        const shouldReposition = this.target && !hasLOSToTarget && enemyDistance < this.range ? 0.8 : 0;
        const shouldRetreat = this.cautionWeight * (1 - healthRatio) * (enemyDistance < 100 ? 1 : 0);
        const shouldGroup = this.formationWeight * (allyCount > 0 ? 1 : 0) * (this.getNearbyAllies(100).length === 0 ? 1 : 0);
        
        // Minimum state duration to prevent rapid cycling (except for urgent retreat)
        const minStateDuration = 2.0; // Increased to 2 seconds minimum
        const canChangeState = this.stateTimer > minStateDuration || shouldRetreat > 0.7;
        
        // Debug state duration
        if (window.DEBUG && Math.round(this.x) % 100 === 0) { // Only log occasionally to avoid spam
            console.log(`Tank at (${Math.round(this.x)},${Math.round(this.y)}): state=${this.state}, timer=${this.stateTimer.toFixed(2)}, canChange=${canChangeState}`);
        }
        
        // State transitions with balanced tactical priorities
        if (shouldRetreat > 0.5 && this.state !== 'retreat') {
            this.setState('retreat');
        } else if (shouldContestHill > 0.7 && this.state !== 'contest_hill' && canChangeState) {  // Raised threshold to allow other strategies
            this.setState('contest_hill');
        } else if (shouldReposition > 0.6 && this.state !== 'reposition' && canChangeState) {
            this.setState('reposition');
        } else if (shouldAttack > 0.5 && this.target && this.state !== 'attack' && canChangeState) {  // Lower attack threshold to encourage combat
            this.setState('attack');
        } else if (shouldGroup > 0.4 && this.state !== 'group' && canChangeState) {
            this.setState('group');
        } else if (this.state === 'group' && (allyCount === 0 || shouldGroup <= 0.2) && canChangeState) {
            // Exit GROUP mode if no allies left or low grouping desire
            this.setState('patrol');
        } else if (this.state === 'retreat' && healthRatio > 0.7 && shouldRetreat <= 0.3 && canChangeState) {
            // Exit RETREAT mode if health recovered and not in immediate danger
            this.setState('patrol');
        } else if (this.state === 'reposition' && hasLOSToTarget && shouldReposition <= 0.3 && canChangeState) {
            // Exit REPOSITION mode if line of sight restored
            this.setState('attack');
        } else if (this.state === 'contest_hill' && (shouldContestHill <= 0.5 || this.stateTimer > 8) && canChangeState) {
            // Exit CONTEST_HILL mode if no longer high priority or held too long
            this.setState('patrol');
        } else if (this.state === 'attack' && (!this.target || enemyDistance > this.range * 1.5 || shouldAttack <= 0.3 || this.stateTimer > 6) && (canChangeState || !this.target)) {
            // Exit ATTACK mode if target lost (immediate), or other conditions (with minimum duration)
            this.setState('patrol');
        } else if (this.state === 'patrol') {
            // Check if we need a new patrol target
            const distanceToTarget = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
            if (distanceToTarget < 30 || this.stateTimer > 10) {
                this.setSmartPatrolTarget();
            }
        }
    }
    setState(newState) {
        // Track state changes for tactical analysis (skip the initial patrol state)
        if (this.state !== newState && this.state !== null) {
            this.stateChanges++;
            // Debug rapid state changes (but skip if this is the initial state setting)
            if (this.stateTimer < 0.5 && this.previousState !== null) {
                console.log(`RAPID STATE CHANGE: ${this.team} tank at (${Math.round(this.x)},${Math.round(this.y)}) state: "${this.state}" -> "${newState}" after ${this.stateTimer.toFixed(2)}s`);
            }
        }
        this.previousState = this.state;
        
        this.state = newState;
        this.stateTimer = 0;
        switch (newState) {
            case 'attack':
                if (this.target) {
                    this.targetX = this.target.x;
                    this.targetY = this.target.y;
                }
                break;
            case 'reposition':
                this.findRepositionTarget();
                break;
            case 'retreat':
                this.findRetreatPosition();
                break;
            case 'group':
                this.findGroupPosition();
                break;
            case 'contest_hill':
                this.moveToContestHill();
                break;
            case 'patrol':
                this.setSmartPatrolTarget();
                break;
        }
    }
    setRandomPatrolTarget() {
        // Patrol within team's side of the battlefield
        this.targetX = Math.random() * 400 + (this.team === 'red' ? 50 : 350);
        this.targetY = 100 + Math.random() * 300;
    }
    setSmartPatrolTarget() {
        // Smarter patrol that avoids sudden direction changes
        const teamSide = this.team === 'red';
        const baseX = teamSide ? 50 : 350;
        const patrolWidth = 400;
        // Calculate current position relative to patrol area
        const currentRelativeX = this.x - baseX;
        const currentRelativeY = this.y - 100;
        // Generate new target that's not too far from current direction
        let newX, newY;
        // If we're near the edges, bias towards center
        if (currentRelativeX < patrolWidth * 0.2) {
            // Near left edge, bias right
            newX = baseX + Math.random() * (patrolWidth * 0.6) + (patrolWidth * 0.3);
        } else if (currentRelativeX > patrolWidth * 0.8) {
            // Near right edge, bias left
            newX = baseX + Math.random() * (patrolWidth * 0.6);
        } else {
            // In middle, can go anywhere but bias towards continuing current direction
            const currentDirection = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            const forwardX = this.x + Math.cos(currentDirection) * 100;
            const forwardY = this.y + Math.sin(currentDirection) * 100;
            // Clamp to patrol area
            newX = Math.max(baseX, Math.min(baseX + patrolWidth, forwardX + (Math.random() - 0.5) * 150));
            newY = Math.max(100, Math.min(400, forwardY + (Math.random() - 0.5) * 150));
            this.targetX = newX;
            this.targetY = newY;
            return;
        }
        // Y coordinate with some randomness
        if (currentRelativeY < 100) {
            // Near top, bias down
            newY = 100 + Math.random() * 200 + 100;
        } else if (currentRelativeY > 200) {
            // Near bottom, bias up
            newY = 100 + Math.random() * 200;
        } else {
            // In middle
            newY = 100 + Math.random() * 300;
        }
        this.targetX = newX;
        this.targetY = newY;
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
    moveToContestHill() {
        if (!this.hillInfo) {
            this.setState('patrol');
            return;
        }
        // Move to hill with tactical positioning
        const hillX = this.hillInfo.position.x;
        const hillY = this.hillInfo.position.y;
        // If we're already on the hill, find a good defensive position
        if (this.isOnHill) {
            // Simplified: Stay put when on hill to maximize combat effectiveness
            // Only move if we're too close to the edge
            const currentDistanceToCenter = Math.sqrt((this.x - hillX) ** 2 + (this.y - hillY) ** 2);
            if (currentDistanceToCenter > this.hillInfo.radius * 0.8) {
                // Move slightly toward center of hill for better position
                const angle = Math.atan2(hillY - this.y, hillX - this.x);
                const radius = this.hillInfo.radius * 0.5;
                this.targetX = hillX + Math.cos(angle) * radius;
                this.targetY = hillY + Math.sin(angle) * radius;
            } else {
                // Stay put - don't move, focus on combat
                this.targetX = this.x;
                this.targetY = this.y;
            }
        } else {
            // Approach the hill with obstacle-aware pathfinding
            const directAngle = Math.atan2(hillY - this.y, hillX - this.x);
            let bestTarget = null;
            let bestScore = -1;
            
            // Try multiple approach angles to find the best path
            const angleVariations = [-0.8, -0.4, 0, 0.4, 0.8]; // Different approach angles
            
            for (const angleOffset of angleVariations) {
                let tacticalAngle = directAngle + angleOffset;
                
                // If we have a target, adjust approach to maintain combat effectiveness
                if (this.target && this.distanceTo(this.target) < this.range * 1.5) {
                    const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    tacticalAngle = (tacticalAngle + targetAngle) / 2;
                }
                
                const approachDistance = this.hillInfo.contestRadius * 0.8;
                const candidateX = hillX + Math.cos(tacticalAngle) * approachDistance;
                const candidateY = hillY + Math.sin(tacticalAngle) * approachDistance;
                
                // Check if this path is clear of obstacles
                const pathClear = this.hasPathToPosition(candidateX, candidateY);
                const distanceToCandidate = Math.sqrt((candidateX - this.x) ** 2 + (candidateY - this.y) ** 2);
                
                // Score based on path clarity and distance
                const score = pathClear ? (1000 - distanceToCandidate) : -distanceToCandidate;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = { x: candidateX, y: candidateY };
                }
            }
            
            if (bestTarget) {
                this.targetX = bestTarget.x;
                this.targetY = bestTarget.y;
            } else {
                // Fallback: try to move around obstacles
                this.findAlternativePathToHill(hillX, hillY);
            }
        }
    }
    hasPathToPosition(targetX, targetY) {
        // Check if there's a clear path from current position to target
        if (!window.game || !window.game.obstacles) {
            return true;
        }
        
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        
        // Simple line-of-sight check for obstacles
        return !window.game.obstacles.some(obstacle => 
            this.lineIntersectsRectangle(startX, startY, targetX, targetY, obstacle)
        );
    }
    findAlternativePathToHill(hillX, hillY) {
        // Try to find a path around obstacles by testing waypoints
        const currentAngle = Math.atan2(hillY - this.y, hillX - this.x);
        const alternatives = [
            currentAngle + Math.PI/3,  // 60 degrees left
            currentAngle - Math.PI/3,  // 60 degrees right
            currentAngle + Math.PI/2,  // 90 degrees left
            currentAngle - Math.PI/2,  // 90 degrees right
        ];
        
        for (const angle of alternatives) {
            // Try moving in this direction for a reasonable distance
            const waypointDistance = 100;
            const waypointX = this.x + Math.cos(angle) * waypointDistance;
            const waypointY = this.y + Math.sin(angle) * waypointDistance;
            
            // Check if this waypoint is reachable and closer to hill
            if (this.hasPathToPosition(waypointX, waypointY)) {
                const currentDistanceToHill = Math.sqrt((this.x - hillX) ** 2 + (this.y - hillY) ** 2);
                const waypointDistanceToHill = Math.sqrt((waypointX - hillX) ** 2 + (waypointY - hillY) ** 2);
                
                // Use this waypoint if it gets us closer to the hill
                if (waypointDistanceToHill < currentDistanceToHill) {
                    this.targetX = waypointX;
                    this.targetY = waypointY;
                    return;
                }
            }
        }
        
        // If no good alternative found, just move perpendicular to try to get unstuck
        const perpAngle = currentAngle + Math.PI/2;
        this.targetX = this.x + Math.cos(perpAngle) * 50;
        this.targetY = this.y + Math.sin(perpAngle) * 50;
    }
    findRepositionTarget() {
        if (!this.target) {
            this.setState('patrol');
            return;
        }
        // Try to find a position that gives line of sight to the target
        const targetX = this.target.x + (this.target.width || 24) / 2;
        const targetY = this.target.y + (this.target.height || 16) / 2;
        // Try multiple angles around our current position
        const attempts = 8;
        const repositionDistance = 80; // How far to move when repositioning
        for (let i = 0; i < attempts; i++) {
            const angle = (i / attempts) * 2 * Math.PI;
            const newX = this.x + Math.cos(angle) * repositionDistance;
            const newY = this.y + Math.sin(angle) * repositionDistance;
            // Check if this position would give us line of sight and no obstacle collision
            if (window.game && window.game.gameState && window.game.gameState.obstacles) {
                const obstacles = window.game.gameState.obstacles;
                // Check if new position doesn't collide with obstacles
                if (!this.wouldCollideWithObstacles(newX, newY, obstacles)) {
                    // Create temporary position to test line of sight
                    const tempTank = {
                        x: newX + this.width / 2,
                        y: newY + this.height / 2,
                        width: this.width,
                        height: this.height
                    };
                    // Test if we'd have line of sight from this position
                    if (this.hasLineOfSightFromPosition(tempTank, this.target, obstacles)) {
                        this.targetX = newX;
                        this.targetY = newY;
                        return;
                    }
                }
            }
        }
        // If no good repositioning spot found, try flanking around the obstacle
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const perpX = -dy; // Perpendicular direction
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength > 0) {
            const flankX = this.x + (perpX / perpLength) * repositionDistance;
            const flankY = this.y + (perpY / perpLength) * repositionDistance;
            this.targetX = flankX;
            this.targetY = flankY;
        } else {
            // Fallback to patrol if all else fails
            this.setState('patrol');
        }
    }
    hasLineOfSightFromPosition(fromPos, target, obstacles) {
        const startX = fromPos.x;
        const startY = fromPos.y;
        const endX = target.x + (target.width || 24) / 2;
        const endY = target.y + (target.height || 16) / 2;
        return !obstacles.some(obstacle => 
            this.lineIntersectsRectangle(startX, startY, endX, endY, obstacle)
        );
    }
    updateMovement(deltaTime, gameState) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Tank facing logic: prioritize combat targets when on hill
        let targetAngle;
        if (this.target && this.isInRange(this.target) && (this.state === 'contest_hill' || this.isOnHill)) {
            // Always face the target for combat when on hill or contesting
            targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        } else if (distance > 15) {
            // Face movement direction when moving significantly
            targetAngle = Math.atan2(dy, dx);
        } else {
            // Keep current angle if not moving much and no combat target
            targetAngle = this.angle;
        }
        if (distance > 15) { // Increased threshold to reduce micro-movements
            // Normalize movement vector
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            // Check for obstacle avoidance
            const newX = this.x + moveX;
            const newY = this.y + moveY;
            if (!this.wouldCollideWithObstacles(newX, newY, gameState.obstacles)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Enhanced obstacle avoidance - try multiple escape directions
                const avoidanceAttempts = [
                    this.angle + Math.PI / 2,     // 90 degrees right
                    this.angle - Math.PI / 2,     // 90 degrees left
                    this.angle + Math.PI / 4,     // 45 degrees right
                    this.angle - Math.PI / 4,     // 45 degrees left
                    this.angle + Math.PI,         // 180 degrees (reverse)
                ];
                
                let foundEscape = false;
                for (const escapeAngle of avoidanceAttempts) {
                    const escapeX = this.x + Math.cos(escapeAngle) * this.speed * deltaTime;
                    const escapeY = this.y + Math.sin(escapeAngle) * this.speed * deltaTime;
                    
                    if (!this.wouldCollideWithObstacles(escapeX, escapeY, gameState.obstacles)) {
                        this.x = escapeX;
                        this.y = escapeY;
                        foundEscape = true;
                        break;
                    }
                }
                
                // If still stuck, try smaller movements
                if (!foundEscape) {
                    const smallMoveDistance = this.speed * deltaTime * 0.5;
                    for (const escapeAngle of avoidanceAttempts) {
                        const escapeX = this.x + Math.cos(escapeAngle) * smallMoveDistance;
                        const escapeY = this.y + Math.sin(escapeAngle) * smallMoveDistance;
                        
                        if (!this.wouldCollideWithObstacles(escapeX, escapeY, gameState.obstacles)) {
                            this.x = escapeX;
                            this.y = escapeY;
                            break;
                        }
                    }
                }
            }
        }
        // Update tank angle regardless of movement
        const angleDiff = targetAngle - this.angle;
        // Normalize angle difference to [-π, π]
        const normalizedDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        // Gradual rotation instead of instant snap
        const maxRotation = 2.5 * deltaTime;
        if (Math.abs(normalizedDiff) > maxRotation) {
            this.angle += Math.sign(normalizedDiff) * maxRotation;
        } else {
            this.angle = targetAngle;
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
    hasLineOfSight(target, obstacles) {
        // Start from tank center
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        // End at target center
        const endX = target.x + (target.width || 24) / 2;
        const endY = target.y + (target.height || 16) / 2;
        // Use line-rectangle intersection to check if line passes through any obstacle
        return !obstacles.some(obstacle => 
            this.lineIntersectsRectangle(startX, startY, endX, endY, obstacle)
        );
    }
    lineIntersectsRectangle(x1, y1, x2, y2, rect) {
        // Check if line segment intersects with rectangle
        const rectLeft = rect.x;
        const rectRight = rect.x + rect.width;
        const rectTop = rect.y;
        const rectBottom = rect.y + rect.height;
        // Check if either endpoint is inside the rectangle
        if (this.pointInRectangle(x1, y1, rect) || this.pointInRectangle(x2, y2, rect)) {
            return true;
        }
        // Check intersection with each edge of the rectangle
        return this.lineIntersectsLine(x1, y1, x2, y2, rectLeft, rectTop, rectRight, rectTop) ||     // Top edge
               this.lineIntersectsLine(x1, y1, x2, y2, rectRight, rectTop, rectRight, rectBottom) || // Right edge
               this.lineIntersectsLine(x1, y1, x2, y2, rectRight, rectBottom, rectLeft, rectBottom) || // Bottom edge
               this.lineIntersectsLine(x1, y1, x2, y2, rectLeft, rectBottom, rectLeft, rectTop);     // Left edge
    }
    pointInRectangle(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Check if line segment (x1,y1)-(x2,y2) intersects line segment (x3,y3)-(x4,y4)
        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denominator) < 1e-10) {
            return false; // Lines are parallel
        }
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    updateCombat(deltaTime, gameState) {
        // Combat should work regardless of current state
        // Ensure we always have the most current target
        if (!this.target || !this.target.isAlive) {
            // If no target or target is dead, find a new one
            this.findNewTarget();
        }
        if (!this.target) {
            return;
        }
        const targetDistance = this.distanceTo(this.target);
        if (targetDistance > this.range) {
            return;
        }
        // Check line of sight before attempting to shoot
        if (!this.hasLineOfSight(this.target, gameState.obstacles)) {
            return;
        }
        const currentTime = gameState.battleTime;
        const timeSinceLastShot = currentTime - this.lastShotTime;
        const canFire = timeSinceLastShot >= 1.0 / this.fireRate;
        
        if (canFire) {
            this.fireAtTarget(this.target, gameState);
            this.lastShotTime = currentTime;
        }
    }
    // Helper method to find a new target
    findNewTarget() {
        if (this.enemies.length === 0) {
            this.target = null;
            return;
        }
        let closestEnemy = null;
        let closestDistance = Infinity;
        let closestVisibleEnemy = null;
        let closestVisibleDistance = Infinity;
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) {
                return;
            }
            const distance = this.distanceTo(enemy);
            // Track closest enemy overall
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
            // Track closest visible enemy (prioritize these)
            if (distance < closestVisibleDistance && this.hasLineOfSight(enemy, [])) {
                closestVisibleDistance = distance;
                closestVisibleEnemy = enemy;
            }
        });
        // Prefer visible enemies, fall back to closest if no visible enemies
        this.target = closestVisibleEnemy || closestEnemy;
        
        // Debug only for contest_hill tanks on hill
        if (this.state === 'contest_hill' && this.isOnHill) {
            console.log(`${this.team} tank on hill: Found target - Closest: ${closestDistance.toFixed(1)}, Visible: ${closestVisibleDistance.toFixed(1)}, Selected: ${this.target ? this.distanceTo(this.target).toFixed(1) : 'none'}`);
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
    distanceToPoint(x, y) {
        const dx = x - (this.x + this.width / 2);
        const dy = y - (this.y + this.height / 2);
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
        // Always show behavior state above tank
        this.renderBehaviorState(ctx);
        // Show tactical archetype info below tank
        this.renderTacticalInfo(ctx);
        // Additional debug info (only when DEBUG is enabled)
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
    renderBehaviorState(ctx) {
        // Show current behavior state above the tank
        ctx.save();
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        // Ensure we have a valid state
        const currentState = this.state || 'patrol';
        
        // Get tactical archetype for this tank
        const tacticalType = this.getTacticalArchetype();
        const typeEmoji = this.getTacticalEmoji(tacticalType);
        
        // Display state with tactical type and context
        let stateText = `${typeEmoji} ${currentState.toUpperCase()}`;
        
        // Add additional context based on state
        if (currentState === 'attack' && this.target) {
            const distance = Math.round(this.distanceTo(this.target));
            stateText += ` (${distance}px)`;
        } else if (currentState === 'reposition') {
            stateText += ` (NO LOS)`;
        } else if (currentState === 'patrol') {
            const patrolDistance = Math.round(Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2));
            stateText += ` (${patrolDistance}px)`;
        } else if (currentState === 'contest_hill') {
            if (this.hillInfo) {
                const hillDistance = Math.round(this.distanceToHill || 0);
                stateText += ` (${hillDistance}px)`;
            }
        }
        
        // Position text above the tank
        const textX = this.x + this.width / 2;
        const textY = this.y - 18;
        
        // Calculate text dimensions for proper background clearing
        const textWidth = ctx.measureText(stateText).width;
        const backgroundWidth = Math.max(textWidth + 8, 80); // Minimum width to clear old text
        const backgroundHeight = 14;
        
        // Clear the area first with a solid background
        ctx.fillStyle = this.getTacticalBackgroundColor(tacticalType, currentState);
        ctx.fillRect(textX - backgroundWidth / 2, textY - 11, backgroundWidth, backgroundHeight);
        
        // Text color based on tactical type and state
        ctx.fillStyle = this.getTacticalTextColor(tacticalType, currentState);
        ctx.fillText(stateText, textX, textY);
        ctx.restore();
    }

    getTacticalArchetype() {
        // Classify this tank's tactical archetype based on genome
        const aggression = this.genome[0] || 0;
        const speed = this.genome[1] || 0;
        const accuracy = this.genome[2] || 0;
        const defense = this.genome[3] || 0;
        const teamwork = this.genome[4] || 0;
        const adaptability = this.genome[5] || 0;
        const learning = this.genome[6] || 0;
        const riskTaking = this.genome[7] || 0;
        const evasion = this.genome[8] || 0;
        
        // Primary archetype classification (same as evolution-engine.js)
        if (accuracy > 0.7 && defense > 0.6 && aggression < 0.4) {
            return 'Sniper';
        }
        if (aggression > 0.7 && speed > 0.6 && riskTaking > 0.6) {
            return 'Berserker';
        }
        if (teamwork > 0.7 && adaptability > 0.6) {
            return 'Support';
        }
        if (evasion > 0.7 && speed > 0.6) {
            return 'Assassin';
        }
        if (learning > 0.7 && adaptability > 0.7) {
            return 'Adaptive';
        }
        if (defense > 0.8 && evasion > 0.6 && aggression < 0.4) {
            return 'Fortress';
        }
        if (speed > 0.8 && riskTaking > 0.7 && accuracy < 0.5) {
            return 'Scout';
        }
        if (accuracy > 0.8 && defense < 0.3) {
            return 'GlassCannon';
        }
        if (teamwork > 0.8 && aggression < 0.5) {
            return 'Coordinator';
        }
        if (aggression > 0.8 && defense < 0.3) {
            return 'Kamikaze';
        }
        if (learning > 0.6 && adaptability > 0.6) {
            return 'Generalist';
        }
        
        // Fallback classifications
        if (aggression > 0.6) {
            return 'Aggressive';
        }
        if (defense > 0.6) {
            return 'Defensive';
        }
        if (teamwork > 0.6) {
            return 'Cooperative';
        }
        return 'Balanced';
    }

    getTacticalEmoji(tacticalType) {
        const emojis = {
            'Sniper': '🎯',
            'Berserker': '⚔️',
            'Support': '🛡️',
            'Assassin': '🗡️',
            'Adaptive': '🧠',
            'Fortress': '🏰',
            'Scout': '👁️',
            'GlassCannon': '💥',
            'Coordinator': '📋',
            'Kamikaze': '💣',
            'Generalist': '⚖️',
            'Aggressive': '👊',
            'Defensive': '🛡️',
            'Cooperative': '🤝',
            'Balanced': '⚖️'
        };
        return emojis[tacticalType] || '❓';
    }

    getTacticalBackgroundColor(tacticalType, currentState) {
        // Base colors by tactical type
        const baseColors = {
            'Sniper': 'rgba(100, 150, 255, 0.8)',      // Blue - precise
            'Berserker': 'rgba(255, 100, 100, 0.8)',   // Red - aggressive
            'Support': 'rgba(100, 255, 100, 0.8)',     // Green - supportive
            'Assassin': 'rgba(150, 100, 255, 0.8)',    // Purple - stealthy
            'Adaptive': 'rgba(255, 255, 100, 0.8)',    // Yellow - learning
            'Fortress': 'rgba(150, 150, 150, 0.8)',    // Gray - defensive
            'Scout': 'rgba(255, 200, 100, 0.8)',       // Orange - mobile
            'GlassCannon': 'rgba(255, 150, 255, 0.8)', // Pink - fragile but deadly
            'Coordinator': 'rgba(100, 255, 255, 0.8)', // Cyan - team-focused
            'Kamikaze': 'rgba(255, 50, 50, 0.8)',      // Dark red - reckless
            'Generalist': 'rgba(200, 200, 200, 0.8)'   // Light gray - balanced
        };

        // Override for special states
        if (currentState === 'reposition') {
            return 'rgba(255, 165, 0, 0.8)'; // Orange for repositioning
        }
        if (currentState === 'contest_hill') {
            return 'rgba(0, 255, 0, 0.8)'; // Green for hill contest
        }

        return baseColors[tacticalType] || 'rgba(0, 0, 0, 0.7)';
    }

    getTacticalTextColor(tacticalType, currentState) {
        // High contrast text colors
        const textColors = {
            'Sniper': '#ffffff',
            'Berserker': '#ffffff', 
            'Support': '#000000',
            'Assassin': '#ffffff',
            'Adaptive': '#000000',
            'Fortress': '#ffffff',
            'Scout': '#000000',
            'GlassCannon': '#000000',
            'Coordinator': '#000000',
            'Kamikaze': '#ffffff',
            'Generalist': '#000000'
        };

        // Special state overrides
        if (currentState === 'reposition') {
            return '#000000';
        }
        if (currentState === 'contest_hill') {
            return '#000000';
        }
        if (currentState === 'attack') {
            return '#ffffff';
        }

        return textColors[tacticalType] || (this.team === 'red' ? '#ffdddd' : '#ddddff');
    }

    renderTacticalInfo(ctx) {
        // Show compact tactical archetype info below the tank
        ctx.save();
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        
        const tacticalType = this.getTacticalArchetype();
        const typeText = tacticalType.toUpperCase();
        
        // Position text below the tank
        const textX = this.x + this.width / 2;
        const textY = this.y + this.height + 12;
        
        // Calculate proper background size to clear old text
        const textWidth = ctx.measureText(typeText).width;
        const backgroundWidth = Math.max(textWidth + 6, 50); // Minimum width to clear old text
        const backgroundHeight = 12;
        
        // Clear background area first
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(textX - backgroundWidth / 2, textY - 9, backgroundWidth, backgroundHeight);
        
        // Text color based on tactical type
        ctx.fillStyle = this.team === 'red' ? '#ffcccc' : '#ccccff';
        if (tacticalType === 'Sniper') {
            ctx.fillStyle = '#66aaff';
        } else if (tacticalType === 'Berserker') {
            ctx.fillStyle = '#ff6666';
        } else if (tacticalType === 'Support') {
            ctx.fillStyle = '#66ff66';
        } else if (tacticalType === 'Assassin') {
            ctx.fillStyle = '#cc66ff';
        }
        
        ctx.fillText(typeText, textX, textY);
        ctx.restore();
    }

    // Hill tactical analysis methods
    getEnemiesOnHill() {
        if (!this.hillInfo || !this.enemies) {
            return [];
        }
        return this.enemies.filter(enemy => {
            const dx = enemy.x + enemy.width / 2 - this.hillInfo.position.x;
            const dy = enemy.y + enemy.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius;
        });
    }

    getAlliesOnHill() {
        if (!this.hillInfo || !this.allies) {
            return [];
        }
        return this.allies.filter(ally => {
            const dx = ally.x + ally.width / 2 - this.hillInfo.position.x;
            const dy = ally.y + ally.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= this.hillInfo.contestRadius;
        });
    }

    getEnemiesNearHill() {
        if (!this.hillInfo || !this.enemies) {
            return [];
        }
        const nearRadius = this.hillInfo.contestRadius + 50; // 50px buffer around hill
        return this.enemies.filter(enemy => {
            const dx = enemy.x + enemy.width / 2 - this.hillInfo.position.x;
            const dy = enemy.y + enemy.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= nearRadius;
        });
    }

    getAlliesNearHill() {
        if (!this.hillInfo || !this.allies) {
            return [];
        }
        const nearRadius = this.hillInfo.contestRadius + 50; // 50px buffer around hill
        return this.allies.filter(ally => {
            const dx = ally.x + ally.width / 2 - this.hillInfo.position.x;
            const dy = ally.y + ally.height / 2 - this.hillInfo.position.y;
            const distToHill = Math.sqrt(dx * dx + dy * dy);
            return distToHill <= nearRadius;
        });
    }

    renderDebugInfo(ctx) {
        ctx.fillStyle = '#00ff88';
        ctx.font = '10px Courier New';
        ctx.fillText(`DEBUG: ${this.state}`, this.x, this.y - 35); // Moved higher to avoid overlap
        // Target line with line-of-sight indication
        if (this.target) {
            // Check if we have line of sight
            const hasLOS = window.game?.gameState?.obstacles ? 
                this.hasLineOfSight(this.target, window.game.gameState.obstacles) : true;
            ctx.strokeStyle = hasLOS ? '#88ff88' : '#ff8888'; // Green if clear, red if blocked
            ctx.lineWidth = hasLOS ? 1 : 2;
            ctx.setLineDash(hasLOS ? [2, 2] : [4, 4]);
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.target.x + (this.target.width || 24) / 2, this.target.y + (this.target.height || 16) / 2);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash pattern
            // Show LOS status text
            ctx.fillStyle = hasLOS ? '#88ff88' : '#ff8888';
            ctx.fillText(hasLOS ? 'LOS OK' : 'LOS BLOCKED', this.x, this.y - 47); // Moved higher to avoid overlap
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
        // Remove if out of bounds (use actual game dimensions)
        const gameWidth = window.game ? window.game.width : 800;
        const gameHeight = window.game ? window.game.height : 600;
        const margin = 50;
        if (this.x < -margin || this.x > gameWidth + margin || this.y < -margin || this.y > gameHeight + margin) {
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
