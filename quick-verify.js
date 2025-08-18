// Quick verification script for enhanced scenarios
// Run this in the browser console to verify implementation

function quickVerifyEnhancedScenarios() {
    console.log('🔍 Quick Verification: Enhanced Battle Scenarios');
    console.log('='.repeat(50));
    
    let allGood = true;
    
    // Check 1: Configuration structure
    try {
        const config = window.CONFIG?.asiArch?.battleScenarios;
        if (!config || !config.enabled) {
            console.error('❌ Configuration not found or disabled');
            allGood = false;
        } else {
            console.log('✅ Configuration found and enabled');
            console.log(`   - Scenarios: ${Object.keys(config.scenarios).length}`);
            console.log(`   - Rotation interval: ${config.rotationInterval}`);
        }
    } catch (e) {
        console.error('❌ Configuration check failed:', e.message);
        allGood = false;
    }
    
    // Check 2: LLMEnhancedASIArch initialization
    try {
        const mockClient = {
            analyzeBattleResults: async () => ({ analysis: 'test' }),
            generateTacticalProposal: async () => ({ proposal: { modifications: [] }, rationale: 'test' })
        };
        const asiArch = new LLMEnhancedASIArch(window.CONFIG, mockClient);
        const scenario = asiArch.getCurrentScenario();
        
        if (scenario && scenario.id) {
            console.log(`✅ ASI-ARCH initialized with scenario: ${scenario.id}`);
        } else {
            console.error('❌ ASI-ARCH scenario initialization failed');
            allGood = false;
        }
    } catch (e) {
        console.error('❌ ASI-ARCH initialization failed:', e.message);
        allGood = false;
    }
    
    // Check 3: Seeded RNG
    try {
        const rng1 = createSeededRNG(12345);
        const rng2 = createSeededRNG(12345);
        const val1 = rng1.random();
        const val2 = rng2.random();
        
        if (Math.abs(val1 - val2) < 0.0001) {
            console.log('✅ Seeded RNG working correctly');
        } else {
            console.error('❌ Seeded RNG not deterministic');
            allGood = false;
        }
    } catch (e) {
        console.error('❌ Seeded RNG test failed:', e.message);
        allGood = false;
    }
    
    // Check 4: Obstacle generation functions
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const scenario = { obstacleCount: 5, obstacleSize: { min: 30, max: 60 } };
        
        const obstacles = createOpenFieldObstacles(canvas, scenario, 123);
        if (obstacles && obstacles.length === 5) {
            console.log('✅ Obstacle generation working');
        } else {
            console.error('❌ Obstacle generation failed');
            allGood = false;
        }
    } catch (e) {
        console.error('❌ Obstacle generation test failed:', e.message);
        allGood = false;
    }
    
    // Check 5: Battle initialization
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const redTeam = [{ id: 'r1', x: 100, y: 100 }];
        const blueTeam = [{ id: 'b1', x: 600, y: 400 }];
        
        const battle = initializeBattle(canvas, redTeam, blueTeam, 'urban_warfare', 456);
        if (battle && battle.obstacles && battle.obstacles.length > 0) {
            console.log('✅ Battle initialization working');
        } else {
            console.error('❌ Battle initialization failed');
            allGood = false;
        }
    } catch (e) {
        console.error('❌ Battle initialization test failed:', e.message);
        allGood = false;
    }
    
    console.log('='.repeat(50));
    if (allGood) {
        console.log('🎉 All components verified successfully!');
        console.log('✅ Enhanced scenarios system is ready for deployment');
    } else {
        console.log('⚠️  Some issues found - check implementation');
    }
    
    return allGood;
}

// Auto-run if called from console
if (typeof window !== 'undefined' && window.console) {
    // Make function globally available
    window.quickVerifyEnhancedScenarios = quickVerifyEnhancedScenarios;
}
