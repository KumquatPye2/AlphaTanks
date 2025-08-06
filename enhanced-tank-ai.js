/**
 * Enhanced Tank AI with Improved Obstacle Navigation
 * This module provides better pathfinding and obstacle avoidance
 * to replace the basic obstacle handling in tank-ai.js
 */

class EnhancedTankAI {
    constructor(tank, obstacleSystem) {
        this.tank = tank;
        this.obstacleSystem = obstacleSystem;
        this.movement = new EnhancedTankMovement(tank, obstacleSystem);
        
        // Navigation state
        this.currentPath = null;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 0.5; // Update path twice per second
        this.lastTargetX = null;
        this.lastTargetY = null;
        this.stuckTimer = 0;
        this.stuckThreshold = 2.0; // 2 seconds stuck triggers new path
        this.lastPosition = { x: tank.x, y: tank.y };
        
        // Enhanced behavior parameters
        this.avoidanceRadius = 50; // Distance to start avoiding obstacles
        this.lookaheadDistance = 30; // How far ahead to check for obstacles
        this.pathOptimization = true; // Enable path smoothing
    }

    updateMovement(deltaTime, targetX, targetY, gameState) {
        // Check if we're stuck
        this.checkIfStuck(deltaTime);
        
        // Update pathfinding if needed
        this.updatePathfinding(deltaTime, targetX, targetY);
        
        // Execute movement with enhanced obstacle avoidance
        this.executeMovement(deltaTime, gameState);
        
        // Update last known position
        this.lastPosition = { x: this.tank.x, y: this.tank.y };
    }

    checkIfStuck(deltaTime) {
        const distanceMoved = Math.sqrt(
            Math.pow(this.tank.x - this.lastPosition.x, 2) + 
            Math.pow(this.tank.y - this.lastPosition.y, 2)
        );
        
        if (distanceMoved < 5) { // Less than 5 pixels movement
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer > this.stuckThreshold) {
                // Force new pathfinding when stuck
                this.currentPath = null;
                this.stuckTimer = 0;
                
                // Add some randomness to escape loops
                this.pathUpdateInterval = 0.1 + Math.random() * 0.3;
            }
        } else {
            this.stuckTimer = 0;
            this.pathUpdateInterval = 0.5; // Reset normal update interval
        }
    }

    updatePathfinding(deltaTime, targetX, targetY) {
        this.pathUpdateTimer += deltaTime;
        
        const targetChanged = Math.abs(targetX - (this.lastTargetX || 0)) > 20 || 
                             Math.abs(targetY - (this.lastTargetY || 0)) > 20;
        
        const needsUpdate = this.pathUpdateTimer >= this.pathUpdateInterval || 
                           !this.currentPath || 
                           targetChanged ||
                           this.stuckTimer > 1.0;
        
        if (needsUpdate) {
            this.currentPath = this.obstacleSystem.findPath(
                this.tank.x + this.tank.width / 2,
                this.tank.y + this.tank.height / 2,
                targetX,
                targetY
            );
            
            // Optimize path if enabled
            if (this.pathOptimization && this.currentPath) {
                this.currentPath = this.optimizePath(this.currentPath);
            }
            
            this.pathUpdateTimer = 0;
            this.lastTargetX = targetX;
            this.lastTargetY = targetY;
        }
    }

    optimizePath(path) {
        if (!path || path.length <= 2) {
            return path;
        }
        
        const optimizedPath = [path[0]];
        let currentIndex = 0;
        
        while (currentIndex < path.length - 1) {
            let farthestVisible = currentIndex + 1;
            
            // Find the farthest point we can see directly
            for (let i = currentIndex + 2; i < path.length; i++) {
                if (this.hasLineOfSight(path[currentIndex], path[i])) {
                    farthestVisible = i;
                } else {
                    break;
                }
            }
            
            optimizedPath.push(path[farthestVisible]);
            currentIndex = farthestVisible;
        }
        
        return optimizedPath;
    }

    hasLineOfSight(start, end) {
        const steps = 10;
        const dx = (end.x - start.x) / steps;
        const dy = (end.y - start.y) / steps;
        
        for (let i = 0; i <= steps; i++) {
            const x = start.x + dx * i;
            const y = start.y + dy * i;
            
            // Check if this point intersects with any obstacle
            const testRect = {
                x: x - this.tank.width / 2,
                y: y - this.tank.height / 2,
                width: this.tank.width,
                height: this.tank.height
            };
            
            if (this.obstacleSystem.obstacles.some(obs => 
                this.obstacleSystem.isOverlapping(testRect, obs))) {
                return false;
            }
        }
        
        return true;
    }

    executeMovement(deltaTime, gameState) {
        let moveVector = { x: 0, y: 0 };
        
        if (this.currentPath && this.currentPath.length > 1) {
            // Follow pathfinding route
            moveVector = this.followPath(deltaTime);
        } else {
            // Direct movement with local avoidance
            moveVector = this.calculateDirectMovement(deltaTime);
        }
        
        // Apply movement with collision prevention
        this.applyMovement(moveVector, deltaTime, gameState);
    }

    followPath(deltaTime) {
        const nextWaypoint = this.currentPath[1];
        const tankCenterX = this.tank.x + this.tank.width / 2;
        const tankCenterY = this.tank.y + this.tank.height / 2;
        
        const dx = nextWaypoint.x - tankCenterX;
        const dy = nextWaypoint.y - tankCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Remove waypoint if we're close enough
        if (distance < this.obstacleSystem.gridSize * 0.7) {
            this.currentPath.shift();
            
            if (this.currentPath.length <= 1) {
                this.currentPath = null;
                return { x: 0, y: 0 };
            }
            
            // Recalculate for next waypoint
            return this.followPath(deltaTime);
        }
        
        // Calculate movement vector
        if (distance > 0) {
            const speed = this.tank.speed * deltaTime;
            return {
                x: (dx / distance) * speed,
                y: (dy / distance) * speed
            };
        }
        
        return { x: 0, y: 0 };
    }

    calculateDirectMovement(deltaTime) {
        if (!this.tank.targetX || !this.tank.targetY) {
            return { x: 0, y: 0 };
        }
        
        const dx = this.tank.targetX - this.tank.x;
        const dy = this.tank.targetY - this.tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            return { x: 0, y: 0 };
        }
        
        const speed = this.tank.speed * deltaTime;
        const moveVector = {
            x: (dx / distance) * speed,
            y: (dy / distance) * speed
        };
        
        // Check for obstacles and apply avoidance
        return this.applyLocalAvoidance(moveVector);
    }

    applyLocalAvoidance(moveVector) {
        // Check for immediate collision
        const collision = this.obstacleSystem.predictCollision(this.tank, moveVector.x, moveVector.y);
        
        if (!collision) {
            return moveVector;
        }
        
        // Try different avoidance strategies
        const avoidanceStrategies = [
            this.trySlideMovement(moveVector, collision),
            this.tryPerpendicularMovement(moveVector),
            this.tryReverseMovement(moveVector),
            this.tryRandomAvoidance(moveVector)
        ];
        
        for (const strategy of avoidanceStrategies) {
            if (strategy && !this.obstacleSystem.predictCollision(this.tank, strategy.x, strategy.y)) {
                return strategy;
            }
        }
        
        // Last resort: stop
        return { x: 0, y: 0 };
    }

    trySlideMovement(moveVector, obstacle) {
        // Try sliding along obstacle edge
        const tankCenter = {
            x: this.tank.x + this.tank.width / 2,
            y: this.tank.y + this.tank.height / 2
        };
        
        const obstacleCenter = {
            x: obstacle.x + obstacle.width / 2,
            y: obstacle.y + obstacle.height / 2
        };
        
        const dx = tankCenter.x - obstacleCenter.x;
        const dy = tankCenter.y - obstacleCenter.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Slide vertically
            return { x: 0, y: moveVector.y };
        } else {
            // Slide horizontally
            return { x: moveVector.x, y: 0 };
        }
    }

    tryPerpendicularMovement(moveVector) {
        // Move perpendicular to intended direction
        return {
            x: -moveVector.y,
            y: moveVector.x
        };
    }

    tryReverseMovement(moveVector) {
        // Move in reverse direction
        return {
            x: -moveVector.x * 0.5,
            y: -moveVector.y * 0.5
        };
    }

    tryRandomAvoidance(moveVector) {
        // Random avoidance direction
        const angle = Math.random() * Math.PI * 2;
        const magnitude = Math.sqrt(moveVector.x * moveVector.x + moveVector.y * moveVector.y);
        
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        };
    }

    applyMovement(moveVector, deltaTime, gameState) {
        // Final safety check before applying movement
        if (moveVector.x === 0 && moveVector.y === 0) {
            return;
        }
        
        const newX = this.tank.x + moveVector.x;
        const newY = this.tank.y + moveVector.y;
        
        // Ensure tank stays within battlefield bounds
        const boundedX = Math.max(0, Math.min(gameState.width - this.tank.width, newX));
        const boundedY = Math.max(0, Math.min(gameState.height - this.tank.height, newY));
        
        // Apply movement
        this.tank.x = boundedX;
        this.tank.y = boundedY;
        
        // Update tank angle to face movement direction
        if (moveVector.x !== 0 || moveVector.y !== 0) {
            this.tank.angle = Math.atan2(moveVector.y, moveVector.x);
        }
    }

    // Debugging and visualization
    renderDebugInfo(ctx) {
        if (!window.DEBUG_TANK_AI) {
            return;
        }
        
        ctx.save();
        
        // Render current path
        if (this.currentPath && this.currentPath.length > 1) {
            ctx.strokeStyle = this.tank.team === 'red' ? '#ff6666' : '#6666ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            
            ctx.beginPath();
            ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
            
            for (let i = 1; i < this.currentPath.length; i++) {
                ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Render waypoints
            for (let i = 0; i < this.currentPath.length; i++) {
                ctx.fillStyle = i === 0 ? '#00ff00' : '#ffff00';
                ctx.beginPath();
                ctx.arc(this.currentPath[i].x, this.currentPath[i].y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Render stuck indicator
        if (this.stuckTimer > 0.5) {
            ctx.fillStyle = '#ff0000';
            ctx.font = '12px monospace';
            ctx.fillText('STUCK', this.tank.x, this.tank.y - 20);
        }
        
        ctx.restore();
    }

    // Performance metrics
    getPerformanceMetrics() {
        return {
            hasPath: !!this.currentPath,
            pathLength: this.currentPath ? this.currentPath.length : 0,
            isStuck: this.stuckTimer > 1.0,
            pathUpdateInterval: this.pathUpdateInterval
        };
    }
}

// Integration helper
class ObstacleSystemIntegrator {
    static upgradeGameEngine(gameEngine) {
        // Replace simple obstacle system with enhanced version
        gameEngine.enhancedObstacles = new EnhancedObstacleSystem(gameEngine.width, gameEngine.height);
        
        // Upgrade all tanks with enhanced AI
        gameEngine.tanks.forEach(tank => {
            if (!tank.enhancedAI) {
                tank.enhancedAI = new EnhancedTankAI(tank, gameEngine.enhancedObstacles);
            }
        });
        
        // Override tank movement method
        const originalUpdateMovement = gameEngine.tanks[0]?.updateMovement;
        if (originalUpdateMovement) {
            gameEngine.tanks.forEach(tank => {
                tank.originalUpdateMovement = tank.updateMovement;
                tank.updateMovement = function(deltaTime, gameState) {
                    if (this.enhancedAI) {
                        this.enhancedAI.updateMovement(deltaTime, this.targetX, this.targetY, gameState);
                    } else {
                        this.originalUpdateMovement(deltaTime, gameState);
                    }
                };
            });
        }
        
        // Override obstacle rendering
        gameEngine.originalRenderObstacles = gameEngine.render;
        gameEngine.render = function() {
            // Clear canvas
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw grid
            this.drawGrid();
            
            // Draw enhanced obstacles
            if (this.enhancedObstacles) {
                this.enhancedObstacles.render(this.ctx);
            } else {
                this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
            }
            
            // Draw tanks with debug info
            this.tanks.forEach(tank => {
                tank.render(this.ctx);
                if (tank.enhancedAI) {
                    tank.enhancedAI.renderDebugInfo(this.ctx);
                }
            });
            
            // Draw projectiles
            this.projectiles.forEach(projectile => projectile.render(this.ctx));
            
            // Draw UI overlay
            this.drawBattleInfo();
        };
        
        console.log('✅ Enhanced Obstacle System integrated successfully!');
        console.log('🔧 Enable DEBUG_TANK_AI and DEBUG_PATHFINDING for visual debugging');
    }
}

// Global exports
window.EnhancedTankAI = EnhancedTankAI;
window.ObstacleSystemIntegrator = ObstacleSystemIntegrator;
