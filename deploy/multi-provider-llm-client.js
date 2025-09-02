// Multi-Provider LLM Client
// Supports DeepSeek, OpenAI, and other compatible APIs

class MultiProviderLLMClient {
    constructor(config = window.CONFIG?.llm) {
        this.config = config || {};
        this.providers = this.initializeProviders();
        this.currentProvider = this.config.defaultProvider || 'deepseek';
        
        // Rate limiting and caching
        this.requestQueue = [];
        this.lastRequestTime = {};
        this.requestCount = {};
        this.resetTime = {};
        this.cache = new Map();
        this.enableCaching = window.CONFIG?.development?.enableCaching || false;
        
        this.initializeProvider(this.currentProvider);
    }

    initializeProviders() {
        return {
            deepseek: {
                name: 'DeepSeek',
                baseURL: 'https://api.deepseek.com/v1',
                models: ['deepseek-chat', 'deepseek-coder'],
                defaultModel: 'deepseek-chat',
                keyPattern: /^sk-[a-zA-Z0-9]{32,64}$/,
                keyPrefix: 'sk-',
                rateLimits: { requestsPerMinute: 60, tokensPerMinute: 200000 }
            },
            openai: {
                name: 'OpenAI',
                baseURL: 'https://api.openai.com/v1',
                models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                defaultModel: 'gpt-4',
                keyPattern: /^sk-[a-zA-Z0-9]{48,64}$/,
                keyPrefix: 'sk-',
                rateLimits: { requestsPerMinute: 60, tokensPerMinute: 150000 }
            },
            anthropic: {
                name: 'Anthropic Claude',
                baseURL: 'https://api.anthropic.com/v1',
                models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
                defaultModel: 'claude-3-sonnet-20240229',
                keyPattern: /^sk-ant-[a-zA-Z0-9\-_]{95,105}$/,
                keyPrefix: 'sk-ant-',
                rateLimits: { requestsPerMinute: 60, tokensPerMinute: 100000 }
            },
            azure: {
                name: 'Azure OpenAI',
                baseURL: '', // Will be set per deployment
                models: ['gpt-4', 'gpt-35-turbo'],
                defaultModel: 'gpt-4',
                keyPattern: /^[a-zA-Z0-9]{32}$/,
                keyPrefix: '',
                rateLimits: { requestsPerMinute: 120, tokensPerMinute: 300000 }
            }
        };
    }

    initializeProvider(providerKey) {
        const provider = this.providers[providerKey];
        if (!provider) {
            throw new Error(`Unknown provider: ${providerKey}`);
        }

        this.currentProvider = providerKey;
        this.provider = provider;
        this.model = this.config.model || provider.defaultModel;
        this.baseURL = this.config.baseURL || provider.baseURL;
        
        // Load API key from storage
        this.apiKey = this.loadApiKeyFromStorage(providerKey);
        
        // Initialize rate limiting for this provider
        if (!this.requestCount[providerKey]) {
            this.requestCount[providerKey] = 0;
            this.resetTime[providerKey] = Date.now() + 60000;
            this.lastRequestTime[providerKey] = 0;
        }

                
        // Provider initialized successfully
        return this;
    }

    loadApiKeyFromStorage(providerKey) {
        try {
            return localStorage.getItem(`${providerKey}_api_key`) || '';
        } catch (error) {
            console.warn(`Could not load API key for ${providerKey}:`, error);
            return '';
        }
    }

    switchProvider(providerKey) {
        if (this.providers[providerKey]) {
            this.initializeProvider(providerKey);
            return true;
        }
        return false;
    }

    validateApiKey(apiKey, providerKey = this.currentProvider) {
        const provider = this.providers[providerKey];
        if (!provider) {
            return false;
        }
        
        return provider.keyPattern.test(apiKey);
    }

    updateApiKey(apiKey, providerKey = this.currentProvider) {
        if (!this.validateApiKey(apiKey, providerKey)) {
            throw new Error(`Invalid API key format for ${this.providers[providerKey]?.name}`);
        }

        this.apiKey = apiKey;
        
        // Save to localStorage
        try {
            localStorage.setItem(`${providerKey}_api_key`, apiKey);
        } catch (error) {
            console.error(`Failed to save API key for ${providerKey}:`, error);
        }

        // Update mock mode
        if (apiKey && window.CONFIG?.development) {
            window.CONFIG.development.enableMockMode = false;
        }
    }

    async makeRequest(prompt, temperature = 0.7, systemPrompt = '', model = null) {
        // Use specified model or default
        const requestModel = model || this.model;
        
        // Check cache first
        const cacheKey = `${this.currentProvider}-${requestModel}-${systemPrompt}-${prompt}-${temperature}`;
        if (this.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Check mock mode
        if (window.CONFIG?.development?.enableMockMode === true) {
            return this.generateMockResponse(prompt);
        }

        // Validate API key
        if (!this.apiKey || !this.validateApiKey(this.apiKey)) {
            throw new Error(`No valid API key configured for ${this.provider.name}`);
        }

        // Rate limiting
        await this.enforceRateLimit();

        try {
            let response;
            
            // Call appropriate API based on provider
            switch (this.currentProvider) {
                case 'deepseek':
                case 'openai':
                    response = await this.callOpenAICompatibleAPI(prompt, temperature, systemPrompt, requestModel);
                    break;
                case 'anthropic':
                    response = await this.callAnthropicAPI(prompt, temperature, systemPrompt, requestModel);
                    break;
                case 'azure':
                    response = await this.callAzureAPI(prompt, temperature, systemPrompt, requestModel);
                    break;
                default:
                    throw new Error(`Provider ${this.currentProvider} not implemented`);
            }

            // Cache the response
            if (this.enableCaching) {
                this.cache.set(cacheKey, response);
            }

            return response;
        } catch (error) {
            console.error(`API request failed for ${this.provider.name}:`, error);
            return this.generateFallbackResponse(prompt);
        }
    }

    async callOpenAICompatibleAPI(prompt, temperature, systemPrompt, model) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: 2000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`${this.provider.name} API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callAnthropicAPI(prompt, temperature, systemPrompt, model) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'assistant', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async callAzureAPI(prompt, temperature, systemPrompt, model) {
        // Azure OpenAI has a different URL structure
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch(`${this.baseURL}/openai/deployments/${model}/chat/completions?api-version=2023-05-15`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify({
                messages: messages,
                temperature: temperature,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Azure OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async enforceRateLimit() {
        const providerKey = this.currentProvider;
        const now = Date.now();
        
        // Reset counter every minute
        if (now > this.resetTime[providerKey]) {
            this.requestCount[providerKey] = 0;
            this.resetTime[providerKey] = now + 60000;
        }

        // Check rate limit
        const maxRequests = this.provider.rateLimits?.requestsPerMinute || 60;
        if (this.requestCount[providerKey] >= maxRequests) {
            const waitTime = this.resetTime[providerKey] - now;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.requestCount[providerKey] = 0;
            this.resetTime[providerKey] = Date.now() + 60000;
        }

        // Ensure minimum time between requests
        const timeSinceLastRequest = now - this.lastRequestTime[providerKey];
        const minInterval = 1000; // 1 second
        if (timeSinceLastRequest < minInterval) {
            await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
        }

        this.requestCount[providerKey]++;
        this.lastRequestTime[providerKey] = Date.now();
    }

    generateMockResponse(_prompt) {
        const responses = [
            "This is a mock response for development. Configure an API key to use real LLM features.",
            "Mock mode: The AI would analyze this prompt and provide insights about tank evolution.",
            "Development mode: Real LLM integration would provide detailed tactical analysis here.",
            "Simulated response: Tank behavior optimization suggestions would appear with a real API key."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateFallbackResponse(_prompt) {
        return "API request failed. Please check your API key and connection.";
    }

    // Get available providers
    getProviders() {
        return Object.keys(this.providers).map(key => ({
            key,
            name: this.providers[key].name,
            models: this.providers[key].models
        }));
    }

    // Get current provider info
    getCurrentProvider() {
        return {
            key: this.currentProvider,
            name: this.provider.name,
            model: this.model,
            hasValidKey: this.validateApiKey(this.apiKey)
        };
    }
}

// Backward compatibility - create global instance
window.MultiProviderLLMClient = MultiProviderLLMClient;
