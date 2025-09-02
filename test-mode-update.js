// Simple test to trigger ASI-ARCH mode display update

function testModeUpdate() {
    // Check if ASI-ARCH is available
    if (window.asiArch && typeof window.asiArch.updateModeDisplay === 'function') {
        window.asiArch.updateModeDisplay();
    }
}

// Auto-run after a delay
setTimeout(() => {
    testModeUpdate();
}, 2000);

// Make it available globally for manual testing
window.testModeUpdate = testModeUpdate;
