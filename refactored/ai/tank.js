/**
 * Refactored Tank Class - Main Tank Implementation
 * Uses composition pattern to combine TankEntity, TankAI, and TankCombat
 * This provides a clean interface while maintaining separation of concerns
 */

class Tank {
    constructor(x, y, team, genome) {
        // Create core entity
        this.entity = new TankEntity(x, y, team, genome);
        
        // Phase 2: Add unique tank ID for insights tracking
        this.tankId = `${team}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.entity.tankId = this.tankId; // Also add to entity for CollisionUtils access
        
        // Create AI system
        this.ai = new TankAI(this.entity);
        
        // Create combat system
        this.combat = new TankCombat(this.entity);
        
        // Expose commonly used properties from entity for backward compatibility
        this.x = this.entity.x;
        this.y = this.entity.y;
        this.spawnX = this.entity.spawnX;
        this.spawnY = this.entity.spawnY;
        this.width = this.entity.width;
        this.height = this.entity.height;
        this.team = this.entity.team;
        this.genome = this.entity.genome;
        this.health = this.entity.health;
        this.maxHealth = this.entity.maxHealth;
        this.isAlive = this.entity.isAlive;
        this.angle = this.entity.angle;
        this.speed = this.entity.speed;
        this.damage = this.entity.damage;
        this.range = this.entity.range;
        this.accuracy = this.entity.accuracy;
        this.fireRate = this.entity.fireRate;
        this.allies = this.entity.allies;
        this.enemies = this.entity.enemies;
        this.target = this.entity.target;
        this.state = this.entity.state;
        this.stats = this.entity.stats;
        
        // Behavior weights for external access
        this.aggressionWeight = this.entity.behaviorWeights.aggression;
        this.cautionWeight = this.entity.behaviorWeights.caution;
        this.cooperationWeight = this.entity.behaviorWeights.cooperation;
        this.formationWeight = this.entity.behaviorWeights.formation;
        this.riskTakingWeight = this.entity.behaviorWeights.riskTaking;
        this.evasionWeight = this.entity.behaviorWeights.evasion;
        this.objectiveFocus = this.entity.behaviorWeights.objectiveFocus;
        this.hillPriority = this.entity.behaviorWeights.hillPriority;
        this.contestWillingness = this.entity.behaviorWeights.contestWillingness;
        
        // For genome validation compatibility
        this.trait0 = this.genome[0];
        this.trait8 = this.genome[8];
        
        // Legacy properties for compatibility
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.survivalTime = 0;
        this.kills = 0;
        this.lastShotTime = 0;
        this.targetX = this.entity.targetX;
        this.targetY = this.entity.targetY;
        this.stateTimer = 0;
        this.averageEngagementDistance = 0;
        this.engagementDistances = [];
        this.stateChanges = 0;
        this.targetSwitches = 0;
        this.previousTarget = null;
        this.previousState = null;
    }
    
    /**
     * Main update method - coordinates all subsystems
     */
    update(deltaTime, gameState) {
        // Always sync first so external systems see accurate alive/dead state
        this.syncProperties();
        if (!this.entity.isAlive) {
            return;
        }
        
        // Update entity (basic properties and lifecycle)
        this.entity.updateSurvivalTime(deltaTime);
        
        // Update AI (decision making and behavior)
        this.ai.update(deltaTime, gameState);
        
        // Update combat (firing and damage)
        this.combat.update(deltaTime, gameState);
        
        // Sync exposed properties with entity state
        this.syncProperties();
        
        // Keep tank within battlefield bounds
        this.entity.keepInBounds(gameState.width, gameState.height);
        
        // Update position references
        this.x = this.entity.x;
        this.y = this.entity.y;
    }
    
    /**
     * Synchronize exposed properties with internal entity state
     */
    syncProperties() {
        // Core properties
        this.health = this.entity.health;
        this.isAlive = this.entity.isAlive;
        this.angle = this.entity.angle;
        this.target = this.entity.target;
        this.state = this.entity.state;
        this.allies = this.entity.allies;
        this.enemies = this.entity.enemies;
        this.targetX = this.entity.targetX;
        this.targetY = this.entity.targetY;
        this.stateTimer = this.entity.stateTimer;
        
        // Statistics
        this.damageDealt = this.entity.stats.damageDealt;
        this.damageTaken = this.entity.stats.damageTaken;
        this.shotsFired = this.entity.stats.shotsFired;
        this.shotsHit = this.entity.stats.shotsHit;
        this.survivalTime = this.entity.stats.survivalTime;
        this.kills = this.entity.stats.kills;
        this.lastShotTime = this.entity.lastShotTime;
        this.averageEngagementDistance = this.entity.averageEngagementDistance || 0;
        this.engagementDistances = this.entity.stats.engagementDistances;
        this.stateChanges = this.entity.stats.stateChanges;
        this.targetSwitches = this.entity.stats.targetSwitches;
        this.previousTarget = this.entity.previousTarget;
        this.previousState = this.entity.previousState;
    }
    
    /**
     * Take damage - delegates to entity
     */
    takeDamage(damage) {
        return this.entity.takeDamage(damage);
    }
    
    /**
     * Distance calculation - delegates to entity
     */
    distanceTo(other) {
        return this.entity.distanceTo(other);
    }
    
    /**
     * Render tank - delegates to entity
     */
    render(ctx) {
        this.entity.render(ctx);
    }
    
    /**
     * Get center position - delegates to entity
     */
    getCenterPosition() {
        return this.entity.getCenterPosition();
    }
    
    /**
     * Check if tank can fire - delegates to entity
     */
    canFire() {
        return this.entity.canFire();
    }
    
    /**
     * Record a hit - delegates to entity
     */
    recordHit(damage) {
        this.entity.recordHit(damage);
    }
    
    /**
     * Record a shot - delegates to entity
     */
    recordShot() {
        this.entity.recordShot();
    }
    
    /**
     * Record a kill - delegates to entity
     */
    recordKill() {
        this.entity.recordKill();
    }
    
    /**
     * Calculate fitness - delegates to entity
     */
    calculateFitness() {
        return this.entity.calculateFitness();
    }
    
    /**
     * Get combat statistics - delegates to entity and combat system
     */
    getCombatStats() {
        return this.entity.getCombatStats();
    }
    
    /**
     * Get combat metrics - delegates to combat system
     */
    getCombatMetrics() {
        return this.combat.getCombatMetrics();
    }
    
    // Legacy methods for backward compatibility
    
    /**
     * Alternative method name for validation compatibility
     */
    findClosestEnemy(_gameState = null) {
        return this.ai.findClosestEnemy();
    }
    
    /**
     * Check line of sight to target
     */
    hasLineOfSight(target, obstacles) {
        return CollisionUtils.hasLineOfSight(this.entity, target, obstacles);
    }
    
    /**
     * Line intersection utility
     */
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        return MathUtils.lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4);
    }
    
    /**
     * Update perception - delegates to AI
     */
    updatePerception(gameState) {
        this.ai.updatePerception(gameState);
    }
    
    /**
     * Make decisions - delegates to AI
     */
    makeDecisions(deltaTime, gameState) {
        this.ai.makeDecisions(deltaTime, gameState);
    }
    
    /**
     * Update movement - handled by AI automatically
     */
    updateMovement(_deltaTime, _gameState) {
        // This is now handled internally by the AI system
        // Keep this method for compatibility but don't do anything
    }
    
    /**
     * Update combat - handled by combat system automatically
     */
    updateCombat(_deltaTime, _gameState) {
        // This is now handled internally by the combat system
        // Keep this method for compatibility but don't do anything
    }
    
    /**
     * Keep in bounds - delegates to entity
     */
    keepInBounds(width, height) {
        this.entity.keepInBounds(width, height);
        this.x = this.entity.x;
        this.y = this.entity.y;
    }
    
    /**
     * Get game object for compatibility
     */
    getGameObject() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            team: this.team,
            health: this.health,
            isAlive: this.isAlive,
            angle: this.angle
        };
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Tank };
} else {
    window.Tank = Tank;
}
