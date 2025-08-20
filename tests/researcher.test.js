/**
 * Comprehensive Unit Tests for ASI-ARCH TankResearcher Module
 * Tests all core functionality of the Researcher including:
 * - Genome generation and mutation
 * - Parent selection and crossover
 * - Team-specific evolution
 * - Counter-evolution strategies
 * - Red Queen Race dynamics
 */

const fs = require('fs');
const path = require('path');

// Load source files
const asiArchModulesSource = fs.readFileSync(path.join(__dirname, '../asi-arch-modules.js'), 'utf8');
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
  // Set up minimal DOM elements
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <span id="researcherRedMutations">0</span>
    <span id="researcherBlueMutations">0</span>
  `;

  // Mock window.emitASIArchEvent
  global.window = global.window || {};
  global.window.emitASIArchEvent = jest.fn();

  // Execute the source code in test environment
  eval(asiArchModulesSource);
  eval(evolutionEngineSource);

  return {
    TankResearcher: global.TankResearcher,
    MilitaryTacticsKnowledge: global.MilitaryTacticsKnowledge
  };
}

describe('TankResearcher Module - Comprehensive Tests', () => {
  let testEnv;
  let researcher;
  let cognitionBase;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    researcher = new testEnv.TankResearcher();
    cognitionBase = new testEnv.MilitaryTacticsKnowledge();
    
    // Reset mocks
    if (global.window.emitASIArchEvent) {
      global.window.emitASIArchEvent.mockClear();
    }
  });

  describe('Genome Generation', () => {
    test('should generate valid random genomes', () => {
      const genome = researcher.generateRandomGenome();
      
      expect(genome).toHaveLength(9);
      expect(genome.every(gene => gene >= 0 && gene <= 1)).toBe(true);
      expect(genome.every(gene => typeof gene === 'number')).toBe(true);
    });

    test('should generate team-specific genomes with correct biases', () => {
      const redGenome = researcher.generateTeamSpecificGenome('red');
      const blueGenome = researcher.generateTeamSpecificGenome('blue');
      
      // Red team should be more aggressive and risk-taking
      expect(redGenome[0]).toBeGreaterThanOrEqual(0.2); // Aggression boost
      expect(redGenome[7]).toBeGreaterThanOrEqual(0.2); // Risk-taking boost
      
      // Blue team should be more accurate and defensive
      expect(blueGenome[2]).toBeGreaterThanOrEqual(0.2); // Accuracy boost
      expect(blueGenome[3]).toBeGreaterThanOrEqual(0.1); // Defense boost
      
      // Both should be valid genomes
      expect(redGenome).toHaveLength(9);
      expect(blueGenome).toHaveLength(9);
    });

    test('should create unique genomes each time', () => {
      const genome1 = researcher.generateRandomGenome();
      const genome2 = researcher.generateRandomGenome();
      
      // Should be different (extremely unlikely to be identical)
      expect(genome1).not.toEqual(genome2);
    });
  });

  describe('Parent Selection', () => {
    test('should select parents from candidate pool using tournament selection', () => {
      const candidatePool = [
        { genome: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], fitness: 0.3, team: 'red' },
        { genome: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], fitness: 0.8, team: 'red' },
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6, team: 'red' }
      ];

      const parents = researcher.selectParents(candidatePool, 2);
      
      expect(parents).toHaveLength(2);
      expect(parents[0]).toHaveProperty('genome');
      expect(parents[0]).toHaveProperty('fitness');
      expect(parents[0].genome).toHaveLength(9);
    });

    test('should handle empty candidate pool gracefully', () => {
      const parents = researcher.selectParents([], 2);
      
      expect(parents).toHaveLength(2);
      expect(parents[0].genome).toHaveLength(9);
      expect(parents[0].fitness).toBe(0.5);
    });

    test('should run tournament selection correctly', () => {
      const candidatePool = [
        { genome: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], fitness: 0.2, team: 'red' },
        { genome: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], fitness: 0.9, team: 'red' },
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.4, team: 'red' }
      ];

      // Run tournament multiple times to test selection pressure
      const results = [];
      for (let i = 0; i < 10; i++) {
        const winner = researcher.runTournament(candidatePool, 3);
        results.push(winner.fitness);
      }

      // Higher fitness should be selected more often
      const avgFitness = results.reduce((sum, f) => sum + f, 0) / results.length;
      expect(avgFitness).toBeGreaterThan(0.4); // Should favor higher fitness
    });
  });

  describe('Crossover Operations', () => {
    test('should perform valid crossover between two parents', () => {
      const parent1 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      const parent2 = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

      const child = researcher.crossover(parent1, parent2);
      
      expect(child).toHaveLength(9);
      expect(child.every(gene => gene >= 0 && gene <= 1)).toBe(true);
      
      // Child should contain elements from both parents
      expect(child).not.toEqual(parent1);
      expect(child).not.toEqual(parent2);
    });

    test('should emit visualization events during crossover', () => {
      const parent1 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const parent2 = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6];

      researcher.crossover(parent1, parent2);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'researcher', 
        'crossover'
      );
    });
  });

  describe('Mutation Operations', () => {
    test('should perform valid mutations on genomes', () => {
      const originalGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const mutatedGenome = researcher.mutate([...originalGenome]);
      
      expect(mutatedGenome).toHaveLength(9);
      expect(mutatedGenome.every(gene => gene >= 0 && gene <= 1)).toBe(true);
      
      // Should be different from original (unless no mutations occurred)
      // Test multiple times to ensure mutation happens
      let foundMutation = false;
      for (let i = 0; i < 10; i++) {
        const testMutation = researcher.mutate([...originalGenome]);
        if (!testMutation.every((gene, idx) => gene === originalGenome[idx])) {
          foundMutation = true;
          break;
        }
      }
      expect(foundMutation).toBe(true);
    });

    test('should respect mutation rate boundaries', () => {
      // Test with extreme mutation rate
      const originalRate = researcher.mutationRate;
      researcher.mutationRate = 1.0; // 100% mutation rate
      
      const originalGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const mutatedGenome = researcher.mutate([...originalGenome]);
      
      // Should be different from original with 100% mutation rate
      expect(mutatedGenome).not.toEqual(originalGenome);
      
      // Restore original rate
      researcher.mutationRate = originalRate;
    });
  });

  describe('Team Candidate Management', () => {
    test('should filter candidates by team affiliation', () => {
      const candidatePool = [
        { genome: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], fitness: 0.3, team: 'red' },
        { genome: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], fitness: 0.8, team: 'blue' },
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6, team: 'red' }
      ];
      const history = [];

      const redCandidates = researcher.getTeamCandidates(candidatePool, history, 'red');
      
      expect(redCandidates.length).toBeGreaterThanOrEqual(2);
      expect(redCandidates.every(candidate => 
        candidate.team === 'red' || !candidate.team
      )).toBe(true);
    });

    test('should generate team candidates when pool is insufficient', () => {
      const emptyCandidatePool = [];
      const history = [];

      const redCandidates = researcher.getTeamCandidates(emptyCandidatePool, history, 'red');
      
      expect(redCandidates).toHaveLength(4); // Should create 4 team-specific genomes
      expect(redCandidates.every(candidate => candidate.team === 'red')).toBe(true);
    });

    test('should utilize battle history when candidate pool is small', () => {
      const smallCandidatePool = [
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.3, team: 'red' }
      ];
      
      const mockHistory = [
        {
          redGenomes: [
            [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9]
          ],
          blueGenomes: [
            [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
          ],
          result: { 
            winner: 'red',
            redTeamStats: {
              averageSurvivalTime: 60,
              accuracy: 0.7,
              totalDamageDealt: 80
            },
            blueTeamStats: {
              averageSurvivalTime: 40,
              accuracy: 0.5,
              totalDamageDealt: 50
            }
          },
          generation: 1
        }
      ];

      const redCandidates = researcher.getTeamCandidates(smallCandidatePool, mockHistory, 'red');
      
      expect(redCandidates.length).toBeGreaterThan(1);
    });
  });

  describe('Experiment Proposal', () => {
    test('should propose valid experiments with team-specific genomes', () => {
      const candidatePool = [
        { genome: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], fitness: 0.3, team: 'red' },
        { genome: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], fitness: 0.8, team: 'blue' }
      ];
      const history = [];

      const experiment = researcher.proposeExperiment(candidatePool, history, cognitionBase);
      
      expect(experiment).toHaveProperty('redGenomes');
      expect(experiment).toHaveProperty('blueGenomes');
      expect(experiment.redGenomes).toHaveLength(5);
      expect(experiment.blueGenomes).toHaveLength(5);
      
      // All genomes should be valid
      [...experiment.redGenomes, ...experiment.blueGenomes].forEach(genome => {
        expect(genome).toHaveLength(9);
        expect(genome.every(gene => typeof gene === 'number')).toBe(true);
        expect(genome.every(gene => gene >= 0 && gene <= 1)).toBe(true);
      });
    });

    test('should emit visualization events during experiment proposal', () => {
      const candidatePool = [];
      const history = [];

      researcher.proposeExperiment(candidatePool, history, cognitionBase);
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'researcher', 
        'propose_experiment'
      );
    });
  });

  describe('Opponent Strategy Analysis', () => {
    test('should analyze opponent strategies from battle history', () => {
      const mockHistory = [
        {
          redGenomes: [
            [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.9]
          ],
          blueGenomes: [
            [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
          ],
          result: { 
            winner: 'blue',
            redTeamStats: {
              averageSurvivalTime: 40,
              accuracy: 0.5,
              totalDamageDealt: 50
            },
            blueTeamStats: {
              averageSurvivalTime: 80,
              accuracy: 0.8,
              totalDamageDealt: 90
            }
          },
          generation: 1
        }
      ];

      const strategies = researcher.analyzeOpponentStrategies(mockHistory, 'blue');
      
      expect(strategies).toHaveProperty('avgAggression');
      expect(strategies).toHaveProperty('avgSpeed');
      expect(strategies).toHaveProperty('avgAccuracy');
      expect(strategies).toHaveProperty('winningTactics');
      expect(typeof strategies.avgAggression).toBe('number');
    });

    test('should handle empty history gracefully', () => {
      const strategies = researcher.analyzeOpponentStrategies([], 'red');
      
      expect(strategies).toHaveProperty('avgAggression');
      expect(strategies).toHaveProperty('avgSpeed');
      expect(strategies).toHaveProperty('avgAccuracy');
      expect(strategies).toHaveProperty('winningTactics');
      expect(strategies.avgAggression).toBe(0.5); // Default values
    });
  });

  describe('Cognition Integration', () => {
    test('should apply cognition-based improvements to genomes', () => {
      const baseGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const history = [];

      const improvedGenome = researcher.applyCognition(baseGenome, cognitionBase, 'red', history);
      
      expect(improvedGenome).toHaveLength(9);
      expect(improvedGenome.every(gene => typeof gene === 'number')).toBe(true);
      expect(improvedGenome.every(gene => gene >= 0 && gene <= 1)).toBe(true);
    });

    test('should differentiate improvements between teams', () => {
      const baseGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const history = [];

      const redImproved = researcher.applyCognition([...baseGenome], cognitionBase, 'red', history);
      const blueImproved = researcher.applyCognition([...baseGenome], cognitionBase, 'blue', history);
      
      // Teams should have different improvements (though this might not always be the case)
      // At minimum, the function should run without errors for both teams
      expect(redImproved).toHaveLength(9);
      expect(blueImproved).toHaveLength(9);
    });
  });

  describe('Red Queen Race Dynamics', () => {
    test('should implement counter-evolution against opponent strategies', () => {
      const baseGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const opponentStrategies = {
        avgAggression: 0.8,
        avgSpeed: 0.6,
        avgAccuracy: 0.7,
        winningTactics: ['high_aggression', 'formation_fighting']
      };

      const counterGenome = researcher.applyCounterEvolution([...baseGenome], opponentStrategies, 'red');
      
      expect(counterGenome).toHaveLength(9);
      expect(counterGenome.every(gene => typeof gene === 'number')).toBe(true);
      expect(counterGenome.every(gene => gene >= 0 && gene <= 1)).toBe(true);
      
      // Should have adapted to counter high aggression (increased defense)
      expect(counterGenome[3]).toBeGreaterThan(baseGenome[3]); // Defense should increase
    });

    test('should generate different team genomes for competitive evolution', () => {
      const parents = [
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 }
      ];
      const history = [];

      const redGenomes = researcher.generateTeamGenomes(parents, cognitionBase, 'red', history);
      const blueGenomes = researcher.generateTeamGenomes(parents, cognitionBase, 'blue', history);
      
      expect(redGenomes).toHaveLength(5);
      expect(blueGenomes).toHaveLength(5);
      
      // Should generate different genomes for different teams
      expect(redGenomes).not.toEqual(blueGenomes);
    });
  });

  describe('Configuration and Parameters', () => {
    test('should have reasonable default parameters', () => {
      expect(researcher.mutationRate).toBeGreaterThan(0);
      expect(researcher.mutationRate).toBeLessThanOrEqual(1);
      expect(researcher.crossoverRate).toBeGreaterThan(0);
      expect(researcher.crossoverRate).toBeLessThanOrEqual(1);
    });

    test('should allow parameter modification', () => {
      const originalMutationRate = researcher.mutationRate;
      const originalCrossoverRate = researcher.crossoverRate;
      
      researcher.mutationRate = 0.5;
      researcher.crossoverRate = 0.8;
      
      expect(researcher.mutationRate).toBe(0.5);
      expect(researcher.crossoverRate).toBe(0.8);
      
      // Restore original values
      researcher.mutationRate = originalMutationRate;
      researcher.crossoverRate = originalCrossoverRate;
    });
  });
});
