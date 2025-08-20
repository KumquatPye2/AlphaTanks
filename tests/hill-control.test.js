/**
 * Hill Control System Tests
 * Tests for hill-control.js - capture mechanics, tactical tracking, and strategic information
 */

require('../tests/test-helpers');
const { Hill } = global;

describe('Hill Control System', () => {
    let hill;
    let mockTanks;

    beforeEach(() => {
        // Create fresh hill instance
        hill = new Hill(400, 300, 60);
        
        // Create mock tanks for testing
        mockTanks = {
            red: [
                { x: 380, y: 280, width: 24, height: 16, team: 'red', isAlive: true },
                { x: 420, y: 320, width: 24, height: 16, team: 'red', isAlive: true }
            ],
            blue: [
                { x: 360, y: 290, width: 24, height: 16, team: 'blue', isAlive: true },
                { x: 440, y: 310, width: 24, height: 16, team: 'blue', isAlive: true }
            ],
            dead: [
                { x: 400, y: 300, width: 24, height: 16, team: 'red', isAlive: false }
            ]
        };
    });

    describe('Hill Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(hill.x).toBe(400);
            expect(hill.y).toBe(300);
            expect(hill.radius).toBe(60);
            expect(hill.controllingTeam).toBeNull();
            expect(hill.controlProgress).toBe(0);
            expect(hill.captureTime).toBe(3.0);
            expect(hill.contestRadius).toBe(80); // radius + 20
            expect(hill.occupationTime).toBe(20);
        });

        test('should initialize tactical tracking values', () => {
            expect(hill.controlChanges).toBe(0);
            expect(hill.maxRedControl).toBe(0);
            expect(hill.maxBlueControl).toBe(0);
            expect(hill.currentRedStreak).toBe(0);
            expect(hill.currentBlueStreak).toBe(0);
            expect(hill.previousController).toBeNull();
            expect(hill.captureEvents).toEqual([]);
        });

        test('should initialize with custom radius', () => {
            const customHill = new Hill(100, 200, 80);
            expect(customHill.radius).toBe(80);
            expect(customHill.contestRadius).toBe(100); // radius + 20
        });
    });

    describe('Tank Detection', () => {
        test('should detect tanks within contest radius', () => {
            const tanksInArea = hill.getTanksInArea([...mockTanks.red, ...mockTanks.blue], hill.contestRadius);
            expect(tanksInArea.length).toBeGreaterThan(0);
            tanksInArea.forEach(tank => {
                expect(tank.isAlive).toBe(true);
            });
        });

        test('should ignore dead tanks', () => {
            const allTanks = [...mockTanks.red, ...mockTanks.blue, ...mockTanks.dead];
            const tanksInArea = hill.getTanksInArea(allTanks, hill.contestRadius);
            
            tanksInArea.forEach(tank => {
                expect(tank.isAlive).toBe(true);
            });
        });

        test('should calculate distance correctly', () => {
            const farTank = { x: 600, y: 500, width: 24, height: 16, team: 'red', isAlive: true };
            const tanksInArea = hill.getTanksInArea([farTank], hill.contestRadius);
            expect(tanksInArea).toHaveLength(0);
        });

        test('should handle empty tank array', () => {
            const tanksInArea = hill.getTanksInArea([], hill.contestRadius);
            expect(tanksInArea).toEqual([]);
        });
    });

    describe('Capture Mechanics', () => {
        test('should start capturing with single team', () => {
            hill.update(1.0, mockTanks.red);
            
            expect(hill.controllingTeam).toBe('red');
            expect(hill.controlProgress).toBeGreaterThan(0);
            expect(hill.currentRedStreak).toBeGreaterThan(0);
            expect(hill.currentBlueStreak).toBe(0);
        });

        test('should progress capture over time', () => {
            hill.update(1.0, mockTanks.red);
            const initialProgress = hill.controlProgress;
            
            hill.update(1.0, mockTanks.red);
            expect(hill.controlProgress).toBeGreaterThan(initialProgress);
        });

        test('should complete capture after sufficient time', () => {
            // Simulate capture over time
            for (let i = 0; i < 5; i++) {
                hill.update(1.0, mockTanks.red);
            }
            
            expect(hill.controlProgress).toBe(100);
            expect(hill.controllingTeam).toBe('red');
        });

        test('should handle contested hill (no progress)', () => {
            const allTanks = [...mockTanks.red, ...mockTanks.blue];
            hill.update(1.0, allTanks);
            
            expect(hill.controlProgress).toBe(0);
            expect(hill.controllingTeam).toBeNull();
        });

        test('should decay progress when hill is empty', () => {
            // First establish control
            hill.update(2.0, mockTanks.red);
            expect(hill.controlProgress).toBeGreaterThan(0);
            
            // Then leave hill empty
            hill.update(1.0, []);
            expect(hill.controlProgress).toBeLessThan(100);
        });

        test('should switch control between teams', () => {
            // Red captures first
            hill.update(2.0, mockTanks.red);
            expect(hill.controllingTeam).toBe('red');
            
            // Blue contests and takes over
            hill.update(5.0, mockTanks.blue);
            expect(hill.controllingTeam).toBe('blue');
            expect(hill.controlChanges).toBeGreaterThan(0);
        });
    });

    describe('Tactical Tracking', () => {
        test('should track control streaks', () => {
            hill.update(2.0, mockTanks.red);
            expect(hill.currentRedStreak).toBeCloseTo(2.0, 1);
            expect(hill.maxRedControl).toBeCloseTo(2.0, 1);
            
            hill.update(1.0, mockTanks.red);
            expect(hill.currentRedStreak).toBeCloseTo(3.0, 1);
            expect(hill.maxRedControl).toBeCloseTo(3.0, 1);
        });

        test('should reset opposing streaks on team change', () => {
            // Red controls first
            hill.update(2.0, mockTanks.red);
            expect(hill.currentRedStreak).toBeGreaterThan(0);
            
            // Blue takes over
            hill.update(5.0, mockTanks.blue);
            expect(hill.currentRedStreak).toBe(0);
            expect(hill.currentBlueStreak).toBeGreaterThan(0);
        });

        test('should count control changes', () => {
            expect(hill.controlChanges).toBe(0);
            
            // Red captures
            hill.update(2.0, mockTanks.red);
            
            // Blue captures
            hill.update(5.0, mockTanks.blue);
            
            // Red recaptures
            hill.update(5.0, mockTanks.red);
            
            expect(hill.controlChanges).toBeGreaterThan(1);
        });

        test('should record capture events', () => {
            hill.update(2.0, mockTanks.red);
            hill.update(5.0, mockTanks.blue);
            
            expect(hill.captureEvents.length).toBeGreaterThan(0);
            hill.captureEvents.forEach(event => {
                expect(event).toHaveProperty('time');
                expect(event).toHaveProperty('newTeam');
                expect(event).toHaveProperty('contestDuration');
            });
        });
    });

    describe('Victory Conditions', () => {
        test('should detect victory by occupation time', () => {
            hill.redControlTime = 20; // Equals occupation time
            expect(hill.isGameWon()).toBe(true);
            expect(hill.getWinner()).toBe('red');
            
            hill.redControlTime = 0;
            hill.blueControlTime = 20;
            expect(hill.isGameWon()).toBe(true);
            expect(hill.getWinner()).toBe('blue');
        });

        test('should detect no winner when neither team reaches occupation time', () => {
            hill.redControlTime = 10;
            hill.blueControlTime = 15;
            expect(hill.isGameWon()).toBe(false);
            expect(hill.getWinner()).toBeNull();
        });

        test('should prefer occupation time over score victory', () => {
            hill.redControlTime = 20;
            hill.redScore = 100; // Less than maxScore
            expect(hill.getWinner()).toBe('red');
        });

        test('should handle legacy score-based victory', () => {
            hill.redScore = 500; // Equals maxScore
            expect(hill.isGameWon()).toBe(true);
            expect(hill.getWinner()).toBe('red');
        });
    });

    describe('Strategic Information', () => {
        test('should provide complete strategic information', () => {
            const info = hill.getStrategicInfo();
            
            expect(info).toHaveProperty('position');
            expect(info).toHaveProperty('radius');
            expect(info).toHaveProperty('contestRadius');
            expect(info).toHaveProperty('controllingTeam');
            expect(info).toHaveProperty('controlProgress');
            expect(info).toHaveProperty('redTimeToWin');
            expect(info).toHaveProperty('blueTimeToWin');
            expect(info).toHaveProperty('isContested');
            expect(info).toHaveProperty('isNeutral');
            expect(info).toHaveProperty('isSecure');
        });

        test('should calculate time to win correctly', () => {
            hill.redControlTime = 5;
            hill.blueControlTime = 10;
            
            const info = hill.getStrategicInfo();
            expect(info.redTimeToWin).toBe(15); // 20 - 5
            expect(info.blueTimeToWin).toBe(10); // 20 - 10
        });

        test('should identify hill states correctly', () => {
            // Neutral hill
            let info = hill.getStrategicInfo();
            expect(info.isNeutral).toBe(true);
            expect(info.isContested).toBe(false);
            expect(info.isSecure).toBe(false);
            
            // Partially captured
            hill.update(1.0, mockTanks.red);
            info = hill.getStrategicInfo();
            expect(info.isNeutral).toBe(false);
            expect(info.isContested).toBe(true);
            expect(info.isSecure).toBe(false);
            
            // Fully captured
            hill.controlProgress = 100;
            info = hill.getStrategicInfo();
            expect(info.isNeutral).toBe(false);
            expect(info.isContested).toBe(false);
            expect(info.isSecure).toBe(true);
        });
    });

    describe('Reset Functionality', () => {
        test('should reset all hill state', () => {
            // Set up hill with some state
            hill.update(3.0, mockTanks.red);
            hill.controlProgress = 100;
            hill.redControlTime = 10;
            hill.controlChanges = 5;
            hill.captureEvents.push({ test: 'event' });
            
            // Reset
            hill.reset();
            
            // Verify reset state
            expect(hill.controllingTeam).toBeNull();
            expect(hill.controlProgress).toBe(0);
            expect(hill.redControlTime).toBe(0);
            expect(hill.blueControlTime).toBe(0);
            expect(hill.redScore).toBe(0);
            expect(hill.blueScore).toBe(0);
            expect(hill.controlChanges).toBe(0);
            expect(hill.maxRedControl).toBe(0);
            expect(hill.maxBlueControl).toBe(0);
            expect(hill.currentRedStreak).toBe(0);
            expect(hill.currentBlueStreak).toBe(0);
            expect(hill.previousController).toBeNull();
            expect(hill.captureEvents).toEqual([]);
            expect(hill.captureEffects).toEqual([]);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null tank array', () => {
            expect(() => hill.update(1.0, null)).not.toThrow();
        });

        test('should handle undefined tanks', () => {
            expect(() => hill.update(1.0, undefined)).not.toThrow();
        });

        test('should handle zero deltaTime', () => {
            hill.update(0, mockTanks.red);
            expect(hill.controlProgress).toBe(0);
        });

        test('should handle negative deltaTime', () => {
            hill.update(-1.0, mockTanks.red);
            expect(hill.controlProgress).toBe(0);
        });

        test('should handle very large deltaTime', () => {
            hill.update(1000.0, mockTanks.red);
            expect(hill.controlProgress).toBe(100); // Should cap at 100
        });

        test('should handle tanks without required properties', () => {
            const malformedTanks = [
                { x: 400, y: 300 }, // Missing width, height, team, isAlive
                { team: 'red', isAlive: true } // Missing position and size
            ];
            
            expect(() => hill.update(1.0, malformedTanks)).not.toThrow();
        });
    });

    describe('Performance Considerations', () => {
        test('should handle large numbers of tanks efficiently', () => {
            const manyTanks = [];
            for (let i = 0; i < 100; i++) {
                manyTanks.push({
                    x: 300 + i,
                    y: 250 + i,
                    width: 24,
                    height: 16,
                    team: i % 2 === 0 ? 'red' : 'blue',
                    isAlive: true
                });
            }
            
            const startTime = performance.now();
            hill.update(1.0, manyTanks);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
        });

        test('should limit capture events array growth', () => {
            // Simulate many rapid control changes
            for (let i = 0; i < 200; i++) {
                const tanks = i % 2 === 0 ? mockTanks.red : mockTanks.blue;
                hill.update(0.1, tanks);
            }
            
            // Events should be limited to prevent memory growth
            expect(hill.captureEvents.length).toBeLessThan(100);
        });
    });
});
