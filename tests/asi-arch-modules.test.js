/**
 * Tests for ASI-ARCH module functionality
 */

// Import modules
const fs = require('fs');
const path = require('path');

// Load source files
const asiArchModulesSource = fs.readFileSync(path.join(__dirname, '../asi-arch-modules.js'), 'utf8');
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');
const tankAiSource = fs.readFileSync(path.join(__dirname, '../tank-ai.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
  // Set up DOM elements
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="generationDisplay">Generation: 1</div>
    <div id="redScore">Red Score: 0</div>
    <div id="blueScore">Blue Score: 0</div>
    <div id="redFitness">Red Fitness: 0</div>
    <div id="blueFitness">Blue Fitness: 0</div>
    <span id="researcherRedMutations">0</span>
    <span id="researcherBlueMutations">0</span>
    <span id="analystRedInsights">0</span>
    <span id="analystBlueInsights">0</span>
    <span id="cognitionRedTactics">0</span>
    <span id="cognitionBlueTactics">0</span>
    <div id="redAdaptations">Red Adaptations: 0</div>
    <div id="blueAdaptations">Blue Adaptations: 0</div>
  `;

  // Execute the source code in test environment
  eval(asiArchModulesSource);
  eval(tankAiSource);
  eval(evolutionEngineSource);

  return {
    ASIArchModules: global.ASIArchModules,
    TankAI: global.TankAI,
    EvolutionEngine: global.EvolutionEngine
  };
}

describe('ASI-ARCH Module System', () => {
  let testEnv;
  let asiArchModules;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    asiArchModules = new testEnv.ASIArchModules();
  });

  describe('Initialization', () => {
    test('should initialize with all four modules', () => {
      expect(asiArchModules).toBeDefined();
      expect(asiArchModules.researcherModule).toBeDefined();
      expect(asiArchModules.engineerModule).toBeDefined();
      expect(asiArchModules.analystModule).toBeDefined();
      expect(asiArchModules.cognitionModule).toBeDefined();
    });

    test('should start with zero statistics for both teams', () => {
      expect(asiArchModules.stats.red.mutations).toBe(0);
      expect(asiArchModules.stats.blue.mutations).toBe(0);
      expect(asiArchModules.stats.red.insights).toBe(0);
      expect(asiArchModules.stats.blue.insights).toBe(0);
      expect(asiArchModules.stats.red.tactics).toBe(0);
      expect(asiArchModules.stats.blue.tactics).toBe(0);
      expect(asiArchModules.stats.red.adaptations).toBe(0);
      expect(asiArchModules.stats.blue.adaptations).toBe(0);
    });
  });

  describe('Researcher Module', () => {
    test('should apply research to tank genome', () => {
      const initialGenome = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const population = [{ genome: [...initialGenome], fitness: 1.0 }];
      
      const researched = asiArchModules.applyResearcher(population, 'red');
      
      expect(researched).toBeDefined();
      expect(researched.length).toBe(1);
      expect(researched[0].genome).toHaveLength(9);
      expect(asiArchModules.stats.red.mutations).toBeGreaterThan(0);
    });

    test('should track mutations separately for red and blue teams', () => {
      const population = [{ genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 1.0 }];
      
      asiArchModules.applyResearcher(population, 'red');
      const redMutations = asiArchModules.stats.red.mutations;
      
      asiArchModules.applyResearcher(population, 'blue');
      const blueMutations = asiArchModules.stats.blue.mutations;
      
      expect(redMutations).toBeGreaterThan(0);
      expect(blueMutations).toBeGreaterThan(0);
      expect(asiArchModules.stats.red.mutations).toBeGreaterThanOrEqual(redMutations);
      expect(asiArchModules.stats.blue.mutations).toBeGreaterThanOrEqual(blueMutations);
    });
  });

  describe('Engineer Module', () => {
    test('should optimize tank configurations', () => {
      const population = [
        { genome: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], fitness: 0.3 },
        { genome: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], fitness: 0.7 }
      ];
      
      const optimized = asiArchModules.applyEngineer(population, 'red');
      
      expect(optimized).toBeDefined();
      expect(optimized.length).toBe(2);
      expect(asiArchModules.stats.red.insights).toBeGreaterThan(0);
    });

    test('should preserve high-fitness individuals', () => {
      const highFitnessTank = { genome: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9], fitness: 0.95 };
      const lowFitnessTank = { genome: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], fitness: 0.05 };
      const population = [highFitnessTank, lowFitnessTank];
      
      const optimized = asiArchModules.applyEngineer(population, 'red');
      
      // High fitness tank should be preserved
      const preservedHighFitness = optimized.find(tank => tank.fitness >= 0.95);
      expect(preservedHighFitness).toBeDefined();
    });
  });

  describe('Analyst Module', () => {
    test('should analyze team performance', () => {
      const redPopulation = [
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 },
        { genome: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6], fitness: 0.8 }
      ];
      const bluePopulation = [
        { genome: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], fitness: 0.4 },
        { genome: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], fitness: 0.2 }
      ];
      
      const analyzed = asiArchModules.applyAnalyst(redPopulation, bluePopulation, 'red');
      
      expect(analyzed).toBeDefined();
      expect(analyzed.length).toBe(2);
      expect(asiArchModules.stats.red.tactics).toBeGreaterThan(0);
    });

    test('should implement conditional tactical learning', () => {
      // Test scenario where team is performing well (should learn tactics)
      const redPopulation = [{ genome: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], fitness: 0.9 }];
      const bluePopulation = [{ genome: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], fitness: 0.1 }];
      
      const initialTactics = asiArchModules.stats.red.tactics;
      asiArchModules.applyAnalyst(redPopulation, bluePopulation, 'red');
      
      // Should learn tactics when performing well
      expect(asiArchModules.stats.red.tactics).toBeGreaterThan(initialTactics);
    });
  });

  describe('Cognition Module', () => {
    test('should apply meta-learning and adaptations', () => {
      const population = [
        { genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 }
      ];
      
      const enhanced = asiArchModules.applyCognition(population, 'red');
      
      expect(enhanced).toBeDefined();
      expect(enhanced.length).toBe(1);
      expect(asiArchModules.stats.red.adaptations).toBeGreaterThan(0);
    });

    test('should implement performance-based learning', () => {
      // Set up team performance for testing
      asiArchModules.setTeamPerformance('red', 0.8);
      asiArchModules.setTeamPerformance('blue', 0.2);
      
      const population = [{ genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 }];
      
      const initialAdaptations = asiArchModules.stats.red.adaptations;
      asiArchModules.applyCognition(population, 'red');
      
      expect(asiArchModules.stats.red.adaptations).toBeGreaterThan(initialAdaptations);
    });
  });

  describe('Red Queen Race Mechanics', () => {
    test('should track competitive evolution between teams', () => {
      const redPop = [{ genome: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7], fitness: 0.8 }];
      const bluePop = [{ genome: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], fitness: 0.2 }];
      
      // Apply all modules to both teams
      asiArchModules.applyResearcher(redPop, 'red');
      asiArchModules.applyEngineer(redPop, 'red');
      asiArchModules.applyAnalyst(redPop, bluePop, 'red');
      asiArchModules.applyCognition(redPop, 'red');
      
      asiArchModules.applyResearcher(bluePop, 'blue');
      asiArchModules.applyEngineer(bluePop, 'blue');
      asiArchModules.applyAnalyst(bluePop, redPop, 'blue');
      asiArchModules.applyCognition(bluePop, 'blue');
      
      // Both teams should show activity
      expect(asiArchModules.stats.red.mutations).toBeGreaterThan(0);
      expect(asiArchModules.stats.blue.mutations).toBeGreaterThan(0);
      expect(asiArchModules.stats.red.insights).toBeGreaterThan(0);
      expect(asiArchModules.stats.blue.insights).toBeGreaterThan(0);
    });

    test('should show different tactical evolution for different teams', () => {
      // Reset stats
      asiArchModules.stats.red.tactics = 0;
      asiArchModules.stats.blue.tactics = 0;
      
      const strongRedPop = [{ genome: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9], fitness: 0.95 }];
      const weakBluePop = [{ genome: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], fitness: 0.05 }];
      
      // Apply analyst to both teams with different performance contexts
      asiArchModules.applyAnalyst(strongRedPop, weakBluePop, 'red');
      asiArchModules.applyAnalyst(weakBluePop, strongRedPop, 'blue');
      
      // Red should learn more tactics due to better performance
      expect(asiArchModules.stats.red.tactics).toBeGreaterThanOrEqual(asiArchModules.stats.blue.tactics);
    });
  });

  describe('Team Performance Tracking', () => {
    test('should track team performance separately', () => {
      asiArchModules.setTeamPerformance('red', 0.75);
      asiArchModules.setTeamPerformance('blue', 0.25);
      
      expect(asiArchModules.getTeamPerformance('red')).toBe(0.75);
      expect(asiArchModules.getTeamPerformance('blue')).toBe(0.25);
    });

    test('should use performance data for conditional learning', () => {
      // Set different performance levels
      asiArchModules.setTeamPerformance('red', 0.9);
      asiArchModules.setTeamPerformance('blue', 0.1);
      
      const population = [{ genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 }];
      
      // High-performing team should get more adaptations
      const redInitial = asiArchModules.stats.red.adaptations;
      asiArchModules.applyCognition(population, 'red');
      const redFinal = asiArchModules.stats.red.adaptations;
      
      expect(redFinal).toBeGreaterThan(redInitial);
    });
  });

  describe('Integration with DOM', () => {
    test('should update DOM elements with statistics', () => {
      // Trigger some ASI-ARCH activity
      const population = [{ genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fitness: 0.6 }];
      
      asiArchModules.applyResearcher(population, 'red');
      asiArchModules.applyEngineer(population, 'red');
      
      // Force DOM update
      asiArchModules.updateDisplay();
      
      // Check if DOM elements are updated
      const redMutationsElement = document.getElementById('researcherRedMutations');
      const redInsightsElement = document.getElementById('analystRedInsights');
      
      expect(redMutationsElement.textContent).toBe(asiArchModules.stats.red.mutations.toString());
      expect(redInsightsElement.textContent).toBe(asiArchModules.stats.red.insights.toString());
    });
  });
});
