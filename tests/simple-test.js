// Simple test to verify test setup is working
describe('Simple Integration Test', () => {
    test('should be able to run basic tests', () => {
        expect(1 + 1).toBe(2);
    });
    
    test('should have access to globals', () => {
        expect(global).toBeDefined();
        expect(global.window).toBeDefined();
    });
    
    test('should have a simple config mock', () => {
        // Manual setup for this test
        global.window.CONFIG = {
            deepseek: {
                baseURL: 'https://api.deepseek.com/v1',
                model: 'deepseek-chat',
                rateLimits: { requestsPerMinute: 60, tokensPerMinute: 200000 }
            },
            asiArch: {
                fitnessWeights: { quantitative: 0.33, qualitative: 0.33, innovation: 0.34 }
            },
            development: {
                enableMockMode: false,
                logLevel: 'info'
            }
        };
        
        expect(global.window.CONFIG).toBeDefined();
        expect(global.window.CONFIG.deepseek.baseURL).toBe('https://api.deepseek.com/v1');
    });
});
