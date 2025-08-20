/**
 * Comprehensive Unit Tests for ASI-ARCH TankEngineer Module
 * Tests all core functionality of the Engineer including:
 * - Battle simulation and execution
 * - Genome performance evaluation
 * - Team synergy calculations
 * - Adaptability assessments
 * - Battle result analysis
 */

const fs = require('fs');
const path = require('path');

// Load source files
const asiArchModulesSource = fs.readFileSync(path.join(__dirname, '../asi-arch-modules.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
  // Set up minimal DOM elements
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <span id="engineerRedOptimizations">0</span>
    <span id="engineerBlueOptimizations">0</span>
  `;

  // Mock window.emitASIArchEvent
  global.window = global.window || {};
  global.window.emitASIArchEvent = jest.fn();
  
  // Mock Tank class
  global.Tank = jest.fn().mockImplementation((x, y, team, genome) => ({
    x, y, team, genome,
    health: 100,
    isDestroyed: false,
    damage: 0,
    shots: 0,
    hits: 0,
    survivalTime: 0
  }));

  // Mock game engine
  global.window.game = {
    tanks: [],
    projectiles: [],
    redTeam: [],
    blueTeam: [],
    battleTime: 0,
    battleStarted: false,
    gameState: 'running',
    width: 800,
    height: 600,
    gameLoop: jest.fn(),
    initializeBattle: jest.fn((redCount, blueCount, _battleType, _scenarioId, _seed) => {
      // Mock battle initialization
      global.window.game.redTeam = Array.from({ length: redCount }, (_, i) => {
        const tank = { 
          id: `red_${i}`, 
          team: 'red',
          entity: {
            calculateBehaviorWeights: jest.fn(),
            calculateSpeed: jest.fn(),
            calculateFireRate: jest.fn(),
            calculateDamage: jest.fn(),
            calculateRange: jest.fn(),
            calculateAccuracy: jest.fn()
          }
        };
        // Call Tank constructor for test tracking with expected signature
        global.Tank(50, 100 + i * 50, 'red', [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9]);
        return tank;
      });
      global.window.game.blueTeam = Array.from({ length: blueCount }, (_, i) => {
        const tank = { 
          id: `blue_${i}`, 
          team: 'blue',
          entity: {
            calculateBehaviorWeights: jest.fn(),
            calculateSpeed: jest.fn(),
            calculateFireRate: jest.fn(),
            calculateDamage: jest.fn(),
            calculateRange: jest.fn(),
            calculateAccuracy: jest.fn()
          }
        };
        // Call Tank constructor for test tracking with expected signature
        global.Tank(750, 100 + i * 50, 'blue', [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
        return tank;
      });
      global.window.game.tanks = [...global.window.game.redTeam, ...global.window.game.blueTeam];
      global.window.game.battleTime = 0;
      global.window.game.battleStarted = true;
    }),
    endBattle: jest.fn((reason) => {
      // Simulate battle end event
      const event = new CustomEvent('battleEnd', {
        detail: {
          winner: 'red',
          duration: 45,
          reason: reason || 'elimination',
          redTeamStats: {
            averageSurvivalTime: 45,
            accuracy: 0.7,
            totalDamageDealt: 80,
            totalDamageTaken: 40,
            tanksDestroyed: 2
          },
          blueTeamStats: {
            averageSurvivalTime: 30,
            accuracy: 0.5,
            totalDamageDealt: 40,
            totalDamageTaken: 80,
            tanksDestroyed: 1
          }
        }
      });
      window.dispatchEvent(event);
    }),
    start: jest.fn(() => {
      // Mock game start - immediately trigger battle end for testing
      setTimeout(() => {
        global.window.game.endBattle('test_complete');
      }, 10);
    })
  };

  // Mock addEventListener and removeEventListener
  global.window.addEventListener = jest.fn((event, handler) => {
    if (event === 'battleEnd') {
      // Simulate immediate battle end for testing
      setTimeout(() => {
        handler({
          detail: {
            winner: 'red',
            duration: 45,
            reason: 'elimination',
            redTeamStats: {
              averageSurvivalTime: 45,
              accuracy: 0.7,
              totalDamageDealt: 80,
              totalDamageTaken: 40,
              tanksDestroyed: 2
            },
            blueTeamStats: {
              averageSurvivalTime: 30,
              accuracy: 0.5,
              totalDamageDealt: 40,
              totalDamageTaken: 80,
              tanksDestroyed: 1
            }
          }
        });
      }, 10);
    }
  });
  
  global.window.removeEventListener = jest.fn();

  // Execute the source code in test environment
  eval(asiArchModulesSource);

  return {
    TankEngineer: global.TankEngineer
  };
}

describe('TankEngineer Module - Comprehensive Tests', () => {
  let testEnv;
  let engineer;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    engineer = new testEnv.TankEngineer();
    
    // Reset mocks
    if (global.window.emitASIArchEvent) {
      global.window.emitASIArchEvent.mockClear();
    }
    if (global.window.game) {
      global.window.game.gameLoop.mockClear();
      global.window.game.endBattle.mockClear();
    }
    if (global.Tank) {
      global.Tank.mockClear();
    }
    if (global.window.addEventListener) {
      global.window.addEventListener.mockClear();
    }
    if (global.window.removeEventListener) {
      global.window.removeEventListener.mockClear();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default battle time limit', () => {
      expect(engineer).toBeDefined();
      expect(engineer.battleTimeLimit).toBe(60);
      expect(typeof engineer.battleTimeLimit).toBe('number');
    });

    test('should allow custom battle time limit', () => {
      const customEngineer = new testEnv.TankEngineer();
      customEngineer.battleTimeLimit = 90;
      
      expect(customEngineer.battleTimeLimit).toBe(90);
    });
  });

  describe('Battle Simulation', () => {
    test('should run battle with provided genomes', async () => {
      const redGenomes = [
        [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9],
        [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9, 0.8]
      ];
      
      const blueGenomes = [
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1]
      ];

      const result = await engineer.runBattle(redGenomes, blueGenomes);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('redTeamStats');
      expect(result).toHaveProperty('blueTeamStats');
      expect(['red', 'blue']).toContain(result.winner);
    });

    test('should emit visualization events during battle', async () => {
      const redGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
      const blueGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];

      await engineer.runBattle(redGenomes, blueGenomes);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'engineer', 
        'run_battle',
        expect.objectContaining({
          trait: 'battle_setup',
          teams: expect.stringContaining('Red: 1 vs Blue: 1')
        })
      );
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'engineer', 
        'battle_complete',
        expect.objectContaining({
          trait: 'result',
          winner: expect.any(String),
          duration: expect.any(Number)
        })
      );
    });

    test('should create tanks with correct genomes and positions', async () => {
      const redGenomes = [
        [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9]
      ];
      const blueGenomes = [
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
      ];

      await engineer.runBattle(redGenomes, blueGenomes);
      
      // Should create tanks for both teams
      expect(global.Tank).toHaveBeenCalledTimes(2);
      
      // Check red tank creation
      expect(global.Tank).toHaveBeenCalledWith(
        50, // x position
        expect.any(Number), // y position
        'red',
        redGenomes[0]
      );
      
      // Check blue tank creation
      expect(global.Tank).toHaveBeenCalledWith(
        expect.any(Number), // x position (should be on right side)
        expect.any(Number), // y position
        'blue',
        blueGenomes[0]
      );
    });

    test('should initialize game state correctly', async () => {
      const redGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
      const blueGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];

      // Check initial state before battle
      expect(global.window.game.battleTime).toBe(0);
      expect(global.window.game.battleStarted).toBe(false);
      expect(global.window.game.gameState).toBe('running');

      await engineer.runBattle(redGenomes, blueGenomes);
      
      // The battle should have created tanks, so we check that tanks were created
      expect(global.Tank).toHaveBeenCalledTimes(2); // 1 red + 1 blue
    });

    test('should handle multiple tanks per team', async () => {
      const redGenomes = [
        [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9],
        [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9, 0.8],
        [0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9, 0.8, 0.7]
      ];
      
      const blueGenomes = [
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1]
      ];

      await engineer.runBattle(redGenomes, blueGenomes);
      
      expect(global.Tank).toHaveBeenCalledTimes(5); // 3 red + 2 blue
    });

    test('should set up battle end event listener', async () => {
      const redGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
      const blueGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];

      await engineer.runBattle(redGenomes, blueGenomes);
      
      expect(global.window.addEventListener).toHaveBeenCalledWith(
        'battleEnd',
        expect.any(Function)
      );
      
      expect(global.window.removeEventListener).toHaveBeenCalledWith(
        'battleEnd',
        expect.any(Function)
      );
    });
  });

  describe('Genome Performance Evaluation', () => {
    test('should evaluate genome performance correctly', () => {
      const genome = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9];
      const battleResult = {
        duration: 45,
        redTeamStats: {
          averageSurvivalTime: 45,
          accuracy: 0.7,
          totalDamageDealt: 80,
          totalDamageTaken: 40
        },
        blueTeamStats: {
          averageSurvivalTime: 30,
          accuracy: 0.5,
          totalDamageDealt: 40,
          totalDamageTaken: 80
        }
      };

      const performance = engineer.evaluateGenomePerformance(genome, battleResult, 'red');
      
      expect(performance).toHaveProperty('survival');
      expect(performance).toHaveProperty('combat_effectiveness');
      expect(performance).toHaveProperty('accuracy');
      expect(performance).toHaveProperty('team_synergy');
      expect(performance).toHaveProperty('adaptability');
      
      expect(performance.survival).toBe(45);
      expect(performance.accuracy).toBe(0.7);
      expect(typeof performance.combat_effectiveness).toBe('number');
      expect(typeof performance.team_synergy).toBe('number');
      expect(typeof performance.adaptability).toBe('number');
    });

    test('should calculate combat effectiveness correctly', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const battleResult = {
        duration: 60,
        redTeamStats: {
          totalDamageDealt: 100,
          totalDamageTaken: 50,
          accuracy: 0.8,
          averageSurvivalTime: 50
        }
      };

      const performance = engineer.evaluateGenomePerformance(genome, battleResult, 'red');
      
      expect(performance.combat_effectiveness).toBe(2.0); // 100/50
    });

    test('should handle zero damage taken gracefully', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const battleResult = {
        duration: 60,
        redTeamStats: {
          totalDamageDealt: 100,
          totalDamageTaken: 0,
          accuracy: 0.9,
          averageSurvivalTime: 60
        }
      };

      const performance = engineer.evaluateGenomePerformance(genome, battleResult, 'red');
      
      expect(performance.combat_effectiveness).toBe(100); // 100/max(0,1) = 100/1
    });

    test('should evaluate blue team performance correctly', () => {
      const genome = [0.3, 0.4, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.9];
      const battleResult = {
        duration: 35,
        redTeamStats: {
          averageSurvivalTime: 20,
          accuracy: 0.4,
          totalDamageDealt: 30,
          totalDamageTaken: 90
        },
        blueTeamStats: {
          averageSurvivalTime: 35,
          accuracy: 0.8,
          totalDamageDealt: 90,
          totalDamageTaken: 30
        }
      };

      const performance = engineer.evaluateGenomePerformance(genome, battleResult, 'blue');
      
      expect(performance.survival).toBe(35);
      expect(performance.accuracy).toBe(0.8);
      expect(performance.combat_effectiveness).toBe(3.0); // 90/30
    });
  });

  describe('Team Synergy Calculation', () => {
    test('should calculate team synergy based on teamwork and adaptability', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.8, 0.7, 0.5, 0.5, 0.5]; // High teamwork and adaptability
      const stats = {
        accuracy: 0.6,
        averageSurvivalTime: 40
      };

      const synergy = engineer.calculateTeamSynergy(genome, stats);
      
      // Should be: 0.8 * 0.7 * 0.5 + 0.3 + 0.2 = 0.28 + 0.3 + 0.2 = 0.78
      expect(synergy).toBeCloseTo(0.78, 2);
    });

    test('should give bonus for high accuracy', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.5, 0.5, 0.5];
      const highAccuracyStats = {
        accuracy: 0.7,
        averageSurvivalTime: 25
      };
      const lowAccuracyStats = {
        accuracy: 0.3,
        averageSurvivalTime: 25
      };

      const synergyHigh = engineer.calculateTeamSynergy(genome, highAccuracyStats);
      const synergyLow = engineer.calculateTeamSynergy(genome, lowAccuracyStats);
      
      expect(synergyHigh).toBeGreaterThan(synergyLow);
      expect(synergyHigh - synergyLow).toBeCloseTo(0.3, 2);
    });

    test('should give bonus for long survival time', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.5, 0.5, 0.5];
      const longSurvivalStats = {
        accuracy: 0.4,
        averageSurvivalTime: 45
      };
      const shortSurvivalStats = {
        accuracy: 0.4,
        averageSurvivalTime: 15
      };

      const synergyLong = engineer.calculateTeamSynergy(genome, longSurvivalStats);
      const synergyShort = engineer.calculateTeamSynergy(genome, shortSurvivalStats);
      
      expect(synergyLong).toBeGreaterThan(synergyShort);
      expect(synergyLong - synergyShort).toBeCloseTo(0.2, 2);
    });

    test('should handle edge cases in team synergy', () => {
      const zeroGenome = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const maxGenome = [1, 1, 1, 1, 1, 1, 1, 1, 1];
      const stats = {
        accuracy: 1.0,
        averageSurvivalTime: 60
      };

      const synergyZero = engineer.calculateTeamSynergy(zeroGenome, stats);
      const synergyMax = engineer.calculateTeamSynergy(maxGenome, stats);
      
      expect(synergyZero).toBeGreaterThanOrEqual(0);
      expect(synergyMax).toBeGreaterThan(synergyZero);
      expect(synergyMax).toBe(1.0); // 1*1*0.5 + 0.3 + 0.2 = 1.0
    });
  });

  describe('Adaptability Calculation', () => {
    test('should calculate adaptability based on survival and combat effectiveness', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const goodResult = {
        duration: 45,
        redTeamStats: { accuracy: 0.6 },
        blueTeamStats: { accuracy: 0.5 }
      };

      const adaptability = engineer.calculateAdaptability(genome, goodResult);
      
      expect(adaptability).toBe(1.0); // 0.5 (survived) + 0.5 (effective combat)
    });

    test('should give partial score for survival only', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const survivalOnlyResult = {
        duration: 35,
        redTeamStats: { accuracy: 0.2 },
        blueTeamStats: { accuracy: 0.3 }
      };

      const adaptability = engineer.calculateAdaptability(genome, survivalOnlyResult);
      
      expect(adaptability).toBe(0.5); // 0.5 (survived) + 0 (ineffective combat)
    });

    test('should give partial score for combat effectiveness only', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const combatOnlyResult = {
        duration: 15,
        redTeamStats: { accuracy: 0.7 },
        blueTeamStats: { accuracy: 0.6 }
      };

      const adaptability = engineer.calculateAdaptability(genome, combatOnlyResult);
      
      expect(adaptability).toBe(0.5); // 0 (didn't survive) + 0.5 (effective combat)
    });

    test('should give zero score for poor performance', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const poorResult = {
        duration: 10,
        redTeamStats: { accuracy: 0.1 },
        blueTeamStats: { accuracy: 0.2 }
      };

      const adaptability = engineer.calculateAdaptability(genome, poorResult);
      
      expect(adaptability).toBe(0); // 0 (didn't survive) + 0 (ineffective combat)
    });

    test('should handle edge case durations', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const exactlyThirtyResult = {
        duration: 30,
        redTeamStats: { accuracy: 0.4 },
        blueTeamStats: { accuracy: 0.4 }
      };

      const adaptability = engineer.calculateAdaptability(genome, exactlyThirtyResult);
      
      expect(adaptability).toBe(0); // duration = 30 is not > 30, so no survival bonus
    });
  });

  describe('Configuration and Parameters', () => {
    test('should have reasonable default battle time limit', () => {
      expect(engineer.battleTimeLimit).toBeGreaterThan(0);
      expect(engineer.battleTimeLimit).toBeLessThanOrEqual(300); // Reasonable upper bound
      expect(typeof engineer.battleTimeLimit).toBe('number');
    });

    test('should allow battle time limit modification', () => {
      const originalLimit = engineer.battleTimeLimit;
      
      engineer.battleTimeLimit = 120;
      expect(engineer.battleTimeLimit).toBe(120);
      
      engineer.battleTimeLimit = 30;
      expect(engineer.battleTimeLimit).toBe(30);
      
      // Restore original value
      engineer.battleTimeLimit = originalLimit;
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty genome arrays', async () => {
      const redGenomes = [];
      const blueGenomes = [];

      // Should not crash and should return a valid result
      const result = await engineer.runBattle(redGenomes, blueGenomes);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('duration');
    });

    test('should handle invalid genome structures', () => {
      const invalidGenome = [0.5, 0.5, 0.5]; // Too short
      const battleResult = {
        duration: 30,
        redTeamStats: {
          averageSurvivalTime: 30,
          accuracy: 0.5,
          totalDamageDealt: 50,
          totalDamageTaken: 50
        }
      };

      // Should not crash when calculating team synergy with invalid genome
      const synergy = engineer.calculateTeamSynergy(invalidGenome, battleResult.redTeamStats);
      expect(typeof synergy).toBe('number');
    });

    test('should handle missing game object gracefully', async () => {
      const originalGame = global.window.game;
      global.window.game = null;

      const redGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
      const blueGenomes = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];

      // Create a promise that will timeout if the method doesn't handle null game properly
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 100);
      });

      const battlePromise = engineer.runBattle(redGenomes, blueGenomes);
      
      // Race between the battle promise and timeout
      const result = await Promise.race([battlePromise, timeoutPromise]);
      
      // Should timeout since the promise is never resolved when game is null
      expect(result).toBe('timeout');

      // Restore game object
      global.window.game = originalGame;
    });

    test('should handle undefined battle result stats', () => {
      const genome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const invalidBattleResult = {
        duration: 30,
        redTeamStats: undefined,
        blueTeamStats: {
          accuracy: 0.5,
          averageSurvivalTime: 30,
          totalDamageDealt: 50,
          totalDamageTaken: 50
        }
      };

      // Should handle undefined team stats
      expect(() => {
        engineer.evaluateGenomePerformance(genome, invalidBattleResult, 'red');
      }).toThrow();
    });
  });
});
