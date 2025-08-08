// Test for early battle termination feature

describe('Early Battle Termination', () => {
    let mockGameEngine;
    let mockBattleResult;

    beforeEach(() => {
        mockBattleResult = undefined; // Reset before each test
        
        // Mock the GameEngine's essential methods
        mockGameEngine = {
            gameState: 'running',
            battleStarted: true,
            battleTime: 5, // Short battle time
            redTeam: [],
            blueTeam: [],
            
            checkWinConditions() {
                const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
                const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
                
                // Check for early battle termination when all tanks of one or both colors are destroyed
                if (aliveRed === 0 && aliveBlue === 0) {
                    // Both teams eliminated - draw
                    this.endBattle('draw');
                } else if (aliveRed === 0 && aliveBlue > 0) {
                    // Red team eliminated - Blue wins
                    this.endBattle('blue');
                } else if (aliveBlue === 0 && aliveRed > 0) {
                    // Blue team eliminated - Red wins
                    this.endBattle('red');
                }
            },
            
            endBattle(winner) {
                // Allow immediate battle termination when all tanks of one or both teams are destroyed
                // Only apply minimum battle time restriction for timeout scenarios
                const minimumBattleTime = 15; // seconds
                
                if (winner === 'timeout' && this.battleStarted && this.battleTime < minimumBattleTime) {
                    // Don't end battle yet for timeout, let it continue until minimum time
                    return;
                }
                
                this.gameState = 'ended';
                mockBattleResult = { winner, duration: this.battleTime };
            }
        };
    });

    test('should end battle immediately when red team is eliminated', () => {
        // Setup: Red team eliminated, Blue team has survivors
        mockGameEngine.redTeam = [
            { isAlive: false },
            { isAlive: false }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        
        mockGameEngine.battleTime = 5; // Less than minimum time
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.checkWinConditions();
        
        expect(mockGameEngine.gameState).toBe('ended');
        expect(mockBattleResult.winner).toBe('blue');
        expect(mockBattleResult.duration).toBe(5);
    });

    test('should end battle immediately when blue team is eliminated', () => {
        // Setup: Blue team eliminated, Red team has survivors
        mockGameEngine.redTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: false },
            { isAlive: false }
        ];
        
        mockGameEngine.battleTime = 8; // Less than minimum time
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.checkWinConditions();
        
        expect(mockGameEngine.gameState).toBe('ended');
        expect(mockBattleResult.winner).toBe('red');
        expect(mockBattleResult.duration).toBe(8);
    });

    test('should end battle immediately when both teams are eliminated (draw)', () => {
        // Setup: Both teams eliminated
        mockGameEngine.redTeam = [
            { isAlive: false },
            { isAlive: false }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: false },
            { isAlive: false }
        ];
        
        mockGameEngine.battleTime = 3; // Very short battle
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.checkWinConditions();
        
        expect(mockGameEngine.gameState).toBe('ended');
        expect(mockBattleResult.winner).toBe('draw');
        expect(mockBattleResult.duration).toBe(3);
    });

    test('should respect minimum time for timeout scenarios', () => {
        // Setup: Both teams alive, but timeout called early
        mockGameEngine.redTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        
        mockGameEngine.battleTime = 5; // Less than minimum time
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.endBattle('timeout');
        
        // Should NOT end battle yet due to minimum time restriction
        expect(mockGameEngine.gameState).toBe('running');
        expect(mockBattleResult).toBeUndefined();
    });

    test('should allow timeout after minimum time', () => {
        // Setup: Both teams alive, but timeout called after minimum time
        mockGameEngine.redTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        
        mockGameEngine.battleTime = 20; // More than minimum time
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.endBattle('timeout');
        
        // Should end battle after minimum time
        expect(mockGameEngine.gameState).toBe('ended');
        expect(mockBattleResult.winner).toBe('timeout');
        expect(mockBattleResult.duration).toBe(20);
    });

    test('should not change state when both teams have survivors', () => {
        // Setup: Both teams have survivors
        mockGameEngine.redTeam = [
            { isAlive: true },
            { isAlive: false }
        ];
        mockGameEngine.blueTeam = [
            { isAlive: true },
            { isAlive: true }
        ];
        
        mockGameEngine.gameState = 'running';
        
        mockGameEngine.checkWinConditions();
        
        // Should continue running
        expect(mockGameEngine.gameState).toBe('running');
        expect(mockBattleResult).toBeUndefined();
    });
});
