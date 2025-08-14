/**
 * Integration Test for Refactored Components
 * This file demonstrates how to use the refactored components together
 * and provides a simple test to verify everything works correctly
 */

/**
 * Test function to verify refactored components work together
 */
function testRefactoredComponents() {
    console.log('🧪 Testing refactored components...');
    
    try {
        // Test utility functions
        console.log('✅ Testing utilities...');
        const distance = MathUtils.distance(0, 0, 3, 4);
        console.assert(distance === 5, 'Distance calculation failed');
        
        const genome = GenomeUtils.generateRandom(9);
        console.assert(genome.length === 9, 'Genome generation failed');
        
        const normalized = GenomeUtils.normalize({ aggression: 0.8, speed: 0.6 });
        console.assert(normalized.length === 9, 'Genome normalization failed');
        
        // Test tank entity
        console.log('✅ Testing tank entity...');
        const tankEntity = new TankEntity(100, 100, 'red', genome);
        console.assert(tankEntity.isAlive === true, 'Tank entity creation failed');
        console.assert(tankEntity.health === 100, 'Tank health incorrect');
        
        // Test tank AI
        console.log('✅ Testing tank AI...');
        const tankAI = new TankAI(tankEntity);
        console.assert(tankAI.tank === tankEntity, 'Tank AI initialization failed');
        
        // Test tank combat
        console.log('✅ Testing tank combat...');
        const tankCombat = new TankCombat(tankEntity);
        console.assert(tankCombat.tank === tankEntity, 'Tank combat initialization failed');
        
        // Test composed tank
        console.log('✅ Testing composed tank...');
        const tank = new Tank(200, 200, 'blue', genome);
        console.assert(tank.isAlive === true, 'Composed tank creation failed');
        console.assert(tank.team === 'blue', 'Tank team assignment failed');
        
        // Test managers
        console.log('✅ Testing managers...');
        const battlefield = new BattlefieldManager(800, 600);
        console.assert(battlefield.obstacles.length > 0, 'Battlefield creation failed');
        
        const combat = new CombatManager();
        console.assert(combat.getProjectileCount() === 0, 'Combat manager creation failed');
        
        const stats = new BattleStatsManager();
        console.assert(stats.battleTime === 0, 'Stats manager creation failed');
        
        // Test Hill control
        console.log('✅ Testing hill control...');
        const hill = new Hill(400, 300, 60);
        console.assert(hill.controllingTeam === null, 'Hill creation failed');
        console.assert(hill.occupationTime === GAME_CONFIG.BATTLE.KING_OF_HILL.WIN_TIME, 'Hill config failed');
        
        console.log('🎉 All refactored components passed basic tests!');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

/**
 * Demo function showing how to use the refactored components
 */
function demonstrateRefactoredUsage() {
    console.log('🎮 Demonstrating refactored component usage...');
    
    // Create a simple game setup
    const battlefield = new BattlefieldManager(800, 600);
    const combat = new CombatManager();
    const stats = new BattleStatsManager();
    
    // Create some tanks
    const redTank = new Tank(100, 300, 'red', GenomeUtils.generateRandom(9));
    const blueTank = new Tank(700, 300, 'blue', GenomeUtils.generateRandom(9));
    
    console.log('Created tanks:', { red: redTank.team, blue: blueTank.team });
    
    // Simulate a frame update
    const deltaTime = 1/60; // 60 FPS
    const gameState = {
        tanks: [redTank, blueTank],
        ...battlefield.getState(),
        battleTime: 0,
        gameMode: 'king_of_hill',
        addProjectile: (projectile) => combat.addProjectile(projectile)
    };
    
    // Update tanks
    redTank.update(deltaTime, gameState);
    blueTank.update(deltaTime, gameState);
    
    // Update battlefield
    battlefield.update(deltaTime, [redTank, blueTank]);
    
    // Update combat
    combat.update(deltaTime, battlefield);
    
    // Update stats
    stats.update(deltaTime, [redTank, blueTank]);
    
    console.log('✅ Successfully updated all components for one frame');
    console.log('Tank states:', {
        red: { health: redTank.health, state: redTank.state },
        blue: { health: blueTank.health, state: blueTank.state }
    });
}

// Export test functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testRefactoredComponents,
        demonstrateRefactoredUsage
    };
} else {
    window.testRefactoredComponents = testRefactoredComponents;
    window.demonstrateRefactoredUsage = demonstrateRefactoredUsage;
}

// Auto-run tests if this file is loaded in browser
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Refactored components loaded. Run testRefactoredComponents() to test.');
    });
}
