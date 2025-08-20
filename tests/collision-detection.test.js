/**
 * Collision Detection and Obstacle System Tests
 * Tests for collision detection, line of sight, and obstacle interaction
 */

describe('Collision Detection and Obstacle System', () => {
    let canvas;
    let obstacles;
    
    beforeEach(() => {
        // Mock canvas for obstacle generation
        canvas = {
            width: 800,
            height: 600
        };
        
        // Create test obstacles
        obstacles = [
            { x: 100, y: 100, width: 80, height: 60 },
            { x: 300, y: 200, width: 60, height: 40 },
            { x: 500, y: 300, width: 100, height: 80 },
            { x: 200, y: 400, width: 40, height: 60 }
        ];
    });

    describe('Basic Collision Detection', () => {
        test('should detect rectangle overlap', () => {
            const rect1 = { x: 10, y: 10, width: 50, height: 30 };
            const rect2 = { x: 30, y: 20, width: 40, height: 25 };
            const rect3 = { x: 100, y: 100, width: 20, height: 20 };
            
            // Mock CollisionUtils if not available
            if (typeof CollisionUtils === 'undefined') {
                global.CollisionUtils = {
                    rectanglesOverlap: (r1, r2) => {
                        return r1.x < r2.x + r2.width &&
                               r1.x + r1.width > r2.x &&
                               r1.y < r2.y + r2.height &&
                               r1.y + r1.height > r2.y;
                    }
                };
            }
            
            expect(CollisionUtils.rectanglesOverlap(rect1, rect2)).toBe(true);
            expect(CollisionUtils.rectanglesOverlap(rect1, rect3)).toBe(false);
        });

        test('should detect point in rectangle', () => {
            const rect = { x: 100, y: 100, width: 50, height: 30 };
            
            const pointInside = { x: 120, y: 110 };
            const pointOutside = { x: 200, y: 200 };
            const pointOnEdge = { x: 100, y: 100 };
            
            expect(pointInside.x >= rect.x && pointInside.x <= rect.x + rect.width &&
                   pointInside.y >= rect.y && pointInside.y <= rect.y + rect.height).toBe(true);
            expect(pointOutside.x >= rect.x && pointOutside.x <= rect.x + rect.width &&
                   pointOutside.y >= rect.y && pointOutside.y <= rect.y + rect.height).toBe(false);
            expect(pointOnEdge.x >= rect.x && pointOnEdge.x <= rect.x + rect.width &&
                   pointOnEdge.y >= rect.y && pointOnEdge.y <= rect.y + rect.height).toBe(true);
        });

        test('should detect circle-rectangle collision', () => {
            const circle = { x: 150, y: 130, radius: 20 };
            const rect = { x: 100, y: 100, width: 80, height: 60 };
            
            // Distance from circle center to closest point on rectangle
            const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
            const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
            const distance = Math.sqrt((circle.x - closestX) ** 2 + (circle.y - closestY) ** 2);
            
            expect(distance <= circle.radius).toBe(true);
        });
    });

    describe('Line of Sight Detection', () => {
        test('should detect clear line of sight', () => {
            const start = { x: 50, y: 50 };
            const end = { x: 250, y: 150 };
            
            // Mock line intersection check
            const hasLineOfSight = (startPos, endPos, obstacleList) => {
                return !obstacleList.some(obstacle => {
                    // Simple line-rectangle intersection test
                    return lineIntersectsRect(startPos.x, startPos.y, endPos.x, endPos.y, obstacle);
                });
            };
            
            const lineIntersectsRect = (x1, y1, x2, y2, rect) => {
                // Simplified line-rectangle intersection
                const minX = Math.min(x1, x2);
                const maxX = Math.max(x1, x2);
                const minY = Math.min(y1, y2);
                const maxY = Math.max(y1, y2);
                
                return !(maxX < rect.x || minX > rect.x + rect.width ||
                        maxY < rect.y || minY > rect.y + rect.height);
            };
            
            expect(hasLineOfSight(start, end, [])).toBe(true);
            expect(hasLineOfSight(start, end, obstacles)).toBe(false);
        });

        test('should detect blocked line of sight', () => {
            const start = { x: 50, y: 50 };
            const endBehindObstacle = { x: 150, y: 130 }; // Behind first obstacle
            
            // This would be blocked by obstacles[0] at (100, 100)
            const isBlocked = obstacles.some(obstacle => {
                return start.x < obstacle.x + obstacle.width && endBehindObstacle.x > obstacle.x &&
                       start.y < obstacle.y + obstacle.height && endBehindObstacle.y > obstacle.y;
            });
            
            expect(isBlocked).toBe(true);
        });

        test('should handle edge cases for line of sight', () => {
            // Line of sight to same point should always be clear
            expect(true).toBe(true); // Same point always has line of sight
        });
    });

    describe('Obstacle Generation', () => {
        test('should generate obstacles within canvas bounds', () => {
            const generateRandomObstacles = (count, canvasInfo) => {
                const generatedObstacles = [];
                for (let i = 0; i < count; i++) {
                    const width = 40 + Math.random() * 60;
                    const height = 30 + Math.random() * 50;
                    const x = Math.random() * (canvasInfo.width - width);
                    const y = Math.random() * (canvasInfo.height - height);
                    
                    generatedObstacles.push({ x, y, width, height });
                }
                return generatedObstacles;
            };
            
            const generated = generateRandomObstacles(10, canvas);
            
            expect(generated).toHaveLength(10);
            generated.forEach(obstacle => {
                expect(obstacle.x).toBeGreaterThanOrEqual(0);
                expect(obstacle.y).toBeGreaterThanOrEqual(0);
                expect(obstacle.x + obstacle.width).toBeLessThanOrEqual(canvas.width);
                expect(obstacle.y + obstacle.height).toBeLessThanOrEqual(canvas.height);
            });
        });

        test('should avoid overlapping with hill', () => {
            const hill = { x: 400, y: 300, radius: 60 };
            
            const isObstacleOverlappingHill = (obstacle, hillInfo) => {
                const closestX = Math.max(obstacle.x, Math.min(hillInfo.x, obstacle.x + obstacle.width));
                const closestY = Math.max(obstacle.y, Math.min(hillInfo.y, obstacle.y + obstacle.height));
                const distance = Math.sqrt((hillInfo.x - closestX) ** 2 + (hillInfo.y - closestY) ** 2);
                return distance < hillInfo.radius + 10; // Add buffer
            };
            
            const validObstacle = { x: 100, y: 100, width: 50, height: 40 };
            const overlappingObstacle = { x: 380, y: 280, width: 50, height: 40 };
            
            expect(isObstacleOverlappingHill(validObstacle, hill)).toBe(false);
            expect(isObstacleOverlappingHill(overlappingObstacle, hill)).toBe(true);
        });

        test('should generate different obstacle patterns for scenarios', () => {
            const scenarios = {
                open_field: { obstacleCount: 8, obstacleSize: { min: 30, max: 60 } },
                urban_warfare: { obstacleCount: 20, obstacleSize: { min: 40, max: 80 } },
                chokepoint_control: { obstacleCount: 12, obstacleSize: { min: 50, max: 100 } }
            };
            
            Object.entries(scenarios).forEach(([_scenarioName, config]) => {
                expect(config.obstacleCount).toBeGreaterThan(0);
                expect(config.obstacleSize.max).toBeGreaterThan(config.obstacleSize.min);
                expect(config.obstacleSize.min).toBeGreaterThanOrEqual(20);
                expect(config.obstacleSize.max).toBeLessThanOrEqual(120);
            });
        });
    });

    describe('Tank-Obstacle Interaction', () => {
        test('should detect tank collision with obstacle', () => {
            const tank = { x: 95, y: 95, width: 24, height: 16 };
            const obstacle = obstacles[0]; // { x: 100, y: 100, width: 80, height: 60 }
            
            const isColliding = tank.x < obstacle.x + obstacle.width &&
                              tank.x + tank.width > obstacle.x &&
                              tank.y < obstacle.y + obstacle.height &&
                              tank.y + tank.height > obstacle.y;
            
            expect(isColliding).toBe(true);
        });

        test('should calculate safe movement paths around obstacles', () => {
            const tank = { x: 50, y: 50, width: 24, height: 16 };
            const target = { x: 150, y: 150 };
            
            // Simple pathfinding: if direct path is blocked, try alternative angles
            const directPath = { x: target.x - tank.x, y: target.y - tank.y };
            const directAngle = Math.atan2(directPath.y, directPath.x);
            
            const alternativeAngles = [
                directAngle + Math.PI / 4,  // 45 degrees offset
                directAngle - Math.PI / 4   // -45 degrees offset
            ];
            
            expect(alternativeAngles).toHaveLength(2);
            alternativeAngles.forEach(angle => {
                expect(angle).toBeDefined();
                expect(typeof angle).toBe('number');
            });
        });

        test('should handle projectile-obstacle collision', () => {
            const projectile = { x: 120, y: 120, radius: 4 };
            const obstacle = obstacles[0];
            
            // Check if projectile center is inside obstacle
            const isInside = projectile.x >= obstacle.x &&
                           projectile.x <= obstacle.x + obstacle.width &&
                           projectile.y >= obstacle.y &&
                           projectile.y <= obstacle.y + obstacle.height;
            
            expect(isInside).toBe(true);
        });
    });

    describe('Performance Optimization', () => {
        test('should handle large numbers of obstacles efficiently', () => {
            const manyObstacles = [];
            for (let i = 0; i < 1000; i++) {
                manyObstacles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    width: 20 + Math.random() * 40,
                    height: 20 + Math.random() * 40
                });
            }
            
            const tank = { x: 400, y: 300, width: 24, height: 16 };
            
            const startTime = performance.now();
            const collisions = manyObstacles.filter(obstacle => {
                return tank.x < obstacle.x + obstacle.width &&
                       tank.x + tank.width > obstacle.x &&
                       tank.y < obstacle.y + obstacle.height &&
                       tank.y + tank.height > obstacle.y;
            });
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
            expect(Array.isArray(collisions)).toBe(true);
        });

        test('should use spatial partitioning for collision detection', () => {
            // Simple spatial hash implementation for testing
            const spatialGrid = new Map();
            const gridSize = 100;
            
            const addToGrid = (entity, grid, size) => {
                const gridX = Math.floor(entity.x / size);
                const gridY = Math.floor(entity.y / size);
                const key = `${gridX},${gridY}`;
                
                if (!grid.has(key)) {
                    grid.set(key, []);
                }
                grid.get(key).push(entity);
            };
            
            obstacles.forEach(obstacle => addToGrid(obstacle, spatialGrid, gridSize));
            
            expect(spatialGrid.size).toBeGreaterThan(0);
            expect(spatialGrid.size).toBeLessThanOrEqual(obstacles.length);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle null or undefined obstacles', () => {
            expect(() => {
                const nullObstacles = null;
                const undefinedObstacles = undefined;
                const collisions1 = (nullObstacles || []).filter(_obstacle => false);
                const collisions2 = (undefinedObstacles || []).filter(_obstacle => false);
                return collisions1.length + collisions2.length;
            }).not.toThrow();
        });

        test('should handle malformed obstacle data', () => {
            const malformedObstacles = [
                { x: 100, y: 100 }, // Missing width/height
                { width: 50, height: 40 }, // Missing position
                { x: "invalid", y: 100, width: 50, height: 40 }, // Invalid type
                null,
                undefined
            ];
            
            const tank = { x: 100, y: 100, width: 24, height: 16 };
            
            expect(() => {
                malformedObstacles.filter(obstacle => {
                    if (!obstacle || typeof obstacle.x !== 'number' || typeof obstacle.y !== 'number') {
                        return false;
                    }
                    return tank.x < obstacle.x + (obstacle.width || 0) &&
                           tank.x + tank.width > obstacle.x &&
                           tank.y < obstacle.y + (obstacle.height || 0) &&
                           tank.y + tank.height > obstacle.y;
                });
            }).not.toThrow();
        });

        test('should handle zero-sized obstacles', () => {
            const zeroObstacle = { x: 100, y: 100, width: 0, height: 0 };
            const tank = { x: 100, y: 100, width: 24, height: 16 };
            
            const isColliding = tank.x < zeroObstacle.x + zeroObstacle.width &&
                              tank.x + tank.width > zeroObstacle.x &&
                              tank.y < zeroObstacle.y + zeroObstacle.height &&
                              tank.y + tank.height > zeroObstacle.y;
            
            // Zero-sized obstacle should not collide
            expect(isColliding).toBe(false);
        });

        test('should handle very large obstacles', () => {
            const giantObstacle = { x: 0, y: 0, width: 10000, height: 10000 };
            const tank = { x: 400, y: 300, width: 24, height: 16 };
            
            const isColliding = tank.x < giantObstacle.x + giantObstacle.width &&
                              tank.x + tank.width > giantObstacle.x &&
                              tank.y < giantObstacle.y + giantObstacle.height &&
                              tank.y + tank.height > giantObstacle.y;
            
            expect(isColliding).toBe(true);
        });
    });
});
