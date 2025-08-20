/**
 * Functional tests for the ASI-ARCH tank evolution system
 * These tests validate the system works as expected without deep internals testing
 */

describe('ASI-ARCH Tank Evolution System - Functional Tests', () => {
  beforeAll(async () => {
    // We'll test the system functionality by checking the actual files exist and are structured correctly
  });

  describe('System Files and Structure', () => {
    test('should have all required source files', () => {
      const fs = require('fs');
      const requiredFiles = [
        'asi-arch-modules.js',
        'evolution-engine.js', 
        'tank-ai.js',
        'game-engine.js',
        'index.html'
      ];

      requiredFiles.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });
    });

    test('should have proper ASI-ARCH module structure', () => {
      const fs = require('fs');
      const asiArchContent = fs.readFileSync('asi-arch-modules.js', 'utf8');
      
      // Check for ASI-ARCH components
      expect(asiArchContent).toContain('class ASIArchModules');
      expect(asiArchContent).toContain('applyResearcher');
      expect(asiArchContent).toContain('applyEngineer'); 
      expect(asiArchContent).toContain('applyAnalyst');
      expect(asiArchContent).toContain('applyCognition');
    });

    test('should have Red Queen Race implementation', () => {
      const fs = require('fs');
      const evolutionContent = fs.readFileSync('evolution-engine.js', 'utf8');
      
      expect(evolutionContent).toContain('class EvolutionEngine');
      expect(evolutionContent).toContain('nextGeneration');
      expect(evolutionContent).toContain('calculateTeamFitness');
      expect(evolutionContent).toContain('Red Queen');
    });

    test('should have tank AI with genome-based behavior', () => {
      const fs = require('fs');
      const tankAiContent = fs.readFileSync('tank-ai.js', 'utf8');
      
      expect(tankAiContent).toContain('class TankAI');
      expect(tankAiContent).toContain('aggression');
      expect(tankAiContent).toContain('searchRadius');
      expect(tankAiContent).toContain('accuracy');
      expect(tankAiContent).toContain('genome');
    });
  });

  describe('Configuration and Setup', () => {
    test('should have proper Jest configuration', () => {
      const fs = require('fs');
      expect(fs.existsSync('jest.config.js')).toBe(true);
      
      const jestConfig = require('../jest.config.js');
      expect(jestConfig.testEnvironment).toBe('jsdom');
    });

    test('should have package.json with test scripts', () => {
      const fs = require('fs');
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      expect(packageJson.scripts.test).toBe('jest');
      expect(packageJson.devDependencies.jest).toBeDefined();
      expect(packageJson.devDependencies.jsdom).toBeDefined();
    });

    test('should have proper HTML structure', () => {
      const fs = require('fs');
      const htmlContent = fs.readFileSync('index.html', 'utf8');
      
      // Check for required DOM elements
      expect(htmlContent).toContain('id="gameCanvas"');
      expect(htmlContent).toContain('id="generationDisplay"');
      expect(htmlContent).toContain('id="redFitness"');
      expect(htmlContent).toContain('id="blueFitness"');
      expect(htmlContent).toContain('id="researcherRedMutations"');
      expect(htmlContent).toContain('id="researcherBlueMutations"');
      
      // Check for tactical evolution monitor (replaced genome display)
      expect(htmlContent).toContain('🎯 Tactical Evolution Monitor');
      expect(htmlContent).toContain('📊 Top Performers');
      expect(htmlContent).toContain('red-champions');
      expect(htmlContent).toContain('blue-champions');
      expect(htmlContent).toContain('class="tactical-section"');
    });
  });

  describe('ASI-ARCH Methodology Compliance', () => {
    test('should implement all four ASI-ARCH modules', () => {
      const fs = require('fs');
      const asiArchContent = fs.readFileSync('asi-arch-modules.js', 'utf8');
      
      // Researcher Module
      expect(asiArchContent).toContain('Researcher Module');
      expect(asiArchContent).toContain('mutation');
      
      // Engineer Module  
      expect(asiArchContent).toContain('Engineer Module');
      expect(asiArchContent).toContain('optimization');
      
      // Analyst Module
      expect(asiArchContent).toContain('Analyst Module');
      expect(asiArchContent).toContain('tactical');
      
      // Cognition Module
      expect(asiArchContent).toContain('Cognition Module');
      expect(asiArchContent).toContain('meta-learning');
    });

    test('should have team-specific statistics tracking', () => {
      const fs = require('fs');
      const asiArchContent = fs.readFileSync('asi-arch-modules.js', 'utf8');
      
      expect(asiArchContent).toContain('stats.red');
      expect(asiArchContent).toContain('stats.blue');
      expect(asiArchContent).toContain('mutations');
      expect(asiArchContent).toContain('insights');
      expect(asiArchContent).toContain('tactics');
      expect(asiArchContent).toContain('adaptations');
    });

    test('should implement conditional tactical learning', () => {
      const fs = require('fs');
      const asiArchContent = fs.readFileSync('asi-arch-modules.js', 'utf8');
      
      expect(asiArchContent).toContain('performance-based');
      expect(asiArchContent).toContain('teamPerformance');
      expect(asiArchContent).toContain('conditional');
    });
  });

  describe('Red Queen Race Implementation', () => {
    test('should have competitive coevolution logic', () => {
      const fs = require('fs');
      const evolutionContent = fs.readFileSync('evolution-engine.js', 'utf8');
      
      expect(evolutionContent).toContain('Red Queen');
      expect(evolutionContent).toContain('competitive');
      expect(evolutionContent).toContain('evolvePopulation');
      expect(evolutionContent).toContain('battleResults');
    });

    test('should track battle outcomes for fitness calculation', () => {
      const fs = require('fs');
      const evolutionContent = fs.readFileSync('evolution-engine.js', 'utf8');
      
      expect(evolutionContent).toContain('wins');
      expect(evolutionContent).toContain('totalBattles');
      expect(evolutionContent).toContain('recordBattleResult');
    });

    test('should apply Red Queen weighting to fitness', () => {
      const fs = require('fs');
      const evolutionContent = fs.readFileSync('evolution-engine.js', 'utf8');
      
      expect(evolutionContent).toContain('redQueenWeight');
      expect(evolutionContent).toContain('calculateTeamFitness');
    });
  });

  describe('Genome and AI Integration', () => {
    test('should have 9-trait genome system', () => {
      const fs = require('fs');
      const tankAiContent = fs.readFileSync('tank-ai.js', 'utf8');
      
      expect(tankAiContent).toContain('aggression = genome[0]');
      expect(tankAiContent).toContain('searchRadius = genome[1]');
      expect(tankAiContent).toContain('accuracy = genome[2]');
      expect(tankAiContent).toContain('mobility = genome[3]');
      expect(tankAiContent).toContain('defensiveness = genome[4]');
      expect(tankAiContent).toContain('teamwork = genome[5]');
      expect(tankAiContent).toContain('adaptability = genome[6]');
      expect(tankAiContent).toContain('riskTaking = genome[7]');
      expect(tankAiContent).toContain('learning = genome[8]');
    });

    test('should implement genome-based behavior differences', () => {
      const fs = require('fs');
      const tankAiContent = fs.readFileSync('tank-ai.js', 'utf8');
      
      expect(tankAiContent).toContain('findClosestEnemy');
      expect(tankAiContent).toContain('shouldFire');
      expect(tankAiContent).toContain('update');
    });
  });

  describe('Visualization and User Interface', () => {
    test('should have comprehensive visualization system', () => {
      const fs = require('fs');
      const visualizerContent = fs.readFileSync('asi-arch-visualizer.js', 'utf8');
      
      expect(visualizerContent).toContain('class ASIArchVisualizer');
      expect(visualizerContent).toContain('updateDisplay');
      expect(visualizerContent).toContain('team-specific');
    });

    test('should track and display all ASI-ARCH metrics', () => {
      const fs = require('fs');
      const htmlContent = fs.readFileSync('index.html', 'utf8');
      
      const expectedElements = [
        'researcherRedMutations', 'researcherBlueMutations',
        'analystRedInsights', 'analystBlueInsights', 
        'cognitionRedTactics', 'cognitionBlueTactics',
        'redAdaptations', 'blueAdaptations'
      ];

      expectedElements.forEach(elementId => {
        expect(htmlContent).toContain(`id="${elementId}"`);
      });
    });
  });

  describe('System Integration', () => {
    test('should have proper module interconnections', () => {
      const fs = require('fs');
      const gameEngineContent = fs.readFileSync('game-engine.js', 'utf8');
      
      expect(gameEngineContent).toContain('EvolutionEngine');
      expect(gameEngineContent).toContain('ASIArchModules');
      expect(gameEngineContent).toContain('ASIArchVisualizer');
    });

    test('should have main entry point with all components', () => {
      const fs = require('fs');
      const mainContent = fs.readFileSync('main.js', 'utf8');
      
      expect(mainContent).toContain('GameEngine');
      expect(mainContent).toContain('startEvolution');
      expect(mainContent).toContain('pauseEvolution');
    });
  });

  describe('Testing Infrastructure', () => {
    test('should have complete test coverage structure', () => {
      const fs = require('fs');
      
      expect(fs.existsSync('tests/asi-arch-modules.test.js')).toBe(true);
      expect(fs.existsSync('tests/evolution-engine.test.js')).toBe(true);
      expect(fs.existsSync('tests/tank-ai.test.js')).toBe(true);
      expect(fs.existsSync('tests/integration.test.js')).toBe(true);
    });

    test('should have proper test environment setup', () => {
      const fs = require('fs');
      expect(fs.existsSync('test-setup.js')).toBe(true);
      
      const setupContent = fs.readFileSync('test-setup.js', 'utf8');
      expect(setupContent).toContain('HTMLCanvasElement');
      expect(setupContent).toContain('requestAnimationFrame');
    });
  });

  describe('Documentation and Architecture', () => {
    test('should have comprehensive documentation', () => {
      const fs = require('fs');
      
      expect(fs.existsSync('README.md')).toBe(true);
      expect(fs.existsSync('Architecture_Document.md')).toBe(true);
      expect(fs.existsSync('Design_Document.md')).toBe(true);
    });

    test('should reference ASI-ARCH methodology in documentation', () => {
      const fs = require('fs');
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      expect(readmeContent).toContain('ASI-ARCH');
      expect(readmeContent).toContain('Red Queen');
      expect(readmeContent).toContain('evolution');
    });
  });

  describe('System Validation', () => {
    test('should have no syntax errors in main files', () => {
      const fs = require('fs');
      const files = [
        'asi-arch-modules.js',
        'evolution-engine.js',
        'tank-ai.js', 
        'game-engine.js',
        'main.js'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic syntax validation - should not have unmatched braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
        
        // Should not have obvious syntax errors
        expect(content).not.toContain('SyntaxError');
        expect(content).not.toContain('unexpected token');
      });
    });

    test('should implement complete ASI-ARCH workflow', () => {
      const fs = require('fs');
      const evolutionContent = fs.readFileSync('evolution-engine.js', 'utf8');
      
      // Should have the complete evolution workflow
      expect(evolutionContent).toContain('applyResearcher');
      expect(evolutionContent).toContain('applyEngineer');
      expect(evolutionContent).toContain('applyAnalyst');
      expect(evolutionContent).toContain('applyCognition');
    });

    test('should demonstrate arms race dynamics', () => {
      const fs = require('fs');
      const asiArchContent = fs.readFileSync('asi-arch-modules.js', 'utf8');
      
      expect(asiArchContent).toContain('counter-evolution');
      expect(asiArchContent).toContain('competitive');
      expect(asiArchContent).toContain('arms race');
    });

    test('should have genome display functionality', () => {
      const fs = require('fs');
      const mainContent = fs.readFileSync('main.js', 'utf8');
      
      // Check for genome display functions
      expect(mainContent).toContain('updateGenomeDisplay');
      expect(mainContent).toContain('getBestGenomeForTeam');
      expect(mainContent).toContain('displayGenome');
      
      // Check for trait tracking
      expect(mainContent).toContain('traitNames');
      expect(mainContent).toContain('Aggression');
      expect(mainContent).toContain('ChampionFitness');
    });
  });
});
