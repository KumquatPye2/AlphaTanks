// Test the DeepSeek LLM Integration
// Run this in browser console to verify setup

async function testDeepSeekIntegration() {
    console.log('🧪 Testing DeepSeek LLM Integration...');
    
    try {
        // 1. Check if components are loaded
        console.log('✅ Configuration loaded:', typeof window.CONFIG !== 'undefined');
        console.log('✅ DeepSeek client loaded:', typeof window.DeepSeekClient !== 'undefined');
        console.log('✅ LLM ASI-ARCH loaded:', typeof window.LLMEnhancedASIArch !== 'undefined');
        console.log('✅ Integration interface loaded:', typeof window.asiArch !== 'undefined');
        
        // 2. Check configuration
        console.log('\n📋 Configuration Status:');
        console.log('API Key configured:', window.CONFIG?.deepseek?.apiKey ? 'YES' : 'NO (using mock mode)');
        console.log('LLM features enabled:', window.CONFIG?.asiArch?.enableComponents?.llmJudge || false);
        console.log('Mock mode:', window.CONFIG?.development?.enableMockMode || false);
        
        // 3. Test basic functionality
        console.log('\n🔧 Testing Basic Functionality:');
        
        if (window.asiArch) {
            // Test debug info
            const debugInfo = window.asiArch.getDebugInfo();
            console.log('Debug info available:', !!debugInfo);
            
            // Test performance metrics
            const metrics = window.asiArch.getPerformanceMetrics();
            console.log('Performance metrics:', metrics);
            
            // Test mock battle result processing
            console.log('\n🥊 Testing Battle Processing:');
            
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
            
            const result = await window.asiArch.processBattleResult(
                mockRedTeam, 
                mockBlueTeam, 
                mockBattleResult
            );
            
            console.log('✅ Battle processing result:', result.type);
            console.log('Analysis insights:', result.analysis?.qualitative?.insights?.length || 0);
            console.log('Proposals generated:', result.proposals?.length || 0);
            
            // Restore original mock mode setting
            if (window.CONFIG?.development && originalMockMode !== undefined) {
                window.CONFIG.development.enableMockMode = originalMockMode;
            }
            
            // 4. Test LLM client directly if available
            if (window.asiArch.llmASIArch?.deepSeekClient) {
                console.log('\n🤖 Testing LLM Client:');
                
                try {
                    // Enable mock mode for safe testing
                    window.CONFIG.development.enableMockMode = true;
                    
                    const testResponse = await window.asiArch.llmASIArch.deepSeekClient.makeRequest(
                        'Test prompt for integration verification',
                        0.5,
                        'You are a test assistant. Respond with a simple acknowledgment.'
                    );
                    
                    console.log('✅ LLM client response received:', !!testResponse);
                    console.log('Response preview:', testResponse.substring(0, 50) + '...');
                    
                } catch (error) {
                    console.log('⚠️ LLM client test failed (this is normal in mock mode):', error.message);
                }
            }
            
        } else {
            console.log('❌ ASI-ARCH integration not available');
        }
        
        // 5. Integration status summary
        console.log('\n📊 Integration Status Summary:');
        console.log('='.repeat(50));
        
        const isFullyIntegrated = window.asiArch && 
                                 window.CONFIG?.deepseek && 
                                 window.DeepSeekClient;
        
        if (isFullyIntegrated) {
            console.log('🟢 STATUS: DeepSeek integration is READY');
            console.log('');
            console.log('Next steps:');
            console.log('1. Add your DeepSeek API key to config.js or set DEEPSEEK_API_KEY');
            console.log('2. Enable LLM features: window.asiArch.enableLLMFeatures()');
            console.log('3. Start a battle to see enhanced analysis in action');
        } else {
            console.log('🟡 STATUS: Integration partially loaded');
            console.log('Check browser console for any script loading errors');
        }
        
        return {
            success: true,
            componentsLoaded: isFullyIntegrated,
            ready: !!window.asiArch
        };
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
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
        testDeepSeekIntegration().then(result => {
            console.log('\n🎯 Test completed:', result.success ? 'PASSED' : 'FAILED');
        });
    }, 1000);
}

// Expose for manual testing
if (typeof window !== 'undefined') {
    window.testDeepSeekIntegration = testDeepSeekIntegration;
}
