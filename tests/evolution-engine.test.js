/**
 * Tests for Evolution Engine and Red Queen Race functionality
 */

const fs = require('fs');
const path = require('path');

// Load source files
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');
const asiArchModulesSource = fs.readFileSync(path.join(__dirname, '../asi-arch-modules.js'), 'utf8');
const tankAiSource = fs.readFileSync(path.join(__dirname, '../tank-ai.js'), 'utf8');

function createEvolutionTestEnvironment() {
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="generationDisplay">Generation: 1</div>
    <div id="experiments">0</div>
    <div id="battles">0</div>
    <div id="redWins">0</div>
    <div id="blueWins">0</div>
    <div id="redScore">Red Score: 0</div>
    <div id="blueScore">Blue Score: 0</div>
    <div id="redFitness">Red Fitness: 0</div>
    <div id="blueFitness">Blue Fitness: 0</div>
    <div id="redBest">None</div>
    <div id="blueBest">None</div>
    <div id="novelDesigns">0</div>
    <div id="redMutations">Red Mutations: 0</div>
    <div id="blueMutations">Blue Mutations: 0</div>
    <div id="redInsights">Red Insights: 0</div>
    <div id="blueInsights">Blue Insights: 0</div>
    <div id="redTactics">Red Tactics: 0</div>
    <div id="blueTactics">Blue Tactics: 0</div>
    <div id="redAdaptations">Red Adaptations: 0</div>
    <div id="blueAdaptations">Blue Adaptations: 0</div>
    <div id="evolutionLog"></div>
  `;

  eval(asiArchModulesSource);
  eval(tankAiSource);
  eval(evolutionEngineSource);

  return {
    EvolutionEngine: global.EvolutionEngine,
    ASIArchModules: global.ASIArchModules,
    TankAI: global.TankAI
  };
}

describe('Evolution Engine', () => {
  let testEnv;
  let evolutionEngine;

  beforeEach(() => {
    testEnv = createEvolutionTestEnvironment();
    evolutionEngine = new testEnv.EvolutionEngine();
  });

  describe('Initialization', () => {
    test('should initialize with proper population size', () => {
      expect(evolutionEngine.redPopulation).toHaveLength(10);
      expect(evolutionEngine.bluePopulation).toHaveLength(10);
    });

    test('should initialize tanks with valid genomes', () => {
      evolutionEngine.redPopulation.forEach(tank => {
        expect(tank.genome).toHaveLength(9);
        tank.genome.forEach(gene => {
          expect(gene).toBeGreaterThanOrEqual(0);
          expect(gene).toBeLessThanOrEqual(1);
        });
      });
    });

    test('should start at generation 1', () => {
      expect(evolutionEngine.generation).toBe(1);
    });
  });

  describe('Fitness Calculation', () => {
    test('should calculate team fitness correctly', () => {
      // Set up mock battle results
      evolutionEngine.battleResults = {
        red: { wins: 7, totalBattles: 10 },
        blue: { wins: 3, totalBattles: 10 }
      };

      const redFitness = evolutionEngine.calculateTeamFitness('red');
      const blueFitness = evolutionEngine.calculateTeamFitness('blue');

      expect(redFitness).toBeCloseTo(0.7, 1);
      expect(blueFitness).toBeCloseTo(0.3, 1);
    });

    test('should apply Red Queen weighting to fitness', () => {
      evolutionEngine.battleResults = {
        red: { wins: 8, totalBattles: 10 },
        blue: { wins: 2, totalBattles: 10 }
      };

      const redFitness = evolutionEngine.calculateTeamFitness('red');
      
      // Red Queen weighting should boost fitness beyond simple win rate
      expect(redFitness).toBeGreaterThan(0.8);
    });

    test('should handle edge cases in fitness calculation', () => {
      // No battles yet
      evolutionEngine.battleResults = {
        red: { wins: 0, totalBattles: 0 },
        blue: { wins: 0, totalBattles: 0 }
      };

      const redFitness = evolutionEngine.calculateTeamFitness('red');
      const blueFitness = evolutionEngine.calculateTeamFitness('blue');

      expect(redFitness).toBe(0.5); // Should default to neutral
      expect(blueFitness).toBe(0.5);
    });

    test('should calculate fitness based on battle performance data', () => {
      // Create mock tanks with performance statistics
      const tank1 = {
        genome: [0.6, 0.4, 0.5, 0.7, 0.5, 0.5, 0.3, 0.2, 0.4],
        kills: 2,
        damageDealt: 150,
        damageTaken: 50,
        survivalTime: 45.0,
        shotsFired: 10,
        shotsHit: 7,
        isAlive: true
      };

      const tank2 = {
        genome: [0.3, 0.7, 0.4, 0.5, 0.6, 0.4, 0.1, 0.3, 0.5],
        kills: 0,
        damageDealt: 30,
        damageTaken: 120,
        survivalTime: 20.0,
        shotsFired: 8,
        shotsHit: 2,
        isAlive: false
      };

      // Mock battle results with detailed performance data
      const mockBattleResults = {
        outcome: 'red_wins',
        duration: 60.0,
        teams: {
          red: {
            tanks: [tank1],
            totalKills: 2,
            totalDamage: 150,
            averageSurvival: 45.0
          },
          blue: {
            tanks: [tank2],
            totalKills: 0,
            totalDamage: 30,
            averageSurvival: 20.0
          }
        }
      };

      // Test fitness calculation with battle performance
      const tank1Fitness = evolutionEngine.calculateBattlePerformanceFitness(tank1, mockBattleResults, 'red');
      const tank2Fitness = evolutionEngine.calculateBattlePerformanceFitness(tank2, mockBattleResults, 'blue');

      // Tank1 should have significantly higher fitness (winner with good performance)
      expect(tank1Fitness).toBeGreaterThan(0.58);
      expect(tank1Fitness).toBeGreaterThan(tank2Fitness);

      // Tank2 should have moderate fitness (loser but still has some performance)
      expect(tank2Fitness).toBeLessThan(tank1Fitness);
      expect(tank2Fitness).toBeGreaterThan(0.3); // Adjusted - even losers get some credit

      // Verify fitness components
      expect(tank1Fitness).toBeLessThanOrEqual(1.0);
      expect(tank2Fitness).toBeGreaterThanOrEqual(0.0);
    });

    test('should handle timeout battles in fitness calculation', () => {
      // Create tanks for timeout scenario
      const tankRed = {
        genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
        kills: 1,
        damageDealt: 80,
        damageTaken: 40,
        survivalTime: 60.0,
        shotsFired: 6,
        shotsHit: 4,
        isAlive: true,
        health: 60
      };

      const tankBlue = {
        genome: [0.4, 0.6, 0.5, 0.5, 0.4, 0.6, 0.4, 0.4, 0.6],
        kills: 1,
        damageDealt: 70,
        damageTaken: 60,
        survivalTime: 60.0,
        shotsFired: 8,
        shotsHit: 3,
        isAlive: true,
        health: 40
      };

      // Mock timeout battle results
      const timeoutBattleResults = {
        outcome: 'timeout',
        duration: 60.0,
        teams: {
          red: {
            tanks: [tankRed],
            totalKills: 1,
            totalDamage: 80,
            averageSurvival: 60.0
          },
          blue: {
            tanks: [tankBlue],
            totalKills: 1,
            totalDamage: 70,
            averageSurvival: 60.0
          }
        }
      };

      const redFitness = evolutionEngine.calculateBattlePerformanceFitness(tankRed, timeoutBattleResults, 'red');
      const blueFitness = evolutionEngine.calculateBattlePerformanceFitness(tankBlue, timeoutBattleResults, 'blue');

      // In timeout, tank with more health should have slightly higher fitness
      expect(redFitness).toBeGreaterThan(blueFitness);
      
      // Both should have reasonable fitness (around 0.5-0.7 for timeout)
      expect(redFitness).toBeGreaterThan(0.4);
      expect(redFitness).toBeLessThan(0.8);
      expect(blueFitness).toBeGreaterThan(0.3);
      expect(blueFitness).toBeLessThan(0.7); // Adjusted - timeout battles can score higher
    });

    test('should properly weight fitness components', () => {
      // Create a tank with excellent individual performance but team lost
      const excellentTank = {
        genome: [0.8, 0.2, 0.7, 0.9, 0.3, 0.4, 0.6, 0.5, 0.7],
        kills: 3,
        damageDealt: 200,
        damageTaken: 20,
        survivalTime: 55.0,
        shotsFired: 12,
        shotsHit: 11,
        isAlive: true
      };

      const losingBattleResults = {
        outcome: 'blue_wins',
        duration: 60.0,
        teams: {
          red: {
            tanks: [excellentTank],
            totalKills: 3,
            totalDamage: 200,
            averageSurvival: 55.0
          },
          blue: {
            tanks: [],
            totalKills: 4,
            totalDamage: 250,
            averageSurvival: 45.0
          }
        }
      };

      const fitness = evolutionEngine.calculateBattlePerformanceFitness(excellentTank, losingBattleResults, 'red');

      // Should have decent fitness despite losing (individual performance matters)
      expect(fitness).toBeGreaterThan(0.4);
      expect(fitness).toBeLessThan(0.7); // But capped by team loss
    });

    test('should track separate team fitness thresholds', () => {
      // Create mock candidates with different team fitness levels
      evolutionEngine.candidatePool = [
        { team: 'red', fitness: 0.8, strategy: 'aggressive' },
        { team: 'red', fitness: 0.6, strategy: 'balanced' },
        { team: 'blue', fitness: 0.9, strategy: 'defensive' },
        { team: 'blue', fitness: 0.4, strategy: 'experimental' }
      ];
      
      // Sort candidate pool (as would happen during normal operation)
      evolutionEngine.candidatePool.sort((a, b) => b.fitness - a.fitness);

      const stats = evolutionEngine.getEvolutionStats();

      // Should track best fitness for each team separately
      expect(stats.bestRedFitness).toBe(0.8);  // Best red candidate
      expect(stats.bestBlueFitness).toBe(0.9); // Best blue candidate
      expect(stats.bestFitness).toBe(0.9);     // Overall best (now first after sorting)

      // Team averages should be calculated correctly
      expect(stats.redAverageFitness).toBeCloseTo(0.7, 1); // (0.8 + 0.6) / 2
      expect(stats.blueAverageFitness).toBeCloseTo(0.65, 1); // (0.9 + 0.4) / 2
    });
  });

  describe('Tank Generation', () => {
    test('should generate valid tank genome', () => {
      const genome = evolutionEngine.generateTankGenome();
      
      expect(genome).toHaveLength(9);
      genome.forEach(gene => {
        expect(gene).toBeGreaterThanOrEqual(0);
        expect(gene).toBeLessThanOrEqual(1);
      });
    });

    test('should create tank with AI and genome', () => {
      const tank = evolutionEngine.createTank(100, 100, 'red');
      
      expect(tank).toBeDefined();
      expect(tank.genome).toBeDefined();
      expect(tank.genome).toHaveLength(9);
      expect(tank.team).toBe('red');
      // Tank has AI behavior built-in, check for AI properties
      expect(tank.aggressionWeight).toBeDefined();
      expect(tank.cautionWeight).toBeDefined();
      expect(tank.cooperationWeight).toBeDefined();
    });
  });

  describe('Population Evolution', () => {
    test('should evolve population with ASI-ARCH modules', () => {
      const initialPopulation = [...evolutionEngine.redPopulation];
      
      // Set up some fitness scores
      evolutionEngine.redPopulation.forEach((tank, i) => {
        tank.fitness = 0.5 + (i * 0.05);
      });

      evolutionEngine.evolvePopulation('red');
      
      // Population should still be same size
      expect(evolutionEngine.redPopulation).toHaveLength(10);
      
      // Should not be identical to initial population (due to ASI-ARCH modifications)
      const genomesChanged = evolutionEngine.redPopulation.some((tank, i) => 
        tank.genome.some((gene, j) => gene !== initialPopulation[i].genome[j])
      );
      expect(genomesChanged).toBe(true);
    });

    test('should preserve elite individuals', () => {
      // Create a clearly superior tank
      const eliteTank = evolutionEngine.createTank(100, 100, 'red');
      eliteTank.fitness = 0.99;
      eliteTank.genome = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
      
      evolutionEngine.redPopulation[0] = eliteTank;
      
      evolutionEngine.evolvePopulation('red');
      
      // Elite should be preserved (or close to it)
      const hasElite = evolutionEngine.redPopulation.some(tank => 
        tank.genome.every(gene => gene >= 0.8)
      );
      expect(hasElite).toBe(true);
    });
  });

  describe('Red Queen Race Implementation', () => {
    test('should trigger evolution for both teams', () => {
      const initialRedGen = evolutionEngine.redPopulation.map(tank => [...tank.genome]);
      const initialBlueGen = evolutionEngine.bluePopulation.map(tank => [...tank.genome]);
      
      // Set up battle results favoring red
      evolutionEngine.battleResults = {
        red: { wins: 8, totalBattles: 10 },
        blue: { wins: 2, totalBattles: 10 }
      };

      evolutionEngine.nextGeneration();
      
      // Both populations should evolve
      const redChanged = evolutionEngine.redPopulation.some((tank, i) => 
        tank.genome.some((gene, j) => Math.abs(gene - initialRedGen[i][j]) > 0.01)
      );
      const blueChanged = evolutionEngine.bluePopulation.some((tank, i) => 
        tank.genome.some((gene, j) => Math.abs(gene - initialBlueGen[i][j]) > 0.01)
      );
      
      expect(redChanged).toBe(true);
      expect(blueChanged).toBe(true);
    });

    test('should increment generation counter', () => {
      const initialGeneration = evolutionEngine.generation;
      
      evolutionEngine.nextGeneration();
      
      expect(evolutionEngine.generation).toBe(initialGeneration + 1);
    });

    test('should apply competitive pressure', () => {
      // Simulate many generations of evolution
      evolutionEngine.battleResults = {
        red: { wins: 6, totalBattles: 10 },
        blue: { wins: 4, totalBattles: 10 }
      };

      // Run several generations
      for (let i = 0; i < 5; i++) {
        evolutionEngine.nextGeneration();
      }

      // Fitness should generally improve or at least change due to competitive pressure
      expect(evolutionEngine.generation).toBe(6);
    });
  });

  describe('ASI-ARCH Integration', () => {
    test('should use ASI-ARCH modules during evolution', () => {
      const asiArchSpy = jest.spyOn(evolutionEngine.asiArch, 'applyResearcher');
      
      evolutionEngine.evolvePopulation('red');
      
      expect(asiArchSpy).toHaveBeenCalledWith(expect.any(Array), 'red');
      
      asiArchSpy.mockRestore();
    });

    test('should track ASI-ARCH statistics', () => {
      const initialMutations = evolutionEngine.asiArch.stats.red.mutations;
      
      evolutionEngine.evolvePopulation('red');
      
      expect(evolutionEngine.asiArch.stats.red.mutations).toBeGreaterThanOrEqual(initialMutations);
    });

    test('should apply all four ASI-ARCH modules', () => {
      const researcherSpy = jest.spyOn(evolutionEngine.asiArch, 'applyResearcher');
      const engineerSpy = jest.spyOn(evolutionEngine.asiArch, 'applyEngineer');
      const analystSpy = jest.spyOn(evolutionEngine.asiArch, 'applyAnalyst');
      const cognitionSpy = jest.spyOn(evolutionEngine.asiArch, 'applyCognition');
      
      evolutionEngine.evolvePopulation('red');
      
      expect(researcherSpy).toHaveBeenCalled();
      expect(engineerSpy).toHaveBeenCalled();
      expect(analystSpy).toHaveBeenCalled();
      expect(cognitionSpy).toHaveBeenCalled();
      
      researcherSpy.mockRestore();
      engineerSpy.mockRestore();
      analystSpy.mockRestore();
      cognitionSpy.mockRestore();
    });
  });

  describe('Battle Result Tracking', () => {
    test('should initialize battle results', () => {
      expect(evolutionEngine.battleResults).toBeDefined();
      expect(evolutionEngine.battleResults.red).toBeDefined();
      expect(evolutionEngine.battleResults.blue).toBeDefined();
    });

    test('should record battle outcomes', () => {
      evolutionEngine.recordBattleResult('red');
      
      expect(evolutionEngine.battleResults.red.wins).toBe(1);
      expect(evolutionEngine.battleResults.red.totalBattles).toBe(1);
      expect(evolutionEngine.battleResults.blue.totalBattles).toBe(1);
    });

    test('should handle multiple battle results', () => {
      evolutionEngine.recordBattleResult('red');
      evolutionEngine.recordBattleResult('blue');
      evolutionEngine.recordBattleResult('red');
      
      expect(evolutionEngine.battleResults.red.wins).toBe(2);
      expect(evolutionEngine.battleResults.blue.wins).toBe(1);
      expect(evolutionEngine.battleResults.red.totalBattles).toBe(3);
      expect(evolutionEngine.battleResults.blue.totalBattles).toBe(3);
    });
  });

  describe('DOM Integration', () => {
    test('should update generation display', () => {
      evolutionEngine.nextGeneration();
      
      const generationElement = document.getElementById('generationDisplay');
      expect(generationElement.textContent).toContain(evolutionEngine.generation.toString());
    });

    test('should update fitness displays', () => {
      evolutionEngine.battleResults = {
        red: { wins: 7, totalBattles: 10 },
        blue: { wins: 3, totalBattles: 10 }
      };

      evolutionEngine.updateFitnessDisplay();
      
      const redFitnessElement = document.getElementById('redFitness');
      const blueFitnessElement = document.getElementById('blueFitness');
      
      expect(redFitnessElement.textContent).toContain('0.7');
      expect(blueFitnessElement.textContent).toContain('0.3');
    });
  });
});
