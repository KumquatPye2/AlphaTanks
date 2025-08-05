/**
 * Comprehensive Unit Tests for ASI-ARCH MilitaryTacticsKnowledge (Cognition) Module
 * Tests all core functionality of the Cognition module including:
 * - Tactical knowledge database management
 * - Formation strategy retrieval
 * - Knowledge search and matching
 * - Tactical principle application
 * - Random tactic selection
 * - Visualization event emissions
 */

const fs = require('fs');
const path = require('path');

// Load source files
const evolutionEngineSource = fs.readFileSync(path.join(__dirname, '../evolution-engine.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
  // Set up minimal DOM elements
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <span id="cognitionRedAdaptations">0</span>
    <span id="cognitionBlueAdaptations">0</span>
  `;

  // Mock window.emitASIArchEvent
  global.window = global.window || {};
  global.window.emitASIArchEvent = jest.fn();

  // Execute the source code in test environment
  eval(evolutionEngineSource);

  return {
    MilitaryTacticsKnowledge: global.MilitaryTacticsKnowledge
  };
}

describe('MilitaryTacticsKnowledge (Cognition) Module - Comprehensive Tests', () => {
  let testEnv;
  let cognition;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    cognition = new testEnv.MilitaryTacticsKnowledge();
    
    // Reset mocks
    if (global.window.emitASIArchEvent) {
      global.window.emitASIArchEvent.mockClear();
    }
  });

  describe('Initialization', () => {
    test('should initialize with formations database', () => {
      expect(cognition).toBeDefined();
      expect(cognition.formations).toBeDefined();
      expect(typeof cognition.formations).toBe('object');
      expect(Object.keys(cognition.formations).length).toBeGreaterThan(0);
    });

    test('should initialize with military principles', () => {
      expect(cognition.principles).toBeDefined();
      expect(typeof cognition.principles).toBe('object');
      expect(Object.keys(cognition.principles).length).toBeGreaterThan(0);
    });

    test('should have expected formation types', () => {
      const expectedFormations = ['phalanx', 'pincer', 'blitzkrieg', 'guerrilla'];
      expectedFormations.forEach(formation => {
        expect(cognition.formations).toHaveProperty(formation);
        expect(cognition.formations[formation]).toHaveProperty('scenario');
        expect(cognition.formations[formation]).toHaveProperty('strategy');
        expect(cognition.formations[formation]).toHaveProperty('traits');
      });
    });

    test('should have expected military principles', () => {
      const expectedPrinciples = [
        'concentration_of_force',
        'economy_of_force',
        'surprise',
        'mobility'
      ];
      expectedPrinciples.forEach(principle => {
        expect(cognition.principles).toHaveProperty(principle);
        expect(typeof cognition.principles[principle]).toBe('string');
      });
    });
  });

  describe('Formation Database Structure', () => {
    test('should have properly structured phalanx formation', () => {
      const phalanx = cognition.formations.phalanx;
      
      expect(phalanx.scenario).toContain('Defensive stand');
      expect(phalanx.strategy).toContain('Tight formation');
      expect(phalanx.traits).toHaveProperty('formation');
      expect(phalanx.traits).toHaveProperty('caution');
      expect(phalanx.traits).toHaveProperty('cooperation');
      
      // Phalanx should emphasize defensive traits
      expect(phalanx.traits.formation).toBeGreaterThan(0.5);
      expect(phalanx.traits.cooperation).toBeGreaterThan(0.5);
    });

    test('should have properly structured pincer formation', () => {
      const pincer = cognition.formations.pincer;
      
      expect(pincer.scenario).toContain('Flanking maneuver');
      expect(pincer.strategy).toContain('Split force');
      expect(pincer.traits).toHaveProperty('flanking');
      expect(pincer.traits).toHaveProperty('cooperation');
      expect(pincer.traits).toHaveProperty('aggression');
      
      // Pincer should emphasize coordination and flanking
      expect(pincer.traits.flanking).toBeGreaterThan(0.5);
      expect(pincer.traits.cooperation).toBeGreaterThan(0.5);
    });

    test('should have properly structured blitzkrieg formation', () => {
      const blitzkrieg = cognition.formations.blitzkrieg;
      
      expect(blitzkrieg.scenario).toContain('Quick decisive victory');
      expect(blitzkrieg.strategy).toContain('Fast, aggressive');
      expect(blitzkrieg.traits).toHaveProperty('speed');
      expect(blitzkrieg.traits).toHaveProperty('aggression');
      expect(blitzkrieg.traits).toHaveProperty('formation');
      
      // Blitzkrieg should emphasize speed and aggression, de-emphasize formation
      expect(blitzkrieg.traits.speed).toBeGreaterThan(0.7);
      expect(blitzkrieg.traits.aggression).toBeGreaterThan(0.7);
      expect(blitzkrieg.traits.formation).toBeLessThan(0.5);
    });

    test('should have properly structured guerrilla formation', () => {
      const guerrilla = cognition.formations.guerrilla;
      
      expect(guerrilla.scenario).toContain('Harass superior enemy');
      expect(guerrilla.strategy).toContain('Hit and run');
      expect(guerrilla.traits).toHaveProperty('ambush');
      expect(guerrilla.traits).toHaveProperty('speed');
      expect(guerrilla.traits).toHaveProperty('caution');
      
      // Guerrilla should emphasize stealth and mobility
      expect(guerrilla.traits.ambush).toBeGreaterThan(0.5);
      expect(guerrilla.traits.speed).toBeGreaterThan(0.5);
      expect(guerrilla.traits.caution).toBeGreaterThan(0.5);
    });

    test('should have valid trait values between 0 and 1', () => {
      Object.values(cognition.formations).forEach(formation => {
        Object.values(formation.traits).forEach(traitValue => {
          expect(typeof traitValue).toBe('number');
          expect(traitValue).toBeGreaterThanOrEqual(0);
          expect(traitValue).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('Knowledge Search', () => {
    test('should search formations by scenario keywords', () => {
      const results = cognition.searchKnowledge('Defensive');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'phalanx')).toBe(true);
    });

    test('should search formations by strategy keywords', () => {
      const results = cognition.searchKnowledge('Fast');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'blitzkrieg')).toBe(true);
    });

    test('should find flanking tactics', () => {
      const results = cognition.searchKnowledge('Flanking');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'pincer')).toBe(true);
    });

    test('should find hit and run tactics', () => {
      const results = cognition.searchKnowledge('Hit and run');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'guerrilla')).toBe(true);
    });

    test('should return empty array for non-matching queries', () => {
      const results = cognition.searchKnowledge('nonexistent_tactic');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should emit visualization events during search', () => {
      cognition.searchKnowledge('defensive');
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition', 
        'search_knowledge',
        expect.objectContaining({
          trait: 'query',
          query: 'defensive'
        })
      );
    });

    test('should emit knowledge found events when results exist', () => {
      cognition.searchKnowledge('Defensive');
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition', 
        'knowledge_found',
        expect.objectContaining({
          trait: 'tactical_match',
          formations: expect.stringContaining('phalanx')
        })
      );
    });

    test('should not emit knowledge found events when no results', () => {
      cognition.searchKnowledge('nonexistent');
      
      // Should only have search_knowledge event, not knowledge_found
      expect(global.window.emitASIArchEvent).toHaveBeenCalledTimes(1);
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition', 
        'search_knowledge',
        expect.any(Object)
      );
    });

    test('should handle case-sensitive searches correctly', () => {
      const upperResults = cognition.searchKnowledge('Defensive');
      const lowerResults = cognition.searchKnowledge('defensive');
      
      // Should find uppercase but not lowercase due to exact matching
      expect(upperResults.length).toBeGreaterThan(0);
      expect(lowerResults.length).toBe(0);
    });

    test('should return complete formation objects in search results', () => {
      const results = cognition.searchKnowledge('Defensive');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('scenario');
        expect(result).toHaveProperty('strategy');
        expect(result).toHaveProperty('traits');
        expect(typeof result.traits).toBe('object');
      });
    });
  });

  describe('Random Tactic Selection', () => {
    test('should return a valid random tactic', () => {
      const tactic = cognition.getRandomTactic();
      
      expect(tactic).toHaveProperty('name');
      expect(tactic).toHaveProperty('scenario');
      expect(tactic).toHaveProperty('strategy');
      expect(tactic).toHaveProperty('traits');
      
      // Name should be one of the known formations
      const formationNames = Object.keys(cognition.formations);
      expect(formationNames).toContain(tactic.name);
    });

    test('should return different tactics over multiple calls', () => {
      const tactics = [];
      
      // Get multiple random tactics
      for (let i = 0; i < 20; i++) {
        tactics.push(cognition.getRandomTactic().name);
      }
      
      // Should have some variety (not all the same)
      const uniqueTactics = new Set(tactics);
      expect(uniqueTactics.size).toBeGreaterThan(1);
    });

    test('should emit visualization events during tactic selection', () => {
      const tactic = cognition.getRandomTactic();
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition', 
        'apply_tactic',
        expect.objectContaining({
          trait: 'formation',
          tactic: tactic.name
        })
      );
    });

    test('should always return valid formation data', () => {
      // Test multiple random selections
      for (let i = 0; i < 10; i++) {
        const tactic = cognition.getRandomTactic();
        
        expect(typeof tactic.scenario).toBe('string');
        expect(typeof tactic.strategy).toBe('string');
        expect(typeof tactic.traits).toBe('object');
        expect(tactic.scenario.length).toBeGreaterThan(0);
        expect(tactic.strategy.length).toBeGreaterThan(0);
        expect(Object.keys(tactic.traits).length).toBeGreaterThan(0);
      }
    });

    test('should return tactics with valid trait values', () => {
      for (let i = 0; i < 10; i++) {
        const tactic = cognition.getRandomTactic();
        
        Object.values(tactic.traits).forEach(traitValue => {
          expect(typeof traitValue).toBe('number');
          expect(traitValue).toBeGreaterThanOrEqual(0);
          expect(traitValue).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('Military Principles', () => {
    test('should have concentration of force principle', () => {
      expect(cognition.principles.concentration_of_force).toBeDefined();
      expect(cognition.principles.concentration_of_force).toContain('Focus maximum power');
    });

    test('should have economy of force principle', () => {
      expect(cognition.principles.economy_of_force).toBeDefined();
      expect(cognition.principles.economy_of_force).toContain('minimum necessary force');
    });

    test('should have surprise principle', () => {
      expect(cognition.principles.surprise).toBeDefined();
      expect(cognition.principles.surprise).toContain('when and where enemy doesn\'t expect');
    });

    test('should have mobility principle', () => {
      expect(cognition.principles.mobility).toBeDefined();
      expect(cognition.principles.mobility).toContain('Speed and positioning');
    });

    test('should have meaningful principle descriptions', () => {
      Object.values(cognition.principles).forEach(principle => {
        expect(typeof principle).toBe('string');
        expect(principle.length).toBeGreaterThan(10); // Should be descriptive
      });
    });
  });

  describe('Tactical Knowledge Integration', () => {
    test('should provide defensive tactics for defensive scenarios', () => {
      const defensiveTactics = cognition.searchKnowledge('Defensive');
      
      expect(defensiveTactics.length).toBeGreaterThan(0);
      defensiveTactics.forEach(tactic => {
        expect(tactic.scenario).toContain('Defensive');
      });
    });

    test('should provide aggressive tactics for offensive scenarios', () => {
      const aggressiveTactics = cognition.searchKnowledge('aggressive');
      
      expect(aggressiveTactics.length).toBeGreaterThan(0);
      aggressiveTactics.forEach(tactic => {
        expect(tactic.strategy).toContain('aggressive');
      });
    });

    test('should provide coordinated tactics for team scenarios', () => {
      const coordinatedTactics = cognition.searchKnowledge('coordinated');
      
      expect(coordinatedTactics.length).toBeGreaterThan(0);
      coordinatedTactics.forEach(tactic => {
        expect(tactic.strategy).toContain('coordinated');
      });
    });

    test('should link traits to tactical scenarios appropriately', () => {
      // Defensive formations should have higher caution/formation traits
      const phalanx = cognition.formations.phalanx;
      expect(phalanx.traits.formation).toBeGreaterThan(0.5);
      expect(phalanx.traits.cooperation).toBeGreaterThan(0.5);
      
      // Aggressive formations should have higher speed/aggression traits
      const blitzkrieg = cognition.formations.blitzkrieg;
      expect(blitzkrieg.traits.speed).toBeGreaterThan(0.7);
      expect(blitzkrieg.traits.aggression).toBeGreaterThan(0.7);
      
      // Stealth formations should have higher ambush/caution traits
      const guerrilla = cognition.formations.guerrilla;
      expect(guerrilla.traits.ambush).toBeGreaterThan(0.5);
      expect(guerrilla.traits.caution).toBeGreaterThan(0.5);
    });
  });

  describe('Data Consistency and Validation', () => {
    test('should have consistent data structure across all formations', () => {
      Object.entries(cognition.formations).forEach(([name, formation]) => {
        expect(typeof name).toBe('string');
        expect(formation).toHaveProperty('scenario');
        expect(formation).toHaveProperty('strategy');
        expect(formation).toHaveProperty('traits');
        
        expect(typeof formation.scenario).toBe('string');
        expect(typeof formation.strategy).toBe('string');
        expect(typeof formation.traits).toBe('object');
        
        expect(formation.scenario.length).toBeGreaterThan(0);
        expect(formation.strategy.length).toBeGreaterThan(0);
        expect(Object.keys(formation.traits).length).toBeGreaterThan(0);
      });
    });

    test('should have unique formation names', () => {
      const formationNames = Object.keys(cognition.formations);
      const uniqueNames = new Set(formationNames);
      
      expect(uniqueNames.size).toBe(formationNames.length);
    });

    test('should have unique principle names', () => {
      const principleNames = Object.keys(cognition.principles);
      const uniqueNames = new Set(principleNames);
      
      expect(uniqueNames.size).toBe(principleNames.length);
    });

    test('should not have empty or null values', () => {
      Object.values(cognition.formations).forEach(formation => {
        expect(formation.scenario).toBeTruthy();
        expect(formation.strategy).toBeTruthy();
        expect(formation.traits).toBeTruthy();
        
        Object.values(formation.traits).forEach(trait => {
          expect(trait).not.toBeNull();
          expect(trait).not.toBeUndefined();
          expect(typeof trait).toBe('number');
        });
      });
      
      Object.values(cognition.principles).forEach(principle => {
        expect(principle).toBeTruthy();
        expect(typeof principle).toBe('string');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null search queries gracefully', () => {
      expect(() => {
        cognition.searchKnowledge(null);
      }).not.toThrow();
    });

    test('should handle undefined search queries gracefully', () => {
      expect(() => {
        cognition.searchKnowledge(undefined);
      }).not.toThrow();
    });

    test('should handle empty string search queries', () => {
      const results = cognition.searchKnowledge('');
      
      expect(Array.isArray(results)).toBe(true);
      // Empty string matches all formations since includes('') returns true
      expect(results.length).toBe(4);
    });

    test('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = cognition.searchKnowledge(longQuery);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should handle special characters in search queries', () => {
      const specialChars = '!@#$%^&*()[]{}|;:,.<>?';
      const results = cognition.searchKnowledge(specialChars);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should maintain data integrity after multiple operations', () => {
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        cognition.searchKnowledge('defensive');
        cognition.searchKnowledge('aggressive');
        cognition.getRandomTactic();
      }
      
      // Data should remain unchanged
      expect(Object.keys(cognition.formations)).toHaveLength(4);
      expect(Object.keys(cognition.principles)).toHaveLength(4);
      
      // Formations should still be valid
      expect(cognition.formations.phalanx).toBeDefined();
      expect(cognition.formations.blitzkrieg).toBeDefined();
      expect(cognition.formations.guerrilla).toBeDefined();
      expect(cognition.formations.pincer).toBeDefined();
    });
  });

  describe('Event System Integration', () => {
    test('should emit appropriate events without window object', () => {
      // Temporarily remove window.emitASIArchEvent
      const originalEmit = global.window.emitASIArchEvent;
      global.window.emitASIArchEvent = undefined;
      
      expect(() => {
        cognition.searchKnowledge('defensive');
        cognition.getRandomTactic();
      }).not.toThrow();
      
      // Restore
      global.window.emitASIArchEvent = originalEmit;
    });

    test('should handle missing window object gracefully', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      global.window = undefined;
      
      expect(() => {
        cognition.searchKnowledge('defensive');
        cognition.getRandomTactic();
      }).not.toThrow();
      
      // Restore
      global.window = originalWindow;
    });

    test('should provide correct event data format', () => {
      cognition.searchKnowledge('defensive');
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition',
        'search_knowledge',
        expect.objectContaining({
          trait: expect.any(String),
          query: expect.any(String)
        })
      );
      
      cognition.getRandomTactic();
      
      expect(global.window.emitASIArchEvent).toHaveBeenCalledWith(
        'cognition',
        'apply_tactic',
        expect.objectContaining({
          trait: expect.any(String),
          tactic: expect.any(String)
        })
      );
    });
  });
});
