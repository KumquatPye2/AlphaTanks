// Force Real API Usage - Add this script after config.js and deepseek-client.js
console.log('Forcing real API usage...');

// Ensure mock mode is disabled
if (window.CONFIG?.development) {
    window.CONFIG.development.enableMockMode = false;
    console.log('Mock mode forcibly disabled');
}

// Override the DeepSeekClient to ensure it uses the real API
const originalMakeRequest = DeepSeekClient.prototype.makeRequest;
DeepSeekClient.prototype.makeRequest = async function(prompt, temperature = 0.7, systemPrompt = '') {
    // Force check for API key and use real API if available
    const hasApiKey = this.apiKey && this.apiKey.length > 0;
    
    console.log('Force override makeRequest:', {
        hasApiKey,
        apiKeyLength: this.apiKey?.length,
        mockModeConfig: window.CONFIG?.development?.enableMockMode
    });
    
    if (hasApiKey) {
        console.log('Using REAL API (forced)');
        // Force disable mock mode for this request
        const originalMockMode = window.CONFIG?.development?.enableMockMode;
        window.CONFIG.development.enableMockMode = false;
        
        try {
            const result = await originalMakeRequest.call(this, prompt, temperature, systemPrompt);
            // Restore original mock mode setting
            window.CONFIG.development.enableMockMode = originalMockMode;
            return result;
        } catch (error) {
            // Restore original mock mode setting
            window.CONFIG.development.enableMockMode = originalMockMode;
            throw error;
        }
    } else {
        console.log('No API key available, cannot use real API');
        return this.generateMockResponse(prompt);
    }
};

console.log('DeepSeekClient override applied - will force real API usage when API key is available');
