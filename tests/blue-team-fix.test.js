/**
 * Integration Tests for Blue Team Genome Update Fix
 * Tests the specific issue where Blue team genome values weren't updating
 */
const fs = require('fs');
const path = require('path');

// Mock Tank class before loading any modules
global.Tank = class Tank {
    constructor(x, y, team, genome) {
        this.x = x; this.y = y; this.team = team; this.genome = genome;
        this.isAlive = true; this.width = 20; this.height = 20;
        this.damageDealt = 0; this.damageTaken = 0; this.survivalTime = 0;
        this.shotsFired = 0; this.shotsHit = 0;
    }
    update() {} render() {} takeDamage() {}
};

// Load source files
const mainSource = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');
function createIntegrationTestEnvironment() {
  // Create comprehensive DOM structure
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <!-- Evolution Control Buttons -->
    <button id="startEvolution">Start Evolution</button>
    <button id="pauseEvolution">Pause Evolution</button>
    <button id="resetBattle">Reset Battle</button>
    <!-- Red Team Display -->
    <div id="redChampionFitness">0.000</div>
    <div id="redAggression">0.50</div>
    <div id="redSpeed">0.50</div>
    <div id="redAccuracy">0.50</div>
    <div id="redDefense">0.50</div>
    <div id="redTeamwork">0.50</div>
    <div id="redAdaptability">0.50</div>
    <div id="redLearning">0.50</div>
    <div id="redRiskTaking">0.50</div>
    <div id="redEvasion">0.50</div>
    <div id="redAggressionBar"></div>
    <div id="redSpeedBar"></div>
    <div id="redAccuracyBar"></div>
    <div id="redDefenseBar"></div>
    <div id="redTeamworkBar"></div>
    <div id="redAdaptabilityBar"></div>
    <div id="redLearningBar"></div>
    <div id="redRiskTakingBar"></div>
    <div id="redEvasionBar"></div>
    <!-- Blue Team Display -->
    <div id="blueChampionFitness">0.000</div>
    <div id="blueAggression">0.50</div>
    <div id="blueSpeed">0.50</div>
    <div id="blueAccuracy">0.50</div>
    <div id="blueDefense">0.50</div>
    <div id="blueTeamwork">0.50</div>
    <div id="blueAdaptability">0.50</div>
    <div id="blueLearning">0.50</div>
    <div id="blueRiskTaking">0.50</div>
    <div id="blueEvasion">0.50</div>
    <div id="blueAggressionBar"></div>
    <div id="blueSpeedBar"></div>
    <div id="blueAccuracyBar"></div>
    <div id="blueDefenseBar"></div>
    <div id="blueTeamworkBar"></div>
    <div id="blueAdaptabilityBar"></div>
    <div id="blueLearningBar"></div>
    <div id="blueRiskTakingBar"></div>
    <div id="blueEvasionBar"></div>
  `;
  // Setup global window mock
  global.window = {
    DEBUG_GENOME: true, // Enable debug logging for tests
    lastDebugLog: 0,
    lastSearchLog: 0,
    lastTeamLog: 0,
    lastSuccessLog: 0,
    lastGenomeUpdate: 0,
    lastPerfWarning: 0
  };
  // Mock Date.now for consistent timing
  const mockTime = 1000000;
  jest.spyOn(Date, 'now').mockReturnValue(mockTime);
  // Evaluate evolution engine
  eval(evolutionEngineSource);
  // Extract and evaluate the specific functions we need to test
  const functionsToExtract = [
    'getBestGenomeForTeam',
    'displayGenome',
    'displayGenomeWithEvolvingFitness',
    'displayNoGenomeDataForTeam',
    'updateGenomeDisplay'
  ];
  const extractedCode = functionsToExtract.map(funcName => {
    const regex = new RegExp(`function ${funcName}\\([^{]*\\{(?:[^{}]*\\{[^{}]*\\})*[^{}]*\\}`, 'g');
    const match = mainSource.match(regex);
    return match ? match[0] : '';
  }).join('\n');
  // Add genome cache
  const genomeCacheCode = 'const genomeCache = { lastPoolSize: 0, lastCacheTime: 0, lastPoolChecksum: null, redBest: null, blueBest: null };';
  eval(genomeCacheCode + '\n' + extractedCode);
  return {
    EvolutionEngine: global.EvolutionEngine,
    getBestGenomeForTeam: global.getBestGenomeForTeam,
    updateGenomeDisplay: global.updateGenomeDisplay,
    genomeCache: global.genomeCache
  };
}
describe('Blue Team Genome Update Fix - Integration Tests', () => {
  let testEnv;
  let evolutionEngine;
  let gameEngine;
  beforeEach(() => {
    // Reset all mocks and global state
    jest.clearAllMocks();
    global.window = {
      DEBUG_GENOME: true,
      lastDebugLog: 0,
      lastSearchLog: 0,
      lastTeamLog: 0,
      lastSuccessLog: 0,
      lastGenomeUpdate: 0,
      lastPerfWarning: 0
    };
    testEnv = createIntegrationTestEnvironment();
    evolutionEngine = new testEnv.EvolutionEngine();
    // Mock game engine
    gameEngine = {
      gameState: 'ready',
      tanks: [],
      resumedFromPause: false,
      initializationComplete: false
    };
    // Set up global references
    global.evolution = evolutionEngine;
    global.game = gameEngine;
    // Reset genome cache
    global.genomeCache = {
      lastPoolSize: 0,
      lastCacheTime: 0,
      lastPoolChecksum: null,
      redBest: null,
      blueBest: null
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Bug Reproduction - Blue Team Not Updating', () => {
    test('should reproduce the original bug scenario', () => {
      // Simulate the original problematic candidate pool
      evolutionEngine.candidatePool = [
        // Red team candidates with battle experience
        {
          team: 'red',
          fitness: 0.685,
          battles: 1,
          wins: 1,
          strategy: 'Balanced',
          genome: [0.6, 0.7, 0.8, 0.5, 0.4, 0.6, 0.5, 0.7, 0.6]
        },
        // More Red candidates
        ...Array.from({ length: 9 }, () => ({
          team: 'red',
          fitness: 0.5 + Math.random() * 0.2,
          battles: 0,
          wins: 0,
          genome: Array.from({ length: 9 }, () => Math.random())
        })),
        // Blue team candidates (10 total as shown in logs)
        ...Array.from({ length: 10 }, () => ({
          team: 'blue',
          fitness: 0.5 + Math.random() * 0.2,
          battles: 0,
          wins: 0,
          genome: Array.from({ length: 9 }, () => Math.random())
        }))
      ];
      // Capture console logs to verify both teams are processed
      const consoleLogs = [];
      const originalConsoleLog = console.log;
      console.log = jest.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalConsoleLog(...args);
      });
      // Call updateGenomeDisplay which should process both teams
      testEnv.updateGenomeDisplay();
      // Verify both Red and Blue team selection was attempted
      const redLogs = consoleLogs.filter(log => log.includes('getBestGenomeForTeam(red)'));
      const blueLogs = consoleLogs.filter(log => log.includes('getBestGenomeForTeam(blue)'));
      expect(redLogs.length).toBeGreaterThan(0);
      expect(blueLogs.length).toBeGreaterThan(0);
      // Verify both teams get actual genome display updates
      expect(document.getElementById('redChampionFitness').textContent).not.toBe('0.000');
      expect(document.getElementById('blueChampionFitness').textContent).not.toBe('0.000');
      console.log = originalConsoleLog;
    });
    test('should ensure Blue team gets different genome values than Red team', () => {
      // Create distinct candidates for each team
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4, 0.5] // Distinctive Red pattern
        },
        {
          team: 'blue',
          fitness: 0.75,
          battles: 3,
          wins: 2,
          genome: [0.2, 0.9, 0.3, 0.8, 0.4, 0.7, 0.1, 0.6, 0.5] // Distinctive Blue pattern (opposite)
        }
      ];
      // Update genome display
      testEnv.updateGenomeDisplay();
      // Get the displayed values
      const redAggression = document.getElementById('redAggression').textContent;
      const blueAggression = document.getElementById('blueAggression').textContent;
      const redSpeed = document.getElementById('redSpeed').textContent;
      const blueSpeed = document.getElementById('blueSpeed').textContent;
      // Verify teams have different genome values
      expect(redAggression).not.toBe(blueAggression);
      expect(redSpeed).not.toBe(blueSpeed);
      // Verify expected values based on our distinctive patterns
      expect(redAggression).toBe('0.90'); // Red has high aggression
      expect(blueAggression).toBe('0.20'); // Blue has low aggression
      expect(redSpeed).toBe('0.10'); // Red has low speed
      expect(blueSpeed).toBe('0.90'); // Blue has high speed
    });
    test('should handle cache properly for both teams', () => {
      // Set up candidate pool
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 1,
          wins: 1,
          genome: [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6]
        },
        {
          team: 'blue',
          fitness: 0.75,
          battles: 1,
          wins: 1,
          genome: [0.4, 0.8, 0.6, 0.7, 0.9, 0.5, 0.6, 0.4, 0.8]
        }
      ];
      // First call should populate cache
      const redFirst = testEnv.getBestGenomeForTeam('red');
      const blueFirst = testEnv.getBestGenomeForTeam('blue');
      expect(redFirst).not.toBeNull();
      expect(blueFirst).not.toBeNull();
      // Cache should now contain both teams
      expect(global.genomeCache.redBest).not.toBeNull();
      expect(global.genomeCache.blueBest).not.toBeNull();
      // Second call should use cache (with valid cache timing)
      const redCached = testEnv.getBestGenomeForTeam('red');
      const blueCached = testEnv.getBestGenomeForTeam('blue');
      // Should return same objects from cache
      expect(redCached).toBe(redFirst);
      expect(blueCached).toBe(blueFirst);
    });
  });
  describe('Emergency Fallback Mechanism', () => {
    test('should create Blue champion from Red template when Blue has no candidates', () => {
      // Create scenario where only Red has a candidate
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6]
        }
      ];
      // Capture console warnings
      const consoleWarns = [];
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn((...args) => {
        consoleWarns.push(args.join(' '));
        originalConsoleWarn(...args);
      });
      // Update genome display
      testEnv.updateGenomeDisplay();
      // Should warn about emergency fallback
      expect(consoleWarns.some(warn => warn.includes('Emergency fallback'))).toBe(true);
      // Red team should display normally
      expect(document.getElementById('redChampionFitness').textContent).toBe('0.800');
      expect(document.getElementById('redAggression').textContent).toBe('0.80');
      // Blue team should get emergency fallback (modified Red genome)
      expect(document.getElementById('blueChampionFitness').textContent).toBe('Evolving...');
      expect(document.getElementById('blueAggression').textContent).not.toBe('—'); // Should have actual value
      expect(document.getElementById('blueAggression').textContent).not.toBe('0.80'); // Should be modified from Red
      console.warn = originalConsoleWarn;
    });
    test('should modify Red genome traits appropriately for Blue emergency fallback', () => {
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [1.0, 0.5, 0.8, 0.5, 0.7, 0.5, 0.3, 0.8, 0.6] // High aggression Red
        }
      ];
      // Capture console logs to verify emergency creation
      const consoleLogs = [];
      const originalConsoleLog = console.log;
      console.log = jest.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalConsoleLog(...args);
      });
      testEnv.updateGenomeDisplay();
      // Verify emergency Blue champion was created
      expect(consoleLogs.some(log => log.includes('Emergency Blue champion created'))).toBe(true);
      // Blue should have modified traits
      const blueAggression = parseFloat(document.getElementById('blueAggression').textContent);
      const blueSpeed = parseFloat(document.getElementById('blueSpeed').textContent);
      const blueDefense = parseFloat(document.getElementById('blueDefense').textContent);
      // Blue aggression should be 90% of Red's (1.0 * 0.9 = 0.9)
      expect(blueAggression).toBeCloseTo(0.9, 2);
      // Blue speed should be 110% of Red's (0.5 * 1.1 = 0.55)
      expect(blueSpeed).toBeCloseTo(0.55, 2);
      // Blue defense should be 110% of Red's (0.5 * 1.1 = 0.55)
      expect(blueDefense).toBeCloseTo(0.55, 2);
      console.log = originalConsoleLog;
    });
  });
  describe('Performance and Debug Logging', () => {
    test('should handle debug logging without performance issues', () => {
      // Create large candidate pool
      evolutionEngine.candidatePool = Array.from({ length: 100 }, (_, i) => ({
        team: i % 2 === 0 ? 'red' : 'blue',
        fitness: Math.random(),
        battles: Math.floor(Math.random() * 5),
        wins: Math.floor(Math.random() * 3),
        genome: Array.from({ length: 9 }, () => Math.random())
      }));
      // Measure performance
      const startTime = performance.now();
      // Multiple calls to test caching and performance
      for (let i = 0; i < 10; i++) {
        testEnv.updateGenomeDisplay();
      }
      const endTime = performance.now();
      const duration = endTime - startTime;
      // Should complete within reasonable time (less than 100ms for 10 calls)
      expect(duration).toBeLessThan(100);
    });
    test('should throttle debug logging appropriately', () => {
      // Set up scenario to trigger debug logging
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 1,
          wins: 1,
          genome: [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6]
        }
      ];
      // Capture console logs
      const consoleLogs = [];
      const originalConsoleLog = console.log;
      console.log = jest.fn((...args) => {
        consoleLogs.push(args.join(' '));
      });
      // Make multiple rapid calls
      for (let i = 0; i < 5; i++) {
        testEnv.getBestGenomeForTeam('red');
      }
      // Debug logs should be throttled (not appearing for every call)
      const debugLogs = consoleLogs.filter(log => log.includes('getBestGenomeForTeam'));
      expect(debugLogs.length).toBeLessThan(5); // Should be throttled
      console.log = originalConsoleLog;
    });
  });
  describe('Regression Prevention', () => {
    test('should always find champions for both teams in realistic scenario', () => {
      // Simulate realistic evolution scenario
      evolutionEngine.candidatePool = [
        // Early Red champions
        ...Array.from({ length: 5 }, (_, i) => ({
          team: 'red',
          fitness: 0.6 + i * 0.05,
          battles: i + 1,
          wins: Math.floor((i + 1) / 2),
          genome: Array.from({ length: 9 }, () => 0.4 + Math.random() * 0.4)
        })),
        // Early Blue champions
        ...Array.from({ length: 5 }, (_, i) => ({
          team: 'blue',
          fitness: 0.55 + i * 0.06,
          battles: i + 1,
          wins: Math.floor(i / 2),
          genome: Array.from({ length: 9 }, () => 0.3 + Math.random() * 0.5)
        }))
      ];
      // Both teams should always get champions
      const redChampion = testEnv.getBestGenomeForTeam('red');
      const blueChampion = testEnv.getBestGenomeForTeam('blue');
      expect(redChampion).not.toBeNull();
      expect(blueChampion).not.toBeNull();
      expect(redChampion.team).toBe('red');
      expect(blueChampion.team).toBe('blue');
      // Should get the highest fitness candidates for each team
      expect(redChampion.fitness).toBe(0.8); // 0.6 + 4 * 0.05
      expect(blueChampion.fitness).toBe(0.79); // 0.55 + 4 * 0.06
    });
    test('should maintain team separation even with identical fitness values', () => {
      // Create candidates with identical fitness but different teams
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.75,
          battles: 3,
          wins: 2,
          genome: [0.7, 0.5, 0.8, 0.4, 0.6, 0.5, 0.3, 0.7, 0.6]
        },
        {
          team: 'blue',
          fitness: 0.75, // Same fitness
          battles: 3,
          wins: 2,
          genome: [0.4, 0.8, 0.5, 0.7, 0.8, 0.6, 0.7, 0.4, 0.8]
        }
      ];
      const redChampion = testEnv.getBestGenomeForTeam('red');
      const blueChampion = testEnv.getBestGenomeForTeam('blue');
      expect(redChampion).not.toBeNull();
      expect(blueChampion).not.toBeNull();
      expect(redChampion.team).toBe('red');
      expect(blueChampion.team).toBe('blue');
      // Should be different candidates despite same fitness
      expect(redChampion.genome[0]).not.toBe(blueChampion.genome[0]); // Different aggression values
    });
  });
});
