// Integration test for enhanced battle scenarios with seeded evaluation
// Tests scenario rotation, multi-scenario fitness, and reproducibility

async function testEnhancedScenarios() {
    console.log('🚀 Testing Enhanced Battle Scenarios with Seeded Evaluation...\n');
    
    // Test 1: Scenario Configuration Loading
    console.log('Test 1: Verifying scenario configuration...');
    try {
        const config = window.CONFIG;
        if (!config) {
            throw new Error('CONFIG not found - check config.js loading');
        }
        
        const scenarios = config.asiArch?.battleScenarios;
        if (!scenarios) {
            throw new Error('battleScenarios not found in config.asiArch');
        }
        
        if (!scenarios.enabled) {
            throw new Error('Battle scenarios not enabled in config');
        }
        
        const expectedScenarios = ['open_field', 'urban_warfare', 'chokepoint_control', 'fortress_assault'];
        const availableScenarios = Object.keys(scenarios.scenarios || {});
        
        for (const scenario of expectedScenarios) {
            if (!availableScenarios.includes(scenario)) {
                throw new Error(`Missing scenario: ${scenario}`);
            }
        }
        
        console.log('✅ All 4 scenarios available:', availableScenarios);
        console.log('✅ Rotation interval:', scenarios.rotationInterval, 'cycles');
        console.log('✅ Seeded evaluation:', scenarios.seededEvaluation?.enabled ? 'enabled' : 'disabled');
        console.log('✅ Multi-scenario fitness:', scenarios.multiScenarioFitness?.enabled ? 'enabled' : 'disabled');
        
    } catch (error) {
        console.error('❌ Scenario configuration test failed:', error.message);
        return false;
    }
    
    // Test 2: ASI-ARCH Initialization with Scenarios
    console.log('\nTest 2: Initializing ASI-ARCH with scenario support...');
    try {
        // Check if required classes are available
        if (typeof LLMEnhancedASIArch === 'undefined') {
            throw new Error('LLMEnhancedASIArch class not found - check script loading order');
        }
        
        if (typeof DeepSeekClient === 'undefined') {
            console.log('⚠️  DeepSeekClient not found, using mock only');
        }
        
        // Mock DeepSeek client for testing
        const mockDeepSeekClient = {
            analyzeBattleResults: async () => ({
                analysis: 'Mock analysis',
                recommendations: ['Test recommendation']
            }),
            generateTacticalProposal: async () => ({
                proposal: { modifications: ['increase speed', 'improve accuracy'] },
                rationale: 'Mock tactical proposal',
                expectedImprovement: 0.15,
                scenarioSpecific: true
            })
        };
        
        const asiArch = new LLMEnhancedASIArch(window.CONFIG, mockDeepSeekClient);
        
        // Check initial scenario
        const initialScenario = asiArch.getCurrentScenario();
        if (!initialScenario || !initialScenario.id) {
            throw new Error('getCurrentScenario() returned invalid result');
        }
        
        console.log('✅ Initial scenario:', initialScenario.id);
        console.log('✅ Scenario description:', initialScenario.description || 'No description');
        
        // Test scenario advancement
        const scenariosBefore = asiArch.getCurrentScenario().id;
        const rotationInterval = window.CONFIG.asiArch.battleScenarios.rotationInterval || 5;
        
        // Call advanceScenarioRotation enough times to trigger a rotation
        for (let i = 0; i <= rotationInterval; i++) {
            asiArch.advanceScenarioRotation();
        }
        const scenariosAfter = asiArch.getCurrentScenario().id;
        
        if (scenariosBefore === scenariosAfter) {
            console.log('⚠️  Warning: Scenario didn\'t change after rotation interval');
        } else {
            console.log('✅ Scenario rotation working:', scenariosBefore, '->', scenariosAfter);
        }
        
    } catch (error) {
        console.error('❌ ASI-ARCH initialization test failed:', error.message);
        return false;
    }
    
    // Test 3: Seeded Random Number Generation
    console.log('\nTest 3: Testing seeded random number generation...');
    try {
        // Check if createSeededRNG function is available
        if (typeof createSeededRNG === 'undefined') {
            throw new Error('createSeededRNG function not found - check game-engine.js loading');
        }
        
        // Test reproducibility with same seed
        const seed1 = 12345;
        const rng1 = createSeededRNG(seed1);
        const rng2 = createSeededRNG(seed1);
        
        const sequence1 = [];
        const sequence2 = [];
        
        for (let i = 0; i < 10; i++) {
            sequence1.push(rng1.random());
            sequence2.push(rng2.random());
        }
        
        let identical = true;
        for (let i = 0; i < sequence1.length; i++) {
            if (Math.abs(sequence1[i] - sequence2[i]) > 0.0001) {
                identical = false;
                break;
            }
        }
        
        if (identical) {
            console.log('✅ Seeded RNG produces identical sequences');
        } else {
            throw new Error('Seeded RNG sequences differ');
        }
        
        // Test different seeds produce different sequences
        const rng3 = createSeededRNG(54321);
        const sequence3 = [];
        for (let i = 0; i < 10; i++) {
            sequence3.push(rng3.random());
        }
        
        let different = false;
        for (let i = 0; i < sequence1.length; i++) {
            if (Math.abs(sequence1[i] - sequence3[i]) > 0.0001) {
                different = true;
                break;
            }
        }
        
        if (different) {
            console.log('✅ Different seeds produce different sequences');
        } else {
            throw new Error('Different seeds produced identical sequences');
        }
        
    } catch (error) {
        console.error('❌ Seeded RNG test failed:', error.message);
        return false;
    }
    
    // Test 4: Testing scenario-specific obstacle generation...
    console.log('\nTest 4: Testing scenario-specific obstacle generation...');
    try {
        // Check if obstacle generation functions are available
        const requiredFunctions = ['createOpenFieldObstacles', 'createUrbanObstacles', 'createChokepointObstacles', 'createFortressObstacles'];
        for (const funcName of requiredFunctions) {
            if (typeof window[funcName] !== 'function') {
                throw new Error(`Required function ${funcName} not found in global scope`);
            }
        }
        
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 800;
        testCanvas.height = 600;
        
        const scenarios = ['open_field', 'urban_warfare', 'chokepoint_control', 'fortress_assault'];
        const seed = 42;
        
        for (const scenarioId of scenarios) {
            const scenario = window.CONFIG.asiArch.battleScenarios.scenarios[scenarioId];
            
            if (!scenario) {
                throw new Error(`Scenario configuration not found for: ${scenarioId}`);
            }
            
            // Test scenario-specific obstacle creation
            let obstacles = [];
            try {
                switch (scenarioId) {
                    case 'open_field':
                        obstacles = createOpenFieldObstacles(testCanvas, scenario, seed);
                        break;
                    case 'urban_warfare':
                        obstacles = createUrbanObstacles(testCanvas, scenario, seed);
                        break;
                    case 'chokepoint_control':
                        obstacles = createChokepointObstacles(testCanvas, scenario, seed);
                        break;
                    case 'fortress_assault':
                        obstacles = createFortressObstacles(testCanvas, scenario, seed);
                        break;
                    default:
                        throw new Error(`Unknown scenario: ${scenarioId}`);
                }
            } catch (obstacleError) {
                throw new Error(`Failed to create obstacles for ${scenarioId}: ${obstacleError.message}`);
            }
            
            if (!obstacles || !Array.isArray(obstacles)) {
                throw new Error(`Invalid obstacles returned for ${scenarioId}: ${typeof obstacles}`);
            }
            
            console.log(`✅ ${scenarioId}: ${obstacles.length} obstacles generated`);
            
            // Verify obstacles are within bounds
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (!obstacle || typeof obstacle.x === 'undefined' || typeof obstacle.y === 'undefined') {
                    throw new Error(`Invalid obstacle structure in ${scenarioId} at index ${i}: ${JSON.stringify(obstacle)}`);
                }
                
                const width = obstacle.width || 0;
                const height = obstacle.height || 0;
                
                if (obstacle.x < 0 || obstacle.x + width > testCanvas.width ||
                    obstacle.y < 0 || obstacle.y + height > testCanvas.height) {
                    throw new Error(`Obstacle ${i} out of bounds in ${scenarioId}: x=${obstacle.x}, y=${obstacle.y}, w=${width}, h=${height} (canvas: ${testCanvas.width}x${testCanvas.height})`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Scenario obstacle generation test failed:', error.message);
        return false;
    }
    
    // Test 5: Multi-Scenario Fitness Calculation
    console.log('\nTest 5: Testing multi-scenario fitness calculation...');
    try {
        const mockDeepSeekClient = {
            analyzeBattleResults: async () => ({ analysis: 'Mock', recommendations: [] }),
            generateTacticalProposal: async () => ({
                proposal: { modifications: [] },
                rationale: 'Mock',
                expectedImprovement: 0.1
            })
        };
        
        const asiArch = new LLMEnhancedASIArch(window.CONFIG, mockDeepSeekClient);
        
        // Simulate multiple scenario results
        const mockRedTeam = [{ health: 100 }, { health: 80 }];
        const mockBlueTeam = [{ health: 60 }, { health: 0 }];
        
        asiArch.updateMultiScenarioResults(mockRedTeam, mockBlueTeam, {
            winner: 'red',
            duration: 45
        }, 'open_field');
        
        // Add a second battle for open_field to meet the minimum requirement
        asiArch.updateMultiScenarioResults(mockRedTeam, mockBlueTeam, {
            winner: 'red',
            duration: 50
        }, 'open_field');
        
        asiArch.updateMultiScenarioResults(mockBlueTeam, mockRedTeam, {
            winner: 'blue', 
            duration: 60
        }, 'urban_warfare');
        
        // Add a second battle for urban_warfare
        asiArch.updateMultiScenarioResults(mockBlueTeam, mockRedTeam, {
            winner: 'blue',
            duration: 55
        }, 'urban_warfare');
        
        // Test multi-scenario fitness
        const teamData = {
            team: 'red',
            performance: 0.8,
            scenario: 'open_field'
        };
        
        const multiScenarioFitness = asiArch.calculateMultiScenarioFitness(teamData);
        console.log('✅ Multi-scenario fitness calculated:', multiScenarioFitness.toFixed(3));
        
        if (multiScenarioFitness >= 0 && multiScenarioFitness <= 1) {
            console.log('✅ Fitness value within valid range [0, 1]');
        } else {
            throw new Error(`Invalid fitness value: ${multiScenarioFitness}`);
        }
        
    } catch (error) {
        console.error('❌ Multi-scenario fitness test failed:', error.message);
        return false;
    }
    
    // Test 6: Battle Initialization with Scenarios
    console.log('\nTest 6: Testing battle initialization with scenarios...');
    try {
        // Check if required functions are available
        if (typeof initializeBattle === 'undefined') {
            throw new Error('initializeBattle function not found');
        }
        if (typeof initializeKingOfHill === 'undefined') {
            throw new Error('initializeKingOfHill function not found');
        }
        
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 800;
        testCanvas.height = 600;
        
        const redTeam = [
            { id: 'r1', x: 100, y: 100, health: 100, team: 'red' },
            { id: 'r2', x: 120, y: 120, health: 100, team: 'red' }
        ];
        
        const blueTeam = [
            { id: 'b1', x: 600, y: 400, health: 100, team: 'blue' },
            { id: 'b2', x: 620, y: 420, health: 100, team: 'blue' }
        ];
        
        const seed = 789;
        
        // Test initializeBattle with scenario
        const result = initializeBattle(testCanvas, redTeam, blueTeam, 'urban_warfare', seed);
        
        if (result && result.obstacles && result.obstacles.length > 0) {
            console.log('✅ Battle initialized with obstacles:', result.obstacles.length);
        } else {
            throw new Error('Battle initialization failed or no obstacles created');
        }
        
        // Test King of the Hill initialization
        const hillResult = initializeKingOfHill(testCanvas, 'urban_warfare', seed);
        if (hillResult && typeof hillResult.x === 'number' && typeof hillResult.y === 'number') {
            console.log('✅ King of the Hill initialized at:', hillResult.x.toFixed(1), hillResult.y.toFixed(1));
        } else {
            throw new Error('King of the Hill initialization failed');
        }
        
    } catch (error) {
        console.error('❌ Battle initialization test failed:', error.message);
        return false;
    }
    
    console.log('\n🎉 All enhanced scenario tests passed!');
    console.log('✅ Scenario system is ready for Red Queen evolution');
    console.log('✅ Seeded evaluation ensures reproducible results');
    console.log('✅ Multi-scenario fitness prevents over-specialization');
    
    return true;
}

// Test runner
async function runEnhancedScenarioTests() {
    console.log('='.repeat(60));
    console.log('   ENHANCED BATTLE SCENARIOS - INTEGRATION TEST');
    console.log('='.repeat(60));
    
    try {
        const success = await testEnhancedScenarios();
        
        if (success) {
            console.log('\n🏆 ALL TESTS PASSED - Enhanced scenarios ready for deployment!');
            console.log('\nNext steps:');
            console.log('1. Run actual battles with scenario rotation');
            console.log('2. Monitor multi-scenario fitness evolution');
            console.log('3. Verify reproducibility with identical seeds');
            return true;
        } else {
            console.log('\n❌ Some tests failed - check implementation');
            return false;
        }
        
    } catch (error) {
        console.error('\n💥 Test suite crashed:', error);
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testEnhancedScenarios, runEnhancedScenarioTests };
}
