// DeepSeek API Client for ASI-ARCH Integration
// Implements LLM-as-Judge, Cognition Extraction, and Analysis capabilities

class DeepSeekClient {
    constructor(config = window.CONFIG?.deepseek) {
        this.config = config || {};
        
        // Resolve API key from multiple sources
        this.apiKey = this.resolveApiKey();
        
        this.baseURL = this.config.baseURL || 'https://api.deepseek.com/v1';
        this.model = this.config.model || 'deepseek-chat';
        
        // Rate limiting
        this.requestQueue = [];
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000; // Reset every minute
        
        // Cache for development
        this.cache = new Map();
        this.enableCaching = window.CONFIG?.development?.enableCaching || false;
        
        this.validateConfig();
    }
    
    resolveApiKey() {
        // Priority order for API key resolution:
        // 1. Direct config.apiKey
        // 2. Environment variable (Node.js)
        // 3. Empty string (will use mock mode)
        
        if (this.config.apiKey) {
            return this.config.apiKey;
        }
        
        // Check environment variable if in Node.js environment
        if (typeof process !== 'undefined' && process.env?.DEEPSEEK_API_KEY) {
            return process.env.DEEPSEEK_API_KEY;
        }
        
        return '';
    }
    
    validateConfig() {
        if (!this.apiKey && !window.CONFIG?.development?.enableMockMode) {
            console.warn('🔑 DeepSeek API key not configured. Automatically enabling mock mode for development.');
            console.log('💡 To use real LLM features:');
            console.log('   1. Get API key from: https://platform.deepseek.com/');
            console.log('   2. Add to config.js: CONFIG.deepseek.apiKey = "sk-your-key-here"');
            console.log('   3. Or run: window.asiArch.setApiKey("sk-your-key-here")');
            
            // Automatically enable mock mode if no API key
            if (window.CONFIG?.development) {
                window.CONFIG.development.enableMockMode = true;
            }
        }
    }
    
    async makeRequest(prompt, temperature = 0.7, systemPrompt = '') {
        // Check cache first
        const cacheKey = `${systemPrompt}-${prompt}-${temperature}`;
        if (this.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Mock mode for development
        if (window.CONFIG?.development?.enableMockMode) {
            return this.generateMockResponse(prompt);
        }
        
        // Rate limiting
        await this.enforceRateLimit();
        
        try {
            const response = await this.callAPI(prompt, temperature, systemPrompt);
            
            // Cache the response
            if (this.enableCaching) {
                this.cache.set(cacheKey, response);
            }
            
            return response;
        } catch (error) {
            console.error('DeepSeek API error:', error);
            return this.generateFallbackResponse(prompt);
        }
    }
    
    async callAPI(prompt, temperature, systemPrompt) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        messages.push({
            role: 'user',
            content: prompt
        });
        
        const requestBody = {
            model: this.model,
            messages: messages,
            temperature: temperature,
            max_tokens: 2000,
            stream: false
        };
        
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async enforceRateLimit() {
        const now = Date.now();
        
        // Reset counter every minute
        if (now > this.resetTime) {
            this.requestCount = 0;
            this.resetTime = now + 60000;
        }
        
        // Check rate limit
        const maxRequests = this.config.rateLimits?.requestsPerMinute || 60;
        if (this.requestCount >= maxRequests) {
            const waitTime = this.resetTime - now;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.requestCount = 0;
            this.resetTime = Date.now() + 60000;
        }
        
        // Ensure minimum time between requests
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000; // 1 second
        
        if (timeSinceLastRequest < minInterval) {
            await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
        }
        
        this.requestCount++;
        this.lastRequestTime = Date.now();
    }
    
    generateMockResponse(prompt) {
        // Generate contextually appropriate mock responses for development
        if (prompt.includes('score') || prompt.includes('evaluate')) {
            return JSON.stringify({
                score: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
                reasoning: 'Mock evaluation: This architecture shows promising tactical innovations with balanced offensive and defensive capabilities.',
                confidence: 0.8
            });
        }
        
        if (prompt.includes('analyze') || prompt.includes('insight')) {
            return JSON.stringify({
                insights: [
                    'Enhanced positioning strategies through dynamic formation adjustment',
                    'Improved target prioritization based on threat assessment',
                    'Adaptive movement patterns that respond to battlefield conditions'
                ],
                patterns: ['tactical_adaptation', 'formation_optimization'],
                confidence: 0.85
            });
        }
        
        if (prompt.includes('propose') || prompt.includes('generate')) {
            return JSON.stringify({
                proposal: {
                    name: `MockStrategy_${Date.now()}`,
                    description: 'A novel tactical approach combining aggressive positioning with defensive coordination',
                    modifications: [
                        'Increase aggression when health > 0.7',
                        'Enhanced team coordination during retreats',
                        'Dynamic speed adjustment based on enemy proximity'
                    ]
                },
                rationale: 'This strategy balances risk and reward while maintaining team cohesion.',
                expectedImprovement: 0.15
            });
        }
        
        return 'Mock response: Analysis completed successfully.';
    }
    
    generateFallbackResponse(prompt) {
        console.warn('Using fallback response due to API failure');
        return this.generateMockResponse(prompt);
    }
    
    // ASI-ARCH specific methods
    
    async llmJudgeScore(genomeData, battleResults, baselinePerformance) {
        const systemPrompt = `You are an expert AI researcher evaluating tank battle strategies for an ASI-ARCH system. 
        Assess the architectural merit of proposed tank tactics on a scale of 0.0 to 1.0.
        
        Consider:
        - Tactical innovation and novelty
        - Performance improvement over baseline
        - Strategic sophistication
        - Adaptability to different scenarios
        
        Respond with a JSON object containing: score, reasoning, confidence.`;
        
        const prompt = `Evaluate this tank strategy:
        
        Genome Data:
        ${JSON.stringify(genomeData, null, 2)}
        
        Battle Results:
        ${JSON.stringify(battleResults, null, 2)}
        
        Baseline Performance: ${baselinePerformance}
        
        Provide detailed evaluation focusing on tactical merit and innovation.`;
        
        const response = await this.makeRequest(
            prompt, 
            this.config.temperatures?.judge || 0.5, 
            systemPrompt
        );
        
        try {
            return JSON.parse(response);
        } catch (error) {
            console.warn('Failed to parse LLM judge response, using fallback');
            return {
                score: 0.7,
                reasoning: 'Fallback evaluation due to parsing error',
                confidence: 0.5
            };
        }
    }
    
    async generateTacticalProposal(candidatePool, battleHistory, cognitionBase) {
        const systemPrompt = `You are a tactical researcher in an ASI-ARCH system. Generate novel tank battle strategies 
        by analyzing successful patterns and proposing innovative improvements.
        
        Focus on:
        - Novel tactical approaches
        - Improvements over existing strategies
        - Specific parameter modifications
        - Expected performance gains
        
        Respond with a JSON object containing: proposal, rationale, expectedImprovement.`;
        
        const prompt = `Based on this data, propose a new tactical strategy:
        
        Current Top Performers:
        ${JSON.stringify(candidatePool.slice(0, 5), null, 2)}
        
        Recent Battle History (last 10 battles):
        ${JSON.stringify(battleHistory.slice(-10), null, 2)}
        
        Available Tactical Knowledge:
        ${JSON.stringify(cognitionBase.slice(0, 3), null, 2)}
        
        Generate a specific, actionable tactical proposal with clear modifications.`;
        
        const response = await this.makeRequest(
            prompt,
            this.config.temperatures?.researcher || 0.8,
            systemPrompt
        );
        
        try {
            return JSON.parse(response);
        } catch (error) {
            console.warn('Failed to parse proposal response, using fallback');
            return {
                proposal: {
                    name: `Strategy_${Date.now()}`,
                    description: 'Fallback tactical proposal',
                    modifications: ['Balanced approach with moderate adjustments']
                },
                rationale: 'Generated due to parsing error',
                expectedImprovement: 0.1
            };
        }
    }
    
    async analyzeBattleResults(battleData, trends, context) {
        const systemPrompt = `You are an analyst in an ASI-ARCH system specializing in tactical pattern recognition. 
        Analyze battle results to extract actionable insights and identify emerging tactical patterns.
        
        Focus on:
        - Key performance patterns
        - Tactical effectiveness trends
        - Strategic recommendations
        - Areas for improvement
        
        Respond with a JSON object containing: insights, patterns, recommendations, confidence.`;
        
        const prompt = `Analyze these battle results for tactical insights:
        
        Battle Data:
        ${JSON.stringify(battleData, null, 2)}
        
        Performance Trends:
        ${JSON.stringify(trends, null, 2)}
        
        Context:
        ${JSON.stringify(context, null, 2)}
        
        Extract key insights and patterns that could inform future tactical development.`;
        
        const response = await this.makeRequest(
            prompt,
            this.config.temperatures?.analyst || 0.3,
            systemPrompt
        );
        
        try {
            return JSON.parse(response);
        } catch (error) {
            console.warn('Failed to parse analysis response, using fallback');
            return {
                insights: ['Fallback analysis due to parsing error'],
                patterns: ['general_improvement'],
                recommendations: ['Continue current approach'],
                confidence: 0.5
            };
        }
    }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.DeepSeekClient = DeepSeekClient;
} else {
    module.exports = DeepSeekClient;
}
