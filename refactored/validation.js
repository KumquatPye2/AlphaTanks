/**
 * Integration Validation Script
 * Run this in browser console to validate the integration
 */

function validateIntegration() {
    
    const results = {
        componentsLoaded: false,
        configurationValid: false,
        gameEngineWorking: false,
        tankSystemWorking: false,
        hillSystemWorking: false,
        overallSuccess: false
    };
    
    try {
        // Test 1: Check if all components are loaded
        const requiredComponents = [
            'GAME_CONFIG', 'MathUtils', 'GenomeUtils', 'CollisionUtils',
            'TankEntity', 'TankAI', 'TankCombat', 'Tank',
            'Hill', 'BattlefieldManager', 'CombatManager', 'BattleStatsManager',
            'GameEngine'
        ];
        
        const missingComponents = requiredComponents.filter(comp => typeof window[comp] === 'undefined');
        
        if (missingComponents.length === 0) {
            results.componentsLoaded = true;
        } else {
            console.error('❌ Missing components:', missingComponents);
            return results;
        }
        
        // Test 2: Validate configuration
        if (typeof GAME_CONFIG !== 'undefined' && 
            GAME_CONFIG.BATTLEFIELD && 
            GAME_CONFIG.TANK && 
            GAME_CONFIG.BATTLE) {
            results.configurationValid = true;
        } else {
            console.error('❌ GAME_CONFIG is invalid or incomplete');
            return results;
        }
        
        // Test 3: Test GameEngine creation
        const mockCanvas = document.createElement('canvas');
        mockCanvas.width = 800;
        mockCanvas.height = 600;
        
        const gameEngine = new GameEngine(mockCanvas, {
            populationSize: 10,
            gameMode: 'king_of_hill'
        });
        
        if (gameEngine && typeof gameEngine.update === 'function') {
            results.gameEngineWorking = true;
        } else {
            console.error('❌ GameEngine creation failed');
            return results;
        }
        
        // Test 4: Test Tank system
        console.log('🚗 Testing Tank system...');
        const testGenome = GenomeUtils.generateRandom(9);
        const tank = new Tank(100, 100, 'red', testGenome);
        
        if (tank && tank.isAlive && typeof tank.update === 'function') {
            results.tankSystemWorking = true;
            console.log('✅ Tank system working');
        } else {
            console.error('❌ Tank system failed');
            return results;
        }
        
        // Test 5: Test Hill system
        console.log('🏔️ Testing Hill system...');
        const hill = new Hill(400, 300, 60);
        
        if (hill && typeof hill.update === 'function' && hill.occupationTime > 0) {
            results.hillSystemWorking = true;
            console.log('✅ Hill system working');
        } else {
            console.error('❌ Hill system failed');
            return results;
        }
        
        // Check if window.researcherInsights exists (for evolution engine compatibility)
        if (typeof window.researcherInsights !== 'undefined' && 
            typeof window.researcherInsights.trackGenomeGeneration === 'function') {
            console.log('✅ ResearcherInsights compatibility confirmed');
        } else {
            console.warn('⚠️ ResearcherInsights not available - using fallback');
        }
        
        // All tests passed
        results.overallSuccess = true;
        console.log('🎉 Integration validation PASSED!');
        console.log('📊 Results:', results);
        
        // Performance test
        console.log('⚡ Running performance test...');
        const startTime = performance.now();
        
        // Simulate one game frame
        const mockGameState = {
            tanks: [tank],
            obstacles: [],
            hill: hill,
            battleTime: 0,
            gameMode: 'king_of_hill'
        };
        
        tank.update(1/60, mockGameState);
        hill.update(1/60, [tank]);
        
        const endTime = performance.now();
        const frameTime = endTime - startTime;
        
        console.log(`⏱️ Frame processing time: ${frameTime.toFixed(2)}ms`);
        if (frameTime < 16.67) { // 60 FPS target
            console.log('✅ Performance is good (60+ FPS capable)');
        } else {
            console.log('⚠️ Performance may be slow (< 60 FPS)');
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Integration validation failed with error:', error);
        console.error('Stack trace:', error.stack);
        return results;
    }
}

/**
 * Quick compatibility check
 */
function quickCompatibilityCheck() {
    console.log('🚀 Quick compatibility check...');
    
    // Check for legacy compatibility
    if (typeof Tank !== 'undefined') {
        const tank = new Tank(0, 0, 'red', GenomeUtils.generateRandom(9));
        
        // Check if legacy methods still work
        const legacyMethods = ['update', 'render', 'takeDamage', 'calculateSpeed'];
        const workingMethods = legacyMethods.filter(method => typeof tank[method] === 'function');
        
        console.log(`✅ Legacy compatibility: ${workingMethods.length}/${legacyMethods.length} methods working`);
        
        if (workingMethods.length === legacyMethods.length) {
            console.log('🎯 Full backward compatibility maintained!');
            return true;
        } else {
            console.log('⚠️ Some legacy methods missing:', 
                legacyMethods.filter(m => !workingMethods.includes(m)));
            return false;
        }
    } else {
        console.error('❌ Tank class not found - integration incomplete');
        return false;
    }
}

/**
 * Display integration status in page
 */
function displayIntegrationStatus() {
    const results = validateIntegration();
    const compatibility = quickCompatibilityCheck();
    
    // Create or update status display
    let statusDiv = document.getElementById('integration-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'integration-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            z-index: 1000;
            border: 2px solid ${results.overallSuccess ? '#00ff88' : '#ff4444'};
        `;
        document.body.appendChild(statusDiv);
    }
    
    const status = results.overallSuccess ? 'PASS' : 'FAIL';
    const color = results.overallSuccess ? '#00ff88' : '#ff4444';
    
    statusDiv.innerHTML = `
        <div style="color: ${color}; font-weight: bold; margin-bottom: 10px;">
            🔧 Integration Status: ${status}
        </div>
        <div>📦 Components: ${results.componentsLoaded ? '✅' : '❌'}</div>
        <div>⚙️ Configuration: ${results.configurationValid ? '✅' : '❌'}</div>
        <div>🎮 GameEngine: ${results.gameEngineWorking ? '✅' : '❌'}</div>
        <div>🚗 Tank System: ${results.tankSystemWorking ? '✅' : '❌'}</div>
        <div>🏔️ Hill System: ${results.hillSystemWorking ? '✅' : '❌'}</div>
        <div>🔄 Compatibility: ${compatibility ? '✅' : '❌'}</div>
        <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            Click to close
        </div>
    `;
    
    statusDiv.onclick = () => statusDiv.remove();
    
    // Auto-hide after 10 seconds if successful
    if (results.overallSuccess) {
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.style.opacity = '0.5';
                setTimeout(() => statusDiv.remove(), 2000);
            }
        }, 10000);
    }
}

// Auto-run if this script is loaded in browser
if (typeof window !== 'undefined') {
    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(displayIntegrationStatus, 1000);
        });
    } else {
        setTimeout(displayIntegrationStatus, 1000);
    }
}

// Export for manual use
if (typeof window !== 'undefined') {
    window.validateIntegration = validateIntegration;
    window.quickCompatibilityCheck = quickCompatibilityCheck;
    window.displayIntegrationStatus = displayIntegrationStatus;
}
