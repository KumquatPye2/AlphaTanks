// Configuration for DeepSeek LLM Integration
// ASI-ARCH Implementation with DeepSeek API

// Function to load API key from localStorage
function loadApiKeyFromStorage() {
    try {
        return localStorage.getItem('deepseek_api_key') || '';
    } catch (error) {
        console.warn('Could not access localStorage for API key:', error);
        return '';
    }
}

const CONFIG = {
    // DeepSeek API Configuration
    deepseek: {
        // SECURITY: Never commit API keys to version control!
        // API key will be loaded from user input and stored in localStorage
        // Users must provide their own DeepSeek API key for LLM features
        apiKey: loadApiKeyFromStorage(), // Will be populated from localStorage or user input
        
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
        candidatePoolSize: 50,  // Increased from 10 for better diversity
        
        // Experiment batch size
        batchSize: 5,           // Process 5 experiments per iteration
        
        // Enhanced battle scenarios configuration
        battleScenarios: {
            enabled: true,
            rotationInterval: 5,  // Change scenario every 5 cycles
            
            // Available scenarios with tactical challenges
            scenarios: {
                'open_field': {
                    name: 'Open Field Combat',
                    description: 'Wide open battlefield with minimal cover',
                    obstacleCount: 8,
                    obstacleSize: { min: 30, max: 60 },
                    hillPosition: 'center',
                    tacticalFocus: 'mobility_and_accuracy'
                },
                'urban_warfare': {
                    name: 'Urban Combat',
                    description: 'Dense obstacle layout simulating urban combat',
                    obstacleCount: 20,
                    obstacleSize: { min: 40, max: 80 },
                    hillPosition: 'offset',
                    tacticalFocus: 'positioning_and_cover'
                },
                'chokepoint_control': {
                    name: 'Chokepoint Defense',
                    description: 'Narrow passages requiring tactical coordination',
                    obstacleCount: 12,
                    obstacleSize: { min: 50, max: 100 },
                    hillPosition: 'defended',
                    tacticalFocus: 'teamwork_and_timing'
                },
                'fortress_assault': {
                    name: 'Fortress Assault',
                    description: 'Asymmetric scenario with defensive advantages',
                    obstacleCount: 15,
                    obstacleSize: { min: 60, max: 120 },
                    hillPosition: 'fortified',
                    tacticalFocus: 'adaptation_and_persistence'
                }
            },
            
            // Seeded evaluation for reproducibility
            seededEvaluation: {
                enabled: true,
                seedRange: [1000, 9999]
            },
            
            // Fitness aggregation across scenarios
            multiScenarioFitness: {
                enabled: true,
                adaptabilityWeight: 0.3,
                consistencyWeight: 0.2,
                specializationPenalty: 0.15
            }
        },
        
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
