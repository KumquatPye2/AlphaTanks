/**
 * Tank Combat System
 * Handles projectile creation, firing logic, and damage calculations
 * Separated from tank entity for better organization
 */

class TankCombat {
    constructor(tankEntity) {
        this.tank = tankEntity;
        this.projectiles = []; // Local projectile tracking for this tank
    }
    
    /**
     * Update combat system
     */
    update(deltaTime, gameState) {
        if (!this.tank.isAlive) {
            return;
        }
        
        // Drop invalid targets proactively
        if (this.tank.target && (!this.tank.target.isAlive)) {
            this.tank.setTarget(null);
        }
        
        // Handle automatic firing if we have a valid target
        if (this.tank.target && this.shouldFireAtTarget(this.tank.target, gameState)) {
            this.fire(gameState);
        }
    }
    
    /**
     * Determine if tank should fire at current target
     */
    shouldFireAtTarget(target, gameState) {
        if (!target || !target.isAlive || !this.tank.canFire()) {
            return false;
        }
        
        // Check if target is in range
        const distance = this.tank.distanceTo(target);
        if (distance > this.tank.range) {
            return false;
        }
        
        // Check if we have line of sight
        if (!CollisionUtils.hasLineOfSight(this.tank, target, gameState.obstacles)) {
            return false;
        }
        
        // Check if tank is aimed roughly at target
        const angleToTarget = this.tank.angleTo(target);
        const angleDifference = Math.abs(MathUtils.normalizeAngle(this.tank.angle - angleToTarget));
        
        // Allow some aiming tolerance based on accuracy
        const aimingTolerance = (1.0 - this.tank.accuracy) * Math.PI / 4; // Up to 45 degrees for inaccurate tanks
        
        return angleDifference <= aimingTolerance;
    }
    
    /**
     * Fire a projectile
     */
    fire(gameState) {
        if (!this.tank.canFire()) {
            return null;
        }
        
        // Record the shot
        this.tank.recordShot();
        
        // Calculate projectile starting position (from tank center)
        const center = this.tank.getCenterPosition();
        const projectileX = center.x + Math.cos(this.tank.angle) * (this.tank.width / 2);
        const projectileY = center.y + Math.sin(this.tank.angle) * (this.tank.height / 2);
        
        // Apply accuracy (add some random spread)
        const spread = (1.0 - this.tank.accuracy) * 0.2; // Max 0.2 radian spread for inaccurate tanks
        const finalAngle = this.tank.angle + (Math.random() - 0.5) * spread;
        
        // Create projectile
        const projectile = new Projectile(
            projectileX,
            projectileY,
            finalAngle,
            this.tank.damage,
            this.tank.team,
            this.tank
        );
        
        // Add to game state if method exists
        if (gameState.addProjectile) {
            gameState.addProjectile(projectile);
        }
        
        // Track engagement distance for statistics
        if (this.tank.target) {
            const engagementDistance = this.tank.distanceTo(this.tank.target);
            this.tank.stats.engagementDistances.push(engagementDistance);
            
            // Calculate average engagement distance
            const distances = this.tank.stats.engagementDistances;
            this.tank.averageEngagementDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        }
        
        return projectile;
    }
    
    /**
     * Handle taking damage (called by projectile collision)
     */
    takeDamage(damage, attacker = null) {
        const wasDestroyed = this.tank.takeDamage(damage);
        
        // Award kill to attacker if tank was destroyed
        if (wasDestroyed && attacker && attacker.recordKill) {
            attacker.recordKill();
            attacker.recordHit(damage);
        } else if (attacker && attacker.recordHit) {
            // Just record the hit if tank survived
            attacker.recordHit(damage);
        }
        
        return wasDestroyed;
    }
    
    /**
     * Calculate optimal firing solution for moving target
     */
    calculateInterceptSolution(target) {
        if (!target || !target.isAlive) {
            return null;
        }
        
        // Simple interception calculation
        // For more accuracy, we could predict target movement
        const dx = target.x - this.tank.x;
        const dy = target.y - this.tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Basic interception - aim slightly ahead for moving targets
        const projectileSpeed = GAME_CONFIG.PROJECTILE.SPEED;
        const timeToTarget = distance / projectileSpeed;
        
        // Predict where target will be (assuming constant velocity)
        let predictedX = target.x;
        let predictedY = target.y;
        
        // If target has velocity information, use it for prediction
        if (target.velocity) {
            predictedX += target.velocity.x * timeToTarget;
            predictedY += target.velocity.y * timeToTarget;
        }
        
        return {
            x: predictedX,
            y: predictedY,
            angle: Math.atan2(predictedY - this.tank.y, predictedX - this.tank.x),
            timeToTarget: timeToTarget
        };
    }
    
    /**
     * Get combat effectiveness metrics
     */
    getCombatMetrics() {
        const stats = this.tank.stats;
        const accuracy = stats.shotsFired > 0 ? stats.shotsHit / stats.shotsFired : 0;
        const damageRatio = stats.damageTaken > 0 ? stats.damageDealt / stats.damageTaken : stats.damageDealt;
        
        return {
            accuracy: accuracy,
            damageRatio: damageRatio,
            damagePerSecond: stats.survivalTime > 0 ? stats.damageDealt / stats.survivalTime : 0,
            averageEngagementDistance: this.tank.averageEngagementDistance || 0,
            kills: stats.kills,
            efficiency: accuracy * damageRatio // Combined effectiveness metric
        };
    }
}

/**
 * Projectile class for tank weapons
 */
class Projectile {
    constructor(x, y, angle, damage, team, owner = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.team = team;
        this.owner = owner;
        
        // Movement properties
        this.speed = GAME_CONFIG.PROJECTILE.SPEED;
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
        
        // Lifecycle properties
        this.lifetime = GAME_CONFIG.PROJECTILE.LIFETIME;
        this.age = 0;
        this.shouldRemove = false;
        
        // Visual properties
        this.width = GAME_CONFIG.PROJECTILE.SIZE;
        this.height = GAME_CONFIG.PROJECTILE.SIZE;
    }
    
    /**
     * Update projectile position and lifecycle
     */
    update(deltaTime) {
        // Move projectile
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Update age
        this.age += deltaTime;
        
        // Mark for removal if lifetime exceeded
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
        }
    }
    
    /**
     * Check if projectile is out of bounds
     */
    isOutOfBounds(width, height) {
        return this.x < -this.width || this.x > width + this.width ||
               this.y < -this.height || this.y > height + this.height;
    }
    
    /**
     * Handle collision with target
     */
    hit(target) {
        if (target && target.team !== this.team) {
            // Apply damage through combat system if available
            if (target.combat && target.combat.takeDamage) {
                target.combat.takeDamage(this.damage, this.owner);
            } else if (target.takeDamage) {
                // Fallback to direct damage
                target.takeDamage(this.damage);
                if (this.owner && this.owner.recordHit) {
                    this.owner.recordHit(this.damage);
                }
            }
            
            // Mark projectile for removal
            this.shouldRemove = true;
            return true;
        }
        return false;
    }
    
    /**
     * Handle collision with obstacle
     */
    hitObstacle() {
        this.shouldRemove = true;
    }
    
    /**
     * Render projectile
     */
    render(ctx) {
        ctx.fillStyle = this.team === 'red' ? GAME_CONFIG.UI.COLORS.RED_TEAM : GAME_CONFIG.UI.COLORS.BLUE_TEAM;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
    
    /**
     * Get collision bounds
     */
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TankCombat, Projectile };
} else {
    window.TankCombat = TankCombat;
    window.Projectile = Projectile;
}
