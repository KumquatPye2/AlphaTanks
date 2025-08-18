/**
 * Battlefield Manager - Handles battlefield layout, obstacles, and hill
 * Separated from main game engine for better organization
 */

class BattlefieldManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.obstacles = [];
        this.hill = null;
        this.mode = 'king_of_hill';
        
        this.createObstacles();
    }
    
    /**
     * Create strategic obstacles for tactical gameplay
     */
    createObstacles() {
        this.obstacles = [];
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Large cover blocks near hill for tactical positioning
        this.obstacles.push({
            x: centerX - 150, y: centerY - 80, 
            width: 60, height: 40,
            type: 'cover'
        });
        this.obstacles.push({
            x: centerX + 90, y: centerY - 80,
            width: 60, height: 40, 
            type: 'cover'
        });
        this.obstacles.push({
            x: centerX - 150, y: centerY + 40,
            width: 60, height: 40,
            type: 'cover'
        });
        this.obstacles.push({
            x: centerX + 90, y: centerY + 40,
            width: 60, height: 40,
            type: 'cover'
        });
        
        // Pathway barriers to funnel tank movement
        this.obstacles.push({
            x: centerX - 250, y: centerY - 120,
            width: 30, height: 100,
            type: 'barrier'
        });
        this.obstacles.push({
            x: centerX + 220, y: centerY - 120,
            width: 30, height: 100,
            type: 'barrier'
        });
        this.obstacles.push({
            x: centerX - 250, y: centerY + 20,
            width: 30, height: 100,
            type: 'barrier'
        });
        this.obstacles.push({
            x: centerX + 220, y: centerY + 20,
            width: 30, height: 100,
            type: 'barrier'
        });
    }
    
    /**
     * Initialize King of the Hill mode
     */
    initializeKingOfHill() {
        if (!this.hill) {
            this.hill = new Hill(this.width / 2, this.height / 2, GAME_CONFIG.BATTLE.KING_OF_HILL.CONTROL_RADIUS);
        }
        this.hill.reset();
    }
    
    /**
     * Update battlefield elements
     */
    update(deltaTime, tanks) {
        if (this.hill && this.mode === 'king_of_hill') {
            const aliveTanks = tanks.filter(tank => tank.isAlive);
            this.hill.update(deltaTime, aliveTanks);
        }
    }
    
    /**
     * Render battlefield elements
     */
    render(ctx) {
        this.drawGrid(ctx);
        this.drawObstacles(ctx);
        
        if (this.hill && this.mode === 'king_of_hill') {
            this.hill.render(ctx);
        }
    }
    
    /**
     * Draw grid background
     */
    drawGrid(ctx) {
        ctx.strokeStyle = GAME_CONFIG.UI.COLORS.GRID;
        ctx.lineWidth = 0.5;
        const gridSize = GAME_CONFIG.BATTLEFIELD.GRID_SIZE;
        
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    /**
     * Draw obstacles
     */
    drawObstacles(ctx) {
        this.obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.type === 'cover' ? 
                GAME_CONFIG.UI.COLORS.OBSTACLE_COVER : 
                GAME_CONFIG.UI.COLORS.OBSTACLE_BARRIER;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add border for visual clarity
            ctx.strokeStyle = obstacle.type === 'cover' ? '#666' : '#888';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }
    
    /**
     * Get spawn position for team (safe from obstacles)
     */
    getSpawnPosition(team, _index, _teamSize) {
        const config = GAME_CONFIG.BATTLEFIELD;
        const tankSize = 20; // Typical tank size for collision checking
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        while (attempts < maxAttempts) {
            let spawnPos;
            
            if (team === 'red') {
                // Left side spawn
                spawnPos = {
                    x: config.MIN_SPAWN_DISTANCE + Math.random() * (config.MAX_SPAWN_DISTANCE - config.MIN_SPAWN_DISTANCE),
                    y: this.height * config.SPAWN_MARGIN_RATIO + Math.random() * this.height * (1 - 2 * config.SPAWN_MARGIN_RATIO)
                };
            } else {
                // Right side spawn
                spawnPos = {
                    x: this.width - config.MAX_SPAWN_DISTANCE + Math.random() * (config.MAX_SPAWN_DISTANCE - config.MIN_SPAWN_DISTANCE),
                    y: this.height * config.SPAWN_MARGIN_RATIO + Math.random() * this.height * (1 - 2 * config.SPAWN_MARGIN_RATIO)
                };
            }
            
            // Check if this position is safe (not in an obstacle)
            if (this.isValidPosition(spawnPos.x - tankSize/2, spawnPos.y - tankSize/2, tankSize, tankSize)) {
                return spawnPos;
            }
            
            attempts++;
        }
        
        // Fallback: if we can't find a safe spawn after many attempts, 
        // return a position at the edge of the spawn area
        console.warn(`Could not find safe spawn for ${team} team after ${maxAttempts} attempts, using fallback position`);
        
        if (team === 'red') {
            return {
                x: config.MIN_SPAWN_DISTANCE,
                y: this.height / 2
            };
        } else {
            return {
                x: this.width - config.MIN_SPAWN_DISTANCE,
                y: this.height / 2
            };
        }
    }
    
    /**
     * Check if position is valid (not in obstacle)
     */
    isValidPosition(x, y, width = 0, height = 0) {
        const testRect = { x, y, width, height };
        return !this.obstacles.some(obstacle => MathUtils.rectOverlap(testRect, obstacle));
    }
    
    /**
     * Get battlefield state for AI
     */
    getState() {
        return {
            width: this.width,
            height: this.height,
            obstacles: this.obstacles,
            hill: this.hill,
            mode: this.mode
        };
    }
}

/**
 * Combat Manager - Handles projectiles and collision detection
 * Separated from main game engine for better organization
 */
class CombatManager {
    constructor() {
        this.projectiles = [];
    }
    
    /**
     * Add projectile to tracking
     */
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
    
    /**
     * Update all projectiles
     */
    update(deltaTime, battlefield) {
        // Update projectiles and remove expired ones
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Remove if marked for removal or out of bounds
            if (projectile.shouldRemove || projectile.isOutOfBounds(battlefield.width, battlefield.height)) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Check collisions between projectiles and targets
     */
    checkCollisions(tanks, battlefield) {
        const aliveTanks = tanks.filter(tank => tank.isAlive);
        
        // Early exit if no entities to check
        if (aliveTanks.length === 0 || this.projectiles.length === 0) {
            return;
        }
        
        // Check projectile-tank collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let hit = false;
            
            // Check collision with tanks
            for (let j = 0; j < aliveTanks.length && !hit; j++) {
                const tank = aliveTanks[j];
                if (tank.team !== projectile.team && CollisionUtils.isColliding(projectile, tank)) {
                    hit = projectile.hit(tank);
                    if (hit) {
                        this.projectiles.splice(i, 1);
                    }
                }
            }
            
            // Check collision with obstacles
            if (!hit) {
                for (const obstacle of battlefield.obstacles) {
                    if (CollisionUtils.isColliding(projectile, obstacle)) {
                        projectile.hitObstacle();
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Render all projectiles
     */
    render(ctx) {
        this.projectiles.forEach(projectile => projectile.render(ctx));
    }
    
    /**
     * Clear all projectiles
     */
    clear() {
        this.projectiles = [];
    }
    
    /**
     * Get projectile count
     */
    getProjectileCount() {
        return this.projectiles.length;
    }
}

/**
 * Battle Statistics Manager - Tracks and analyzes battle performance
 */
class BattleStatsManager {
    constructor() {
        this.reset();
    }
    
    /**
     * Reset statistics for new battle
     */
    reset() {
        this.battleStartTime = 0;
        this.battleTime = 0;
        this.battleStarted = false;
        this.totalDamage = { red: 0, blue: 0 };
        this.totalKills = { red: 0, blue: 0 };
        this.totalShots = { red: 0, blue: 0 };
        this.totalHits = { red: 0, blue: 0 };
        this.teamStats = { red: [], blue: [] };
    }
    
    /**
     * Update battle statistics
     */
    update(deltaTime, tanks) {
        if (this.battleStarted) {
            this.battleTime += deltaTime;
        }
        
        // Check for battle start (first tank movement)
        if (!this.battleStarted && tanks.length > 0) {
            const anyTankMoved = tanks.some(tank => {
                if (!tank.isAlive) {
                    return false;
                }
                // Tank.x/y and spawnX/spawnY are top-left coordinates
                const deltaX = Math.abs(tank.x - tank.spawnX);
                const deltaY = Math.abs(tank.y - tank.spawnY);
                return deltaX > GAME_CONFIG.TANK.MOVEMENT_THRESHOLD || deltaY > GAME_CONFIG.TANK.MOVEMENT_THRESHOLD;
            });
            
            if (anyTankMoved) {
                this.battleStarted = true;
                this.battleStartTime = performance.now();
                if (GAME_CONFIG.DEBUG && GAME_CONFIG.DEBUG.VERBOSE_LOGS) {
                    // Debug logging removed for performance
                }
            }
        }
    }
    
    /**
     * Calculate team statistics
     */
    calculateTeamStats(team) {
        const teamTanks = team.filter(tank => tank !== null);
        
        if (teamTanks.length === 0) {
            return {
                averageDamageDealt: 0,
                averageDamageTaken: 0,
                averageAccuracy: 0,
                averageSurvivalTime: 0,
                totalKills: 0,
                survivors: 0
            };
        }
        
        const totalDamageDealt = teamTanks.reduce((sum, tank) => sum + (tank.damageDealt || 0), 0);
        const totalDamageTaken = teamTanks.reduce((sum, tank) => sum + (tank.damageTaken || 0), 0);
        const totalShots = teamTanks.reduce((sum, tank) => sum + (tank.shotsFired || 0), 0);
        const totalHits = teamTanks.reduce((sum, tank) => sum + (tank.shotsHit || 0), 0);
        const totalSurvivalTime = teamTanks.reduce((sum, tank) => sum + (tank.survivalTime || 0), 0);
        const totalKills = teamTanks.reduce((sum, tank) => sum + (tank.kills || 0), 0);
        const survivors = teamTanks.filter(tank => tank.isAlive).length;
        
        return {
            averageDamageDealt: totalDamageDealt / teamTanks.length,
            averageDamageTaken: totalDamageTaken / teamTanks.length,
            averageAccuracy: totalShots > 0 ? totalHits / totalShots : 0,
            averageSurvivalTime: totalSurvivalTime / teamTanks.length,
            totalKills: totalKills,
            survivors: survivors,
            totalDamageDealt: totalDamageDealt,
            totalDamageTaken: totalDamageTaken,
            shotsFired: totalShots,
            shotsHit: totalHits
        };
    }
    
    /**
     * Calculate tactical metrics for evolution
     */
    calculateTacticalMetrics(redTeam, blueTeam) {
        return {
            red: this.calculateTeamTacticalMetrics(redTeam, 'red'),
            blue: this.calculateTeamTacticalMetrics(blueTeam, 'blue'),
            battleComplexity: this.calculateBattleComplexity(redTeam, blueTeam)
        };
    }
    
    /**
     * Calculate team tactical metrics
     */
    calculateTeamTacticalMetrics(team, _teamName) {
        const aliveTanks = team.filter(tank => tank.isAlive);
        const allTanks = team.filter(tank => tank !== null);
        
        if (allTanks.length === 0) {
            return { coordination: 0, adaptability: 0, survivalEfficiency: 0, tacticDiversity: 0 };
        }
        
        // Coordination: How well tanks work together
        const coordinationScore = this.calculateCoordinationScore(allTanks);
        
        // Adaptability: How well tanks adapt to changing situations
        const adaptabilityScore = this.calculateAdaptabilityScore(allTanks);
        
        // Survival efficiency: Balance of survival and effectiveness
        const survivalEfficiency = aliveTanks.length / allTanks.length;
        
        // Tactic diversity: Variety of strategies employed
        const tacticDiversity = this.calculateTacticDiversity(allTanks);
        
        return {
            coordination: coordinationScore,
            adaptability: adaptabilityScore,
            survivalEfficiency,
            tacticDiversity
        };
    }
    
    /**
     * Calculate coordination score
     */
    calculateCoordinationScore(team) {
        if (team.length <= 1) {
            return 0;
        }
        
        // Measure how often tanks are near each other and coordinate actions
        let coordinationScore = 0;
        let comparisons = 0;
        
        for (let i = 0; i < team.length; i++) {
            for (let j = i + 1; j < team.length; j++) {
                const tank1 = team[i];
                const tank2 = team[j];
                
                if (tank1.isAlive && tank2.isAlive) {
                    const distance = MathUtils.distance(tank1.x, tank1.y, tank2.x, tank2.y);
                    const coordinationDistance = 150; // Tanks are coordinating if within 150 pixels
                    
                    if (distance < coordinationDistance) {
                        coordinationScore += 1.0 - (distance / coordinationDistance);
                    }
                    comparisons++;
                }
            }
        }
        
        return comparisons > 0 ? coordinationScore / comparisons : 0;
    }
    
    /**
     * Calculate adaptability score
     */
    calculateAdaptabilityScore(team) {
        // Measure how often tanks change states (indicates adaptability)
        const totalStateChanges = team.reduce((sum, tank) => sum + (tank.stateChanges || 0), 0);
        const averageStateChanges = totalStateChanges / team.length;
        
        // Normalize to 0-1 range (more state changes = more adaptable, up to a point)
        return Math.min(averageStateChanges / 10, 1.0);
    }
    
    /**
     * Calculate tactic diversity
     */
    calculateTacticDiversity(team) {
        const strategies = team.map(tank => {
            if (!tank.genome) {
                return 'Unknown';
            }
            return GenomeUtils.classifyStrategy(tank.genome);
        });
        
        const uniqueStrategies = new Set(strategies);
        return uniqueStrategies.size / Math.max(team.length, 1);
    }
    
    /**
     * Calculate battle complexity
     */
    calculateBattleComplexity(redTeam, blueTeam) {
        const totalTanks = redTeam.length + blueTeam.length;
        const totalStateChanges = redTeam.reduce((sum, tank) => sum + (tank.stateChanges || 0), 0) +
                                 blueTeam.reduce((sum, tank) => sum + (tank.stateChanges || 0), 0);
        
        // Normalize complexity based on battle duration and activity
        const timeComplexity = Math.min(this.battleTime / 60, 1.0); // Up to 60 seconds
        const activityComplexity = Math.min(totalStateChanges / (totalTanks * 5), 1.0); // Up to 5 state changes per tank
        
        return (timeComplexity + activityComplexity) / 2;
    }
    
    /**
     * Get current battle statistics (compatibility method)
     */
    getStats() {
        return {
            battleTime: this.battleTime,
            battleStarted: this.battleStarted,
            totalDamage: this.totalDamage,
            totalKills: this.totalKills,
            totalShots: this.totalShots,
            totalHits: this.totalHits,
            hillController: this.hillController || 'Neutral',
            // Additional properties expected by UI
            redTanks: this.redTanks || 0,
            blueTanks: this.blueTanks || 0,
            generation: this.generation || 1,
            bestFitness: this.bestFitness || 0,
            avgFitness: this.avgFitness || 0,
            battle: this.battle || 1,
            battlesPerGeneration: this.battlesPerGeneration || 10
        };
    }
    
    /**
     * Update UI-specific statistics
     */
    updateUIStats(redTeam, blueTeam, evolutionData = {}) {
        this.redTanks = redTeam ? redTeam.filter(tank => tank && tank.isAlive).length : 0;
        this.blueTanks = blueTeam ? blueTeam.filter(tank => tank && tank.isAlive).length : 0;
        this.generation = evolutionData.generation || this.generation || 1;
        this.bestFitness = evolutionData.bestFitness || this.bestFitness || 0;
        this.avgFitness = evolutionData.avgFitness || this.avgFitness || 0;
        this.battle = evolutionData.battle || this.battle || 1;
        this.battlesPerGeneration = evolutionData.battlesPerGeneration || this.battlesPerGeneration || 10;
    }
}

// Export all managers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BattlefieldManager,
        CombatManager,
        BattleStatsManager
    };
} else {
    window.BattlefieldManager = BattlefieldManager;
    window.CombatManager = CombatManager;
    window.BattleStatsManager = BattleStatsManager;
}
