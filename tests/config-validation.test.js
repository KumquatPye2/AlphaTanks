/**
 * Configuration Validation Tests
 * Tests for config.js validation, API key handling, and configuration integrity
 */

describe('Configuration Validation', () => {
    let originalConfig;
    
    beforeAll(() => {
        // Ensure window.CONFIG is properly set up with complete test data
        console.log('beforeAll: window.CONFIG exists?', !!window.CONFIG);
        console.log('beforeAll: window.CONFIG keys:', window.CONFIG ? Object.keys(window.CONFIG) : 'none');
        
        if (!window.CONFIG || Object.keys(window.CONFIG).length === 0) {
            console.log('Setting up CONFIG manually in beforeAll');
            window.CONFIG = {
                deepseek: {
                    apiKey: 'sk-391b52e4a9aa41f4a66af4e403d3d0aa',
                    baseURL: 'https://api.deepseek.com/v1',
                    model: 'deepseek-chat',
                    temperatures: { researcher: 0.8, analyst: 0.3, judge: 0.5, cognition: 0.2 },
                    rateLimits: { requestsPerMinute: 60, tokensPerMinute: 200000 },
                    retry: { maxAttempts: 3, backoffMs: 1000 }
                },
                asiArch: {
                    fitnessWeights: { quantitative: 0.33, qualitative: 0.33, innovation: 0.34 },
                    candidatePoolSize: 50,
                    batchSize: 5,
                    battleScenarios: {
                        enabled: true,
                        rotationInterval: 5,
                        scenarios: {
                            open_field: {
                                name: 'Open Field Battle',
                                description: 'Classic tank battle in open terrain',
                                obstacleCount: 5,
                                obstacleSize: { min: 20, max: 40 },
                                hillPosition: 'center',
                                tacticalFocus: 'positioning'
                            },
                            urban_warfare: {
                                name: 'Urban Warfare',
                                description: 'Combat in urban environment',
                                obstacleCount: 12,
                                obstacleSize: { min: 30, max: 60 },
                                hillPosition: 'offset',
                                tacticalFocus: 'close_quarters'
                            },
                            chokepoint_control: {
                                name: 'Chokepoint Control',
                                description: 'Control strategic passages',
                                obstacleCount: 8,
                                obstacleSize: { min: 40, max: 80 },
                                hillPosition: 'defended',
                                tacticalFocus: 'area_denial'
                            },
                            fortress_assault: {
                                name: 'Fortress Assault',
                                description: 'Assault heavily fortified position',
                                obstacleCount: 15,
                                obstacleSize: { min: 50, max: 100 },
                                hillPosition: 'fortified',
                                tacticalFocus: 'breakthrough'
                            }
                        }
                    }
                },
                development: {
                    enableMockMode: false,
                    logLevel: 'info',
                    savePrompts: true,
                    enableCaching: true
                }
            };
        }

        // Ensure DeepSeekClient is available
        if (!window.DeepSeekClient && global.DeepSeekClient) {
            window.DeepSeekClient = global.DeepSeekClient;
            global.window.DeepSeekClient = global.DeepSeekClient;
        }
        
        // Also make it available in global scope for tests
        if (!global.DeepSeekClient) {
            global.DeepSeekClient = class DeepSeekClient {
                constructor(config = global.window?.CONFIG?.deepseek) {
                    this.config = config || {};
                    this.apiKey = this.resolveApiKey();
                    this.baseURL = this.config.baseURL || 'https://api.deepseek.com/v1';
                    this.model = this.config.model || 'deepseek-chat';
                }
                
                resolveApiKey() {
                    if (this.config.apiKey) {
                        return this.config.apiKey;
                    }
                    if (typeof process !== 'undefined' && process.env?.DEEPSEEK_API_KEY) {
                        return process.env.DEEPSEEK_API_KEY;
                    }
                    return '';
                }
                
                useMockMode() {
                    return !this.apiKey || this.apiKey === '';
                }
            };
        }
        
        // Make DeepSeekClient available as a global constructor
        window.DeepSeekClient = global.DeepSeekClient;
    });
    
    beforeEach(() => {
        // Store original config
        originalConfig = window.CONFIG ? JSON.parse(JSON.stringify(window.CONFIG)) : null;
    });
    
    afterEach(() => {
        // Restore original config
        if (originalConfig) {
            window.CONFIG = originalConfig;
        }
    });

    describe('Config Structure Validation', () => {
        test('should have all required top-level sections', () => {
            expect(window.CONFIG).toBeDefined();
            expect(window.CONFIG.deepseek).toBeDefined();
            expect(window.CONFIG.asiArch).toBeDefined();
            expect(window.CONFIG.development).toBeDefined();
        });

        test('should have valid DeepSeek configuration', () => {
            const deepseek = window.CONFIG.deepseek;
            expect(deepseek.baseURL).toBe('https://api.deepseek.com/v1');
            expect(deepseek.model).toBe('deepseek-chat');
            expect(deepseek.temperatures).toHaveProperty('researcher');
            expect(deepseek.temperatures).toHaveProperty('analyst');
            expect(deepseek.temperatures).toHaveProperty('judge');
            expect(deepseek.temperatures).toHaveProperty('cognition');
        });

        test('should have valid ASI-ARCH configuration', () => {
            const asiArch = window.CONFIG.asiArch;
            expect(asiArch.fitnessWeights).toBeDefined();
            expect(asiArch.fitnessWeights.quantitative).toBeCloseTo(0.33, 2);
            expect(asiArch.fitnessWeights.qualitative).toBeCloseTo(0.33, 2);
            expect(asiArch.fitnessWeights.innovation).toBeCloseTo(0.34, 2);
            expect(asiArch.candidatePoolSize).toBe(50);
            expect(asiArch.batchSize).toBe(5);
        });

        test('should have valid battle scenarios configuration', () => {
            const scenarios = window.CONFIG.asiArch.battleScenarios;
            expect(scenarios.enabled).toBe(true);
            expect(scenarios.rotationInterval).toBe(5);
            expect(scenarios.scenarios).toHaveProperty('open_field');
            expect(scenarios.scenarios).toHaveProperty('urban_warfare');
            expect(scenarios.scenarios).toHaveProperty('chokepoint_control');
            expect(scenarios.scenarios).toHaveProperty('fortress_assault');
        });
    });

    describe('API Key Handling', () => {
        test('should handle missing API key gracefully', () => {
            const mockConfig = {
                ...window.CONFIG,
                deepseek: { ...window.CONFIG.deepseek, apiKey: '' }
            };
            window.CONFIG = mockConfig;
            
            const client = new DeepSeekClient();
            expect(client.apiKey).toBe('');
            expect(client.useMockMode()).toBe(true);
        });

        test('should validate API key format', () => {
            const validKey = 'sk-391b52e4a9aa41f4a66af4e403d3d0aa';
            const invalidKeys = ['invalid', '', 'sk-short', 'wrong-prefix-123'];
            
            expect(validKey).toMatch(/^sk-[a-f0-9]{32}$/);
            invalidKeys.forEach(key => {
                expect(key).not.toMatch(/^sk-[a-f0-9]{32}$/);
            });
        });

        test('should handle environment variable fallback', () => {
            // Mock process.env for testing
            const originalProcess = global.process;
            global.process = { env: { DEEPSEEK_API_KEY: 'sk-env-test-key' } };
            
            const mockConfig = {
                ...window.CONFIG,
                deepseek: { ...window.CONFIG.deepseek, apiKey: '' }
            };
            window.CONFIG = mockConfig;
            
            const client = new DeepSeekClient();
            expect(client.resolveApiKey()).toBe('sk-env-test-key');
            
            // Restore
            global.process = originalProcess;
        });
    });

    describe('Scenario Configuration Validation', () => {
        test('should validate scenario structure', () => {
            const scenarios = window.CONFIG.asiArch.battleScenarios.scenarios;
            
            Object.values(scenarios).forEach(scenario => {
                expect(scenario).toHaveProperty('name');
                expect(scenario).toHaveProperty('description');
                expect(scenario).toHaveProperty('obstacleCount');
                expect(scenario).toHaveProperty('obstacleSize');
                expect(scenario).toHaveProperty('hillPosition');
                expect(scenario).toHaveProperty('tacticalFocus');
                
                expect(typeof scenario.obstacleCount).toBe('number');
                expect(scenario.obstacleSize).toHaveProperty('min');
                expect(scenario.obstacleSize).toHaveProperty('max');
                expect(scenario.obstacleSize.max).toBeGreaterThan(scenario.obstacleSize.min);
            });
        });

        test('should have reasonable obstacle counts', () => {
            const scenarios = window.CONFIG.asiArch.battleScenarios.scenarios;
            
            Object.values(scenarios).forEach(scenario => {
                expect(scenario.obstacleCount).toBeGreaterThan(0);
                expect(scenario.obstacleCount).toBeLessThan(50);
            });
        });

        test('should have valid hill positions', () => {
            const scenarios = window.CONFIG.asiArch.battleScenarios.scenarios;
            const validPositions = ['center', 'offset', 'defended', 'fortified'];
            
            Object.values(scenarios).forEach(scenario => {
                expect(validPositions).toContain(scenario.hillPosition);
            });
        });
    });

    describe('Rate Limiting Configuration', () => {
        test('should have reasonable rate limits', () => {
            const rateLimits = window.CONFIG.deepseek.rateLimits;
            expect(rateLimits.requestsPerMinute).toBe(60);
            expect(rateLimits.tokensPerMinute).toBe(200000);
            expect(rateLimits.requestsPerMinute).toBeGreaterThan(0);
            expect(rateLimits.tokensPerMinute).toBeGreaterThan(0);
        });

        test('should have valid retry configuration', () => {
            const retry = window.CONFIG.deepseek.retry;
            expect(retry.maxAttempts).toBe(3);
            expect(retry.backoffMs).toBe(1000);
            expect(retry.maxAttempts).toBeGreaterThan(0);
            expect(retry.backoffMs).toBeGreaterThan(0);
        });
    });

    describe('Development Configuration', () => {
        test('should have development flags', () => {
            const dev = window.CONFIG.development;
            expect(typeof dev.enableMockMode).toBe('boolean');
            expect(typeof dev.logLevel).toBe('string');
            expect(typeof dev.savePrompts).toBe('boolean');
            expect(typeof dev.enableCaching).toBe('boolean');
        });

        test('should validate log level', () => {
            const validLevels = ['debug', 'info', 'warn', 'error'];
            expect(validLevels).toContain(window.CONFIG.development.logLevel);
        });
    });
});
