// Simple test to trigger ASI-ARCH mode display update
console.log('🧪 Testing ASI-ARCH mode display update...');

function testModeUpdate() {
    console.log('=== Testing Mode Update ===');
    
    // Check if ASI-ARCH is available
    if (window.asiArch && typeof window.asiArch.updateModeDisplay === 'function') {
        console.log('✅ ASI-ARCH available, calling updateModeDisplay()');
        window.asiArch.updateModeDisplay();
    } else {
        console.log('❌ ASI-ARCH not available');
        console.log('- window.asiArch exists:', !!window.asiArch);
        console.log('- updateModeDisplay is function:', typeof window.asiArch?.updateModeDisplay === 'function');
    }
    
    // Check API key manager status
    if (window.apiKeyManager) {
        console.log('✅ API Key Manager available');
        console.log('- hasValidApiKey():', window.apiKeyManager.hasValidApiKey());
    } else {
        console.log('❌ API Key Manager not available');
    }
    
    // Check config status
    console.log('CONFIG.development.enableMockMode:', window.CONFIG?.development?.enableMockMode);
    console.log('CONFIG.deepseek.apiKey length:', window.CONFIG?.deepseek?.apiKey?.length || 0);
}

// Auto-run after a delay
setTimeout(() => {
    console.log('🔄 Auto-running mode update test...');
    testModeUpdate();
}, 2000);

// Make it available globally for manual testing
window.testModeUpdate = testModeUpdate;
