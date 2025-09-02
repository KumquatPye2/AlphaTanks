// Multi-Provider API Key Manager
// Handles API keys for multiple LLM providers (DeepSeek, OpenAI, Anthropic, Azure)

class MultiProviderApiKeyManager {
    constructor() {
        this.storagePrefix = 'llm_api_key_';
        this.currentProvider = 'deepseek'; // default
        this.initialized = false;
        this.elements = {};
        
        // Provider configurations
        this.providers = {
            deepseek: {
                name: 'DeepSeek',
                keyPattern: /^sk-[a-zA-Z0-9]{32,64}$/,
                placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
                description: 'DeepSeek API key for ASI-ARCH integration'
            },
            openai: {
                name: 'OpenAI',
                keyPattern: /^sk-[a-zA-Z0-9]{48,64}$/,
                placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
                description: 'OpenAI API key for GPT models'
            },
            anthropic: {
                name: 'Anthropic',
                keyPattern: /^sk-ant-[a-zA-Z0-9\-_]{95,105}$/,
                placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx',
                description: 'Anthropic API key for Claude models'
            },
            azure: {
                name: 'Azure OpenAI',
                keyPattern: /^[a-zA-Z0-9]{32}$/,
                placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                description: 'Azure OpenAI service key'
            }
        };
    }

    initialize() {
        if (this.initialized) {
            return;
        }
        
        this.elements = {
            providerSelect: document.getElementById('providerSelect'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            apiKeyStatus: document.getElementById('apiKeyStatus'),
            providerDescription: document.getElementById('providerDescription')
        };
        
        // Check if elements exist
        const missingElements = Object.entries(this.elements)
            .filter(([_, element]) => !element)
            .map(([name]) => name);
            
        if (missingElements.length > 0) {
            console.warn('Multi-Provider API Key Manager: Missing DOM elements:', missingElements);
            return;
        }

        // Set up event listeners
        this.elements.providerSelect.addEventListener('change', () => this.handleProviderChange());
        this.elements.apiKeyInput.addEventListener('input', () => this.handleApiKeyInput());
        this.elements.apiKeyInput.addEventListener('blur', () => this.validateAndSaveApiKey());
        
        // Initialize with current provider
        this.loadProviderSettings();
        this.loadSavedApiKey();
        
        this.initialized = true;
    }

    handleProviderChange() {
        const newProvider = this.elements.providerSelect.value;
        if (this.providers[newProvider]) {
            this.currentProvider = newProvider;
            this.loadProviderSettings();
            this.loadSavedApiKey();
            
            // Update the LLM client if it exists
            if (window.multiProviderLLMClient) {
                window.multiProviderLLMClient.switchProvider(newProvider);
            }
        }
    }

    loadProviderSettings() {
        const provider = this.providers[this.currentProvider];
        if (!provider) {
            return;
        }
        
        // Update input placeholder and description
        this.elements.apiKeyInput.placeholder = provider.placeholder;
        if (this.elements.providerDescription) {
            this.elements.providerDescription.textContent = provider.description;
        }
        
        // Clear previous input
        this.elements.apiKeyInput.value = '';
        this.updateStatus('No API key configured', 'default');
    }

    loadSavedApiKey() {
        try {
            const savedKey = localStorage.getItem(this.storagePrefix + this.currentProvider);
            if (savedKey) {
                this.elements.apiKeyInput.value = savedKey;
                this.updateConfigAndStatus(savedKey);
            } else {
                this.updateStatus('No API key configured', 'default');
            }
        } catch (error) {
            console.warn(`Failed to load API key for ${this.currentProvider}:`, error);
            this.updateStatus('Storage unavailable', 'error');
        }
    }

    handleApiKeyInput() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        const provider = this.providers[this.currentProvider];
        
        if (apiKey.length === 0) {
            this.updateStatus('No API key configured', 'default');
        } else if (!this.isValidApiKeyFormat(apiKey)) {
            this.updateStatus(`Invalid ${provider.name} API key format`, 'error');
        } else {
            this.updateStatus('API key entered (click elsewhere to save)', 'pending');
        }
    }

    validateAndSaveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        
        if (apiKey.length === 0) {
            this.clearApiKey();
            return;
        }

        if (!this.isValidApiKeyFormat(apiKey)) {
            const provider = this.providers[this.currentProvider];
            this.updateStatus(`Invalid ${provider.name} API key format`, 'error');
            return;
        }

        this.saveApiKey(apiKey);
        this.updateConfigAndStatus(apiKey);
    }

    isValidApiKeyFormat(apiKey) {
        const provider = this.providers[this.currentProvider];
        return provider && provider.keyPattern.test(apiKey);
    }

    saveApiKey(apiKey) {
        try {
            localStorage.setItem(this.storagePrefix + this.currentProvider, apiKey);
        } catch (error) {
            console.error(`Failed to save ${this.currentProvider} API key:`, error);
            this.updateStatus('Failed to save API key', 'error');
        }
    }

    clearApiKey() {
        try {
            localStorage.removeItem(this.storagePrefix + this.currentProvider);
            this.updateConfigAndStatus('');
            this.updateStatus('API key cleared', 'default');
        } catch (error) {
            console.error(`Failed to clear ${this.currentProvider} API key:`, error);
        }
    }

    updateConfigAndStatus(apiKey) {
        const provider = this.providers[this.currentProvider];
        
        // Update the multi-provider LLM client
        if (window.multiProviderLLMClient) {
            try {
                if (apiKey) {
                    window.multiProviderLLMClient.updateApiKey(apiKey, this.currentProvider);
                }
            } catch (error) {
                console.error('Failed to update LLM client:', error);
                this.updateStatus('Invalid API key format', 'error');
                return;
            }
        }

        // Update legacy DeepSeek client for backward compatibility
        if (this.currentProvider === 'deepseek' && window.CONFIG?.deepseek) {
            window.CONFIG.deepseek.apiKey = apiKey;
            if (window.deepSeekClient && typeof window.deepSeekClient.updateApiKey === 'function') {
                window.deepSeekClient.updateApiKey(apiKey);
            }
        }

        // Update status
        if (apiKey) {
            this.updateStatus(`${provider.name} API key configured ✓`, 'connected');
        } else {
            this.updateStatus('No API key configured', 'default');
        }
    }

    updateStatus(message, type = 'default') {
        if (!this.elements.apiKeyStatus) {
            return;
        }
        
        this.elements.apiKeyStatus.textContent = message;
        this.elements.apiKeyStatus.className = 'api-key-status';
        
        if (type === 'connected') {
            this.elements.apiKeyStatus.classList.add('connected');
        } else if (type === 'error') {
            this.elements.apiKeyStatus.classList.add('error');
        } else if (type === 'pending') {
            this.elements.apiKeyStatus.classList.add('pending');
        }
    }

    // Public methods
    getCurrentProvider() {
        return this.currentProvider;
    }

    getApiKey(provider = this.currentProvider) {
        if (provider === this.currentProvider && this.elements.apiKeyInput) {
            return this.elements.apiKeyInput.value.trim();
        }
        
        try {
            return localStorage.getItem(this.storagePrefix + provider) || '';
        } catch (error) {
            console.warn(`Failed to get API key for ${provider}:`, error);
            return '';
        }
    }

    hasValidApiKey(provider = this.currentProvider) {
        const apiKey = this.getApiKey(provider);
        const providerConfig = this.providers[provider];
        return apiKey.length > 0 && providerConfig && providerConfig.keyPattern.test(apiKey);
    }

    getConfiguredProviders() {
        return Object.keys(this.providers).filter(provider => this.hasValidApiKey(provider));
    }

    switchToProvider(providerKey) {
        if (this.providers[providerKey] && this.elements.providerSelect) {
            this.elements.providerSelect.value = providerKey;
            this.handleProviderChange();
            return true;
        }
        return false;
    }

    showSecurityWarning() {
        const configuredProviders = this.getConfiguredProviders();
        if (configuredProviders.length > 0) {
            console.warn('⚠️ SECURITY WARNING: API keys are stored in browser localStorage. ' +
                        `Configured providers: ${configuredProviders.join(', ')}. ` +
                        'Only use this on trusted devices. Clear your API keys when done.');
        }
    }
}

// Global instance
window.multiProviderApiKeyManager = new MultiProviderApiKeyManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.multiProviderApiKeyManager.initialize();
    });
} else {
    window.multiProviderApiKeyManager.initialize();
}
