/**
 * Integration tests for the complete ASI-ARCH tank evolution system
 */

const fs = require('fs');
const path = require('path');

// Load all source files
const asiArchModulesSource = fs.readFileSync(path.join(__dirname, '../asi-arch-modules.js'), 'utf8');
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');
const tankAiSource = fs.readFileSync(path.join(__dirname, '../tank-ai.js'), 'utf8');
const gameEngineSource = fs.readFileSync(path.join(__dirname, '../game-engine.js'), 'utf8');

function createIntegrationTestEnvironment() {
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
    <span id="researcherRedMutations">0</span>
    <span id="researcherBlueMutations">0</span>
    <span id="analystRedInsights">0</span>
    <span id="analystBlueInsights">0</span>
    <span id="cognitionRedTactics">0</span>
    <span id="cognitionBlueTactics">0</span>
    <div id="redAdaptations">Red Adaptations: 0</div>
    <div id="blueAdaptations">Blue Adaptations: 0</div>
    <div id="evolutionLog"></div>
    <button id="evolveBtn">Evolve Generation</button>
    <button id="resetBtn">Reset Evolution</button>
  `;

  // Mock canvas context for GameEngine
  const canvas = document.getElementById('gameCanvas');
  const mockContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    imageSmoothingEnabled: true
  };
  
  canvas.getContext = jest.fn(() => mockContext);
  canvas.parentElement = { clientWidth: 800, clientHeight: 600 };

  // Mock requestAnimationFrame for testing
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

  eval(asiArchModulesSource);
  eval(tankAiSource);
  eval(evolutionEngineSource);
  eval(gameEngineSource);

  return {
    ASIArchModules: global.ASIArchModules,
    TankAI: global.TankAI,
    EvolutionEngine: global.EvolutionEngine,
    GameEngine: global.GameEngine
  };
}

describe('ASI-ARCH System Integration', () => {
  let testEnv;
  let gameEngine;
  let evolutionEngine;
  let asiArchModules;

  beforeEach(() => {
    testEnv = createIntegrationTestEnvironment();
    gameEngine = new testEnv.GameEngine('gameCanvas'); // Pass canvas ID
    evolutionEngine = new testEnv.EvolutionEngine(); // Create evolution engine with integrated ASI-ARCH
    asiArchModules = evolutionEngine.asiArch; // Use the integrated ASI-ARCH modules
    
    // Connect the components
    gameEngine.setEvolutionEngine(evolutionEngine);
  });

  describe('System Initialization', () => {
    test('should initialize complete ASI-ARCH system', () => {
      expect(gameEngine).toBeDefined();
      expect(evolutionEngine).toBeDefined();
      expect(asiArchModules).toBeDefined();
      
      expect(evolutionEngine.redPopulation).toHaveLength(10);
      expect(evolutionEngine.bluePopulation).toHaveLength(10);
    });

    test('should have proper component interconnections', () => {
      // Evolution engine should have ASI-ARCH modules
      expect(evolutionEngine.asiArch).toBe(asiArchModules);
      
      // Game engine should have evolution engine
      expect(gameEngine.evolutionEngine).toBe(evolutionEngine);
    });

    test('should initialize with valid DOM connections', () => {
      expect(document.getElementById('gameCanvas')).toBeDefined();
      expect(document.getElementById('generationDisplay')).toBeDefined();
      expect(document.getElementById('redFitness')).toBeDefined();
      expect(document.getElementById('blueFitness')).toBeDefined();
    });
  });

  describe('Red Queen Race Dynamics', () => {
    test('should demonstrate competitive coevolution', () => {
      const initialRedGenomes = evolutionEngine.redPopulation.map(tank => [...tank.genome]);
      const initialBlueGenomes = evolutionEngine.bluePopulation.map(tank => [...tank.genome]);
      
      // Simulate battle results
      evolutionEngine.battleResults = {
        red: { wins: 6, totalBattles: 10 },
        blue: { wins: 4, totalBattles: 10 }
      };

      // Run several generations
      for (let gen = 0; gen < 3; gen++) {
        evolutionEngine.nextGeneration();
      }

      // Both populations should evolve
      const redEvolved = evolutionEngine.redPopulation.some((tank, i) =>
        tank.genome.some((gene, j) => Math.abs(gene - initialRedGenomes[i][j]) > 0.01)
      );
      const blueEvolved = evolutionEngine.bluePopulation.some((tank, i) =>
        tank.genome.some((gene, j) => Math.abs(gene - initialBlueGenomes[i][j]) > 0.01)
      );

      expect(redEvolved).toBe(true);
      expect(blueEvolved).toBe(true);
      expect(evolutionEngine.generation).toBe(4);
    });

    test('should show ASI-ARCH activity during evolution', () => {
      evolutionEngine.nextGeneration();

      // All ASI-ARCH modules should show activity
      expect(asiArchModules.stats.red.mutations).toBeGreaterThan(0);
      expect(asiArchModules.stats.blue.mutations).toBeGreaterThan(0);
      expect(asiArchModules.stats.red.insights).toBeGreaterThan(0);
      expect(asiArchModules.stats.blue.insights).toBeGreaterThan(0);
    });

    test('should demonstrate arms race escalation', () => {
      const generations = 5;
      const redStatsHistory = [];
      const blueStatsHistory = [];

      // Track evolution over multiple generations
      for (let gen = 0; gen < generations; gen++) {
        evolutionEngine.battleResults = {
          red: { wins: 5 + gen, totalBattles: 10 },
          blue: { wins: 5 - gen, totalBattles: 10 }
        };

        evolutionEngine.nextGeneration();

        redStatsHistory.push({
          mutations: asiArchModules.stats.red.mutations,
          insights: asiArchModules.stats.red.insights,
          tactics: asiArchModules.stats.red.tactics,
          adaptations: asiArchModules.stats.red.adaptations
        });

        blueStatsHistory.push({
          mutations: asiArchModules.stats.blue.mutations,
          insights: asiArchModules.stats.blue.insights,
          tactics: asiArchModules.stats.blue.tactics,
          adaptations: asiArchModules.stats.blue.adaptations
        });
      }

      // Stats should generally increase over time (arms race)
      const finalRed = redStatsHistory[generations - 1];
      const finalBlue = blueStatsHistory[generations - 1];

      expect(finalRed.mutations).toBeGreaterThan(redStatsHistory[0].mutations);
      expect(finalBlue.mutations).toBeGreaterThan(blueStatsHistory[0].mutations);
    });
  });

  describe('ASI-ARCH Module Coordination', () => {
    test('should apply all four modules in sequence', () => {
      const researcherSpy = jest.spyOn(asiArchModules, 'applyResearcher');
      const engineerSpy = jest.spyOn(asiArchModules, 'applyEngineer');
      const analystSpy = jest.spyOn(asiArchModules, 'applyAnalyst');
      const cognitionSpy = jest.spyOn(asiArchModules, 'applyCognition');

      evolutionEngine.evolvePopulation('red');

      expect(researcherSpy).toHaveBeenCalledWith(expect.any(Array), 'red');
      expect(engineerSpy).toHaveBeenCalledWith(expect.any(Array), 'red');
      expect(analystSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(Array), 'red');
      expect(cognitionSpy).toHaveBeenCalledWith(expect.any(Array), 'red');

      researcherSpy.mockRestore();
      engineerSpy.mockRestore();
      analystSpy.mockRestore();
      cognitionSpy.mockRestore();
    });

    test('should maintain team-specific statistics', () => {
      // Evolve red team
      evolutionEngine.evolvePopulation('red');
      const redMutationsBefore = asiArchModules.stats.red.mutations;
      const blueMutationsBefore = asiArchModules.stats.blue.mutations;

      // Evolve blue team
      evolutionEngine.evolvePopulation('blue');

      // Red stats should remain unchanged, blue should increase
      expect(asiArchModules.stats.red.mutations).toBe(redMutationsBefore);
      expect(asiArchModules.stats.blue.mutations).toBeGreaterThan(blueMutationsBefore);
    });

    test('should implement conditional tactical learning', () => {
      // Set up performance disparity
      asiArchModules.setTeamPerformance('red', 0.8);
      asiArchModules.setTeamPerformance('blue', 0.2);

      const redTacticsBefore = asiArchModules.stats.red.tactics;
      const blueTacticsBefore = asiArchModules.stats.blue.tactics;

      // Apply analyst module
      asiArchModules.applyAnalyst(
        evolutionEngine.redPopulation,
        evolutionEngine.bluePopulation,
        'red'
      );
      asiArchModules.applyAnalyst(
        evolutionEngine.bluePopulation,
        evolutionEngine.redPopulation,
        'blue'
      );

      // High-performing team should learn more tactics
      const redTacticsGain = asiArchModules.stats.red.tactics - redTacticsBefore;
      const blueTacticsGain = asiArchModules.stats.blue.tactics - blueTacticsBefore;

      expect(redTacticsGain).toBeGreaterThanOrEqual(blueTacticsGain);
    });
  });

  describe('Genome Evolution Validation', () => {
    test('should maintain genome integrity during evolution', () => {
      const initialGenome = evolutionEngine.redPopulation[0].genome;
      expect(initialGenome).toHaveLength(9);

      evolutionEngine.nextGeneration();

      evolutionEngine.redPopulation.forEach(tank => {
        expect(tank.genome).toHaveLength(9);
        tank.genome.forEach(gene => {
          expect(gene).toBeGreaterThanOrEqual(0);
          expect(gene).toBeLessThanOrEqual(1);
        });
      });
    });

    test('should preserve elite individuals', () => {
      // Mark one tank as highly fit
      evolutionEngine.redPopulation[0].fitness = 0.99;
      const eliteGenome = [...evolutionEngine.redPopulation[0].genome];

      evolutionEngine.evolvePopulation('red');

      // Elite traits should be preserved in population
      const hasEliteTraits = evolutionEngine.redPopulation.some(tank =>
        tank.genome.some((gene, i) => Math.abs(gene - eliteGenome[i]) < 0.1)
      );
      expect(hasEliteTraits).toBe(true);
    });

    test('should show genetic diversity in population', () => {
      evolutionEngine.nextGeneration();

      // Calculate genetic diversity
      const genomes = evolutionEngine.redPopulation.map(tank => tank.genome);
      let totalVariance = 0;

      for (let geneIndex = 0; geneIndex < 9; geneIndex++) {
        const geneValues = genomes.map(genome => genome[geneIndex]);
        const mean = geneValues.reduce((sum, val) => sum + val, 0) / geneValues.length;
        const variance = geneValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / geneValues.length;
        totalVariance += variance;
      }

      // Should have some genetic diversity
      expect(totalVariance).toBeGreaterThan(0);
    });
  });

  describe('Performance Tracking', () => {
    test('should track fitness evolution over generations', () => {
      const fitnessHistory = [];

      for (let gen = 0; gen < 5; gen++) {
        evolutionEngine.battleResults = {
          red: { wins: 6, totalBattles: 10 },
          blue: { wins: 4, totalBattles: 10 }
        };

        const avgFitness = evolutionEngine.redPopulation.reduce((sum, tank) => 
          sum + (tank.fitness || 0.5), 0) / evolutionEngine.redPopulation.length;
        
        fitnessHistory.push(avgFitness);
        evolutionEngine.nextGeneration();
      }

      expect(fitnessHistory).toHaveLength(5);
      expect(evolutionEngine.generation).toBe(6);
    });

    test('should update DOM with current statistics', () => {
      evolutionEngine.nextGeneration();

      const generationDisplay = document.getElementById('generationDisplay');
      const redMutationsDisplay = document.getElementById('researcherRedMutations');
      const blueMutationsDisplay = document.getElementById('researcherBlueMutations');

      expect(generationDisplay.textContent).toContain('2');
      expect(redMutationsDisplay.textContent).toBe(asiArchModules.stats.red.mutations.toString());
      expect(blueMutationsDisplay.textContent).toBe(asiArchModules.stats.blue.mutations.toString());
    });
  });

  describe('Tank AI Integration', () => {
    test('should create tanks with AI based on evolved genomes', () => {
      const tank = evolutionEngine.createTank(100, 100, 'red');
      
      expect(tank.ai).toBeDefined();
      expect(tank.ai.tank).toBe(tank);
      expect(tank.ai.aggression).toBeDefined();
      expect(tank.ai.searchRadius).toBeDefined();
      
      // AI traits should be based on genome
      expect(tank.ai.aggression).toBe(tank.genome[0]);
      expect(tank.ai.searchRadius).toBe(tank.genome[1]);
    });

    test('should have different AI behaviors for different genomes', () => {
      const aggressiveTank = evolutionEngine.createTank(100, 100, 'red');
      aggressiveTank.genome = [0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      aggressiveTank.ai = new testEnv.TankAI(aggressiveTank);

      const passiveTank = evolutionEngine.createTank(200, 200, 'blue');
      passiveTank.genome = [0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      passiveTank.ai = new testEnv.TankAI(passiveTank);

      expect(aggressiveTank.ai.aggression).toBeGreaterThan(passiveTank.ai.aggression);
    });
  });

  describe('Error Handling and Robustness', () => {
    test('should handle invalid battle results gracefully', () => {
      evolutionEngine.battleResults = {
        red: { wins: 0, totalBattles: 0 },
        blue: { wins: 0, totalBattles: 0 }
      };

      expect(() => {
        evolutionEngine.nextGeneration();
      }).not.toThrow();
    });

    test('should handle missing DOM elements gracefully', () => {
      // Remove some DOM elements
      document.getElementById('researcherRedMutations').remove();

      expect(() => {
        evolutionEngine.nextGeneration();
      }).not.toThrow();
    });

    test('should validate system state consistency', () => {
      // Run multiple generations and check consistency
      for (let i = 0; i < 3; i++) {
        evolutionEngine.nextGeneration();
        
        // Populations should remain proper size
        expect(evolutionEngine.redPopulation).toHaveLength(10);
        expect(evolutionEngine.bluePopulation).toHaveLength(10);
        
        // All tanks should have valid genomes
        evolutionEngine.redPopulation.forEach(tank => {
          expect(tank.genome).toHaveLength(9);
          expect(tank.ai).toBeDefined();
        });
      }
    });
  });

  describe('System Reset and Reinitialization', () => {
    test('should be able to reset evolution state', () => {
      // Evolve for a few generations
      for (let i = 0; i < 3; i++) {
        evolutionEngine.nextGeneration();
      }

      // Reset system (simulate)
      gameEngine = new testEnv.GameEngine('gameCanvas');
      gameEngine.setEvolutionEngine(new testEnv.EvolutionEngine());
      evolutionEngine = gameEngine.evolutionEngine;
      asiArchModules = evolutionEngine.asiArch;

      expect(evolutionEngine.generation).toBe(1);
      expect(asiArchModules.stats.red.mutations).toBe(0);
    });
  });
});
