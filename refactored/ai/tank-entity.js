/**
 * Tank Entity - Core tank properties and state management
 * Separated from AI, Combat, and Movement logic for better organization
 */

class TankEntity {
    constructor(x, y, team, genome) {
        // Position and basic properties
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        this.width = GAME_CONFIG.TANK.WIDTH;
        this.height = GAME_CONFIG.TANK.HEIGHT;
        this.team = team;
        
        // Normalize genome format using utility function
        this.genome = GenomeUtils.normalize(genome);
        
        // Health and status
        this.health = GAME_CONFIG.TANK.MAX_HEALTH;
        this.maxHealth = GAME_CONFIG.TANK.MAX_HEALTH;
        this.isAlive = true;
        
        // Movement properties
        this.angle = team === 'red' ? 0 : Math.PI; // Red faces right, blue faces left
        this.speed = this.calculateSpeed();
        this.targetX = x;
        this.targetY = y;
        
        // Combat properties - derived from genome
        this.fireRate = this.calculateFireRate();
        this.damage = this.calculateDamage();
        this.range = this.calculateRange();
        this.accuracy = this.calculateAccuracy();
        this.lastShotTime = 0;
        
        // Statistics tracking
        this.stats = {
            damageDealt: 0,
            damageTaken: 0,
            shotsFired: 0,
            shotsHit: 0,
            survivalTime: 0,
            kills: 0,
            engagementDistances: [],
            stateChanges: 0,
            targetSwitches: 0
        };
        
        // AI state
        this.state = TANK_STATES.PATROL;
        this.stateTimer = 0;
        this.target = null;
        this.previousTarget = null;
        this.previousState = null;
        
        // Behavior weights derived from genome
        this.behaviorWeights = this.calculateBehaviorWeights();
        
        // Cached references for performance
        this.allies = [];
        this.enemies = [];
    }
    
    /**
     * Calculate movement speed based on genome
     */
    calculateSpeed() {
        const speedTrait = this.genome[1]; // Speed trait
        const modifiers = GAME_CONFIG.GENOME.MODIFIERS.SPEED;
        const mult = modifiers.base_multiplier + speedTrait * modifiers.bonus_multiplier;
        const raw = GAME_CONFIG.TANK.BASE_SPEED * mult * GAME_CONFIG.TANK.SPEED_MULTIPLIER;
        // Ensure reasonable floor/ceiling
        return Math.min(GAME_CONFIG.TANK.MAX_SPEED, Math.max(60, raw));
    }
    
    /**
     * Calculate fire rate based on aggression trait
     */
    calculateFireRate() {
        const aggression = this.genome[0]; // Aggression trait
        const modifiers = GAME_CONFIG.GENOME.MODIFIERS.AGGRESSION;
        return modifiers.fire_rate_min + aggression * modifiers.fire_rate_max;
    }
    
    /**
     * Calculate damage based on aggression trait
     */
    calculateDamage() {
        const aggression = this.genome[0]; // Aggression trait
        return GAME_CONFIG.TANK.BASE_DAMAGE + aggression * GAME_CONFIG.GENOME.MODIFIERS.AGGRESSION.damage_bonus;
    }
    
    /**
     * Calculate range based on accuracy trait
     */
    calculateRange() {
        const accuracy = this.genome[2]; // Accuracy trait
        return GAME_CONFIG.TANK.BASE_RANGE + accuracy * GAME_CONFIG.GENOME.MODIFIERS.ACCURACY.range_bonus;
    }
    
    /**
     * Calculate accuracy based on accuracy trait
     */
    calculateAccuracy() {
        const accuracyTrait = this.genome[2]; // Accuracy trait
        const modifiers = GAME_CONFIG.GENOME.MODIFIERS.ACCURACY;
        return modifiers.base_accuracy + accuracyTrait * modifiers.bonus_accuracy;
    }
    
    /**
     * Calculate behavior weights from genome
     */
    calculateBehaviorWeights() {
        const [aggression, _speed, _accuracy, defense, teamwork, adaptability, _learning, riskTaking, evasion] = this.genome;
        
        return {
            aggression: aggression,
            caution: defense,
            cooperation: teamwork,
            formation: adaptability,
            riskTaking: riskTaking,
            evasion: evasion,
            // King of the Hill specific weights
            objectiveFocus: 0.3 + teamwork * 0.4,
            hillPriority: aggression * 0.8,
            contestWillingness: riskTaking * 0.9
        };
    }
    
    /**
     * Take damage and update health
     */
    takeDamage(amount) {
        if (!this.isAlive) {
            return false;
        }
        
        this.health -= amount;
        this.stats.damageTaken += amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            return true; // Tank destroyed
        }
        
        return false;
    }
    
    /**
     * Update survival time
     */
    updateSurvivalTime(deltaTime) {
        if (this.isAlive) {
            this.stats.survivalTime += deltaTime;
        }
    }
    
    /**
     * Record a successful hit
     */
    recordHit(damage) {
        this.stats.shotsHit++;
        this.stats.damageDealt += damage;
    }
    
    /**
     * Record a shot fired
     */
    recordShot() {
        this.stats.shotsFired++;
        this.lastShotTime = performance.now() / 1000;
    }
    
    /**
     * Record a kill
     */
    recordKill() {
        this.stats.kills++;
    }
    
    /**
     * Calculate distance to another object
     */
    distanceTo(other) {
        return MathUtils.distance(this.x, this.y, other.x, other.y);
    }
    
    /**
     * Calculate angle to another object
     */
    angleTo(other) {
        return MathUtils.angleBetween(this.x, this.y, other.x, other.y);
    }
    
    /**
     * Check if tank can fire (based on fire rate)
     */
    canFire() {
        if (!this.isAlive) {
            return false;
        }
        const currentTime = performance.now() / 1000;
        const timeSinceLastShot = currentTime - this.lastShotTime;
        return timeSinceLastShot >= (1.0 / this.fireRate);
    }
    
    /**
     * Update state and track changes
     */
    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
            this.stateTimer = 0;
            this.stats.stateChanges++;
        }
    }
    
    /**
     * Update target and track switches
     */
    setTarget(newTarget) {
        if (this.target !== newTarget) {
            this.previousTarget = this.target;
            this.target = newTarget;
            this.stats.targetSwitches++;
        }
    }
    
    /**
     * Check if tank is within bounds
     */
    isInBounds(width, height) {
        return this.x >= 0 && this.x + this.width <= width &&
               this.y >= 0 && this.y + this.height <= height;
    }
    
    /**
     * Keep tank within battlefield bounds
     */
    keepInBounds(width, height) {
        this.x = MathUtils.clamp(this.x, 0, width - this.width);
        this.y = MathUtils.clamp(this.y, 0, height - this.height);
    }
    
    /**
     * Get tank's center position
     */
    getCenterPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    /**
     * Check if position has changed significantly from spawn
     */
    hasMovedFromSpawn() {
        const deltaX = Math.abs(this.x - this.spawnX);
        const deltaY = Math.abs(this.y - this.spawnY);
        return deltaX > GAME_CONFIG.TANK.MOVEMENT_THRESHOLD || deltaY > GAME_CONFIG.TANK.MOVEMENT_THRESHOLD;
    }
    
    /**
     * Get current fitness score based on performance
     */
    calculateFitness() {
        if (!this.isAlive) {
            // Base fitness on survival time and performance when dead
            const survivalFactor = Math.min(1.0, this.stats.survivalTime / 60); // Up to 60 seconds
            const combatFactor = this.stats.damageDealt / Math.max(1, this.stats.damageTaken);
            const accuracyFactor = this.stats.shotsFired > 0 ? this.stats.shotsHit / this.stats.shotsFired : 0;
            
            return (survivalFactor * 0.4 + combatFactor * 0.3 + accuracyFactor * 0.2 + this.stats.kills * 0.1);
        } else {
            // Bonus for staying alive
            const survivalBonus = 0.3;
            const combatFactor = this.stats.damageDealt / Math.max(1, this.stats.damageTaken);
            const accuracyFactor = this.stats.shotsFired > 0 ? this.stats.shotsHit / this.stats.shotsFired : 0;
            
            return survivalBonus + (combatFactor * 0.3 + accuracyFactor * 0.2 + this.stats.kills * 0.2);
        }
    }
    
    /**
     * Get combat statistics summary
     */
    getCombatStats() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            isAlive: this.isAlive,
            damageDealt: this.stats.damageDealt,
            damageTaken: this.stats.damageTaken,
            accuracy: this.stats.shotsFired > 0 ? this.stats.shotsHit / this.stats.shotsFired : 0,
            kills: this.stats.kills,
            survivalTime: this.stats.survivalTime
        };
    }
    
    /**
     * Render tank on canvas
     */
    render(ctx) {
        if (!this.isAlive) {
            return;
        }
        
        ctx.save();
        
        // Move to tank center
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle);
        
        // Draw tank body
        ctx.fillStyle = this.team === 'red' ? GAME_CONFIG.UI.COLORS.RED_TEAM : GAME_CONFIG.UI.COLORS.BLUE_TEAM;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw tank turret (barrel)
        ctx.strokeStyle = this.team === 'red' ? '#aa0000' : '#0000aa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width / 2 + 8, 0); // Turret extends beyond tank body
        ctx.stroke();
        
        // Draw tank center dot
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Draw health bar
        this.renderHealthBar(ctx);
        
        // Draw tactical information
        this.renderTacticalType(ctx);
        this.renderTacticalState(ctx);
    }
    
    /**
     * Render health bar above tank
     */
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barY = this.y - 8;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4f4' : healthPercent > 0.25 ? '#ff4' : '#f44';
        ctx.fillRect(this.x, barY, barWidth * healthPercent, barHeight);
    }
    
    /**
     * Render tactical type below tank (e.g., "BERSERKER", "SNIPER")
     */
    renderTacticalType(ctx) {
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
    
    /**
     * Render tactical state above tank (e.g., "ATTACKING", "DEFENDING")
     */
    renderTacticalState(ctx) {
        ctx.save();
        ctx.font = '7px Arial';
        ctx.textAlign = 'center';
        
        const tacticalType = this.getTacticalArchetype();
        const currentState = this.state;
        
        // Create display text
        const stateText = this.getTacticalStateText(tacticalType, currentState);
        
        // Position text above the tank
        const textX = this.x + this.width / 2;
        const textY = this.y - 15; // Above health bar
        
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
    
    /**
     * Determine tactical archetype based on genome
     */
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
        
        // Berserker: High aggression + high speed + high risk-taking
        if (aggression > 0.75 && speed > 0.6 && riskTaking > 0.6) {
            return 'Berserker';
        }
        
        // Sniper: High accuracy + high defense + low aggression
        if (accuracy > 0.7 && defense > 0.6 && aggression < 0.4) {
            return 'Sniper';
        }
        
        // Support: High teamwork + high defense + moderate everything else
        if (teamwork > 0.7 && defense > 0.5) {
            return 'Support';
        }
        
        // Assassin: High evasion + high speed + moderate accuracy
        if (evasion > 0.6 && speed > 0.6 && accuracy > 0.5) {
            return 'Assassin';
        }
        
        // Guardian: High defense + high teamwork + low risk-taking
        if (defense > 0.7 && teamwork > 0.5 && riskTaking < 0.4) {
            return 'Guardian';
        }
        
        // Scout: High speed + high adaptability + high learning
        if (speed > 0.7 && adaptability > 0.6 && learning > 0.5) {
            return 'Scout';
        }
        
        // Default: Balanced
        return 'Balanced';
    }
    
    /**
     * Get display text for current tactical state
     */
    getTacticalStateText(tacticalType, currentState) {
        // Map game states to tactical descriptions
        const stateMap = {
            'patrol': 'PATROLLING',
            'pursuit': 'PURSUING',
            'combat': 'ENGAGING',
            'retreat': 'RETREATING',
            'defend': 'DEFENDING',
            'attack': 'ATTACKING',
            'support': 'SUPPORTING',
            'flank': 'FLANKING',
            'ambush': 'AMBUSHING',
            'regroup': 'REGROUPING'
        };
        
        return stateMap[currentState] || currentState.toUpperCase();
    }
    
    /**
     * Get background color for tactical state display
     */
    getTacticalBackgroundColor(tacticalType, currentState) {
        const colorMap = {
            'Berserker': 'rgba(255, 100, 100, 0.8)',   // Red - aggressive
            'Sniper': 'rgba(100, 150, 255, 0.8)',      // Blue - precise
            'Support': 'rgba(100, 255, 100, 0.8)',     // Green - supportive  
            'Assassin': 'rgba(200, 100, 255, 0.8)',    // Purple - stealthy
            'Guardian': 'rgba(150, 150, 255, 0.8)',    // Light blue - defensive
            'Scout': 'rgba(255, 200, 100, 0.8)',       // Orange - mobile
            'Balanced': 'rgba(150, 150, 150, 0.8)'     // Gray - balanced
        };
        
        return colorMap[tacticalType] || 'rgba(128, 128, 128, 0.8)';
    }
    
    /**
     * Get text color for tactical state display
     */
    getTacticalTextColor(tacticalType, currentState) {
        const colorMap = {
            'Berserker': '#ffffff', 
            'Sniper': '#ffffff',
            'Support': '#000000',
            'Assassin': '#ffffff',
            'Guardian': '#ffffff',
            'Scout': '#000000',
            'Balanced': '#ffffff'
        };
        
        return colorMap[tacticalType] || '#ffffff';
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TankEntity };
} else {
    window.TankEntity = TankEntity;
}
