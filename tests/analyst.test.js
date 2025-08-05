/**
 * Comprehensive Unit Tests for ASI-ARCH TankAnalyst Module
 * Tests all core functionality of the Analyst including:
 * - Battle result analysis and insights generation
 * - Performance trend analysis
 * - Emergent behavior identification
 * - Strategic insights and discoveries
 * - Fitness progression tracking
 * - Statistical calculations and trend analysis
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
    <span id="analystRedInsights">0</span>
    <span id="analystBlueInsights">0</span>
  `;

  // Mock window.emitASIArchEvent
  global.window = global.window || {};
  global.window.emitASIArchEvent = jest.fn();

  // Execute the source code in test environment
  eval(asiArchModulesSource);

  return {
    TankAnalyst: global.TankAnalyst
  };
}

describe('TankAnalyst Module - Comprehensive Tests', () => {
  let testEnv;
  let analyst;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    analyst = new testEnv.TankAnalyst();
    
    // Reset mocks
    if (global.window.emitASIArchEvent) {
      global.window.emitASIArchEvent.mockClear();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default insight threshold', () => {
      expect(analyst).toBeDefined();
      expect(analyst.insightThreshold).toBe(0.1);
      expect(typeof analyst.insightThreshold).toBe('number');
    });

    test('should allow custom insight threshold', () => {
      const customAnalyst = new testEnv.TankAnalyst();
      customAnalyst.insightThreshold = 0.2;
      
      expect(customAnalyst.insightThreshold).toBe(0.2);
    });
  });

  describe('Battle Result Analysis', () => {
    test('should analyze battle results and return comprehensive analysis', () => {
      const battleResult = {
        winner: 'red',
        duration: 45,
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
      };

      const history = [
        {
          result: {
            winner: 'blue',
            duration: 35,
            redTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 70 },
            blueTeamStats: { averageSurvivalTime: 35, accuracy: 0.6, totalDamageDealt: 70, totalDamageTaken: 30 }
          },
          generation: 1
        }
      ];

      const analysis = analyst.analyzeResults(battleResult, history);
      
      expect(analysis).toHaveProperty('performance_trends');
      expect(analysis).toHaveProperty('emergent_behaviors');
      expect(analysis).toHaveProperty('strategic_insights');
      expect(analysis).toHaveProperty('fitness_progression');
      expect(analysis).toHaveProperty('significantDiscovery');
      
      expect(Array.isArray(analysis.emergent_behaviors)).toBe(true);
      expect(Array.isArray(analysis.strategic_insights)).toBe(true);
    });

    test('should emit visualization events during analysis', () => {
      const battleResult = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 60 }
      };

      analyst.analyzeResults(battleResult, []);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'analyze_results',
        expect.objectContaining({
          trait: 'battle_data',
          historySize: 0
        })
      );
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'analysis_complete',
        expect.objectContaining({
          trait: 'report',
          insights: expect.any(Number)
        })
      );
    });

    test('should handle empty history gracefully', () => {
      const battleResult = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 60 }
      };

      const analysis = analyst.analyzeResults(battleResult, []);
      
      expect(analysis).toBeDefined();
      expect(analysis.performance_trends).toBeNull();
      expect(analysis.fitness_progression).toBeNull();
      expect(analysis.significantDiscovery).toBeNull();
    });
  });

  describe('Performance Trend Analysis', () => {
    test('should analyze performance trends with sufficient history', () => {
      const history = [
        {
          result: {
            winner: 'red',
            duration: 40,
            redTeamStats: { averageSurvivalTime: 40, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 35,
            redTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 35, totalDamageTaken: 60 },
            blueTeamStats: { averageSurvivalTime: 35, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 35 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 50,
            redTeamStats: { averageSurvivalTime: 50, accuracy: 0.7, totalDamageDealt: 70, totalDamageTaken: 30 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 }
          }
        }
      ];

      const trends = analyst.analyzePerformanceTrends(history);
      
      expect(trends).toHaveProperty('average_fitness');
      expect(trends).toHaveProperty('improvement_rate');
      expect(trends).toHaveProperty('battle_duration_trend');
      
      expect(typeof trends.average_fitness).toBe('number');
      expect(typeof trends.improvement_rate).toBe('number');
      expect(trends.battle_duration_trend).toHaveProperty('average');
      expect(trends.battle_duration_trend).toHaveProperty('trend');
    });

    test('should return null for insufficient history', () => {
      const shortHistory = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        }
      ];

      const trends = analyst.analyzePerformanceTrends(shortHistory);
      
      expect(trends).toBeNull();
    });

    test('should emit visualization events during trend analysis', () => {
      const history = [
        {
          result: {
            winner: 'red',
            duration: 40,
            redTeamStats: { averageSurvivalTime: 40, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 35,
            redTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 35, totalDamageTaken: 60 },
            blueTeamStats: { averageSurvivalTime: 35, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 35 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 50,
            redTeamStats: { averageSurvivalTime: 50, accuracy: 0.7, totalDamageDealt: 70, totalDamageTaken: 30 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 }
          }
        }
      ];

      analyst.analyzePerformanceTrends(history);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'analyze_trends',
        expect.objectContaining({
          trait: 'performance',
          historySize: 3
        })
      );
    });
  });

  describe('Emergent Behavior Identification', () => {
    test('should identify extended tactical engagement', () => {
      const longBattleResult = {
        winner: 'red',
        duration: 50,
        redTeamStats: { averageSurvivalTime: 50, accuracy: 0.5, totalDamageDealt: 60, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 35, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 60 }
      };

      const behaviors = analyst.identifyEmergentBehaviors(longBattleResult);
      
      expect(Array.isArray(behaviors)).toBe(true);
      expect(behaviors).toContain('Extended tactical engagement');
    });

    test('should identify high-precision targeting', () => {
      const highAccuracyResult = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.8, totalDamageDealt: 80, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 80 }
      };

      const behaviors = analyst.identifyEmergentBehaviors(highAccuracyResult);
      
      expect(behaviors).toContain('High-precision targeting');
    });

    test('should identify superior tactical positioning', () => {
      const tacticalResult = {
        winner: 'blue',
        duration: 35,
        redTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 80 },
        blueTeamStats: { averageSurvivalTime: 35, accuracy: 0.6, totalDamageDealt: 80, totalDamageTaken: 30 }
      };

      const behaviors = analyst.identifyEmergentBehaviors(tacticalResult);
      
      expect(behaviors).toContain('Superior tactical positioning');
    });

    test('should emit visualization events during behavior analysis', () => {
      const result = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
      };

      analyst.identifyEmergentBehaviors(result);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'identify_behaviors',
        expect.objectContaining({
          trait: 'emergence',
          duration: '30.0'
        })
      );
    });

    test('should handle edge cases in behavior identification', () => {
      const edgeCaseResult = {
        winner: 'timeout',
        duration: 10,
        redTeamStats: { averageSurvivalTime: 10, accuracy: 0.1, totalDamageDealt: 5, totalDamageTaken: 5 },
        blueTeamStats: { averageSurvivalTime: 10, accuracy: 0.1, totalDamageDealt: 5, totalDamageTaken: 5 }
      };

      const behaviors = analyst.identifyEmergentBehaviors(edgeCaseResult);
      
      expect(Array.isArray(behaviors)).toBe(true);
      expect(behaviors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Strategic Insights Generation', () => {
    test('should generate accuracy-focused strategy insights', () => {
      const accuracyResult = {
        winner: 'red',
        duration: 40,
        redTeamStats: { averageSurvivalTime: 40, accuracy: 0.7, totalDamageDealt: 70, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 }
      };

      const insights = analyst.generateStrategicInsights(accuracyResult, []);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights).toContain('Accuracy-focused strategy showed effectiveness');
    });

    test('should generate defensive positioning insights', () => {
      const defensiveResult = {
        winner: 'blue',
        duration: 50,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 60 },
        blueTeamStats: { averageSurvivalTime: 50, accuracy: 0.5, totalDamageDealt: 60, totalDamageTaken: 40 }
      };

      const insights = analyst.generateStrategicInsights(defensiveResult, []);
      
      expect(insights).toContain('Defensive positioning improved survivability');
    });

    test('should generate aggressive engagement insights', () => {
      const aggressiveResult = {
        winner: 'red',
        duration: 20,
        redTeamStats: { averageSurvivalTime: 20, accuracy: 0.6, totalDamageDealt: 80, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 15, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 80 }
      };

      const insights = analyst.generateStrategicInsights(aggressiveResult, []);
      
      expect(insights).toContain('Aggressive early engagement led to quick victory');
    });

    test('should handle timeout results gracefully', () => {
      const timeoutResult = {
        winner: 'timeout',
        duration: 60,
        redTeamStats: { averageSurvivalTime: 60, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 60, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 40 }
      };

      const insights = analyst.generateStrategicInsights(timeoutResult, []);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBe(0); // No insights for timeout
    });

    test('should emit visualization events during insight generation', () => {
      const result = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 60 }
      };

      analyst.generateStrategicInsights(result, []);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'generate_insights',
        expect.objectContaining({
          trait: 'strategy',
          winner: 'red'
        })
      );
    });
  });

  describe('Fitness Progression Analysis', () => {
    test('should analyze fitness progression with sufficient history', () => {
      const history = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 40,
            redTeamStats: { averageSurvivalTime: 25, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 70 },
            blueTeamStats: { averageSurvivalTime: 40, accuracy: 0.6, totalDamageDealt: 70, totalDamageTaken: 50 }
          }
        }
      ];

      const progression = analyst.analyzeFitnessProgression(history);
      
      expect(progression).toHaveProperty('current_fitness');
      expect(progression).toHaveProperty('fitness_trend');
      expect(progression).toHaveProperty('best_fitness');
      expect(progression).toHaveProperty('improvement_consistency');
      
      expect(typeof progression.current_fitness).toBe('number');
      expect(typeof progression.fitness_trend).toBe('number');
      expect(typeof progression.best_fitness).toBe('number');
      expect(typeof progression.improvement_consistency).toBe('number');
    });

    test('should return null for insufficient history', () => {
      const shortHistory = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        }
      ];

      const progression = analyst.analyzeFitnessProgression(shortHistory);
      
      expect(progression).toBeNull();
    });

    test('should emit visualization events during fitness analysis', () => {
      const history = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 40,
            redTeamStats: { averageSurvivalTime: 25, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 70 },
            blueTeamStats: { averageSurvivalTime: 40, accuracy: 0.6, totalDamageDealt: 70, totalDamageTaken: 50 }
          }
        }
      ];

      analyst.analyzeFitnessProgression(history);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'analyze_fitness',
        expect.objectContaining({
          trait: 'progression',
          generations: 2
        })
      );
    });
  });

  describe('Significant Discovery Detection', () => {
    test('should detect significant improvement when threshold is exceeded', () => {
      const currentResult = {
        winner: 'red',
        duration: 50,
        redTeamStats: { averageSurvivalTime: 50, accuracy: 0.8, totalDamageDealt: 90, totalDamageTaken: 20 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 20, totalDamageTaken: 90 }
      };

      const history = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 25,
            redTeamStats: { averageSurvivalTime: 15, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.5, totalDamageDealt: 70, totalDamageTaken: 30 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 35,
            redTeamStats: { averageSurvivalTime: 35, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        }
      ];

      const isSignificant = analyst.detectSignificantImprovement(currentResult, history);
      
      expect(isSignificant).toBe(true);
    });

    test('should not detect significance when improvement is below threshold', () => {
      const currentResult = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
      };

      const history = [
        {
          result: {
            winner: 'red',
            duration: 28,
            redTeamStats: { averageSurvivalTime: 28, accuracy: 0.48, totalDamageDealt: 48, totalDamageTaken: 42 },
            blueTeamStats: { averageSurvivalTime: 22, accuracy: 0.38, totalDamageDealt: 38, totalDamageTaken: 52 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 32,
            redTeamStats: { averageSurvivalTime: 32, accuracy: 0.52, totalDamageDealt: 52, totalDamageTaken: 38 },
            blueTeamStats: { averageSurvivalTime: 18, accuracy: 0.42, totalDamageDealt: 42, totalDamageTaken: 48 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 29,
            redTeamStats: { averageSurvivalTime: 29, accuracy: 0.49, totalDamageDealt: 49, totalDamageTaken: 41 },
            blueTeamStats: { averageSurvivalTime: 21, accuracy: 0.39, totalDamageDealt: 39, totalDamageTaken: 51 }
          }
        }
      ];

      const isSignificant = analyst.detectSignificantImprovement(currentResult, history);
      
      expect(isSignificant).toBe(false);
    });

    test('should return false for insufficient history', () => {
      const currentResult = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
      };

      const shortHistory = [
        {
          result: {
            winner: 'blue',
            duration: 25,
            redTeamStats: { averageSurvivalTime: 15, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 30 }
          }
        }
      ];

      const isSignificant = analyst.detectSignificantImprovement(currentResult, shortHistory);
      
      expect(isSignificant).toBe(false);
    });
  });

  describe('Discovery Report Generation', () => {
    test('should generate comprehensive discovery report', () => {
      const currentResult = {
        winner: 'red',
        duration: 50,
        redTeamStats: { averageSurvivalTime: 50, accuracy: 0.8, totalDamageDealt: 90, totalDamageTaken: 20 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 20, totalDamageTaken: 90 }
      };

      const history = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        }
      ];

      const report = analyst.generateDiscoveryReport(currentResult, history);
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Significant improvement detected');
      expect(report).toContain('% performance gain');
      expect(report).toContain('Emergent behaviors');
    });
  });

  describe('Battle Fitness Calculation', () => {
    test('should calculate fitness for winning team', () => {
      const result = {
        winner: 'red',
        duration: 45,
        redTeamStats: { averageSurvivalTime: 45, accuracy: 0.7, totalDamageDealt: 80, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 80 }
      };

      const fitness = analyst.calculateBattleFitness(result, 'red');
      
      expect(typeof fitness).toBe('number');
      expect(fitness).toBeGreaterThan(0.5); // Should be higher due to winning
      expect(fitness).toBeLessThanOrEqual(1.0);
    });

    test('should calculate fitness for losing team', () => {
      const result = {
        winner: 'red',
        duration: 45,
        redTeamStats: { averageSurvivalTime: 45, accuracy: 0.7, totalDamageDealt: 80, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 30, totalDamageTaken: 80 }
      };

      const fitness = analyst.calculateBattleFitness(result, 'blue');
      
      expect(typeof fitness).toBe('number');
      expect(fitness).toBeLessThan(0.5); // Should be lower due to losing
      expect(fitness).toBeGreaterThanOrEqual(0);
    });

    test('should calculate fitness for timeout scenario', () => {
      const fitness = analyst.calculateBattleFitness({ winner: 'timeout' }, 'timeout');
      
      expect(fitness).toBe(0.3); // Draw fitness
    });
  });

  describe('Statistical Calculations', () => {
    test('should calculate improvement rate correctly', () => {
      const experiments = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 40,
            redTeamStats: { averageSurvivalTime: 40, accuracy: 0.6, totalDamageDealt: 60, totalDamageTaken: 30 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        }
      ];

      const rate = analyst.calculateImprovementRate(experiments);
      
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThanOrEqual(0); // Should show improvement
    });

    test('should analyze duration trends', () => {
      const experiments = [
        { result: { duration: 30 } },
        { result: { duration: 35 } },
        { result: { duration: 40 } }
      ];

      const durationTrend = analyst.analyzeDurationTrend(experiments);
      
      expect(durationTrend).toHaveProperty('average');
      expect(durationTrend).toHaveProperty('trend');
      expect(durationTrend.average).toBe(35);
      expect(typeof durationTrend.trend).toBe('number');
    });

    test('should calculate trend for increasing values', () => {
      const values = [1, 2, 3, 4, 5];
      const trend = analyst.calculateTrend(values);
      
      expect(trend).toBeGreaterThan(0); // Positive trend
    });

    test('should calculate trend for decreasing values', () => {
      const values = [5, 4, 3, 2, 1];
      const trend = analyst.calculateTrend(values);
      
      expect(trend).toBeLessThan(0); // Negative trend
    });

    test('should calculate consistency metric', () => {
      const consistentValues = [0.5, 0.51, 0.49, 0.5, 0.52];
      const inconsistentValues = [0.1, 0.9, 0.2, 0.8, 0.3];

      const consistentScore = analyst.calculateConsistency(consistentValues);
      const inconsistentScore = analyst.calculateConsistency(inconsistentValues);
      
      expect(consistentScore).toBeGreaterThan(inconsistentScore);
      expect(consistentScore).toBeLessThanOrEqual(1);
      expect(inconsistentScore).toBeGreaterThan(0);
    });

    test('should calculate improvement from baseline', () => {
      const currentResult = {
        winner: 'red',
        duration: 40,
        redTeamStats: { averageSurvivalTime: 40, accuracy: 0.7, totalDamageDealt: 70, totalDamageTaken: 30 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 }
      };

      const history = [
        {
          result: {
            winner: 'red',
            duration: 20,
            redTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 },
            blueTeamStats: { averageSurvivalTime: 15, accuracy: 0.2, totalDamageDealt: 20, totalDamageTaken: 70 }
          }
        }
      ];

      const improvement = analyst.calculateImprovement(currentResult, history);
      
      expect(typeof improvement).toBe('number');
      expect(improvement).toBeGreaterThan(0); // Should show improvement
    });

    test('should handle edge cases in statistical calculations', () => {
      // Empty arrays
      expect(analyst.calculateTrend([])).toBe(0);
      expect(analyst.calculateTrend([1])).toBe(0);
      
      // Single value consistency
      expect(analyst.calculateConsistency([0.5])).toBe(1);
      
      // Empty history improvement
      const result = {
        winner: 'red',
        duration: 30,
        redTeamStats: { averageSurvivalTime: 30, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
      };
      expect(analyst.calculateImprovement(result, [])).toBe(0);
    });
  });

  describe('Configuration and Parameters', () => {
    test('should have reasonable default insight threshold', () => {
      expect(analyst.insightThreshold).toBeGreaterThan(0);
      expect(analyst.insightThreshold).toBeLessThanOrEqual(1);
      expect(typeof analyst.insightThreshold).toBe('number');
    });

    test('should allow insight threshold modification', () => {
      const originalThreshold = analyst.insightThreshold;
      
      analyst.insightThreshold = 0.2;
      expect(analyst.insightThreshold).toBe(0.2);
      
      analyst.insightThreshold = 0.05;
      expect(analyst.insightThreshold).toBe(0.05);
      
      // Restore original value
      analyst.insightThreshold = originalThreshold;
    });
  });

  describe('Integration and Discovery Events', () => {
    test('should emit discovery events when significant improvement is found', () => {
      const battleResult = {
        winner: 'red',
        duration: 50,
        redTeamStats: { averageSurvivalTime: 50, accuracy: 0.8, totalDamageDealt: 90, totalDamageTaken: 20 },
        blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 20, totalDamageTaken: 90 }
      };

      const history = [
        {
          result: {
            winner: 'red',
            duration: 30,
            redTeamStats: { averageSurvivalTime: 30, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 },
            blueTeamStats: { averageSurvivalTime: 20, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 60 }
          }
        },
        {
          result: {
            winner: 'blue',
            duration: 25,
            redTeamStats: { averageSurvivalTime: 15, accuracy: 0.3, totalDamageDealt: 30, totalDamageTaken: 70 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.5, totalDamageDealt: 70, totalDamageTaken: 30 }
          }
        },
        {
          result: {
            winner: 'red',
            duration: 35,
            redTeamStats: { averageSurvivalTime: 35, accuracy: 0.5, totalDamageDealt: 50, totalDamageTaken: 40 },
            blueTeamStats: { averageSurvivalTime: 25, accuracy: 0.4, totalDamageDealt: 40, totalDamageTaken: 50 }
          }
        }
      ];

      const analysis = analyst.analyzeResults(battleResult, history);
      
      expect(analysis.significantDiscovery).not.toBeNull();
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'analyst', 
        'discovery_found',
        expect.objectContaining({
          trait: 'insight',
          type: 'significant_improvement'
        })
      );
    });
  });
});
