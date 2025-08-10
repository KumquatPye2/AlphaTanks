// Configuration for DeepSeek LLM Integration
// ASI-ARCH Implementation with DeepSeek API

const CONFIG = {
    // DeepSeek API Configuration
    deepseek: {
        // OPTION 1: Set your API key directly here (browser-friendly)
        apiKey: 'sk-391b52e4a9aa41f4a66af4e403d3d0aa', // Your DeepSeek API key
        
        // OPTION 2: Environment variable (Node.js only)
        // The code will automatically check process.env.DEEPSEEK_API_KEY if apiKey is empty
        
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat', // or 'deepseek-coder' for code-heavy tasks
        
        // Temperature settings for different components (from ASI-ARCH paper)
        temperatures: {
            researcher: 0.8,    // Higher creativity for novel proposals
            analyst: 0.3,       // Lower for factual analysis
            judge: 0.5,         // Balanced for evaluation
            cognition: 0.2      // Precise for knowledge extraction
        },
        
        // Rate limiting to respect API limits
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 200000
        },
        
        // Retry configuration
        retry: {
            maxAttempts: 3,
            backoffMs: 1000
        }
    },
    
    // ASI-ARCH specific settings
    asiArch: {
        // Fitness function weights (from Equation 2 in paper)
        fitnessWeights: {
            quantitative: 0.33,   // σ(Δ_performance)
            qualitative: 0.33,    // LLM_judge
            innovation: 0.34      // Architectural novelty
        },
        
        // Candidate pool size (paper uses top-50)
        candidatePoolSize: 10,  // Scaled down for tank tactics
        
        // Experiment batch size
        batchSize: 5,           // Process 5 experiments per iteration
        
        // Enable/disable LLM components
        enableComponents: {
            llmJudge: true,
            cognitionExtraction: true,
            proposalGeneration: true,
            resultAnalysis: true
        }
    },
    
    // Development settings
    development: {
        enableMockMode: false,  // Use mock responses instead of API calls
        logLevel: 'info',       // debug, info, warn, error
        savePrompts: true,      // Save prompts and responses for debugging
        enableCaching: true     // Cache API responses
    }
};

// Validation
if (typeof window !== 'undefined') {
    // Browser environment
    window.CONFIG = CONFIG;
} else {
    // Node.js environment
    module.exports = CONFIG;
}
