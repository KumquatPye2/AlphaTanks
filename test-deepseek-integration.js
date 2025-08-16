// Test the DeepSeek LLM Integration
// Run this in browser console to verify setup
async function testDeepSeekIntegration() {
    try {
        // 1. Check if components are loaded
        // 2. Check configuration');
        // 3. Test basic functionality
        const asiArch = window.asiArch || (window.evolution?.asiArch) || (window.evolutionEngine?.asiArch);
        if (asiArch) {
            // Test debug info
            const _debugInfo = asiArch.getDebugInfo();
            // Test performance metrics  
            const _metrics = asiArch.getPerformanceMetrics();
            // Test mock battle result processing
            const mockRedTeam = [
                { speed: 0.6, aggression: 0.7, accuracy: 0.5, health: 100, team: 'red', fitness: 0.65 }
            ];
            const mockBlueTeam = [
                { speed: 0.5, aggression: 0.6, accuracy: 0.8, health: 100, team: 'blue', fitness: 0.70 }
            ];
            const mockBattleResult = {
                winner: 'blue',
                duration: 45,
                redTeamStats: { accuracy: 0.5, averageSurvivalTime: 30 },
                blueTeamStats: { accuracy: 0.8, averageSurvivalTime: 45 }
            };
            // Enable mock mode for testing
            const originalMockMode = window.CONFIG?.development?.enableMockMode;
            if (window.CONFIG?.development) {
                window.CONFIG.development.enableMockMode = true;
            }
            const _result = await asiArch.processBattleResult(
                mockRedTeam, 
                mockBlueTeam, 
                mockBattleResult
            );
            // Restore original mock mode setting
            if (window.CONFIG?.development && originalMockMode !== undefined) {
                window.CONFIG.development.enableMockMode = originalMockMode;
            }
            // 4. Test LLM client directly if available
            if (asiArch.llmASIArch?.deepSeekClient) {
                try {
                    // Enable mock mode for safe testing
                    window.CONFIG.development.enableMockMode = true;
                    const testResponse = await asiArch.llmASIArch.deepSeekClient.makeRequest(
                        'Test prompt for integration verification',
                        0.5,
                        'You are a test assistant. Respond with a simple acknowledgment.'
                    );
                    console.log('DeepSeek client test response:', testResponse);
                } catch (error) {
                    console.warn('DeepSeek client test failed:', error.message);
                }
            }
        } else {
            console.warn('ASI-ARCH not found - DeepSeek integration unavailable');
        }
        
        // 5. Integration status summary
        const isFullyIntegrated = asiArch && 
                                 window.CONFIG?.deepseek && 
                                 window.DeepSeekClient;
        if (isFullyIntegrated) {
            console.log('DeepSeek integration is fully operational');
        } else {
            console.log('DeepSeek integration is partial or unavailable');
        }
        return {
            success: true,
            componentsLoaded: isFullyIntegrated,
            ready: !!asiArch
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
// Auto-run test when this script loads
if (typeof window !== 'undefined') {
    // Wait for DOM and other scripts to load
    setTimeout(() => {
        testDeepSeekIntegration().then(_result => {
            // Test completed - results logged to console
        });
    }, 1000);
}
// Expose for manual testing
if (typeof window !== 'undefined') {
    window.testDeepSeekIntegration = testDeepSeekIntegration;
}
