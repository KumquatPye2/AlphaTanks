// API Key Manager for DeepSeek Integration
// Handles secure storage and validation of user-provided API keys

class ApiKeyManager {
    constructor() {
        this.storageKey = 'deepseek_api_key';
        this.statusElement = null;
        this.inputElement = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            return;
        }
        
        this.statusElement = document.getElementById('apiKeyStatus');
        this.inputElement = document.getElementById('apiKeyInput');
        this.mockModeCheckbox = document.getElementById('enableMockMode');
        
        if (!this.statusElement || !this.inputElement) {
            console.warn('API Key Manager: Required DOM elements not found');
            return;
        }

        // Load saved API key and mock mode preference
        this.loadSavedApiKey();
        this.loadMockModePreference();
        
        // Set up event listeners
        this.inputElement.addEventListener('input', () => this.handleApiKeyInput());
        this.inputElement.addEventListener('blur', () => this.validateAndSaveApiKey());
        
        if (this.mockModeCheckbox) {
            this.mockModeCheckbox.addEventListener('change', () => this.handleMockModeChange());
        }
        
        this.initialized = true;
    }

    loadSavedApiKey() {
        try {
            const savedKey = localStorage.getItem(this.storageKey);
            if (savedKey) {
                this.inputElement.value = savedKey;
                this.updateConfigAndStatus(savedKey);
            } else {
                // Check if mock mode should be used instead
                this.updateMockModeStatus();
            }
        } catch (error) {
            console.warn('Failed to load API key from localStorage:', error);
            this.updateStatus('Storage unavailable', 'error');
        }
    }

    loadMockModePreference() {
        try {
            const mockModeEnabled = localStorage.getItem('mock_mode_enabled') === 'true';
            if (this.mockModeCheckbox) {
                this.mockModeCheckbox.checked = mockModeEnabled;
            }
            
            // Update config
            if (window.CONFIG?.development) {
                window.CONFIG.development.enableMockMode = mockModeEnabled;
            }
            
            this.updateMockModeStatus();
        } catch (error) {
            console.warn('Failed to load mock mode preference:', error);
        }
    }

    handleMockModeChange() {
        const mockModeEnabled = this.mockModeCheckbox.checked;
        
        try {
            localStorage.setItem('mock_mode_enabled', mockModeEnabled.toString());
        } catch (error) {
            console.warn('Failed to save mock mode preference:', error);
        }
        
        // Update config
        if (window.CONFIG?.development) {
            window.CONFIG.development.enableMockMode = mockModeEnabled;
        }
        
        this.updateMockModeStatus();
        
        // Update ASI-ARCH status display
        const tryUpdateASIArch = (attempts = 0) => {
            if (window.asiArch && typeof window.asiArch.updateModeDisplay === 'function') {
                window.asiArch.updateModeDisplay();
                return true;
            } else if (attempts < 5) {
                setTimeout(() => tryUpdateASIArch(attempts + 1), 100);
                return false;
            } else {
                console.warn('API Key Manager: Failed to update ASI-ARCH mode display after 5 attempts');
                return false;
            }
        };
        tryUpdateASIArch();
    }

    updateMockModeStatus() {
        const mockModeEnabled = this.mockModeCheckbox?.checked || false;
        const hasApiKey = this.hasValidApiKey();
        
        if (mockModeEnabled) {
            this.updateStatus('🎭 Mock mode enabled - using simulated AI responses', 'mock');
            // Disable API key input when mock mode is enabled
            if (this.inputElement) {
                this.inputElement.disabled = true;
                this.inputElement.style.opacity = '0.5';
            }
        } else {
            // Re-enable API key input
            if (this.inputElement) {
                this.inputElement.disabled = false;
                this.inputElement.style.opacity = '1';
            }
            
            if (hasApiKey) {
                this.updateStatus('API key configured ✓', 'connected');
            } else {
                this.updateStatus('No API key configured', 'default');
            }
        }
    }

    handleApiKeyInput() {
        // Don't validate if mock mode is enabled
        if (this.mockModeCheckbox?.checked) {
            return;
        }
        
        const apiKey = this.inputElement.value.trim();
        
        if (apiKey.length === 0) {
            this.updateStatus('No API key configured', 'default');
        } else if (!this.isValidApiKeyFormat(apiKey)) {
            this.updateStatus('Invalid API key format', 'error');
        } else {
            this.updateStatus('API key entered (click elsewhere to save)', 'pending');
        }
    }

    validateAndSaveApiKey() {
        // Don't save if mock mode is enabled
        if (this.mockModeCheckbox?.checked) {
            return;
        }
        
        const apiKey = this.inputElement.value.trim();
        
        if (apiKey.length === 0) {
            this.clearApiKey();
            return;
        }

        if (!this.isValidApiKeyFormat(apiKey)) {
            this.updateStatus('Invalid API key format', 'error');
            return;
        }

        this.saveApiKey(apiKey);
        this.updateConfigAndStatus(apiKey);
    }

    isValidApiKeyFormat(apiKey) {
        // DeepSeek API keys start with 'sk-' and are typically 32-64 characters after the prefix
        // Example: sk-391b52e4a9aa41f4a66af4e403d3d0aa (32 chars after sk-)
        return /^sk-[a-zA-Z0-9]{32,64}$/.test(apiKey);
    }

    saveApiKey(apiKey) {
        try {
            localStorage.setItem(this.storageKey, apiKey);
        } catch (error) {
            console.error('Failed to save API key:', error);
            this.updateStatus('Failed to save API key', 'error');
        }
    }

    clearApiKey() {
        try {
            localStorage.removeItem(this.storageKey);
            this.updateConfigAndStatus('');
            this.updateStatus('API key cleared', 'default');
        } catch (error) {
            console.error('Failed to clear API key:', error);
        }
    }

    updateConfigAndStatus(apiKey) {
        // Check if mock mode is enabled
        const mockModeEnabled = this.mockModeCheckbox?.checked || false;
        
        if (mockModeEnabled) {
            // Force mock mode regardless of API key
            if (window.CONFIG?.development) {
                window.CONFIG.development.enableMockMode = true;
            }
            this.updateMockModeStatus();
            return;
        }
        
        // Update the global CONFIG object
        if (window.CONFIG && window.CONFIG.deepseek) {
            window.CONFIG.deepseek.apiKey = apiKey;
            
            // Force disable mock mode if we have a valid API key
            if (apiKey && window.CONFIG.development) {
                window.CONFIG.development.enableMockMode = false;
            }
        }

        // Update DeepSeekClient instances if they exist
        if (window.deepSeekClient && typeof window.deepSeekClient.updateApiKey === 'function') {
            window.deepSeekClient.updateApiKey(apiKey);
        }

        // Update status
        if (apiKey) {
            this.updateStatus('API key configured ✓', 'connected');
        } else {
            this.updateStatus('No API key configured', 'default');
        }
        
        // Update ASI-ARCH status display
        const tryUpdateASIArch = (attempts = 0) => {
            if (window.asiArch && typeof window.asiArch.updateModeDisplay === 'function') {
                window.asiArch.updateModeDisplay();
                return true;
            } else if (attempts < 5) {
                setTimeout(() => tryUpdateASIArch(attempts + 1), 100);
                return false;
            } else {
                console.warn('API Key Manager: Failed to update ASI-ARCH display after 5 attempts');
                return false;
            }
        };
        tryUpdateASIArch();
    }

    updateStatus(message, type = 'default') {
        if (!this.statusElement) {
            return;
        }
        
        this.statusElement.textContent = message;
        this.statusElement.className = 'api-key-status';
        
        if (type === 'connected') {
            this.statusElement.classList.add('connected');
        } else if (type === 'error') {
            this.statusElement.classList.add('error');
        } else if (type === 'mock') {
            this.statusElement.classList.add('mock');
        }
    }

    // Public method to get the current API key
    getApiKey() {
        return this.inputElement ? this.inputElement.value.trim() : '';
    }

    // Public method to check if API key is configured
    hasValidApiKey() {
        const apiKey = this.getApiKey();
        return apiKey.length > 0 && this.isValidApiKeyFormat(apiKey);
    }

    // Show warning about API key security
    showSecurityWarning() {
        if (this.hasValidApiKey()) {
            console.warn('⚠️ SECURITY WARNING: API keys are stored in browser localStorage. ' +
                        'Only use this on trusted devices. Clear your API key when done.');
        }
    }
}

// Global instance
window.apiKeyManager = new ApiKeyManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.apiKeyManager.initialize();
    });
} else {
    window.apiKeyManager.initialize();
}
