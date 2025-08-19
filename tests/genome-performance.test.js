/**
 * Performance Tests for Genome Selection and Caching
 * Ensures the Blue team fix doesn't impact performance
 */

const fs = require('fs');
const path = require('path');

// Load source files
const mainSource = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');
const tankAiSource = fs.readFileSync(path.join(__dirname, '../tank-ai.js'), 'utf8');
const hillControlSource = fs.readFileSync(path.join(__dirname, '../hill-control.js'), 'utf8');

function createPerformanceTestEnvironment() {
  document.body.innerHTML = `<canvas id="gameCanvas"></canvas>`;

  global.window = {
    DEBUG_GENOME: false, // Disable debug logging for performance tests
    lastDebugLog: 0,
    lastSearchLog: 0,
    lastTeamLog: 0,
    lastSuccessLog: 0
  };

  // Evaluate required dependencies first
  eval(tankAiSource); // Provides Tank class
  eval(hillControlSource); // Provides Hill class
  eval(evolutionEngineSource);

  // Extract getBestGenomeForTeam function
  const functionMatch = mainSource.match(/function getBestGenomeForTeam\([^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/);
  const genomeCacheMatch = mainSource.match(/const genomeCache = \{[^}]*\};/);
  
  if (functionMatch && genomeCacheMatch) {
    eval(genomeCacheMatch[0] + '\n' + functionMatch[0]);
  }

  return {
    EvolutionEngine: global.EvolutionEngine,
    getBestGenomeForTeam: global.getBestGenomeForTeam,
    genomeCache: global.genomeCache
  };
}

describe('Genome Selection Performance Tests', () => {
  let testEnv;
  let evolutionEngine;

  beforeEach(() => {
    testEnv = createPerformanceTestEnvironment();
    evolutionEngine = new testEnv.EvolutionEngine();
    global.evolution = evolutionEngine;
    
    // Reset cache
    global.genomeCache = {
      lastPoolSize: 0,
      lastCacheTime: 0,
      lastPoolChecksum: null,
      redBest: null,
      blueBest: null
    };
  });

  describe('Cache Performance', () => {
    test('should handle large candidate pools efficiently', () => {
      // Create large candidate pool (1000 candidates)
      evolutionEngine.candidatePool = Array.from({ length: 1000 }, (_, i) => ({
        team: i % 2 === 0 ? 'red' : 'blue',
        fitness: Math.random(),
        battles: Math.floor(Math.random() * 10),
        wins: Math.floor(Math.random() * 5),
        genome: Array.from({ length: 9 }, () => Math.random())
      }));

      const startTime = performance.now();
      
      // First call should populate cache
      const redFirst = testEnv.getBestGenomeForTeam('red');
      const blueFirst = testEnv.getBestGenomeForTeam('blue');
      
      const firstCallTime = performance.now() - startTime;
      
      // Subsequent calls should use cache
      const cacheStartTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        testEnv.getBestGenomeForTeam('red');
        testEnv.getBestGenomeForTeam('blue');
      }
      
      const cacheTime = performance.now() - cacheStartTime;
      
      expect(redFirst).not.toBeNull();
      expect(blueFirst).not.toBeNull();
      expect(firstCallTime).toBeLessThan(100); // First call should be under 100ms
      expect(cacheTime).toBeLessThan(50); // 100 cached calls should be under 50ms
    });

    test('should invalidate cache correctly when pool changes', () => {
      // Initial small pool
      evolutionEngine.candidatePool = [
        {
          team: 'red',
          fitness: 0.5,
          battles: 1,
          wins: 1,
          genome: Array.from({ length: 9 }, () => 0.5)
        }
      ];

      // First selection
      const firstRed = testEnv.getBestGenomeForTeam('red');
      expect(firstRed.fitness).toBe(0.5);

      // Add better candidate
      evolutionEngine.candidatePool.push({
        team: 'red',
        fitness: 0.9,
        battles: 5,
        wins: 4,
        genome: Array.from({ length: 9 }, () => 0.8)
      });

      // Should detect pool change and return new best candidate
      const updatedRed = testEnv.getBestGenomeForTeam('red');
      expect(updatedRed.fitness).toBe(0.9);
    });

    test('should handle concurrent team selections efficiently', () => {
      // Create mixed pool
      evolutionEngine.candidatePool = Array.from({ length: 200 }, (_, i) => ({
        team: i % 2 === 0 ? 'red' : 'blue',
        fitness: Math.random(),
        battles: Math.floor(Math.random() * 5),
        wins: Math.floor(Math.random() * 3),
        genome: Array.from({ length: 9 }, () => Math.random())
      }));

      const startTime = performance.now();
      
      // Simulate rapid alternating team selections
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(testEnv.getBestGenomeForTeam('red'));
        results.push(testEnv.getBestGenomeForTeam('blue'));
      }
      
      const totalTime = performance.now() - startTime;
      
      // All selections should return valid candidates
      expect(results.every(result => result !== null)).toBe(true);
      
      // Should complete in reasonable time
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory during repeated selections', () => {
      // Monitor memory usage if available
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Create and destroy many candidate pools
      for (let cycle = 0; cycle < 10; cycle++) {
        evolutionEngine.candidatePool = Array.from({ length: 100 }, (_, i) => ({
          team: i % 2 === 0 ? 'red' : 'blue',
          fitness: Math.random(),
          battles: Math.floor(Math.random() * 5),
          wins: Math.floor(Math.random() * 3),
          genome: Array.from({ length: 9 }, () => Math.random())
        }));
        
        // Perform many selections
        for (let i = 0; i < 20; i++) {
          testEnv.getBestGenomeForTeam('red');
          testEnv.getBestGenomeForTeam('blue');
        }
        
        // Clear pool
        evolutionEngine.candidatePool = [];
        
        // Force cache clear
        global.genomeCache = {
          lastPoolSize: 0,
          lastCacheTime: 0,
          lastPoolChecksum: null,
          redBest: null,
          blueBest: null
        };
      }
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Memory usage shouldn't grow excessively (allow for some variance)
      if (performance.memory) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
      
      // Test should complete without throwing memory errors
      expect(true).toBe(true);
    });
  });

  describe('Edge Case Performance', () => {
    test('should handle empty and malformed candidate pools gracefully', () => {
      const testCases = [
        [], // Empty pool
        [null], // Null candidate
        [{ team: 'red' }], // Missing genome
        [{ team: 'red', genome: null }], // Null genome
        [{ team: 'red', genome: [] }], // Empty genome
        [{ team: 'red', genome: 'invalid' }], // Invalid genome type
      ];

      testCases.forEach((pool) => {
        evolutionEngine.candidatePool = pool;
        
        const startTime = performance.now();
        const result = testEnv.getBestGenomeForTeam('red');
        const duration = performance.now() - startTime;
        
        // Should handle gracefully and quickly
        expect(duration).toBeLessThan(10);
        expect(result).toBeNull(); // Should return null for invalid pools
      });
    });

    test('should maintain performance with highly fragmented fitness values', () => {
      // Create candidates with very close fitness values (stresses sorting)
      const baseFitness = 0.5;
      evolutionEngine.candidatePool = Array.from({ length: 500 }, (_, i) => ({
        team: i % 2 === 0 ? 'red' : 'blue',
        fitness: baseFitness + (Math.random() - 0.5) * 0.001, // Very small variations
        battles: 1,
        wins: 1,
        genome: Array.from({ length: 9 }, () => Math.random())
      }));

      const startTime = performance.now();
      
      const redResult = testEnv.getBestGenomeForTeam('red');
      const blueResult = testEnv.getBestGenomeForTeam('blue');
      
      const duration = performance.now() - startTime;
      
      expect(redResult).not.toBeNull();
      expect(blueResult).not.toBeNull();
      expect(duration).toBeLessThan(50); // Should sort and select quickly
    });
  });
});
