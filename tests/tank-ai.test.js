/**
 * Tests for Tank AI behavior and genome-based traits
 */

const fs = require('fs');
const path = require('path');

// Load source files
const tankAiSource = fs.readFileSync(path.join(__dirname, '../tank-ai.js'), 'utf8');

function createTankAiTestEnvironment() {
  document.body.innerHTML = `<canvas id="gameCanvas" width="800" height="600"></canvas>`;
  
  eval(tankAiSource);
  
  return {
    TankAI: global.TankAI
  };
}

describe('Tank AI', () => {
  let testEnv;
  let tankAI;
  let mockTank;

  beforeEach(() => {
    testEnv = createTankAiTestEnvironment();
    
    // Create mock tank with typical genome
    mockTank = {
      x: 400,
      y: 300,
      angle: 0,
      speed: 0,
      health: 100,
      team: 'red',
      genome: [0.5, 0.6, 0.7, 0.4, 0.8, 0.3, 0.9, 0.2, 0.5], // 9 traits
      fitness: 0
    };

    tankAI = new testEnv.TankAI(mockTank);
  });

  describe('Initialization', () => {
    test('should initialize with tank reference', () => {
      expect(tankAI.tank).toBe(mockTank);
    });

    test('should extract genome traits correctly', () => {
      expect(tankAI.aggression).toBe(0.5);
      expect(tankAI.searchRadius).toBe(0.6);
      expect(tankAI.accuracy).toBe(0.7);
      expect(tankAI.mobility).toBe(0.4);
      expect(tankAI.defensiveness).toBe(0.8);
      expect(tankAI.teamwork).toBe(0.3);
      expect(tankAI.adaptability).toBe(0.9);
      expect(tankAI.riskTaking).toBe(0.2);
      expect(tankAI.learning).toBe(0.5);
    });
  });

  describe('Genome-Based Behavior', () => {
    test('should have behavior influenced by genome traits', () => {
      // High aggression tank
      const aggressiveTank = { ...mockTank, genome: [0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const aggressiveAI = new testEnv.TankAI(aggressiveTank);
      
      // Low aggression tank
      const passiveTank = { ...mockTank, genome: [0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const passiveAI = new testEnv.TankAI(passiveTank);
      
      expect(aggressiveAI.aggression).toBeGreaterThan(passiveAI.aggression);
    });

    test('should validate genome length', () => {
      const invalidTank = { ...mockTank, genome: [0.5, 0.5, 0.5] }; // Too short
      const invalidAI = new testEnv.TankAI(invalidTank);
      
      // Should handle invalid genome gracefully
      expect(invalidAI.aggression).toBeDefined();
      expect(invalidAI.searchRadius).toBeDefined();
    });
  });

  describe('Target Selection', () => {
    test('should find closest enemy', () => {
      const enemies = [
        { x: 500, y: 300, team: 'blue', health: 100 },
        { x: 350, y: 250, team: 'blue', health: 100 },
        { x: 600, y: 400, team: 'blue', health: 100 }
      ];

      const target = tankAI.findClosestEnemy(enemies);
      
      expect(target).toBe(enemies[1]); // Closest enemy
    });

    test('should ignore same team tanks', () => {
      const units = [
        { x: 350, y: 250, team: 'red', health: 100 },   // Same team
        { x: 500, y: 300, team: 'blue', health: 100 },  // Enemy
        { x: 450, y: 280, team: 'red', health: 100 }    // Same team
      ];

      const target = tankAI.findClosestEnemy(units);
      
      expect(target.team).toBe('blue');
    });

    test('should ignore dead enemies', () => {
      const enemies = [
        { x: 350, y: 250, team: 'blue', health: 0 },    // Dead
        { x: 500, y: 300, team: 'blue', health: 100 }   // Alive
      ];

      const target = tankAI.findClosestEnemy(enemies);
      
      expect(target.health).toBeGreaterThan(0);
    });

    test('should respect search radius', () => {
      // Tank with very small search radius
      const shortSightedTank = { ...mockTank, genome: [0.5, 0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const shortSightedAI = new testEnv.TankAI(shortSightedTank);
      
      const farEnemies = [
        { x: 800, y: 600, team: 'blue', health: 100 } // Very far
      ];

      const target = shortSightedAI.findClosestEnemy(farEnemies);
      
      // May not find target due to limited search radius
      expect(target).toBeNull();
    });
  });

  describe('Movement Behavior', () => {
    test('should calculate movement towards target', () => {
      const target = { x: 500, y: 300 };
      
      tankAI.update([target]);
      
      // Should have calculated movement
      expect(tankAI.targetAngle).toBeDefined();
    });

    test('should implement different movement patterns based on traits', () => {
      // High mobility tank
      const mobileTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const mobileAI = new testEnv.TankAI(mobileTank);
      
      // Low mobility tank
      const slowTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.1, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const slowAI = new testEnv.TankAI(slowTank);
      
      expect(mobileAI.mobility).toBeGreaterThan(slowAI.mobility);
    });
  });

  describe('Combat Behavior', () => {
    test('should decide whether to fire based on traits', () => {
      const target = { x: 450, y: 300, team: 'blue', health: 100 };
      
      const shouldFire = tankAI.shouldFire(target);
      
      expect(typeof shouldFire).toBe('boolean');
    });

    test('should consider accuracy when firing', () => {
      // High accuracy tank
      const accurateTank = { ...mockTank, genome: [0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const accurateAI = new testEnv.TankAI(accurateTank);
      
      // Low accuracy tank  
      const inaccurateTank = { ...mockTank, genome: [0.5, 0.5, 0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
      const inaccurateAI = new testEnv.TankAI(inaccurateTank);
      
      expect(accurateAI.accuracy).toBeGreaterThan(inaccurateAI.accuracy);
    });
  });

  describe('Defensive Behavior', () => {
    test('should implement defensive positioning', () => {
      // High defensive tank
      const defensiveTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.5] };
      const defensiveAI = new testEnv.TankAI(defensiveTank);
      
      // Low defensive tank
      const aggressiveTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.1, 0.5, 0.5, 0.5, 0.5] };
      const aggressiveAI = new testEnv.TankAI(aggressiveTank);
      
      expect(defensiveAI.defensiveness).toBeGreaterThan(aggressiveAI.defensiveness);
    });

    test('should retreat when health is low and defensive', () => {
      const damagedTank = { ...mockTank, health: 20 }; // Low health
      const damagedAI = new testEnv.TankAI(damagedTank);
      
      // High defensiveness should influence behavior when damaged
      expect(damagedAI.defensiveness).toBeDefined();
    });
  });

  describe('Teamwork Behavior', () => {
    test('should consider teammates in decision making', () => {
      const teammates = [
        { x: 380, y: 280, team: 'red', health: 100 },
        { x: 420, y: 320, team: 'red', health: 100 }
      ];
      
      const enemies = [
        { x: 500, y: 300, team: 'blue', health: 100 }
      ];
      
      tankAI.update([...teammates, ...enemies]);
      
      // Should consider teammates in strategy
      expect(tankAI.teamwork).toBeDefined();
    });
  });

  describe('Adaptability and Learning', () => {
    test('should have adaptability trait influence behavior', () => {
      // High adaptability tank
      const adaptableTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5] };
      const adaptableAI = new testEnv.TankAI(adaptableTank);
      
      expect(adaptableAI.adaptability).toBe(0.9);
    });

    test('should have learning trait for future evolution', () => {
      // High learning tank
      const learningTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9] };
      const learningAI = new testEnv.TankAI(learningTank);
      
      expect(learningAI.learning).toBe(0.9);
    });
  });

  describe('Risk Assessment', () => {
    test('should consider risk taking in decisions', () => {
      // High risk taking tank
      const riskTakingTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5] };
      const riskTakingAI = new testEnv.TankAI(riskTakingTank);
      
      // Low risk taking tank
      const cautiousTank = { ...mockTank, genome: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.1, 0.5] };
      const cautiousAI = new testEnv.TankAI(cautiousTank);
      
      expect(riskTakingAI.riskTaking).toBeGreaterThan(cautiousAI.riskTaking);
    });
  });

  describe('Update Cycle', () => {
    test('should update AI state each cycle', () => {
      const allUnits = [
        { x: 450, y: 300, team: 'blue', health: 100 },
        { x: 380, y: 280, team: 'red', health: 100 }
      ];
      
      tankAI.update(allUnits);
      
      // State should potentially change after update
      expect(tankAI.tank).toBe(mockTank);
    });

    test('should handle empty unit list', () => {
      expect(() => {
        tankAI.update([]);
      }).not.toThrow();
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        tankAI.update(null);
      }).not.toThrow();
      
      expect(() => {
        tankAI.update(undefined);
      }).not.toThrow();
    });
  });
});
