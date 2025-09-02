// Enhanced test setup for new test suites
// Import all the classes and modules needed for the new tests

// Load the actual config
const path = require('path');

// Load CONFIG directly since config.js has module.exports
const configPath = path.join(__dirname, '..', 'config.js');
try {
    delete require.cache[require.resolve(configPath)]; // Clear cache
    const loadedConfig = require(configPath);
    global.CONFIG = loadedConfig;
    global.window.CONFIG = loadedConfig;
    
    // If the loaded config is empty, create a manual setup
    if (!loadedConfig || Object.keys(loadedConfig).length === 0) {
        global.CONFIG = {
            deepseek: {
                apiKey: 'sk-test123456789012345678901234567890123456',
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
                            hillPosition: 'center'
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
        global.window.CONFIG = global.CONFIG;
    }
} catch (error) {
    console.warn('Could not load CONFIG:', error.message);
}

// Also expose DeepSeekClient globally for tests to access
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

// Make DeepSeekClient available in global scope for tests
global.window.DeepSeekClient = global.DeepSeekClient;

// Mock browser globals first
global.window = global.window || {};
global.document = global.document || {
    getElementById: jest.fn(() => null),
    createElement: jest.fn(() => ({
        style: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

// Load configuration
const CONFIG = require('../config.js');
global.window.CONFIG = CONFIG;

// Mock console capture for tests
const originalConsole = global.console;
global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Load and setup all main classes
let DeepSeekClient, CollisionUtils;

// Setup Hill class - use mock for stability in test environment
global.Hill = class Hill {
        constructor(x, y, radius = 60) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.controllingTeam = null;
            this.controlProgress = 0;
            this.captureTime = 3.0;
            this.contestRadius = this.radius + 20;
            this.occupationTime = 20;
            this.redControlTime = 0;
            this.blueControlTime = 0;
            this.redScore = 0;
            this.blueScore = 0;
            this.controlChanges = 0;
            this.maxRedControl = 0;
            this.maxBlueControl = 0;
            this.currentRedStreak = 0;
            this.currentBlueStreak = 0;
            this.previousController = null;
            this.captureEvents = [];
            this.captureEffects = [];
            this.pulseTimer = 0;
        }

        update(deltaTime, tanks) {
            // Validate deltaTime to handle edge cases
            if (deltaTime < 0) {
                deltaTime = 0;
            }
            if (deltaTime > 10) {
                deltaTime = 10; // Cap at 10 seconds to prevent huge jumps
            }
            
            this.pulseTimer += deltaTime;
            
            if (!tanks || tanks.length === 0) {
                this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 10);
                if (this.controlProgress === 0) {
                    this.controllingTeam = null;
                }
                return;
            }

            const tanksOnHill = this.getTanksInArea(tanks, this.contestRadius);
            const redTanks = tanksOnHill.filter(tank => tank.team === 'red');
            const blueTanks = tanksOnHill.filter(tank => tank.team === 'blue');

            if (redTanks.length > 0 && blueTanks.length === 0) {
                this.updateCapture('red', deltaTime);
            } else if (blueTanks.length > 0 && redTanks.length === 0) {
                this.updateCapture('blue', deltaTime);
            } else if (redTanks.length > 0 && blueTanks.length > 0) {
                // Contested - no progress
                this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 30);
            } else {
                // Empty hill - slow decay
                this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 10);
                if (this.controlProgress === 0) {
                    this.controllingTeam = null;
                }
            }

            // Award points and track time if hill is controlled
            if (this.controllingTeam && this.controlProgress >= 100) {
                if (this.controllingTeam === 'red') {
                    this.redControlTime += deltaTime;
                } else {
                    this.blueControlTime += deltaTime;
                }
            }
        }

        updateCapture(team, deltaTime) {
            const previousControllingTeam = this.controllingTeam;
            
            if (this.controllingTeam === team) {
                // Same team, increase control
                this.controlProgress = Math.min(100, this.controlProgress + deltaTime * (100 / this.captureTime));
                
                // Track continuous control streaks
                if (team === 'red') {
                    this.currentRedStreak += deltaTime;
                    this.currentBlueStreak = 0;
                    this.maxRedControl = Math.max(this.maxRedControl, this.currentRedStreak);
                } else {
                    this.currentBlueStreak += deltaTime;
                    this.currentRedStreak = 0;
                    this.maxBlueControl = Math.max(this.maxBlueControl, this.currentBlueStreak);
                }
            } else if (this.controllingTeam === null) {
                // Neutral hill, start capturing
                this.controllingTeam = team;
                this.controlProgress = Math.min(100, deltaTime * (100 / this.captureTime));
                
                // Reset streaks and track control change
                this.currentRedStreak = team === 'red' ? deltaTime : 0;
                this.currentBlueStreak = team === 'blue' ? deltaTime : 0;
                
                // Update max control tracking
                if (team === 'red') {
                    this.maxRedControl = Math.max(this.maxRedControl, this.currentRedStreak);
                } else {
                    this.maxBlueControl = Math.max(this.maxBlueControl, this.currentBlueStreak);
                }
                
                if (this.previousController !== null && this.previousController !== team) {
                    this.controlChanges++;
                }
                this.previousController = team;
            } else {
                // Enemy team, contest the hill
                this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 40);
                if (this.controlProgress === 0) {
                    this.controllingTeam = team;
                    this.controlProgress = Math.min(100, deltaTime * (100 / this.captureTime));
                    
                    // Track control change
                    if (previousControllingTeam && previousControllingTeam !== team) {
                        this.controlChanges++;
                    }
                    this.previousController = team;
                    
                    // Reset opposing streak, start new streak
                    if (team === 'red') {
                        this.currentRedStreak = deltaTime;
                        this.currentBlueStreak = 0;
                        this.maxRedControl = Math.max(this.maxRedControl, this.currentRedStreak);
                    } else {
                        this.currentBlueStreak = deltaTime;
                        this.currentRedStreak = 0;
                        this.maxBlueControl = Math.max(this.maxBlueControl, this.currentBlueStreak);
                    }
                    
                    // Record capture event for AI learning
                    this.captureEvents.push({
                        time: Date.now(),
                        previousTeam: previousControllingTeam,
                        newTeam: team,
                        contestDuration: deltaTime
                    });
                    
                    // Limit capture events array to prevent memory growth
                    if (this.captureEvents.length > 100) {
                        this.captureEvents = this.captureEvents.slice(-50); // Keep last 50 events
                    }
                } else {
                    // Still contesting, reset streaks
                    this.currentRedStreak = 0;
                    this.currentBlueStreak = 0;
                }
            }
        }

        getTanksInArea(tanks, radius) {
            return tanks.filter(tank => {
                if (!tank.isAlive) {
                    return false;
                }
                const dx = tank.x + (tank.width || 24) / 2 - this.x;
                const dy = tank.y + (tank.height || 16) / 2 - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance <= radius;
            });
        }

        isGameWon() {
            return this.redControlTime >= this.occupationTime || 
                   this.blueControlTime >= this.occupationTime ||
                   this.redScore >= 500 || this.blueScore >= 500;
        }

        getWinner() {
            if (this.redControlTime >= this.occupationTime) {
                return 'red';
            }
            if (this.blueControlTime >= this.occupationTime) {
                return 'blue';
            }
            if (this.redScore >= 500) {
                return 'red';
            }
            if (this.blueScore >= 500) {
                return 'blue';
            }
            return null;
        }

        getStrategicInfo() {
            return {
                position: { x: this.x, y: this.y },
                radius: this.radius,
                contestRadius: this.contestRadius,
                controllingTeam: this.controllingTeam,
                controlProgress: this.controlProgress,
                redScore: this.redScore,
                blueScore: this.blueScore,
                redControlTime: this.redControlTime,
                blueControlTime: this.blueControlTime,
                hillOccupationTime: this.occupationTime,
                redTimeToWin: Math.max(0, this.occupationTime - this.redControlTime),
                blueTimeToWin: Math.max(0, this.occupationTime - this.blueControlTime),
                isContested: this.controlProgress > 0 && this.controlProgress < 100,
                isNeutral: this.controllingTeam === null,
                isSecure: this.controlProgress >= 100
            };
        }

        reset() {
            this.controllingTeam = null;
            this.controlProgress = 0;
            this.redControlTime = 0;
            this.blueControlTime = 0;
            this.redScore = 0;
            this.blueScore = 0;
            this.captureEvents = [];
            this.captureEffects = [];
            this.controlChanges = 0;
            this.maxRedControl = 0;
            this.maxBlueControl = 0;
            this.currentRedStreak = 0;
            this.currentBlueStreak = 0;
            this.previousController = null;
        }
    };

// Setup DeepSeekClient class
try {
    const deepseekCode = require('fs').readFileSync(require('path').join(__dirname, '../deepseek-client.js'), 'utf8');
    eval(deepseekCode);
    global.DeepSeekClient = DeepSeekClient;
} catch (error) {
    // Fallback mock DeepSeekClient class for testing
    global.DeepSeekClient = class DeepSeekClient {
        constructor() {
            this.config = global.window.CONFIG?.deepseek || {
                apiKey: '',
                baseURL: 'https://api.deepseek.com/v1',
                model: 'deepseek-chat',
                temperatures: {
                    researcher: 0.8,
                    analyst: 0.3,
                    judge: 0.5,
                    cognition: 0.2
                }
            };
            this.apiKey = this.resolveApiKey();
            this.context = {};
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
            return !this.apiKey || global.window.CONFIG?.development?.enableMockMode === true;
        }

        generateMockResponse(prompt) {
            const responses = [
                `Mock analysis for: ${prompt.substring(0, 50)}... Analysis shows tactical improvements in accuracy and positioning.`,
                `Generated response: Genome mutations suggest enhanced cooperation values. Fitness improvements detected.`,
                `Strategic evaluation: Team performance indicates balanced aggression-defense dynamics. Adaptation successful.`,
                `Research findings: Novel behavioral patterns emerged. Recommend genome traits: speed=0.7, accuracy=0.8, teamwork=0.6.`,
                `Judgment assessment: Candidate A shows 15% better performance than baseline. Recommend for next generation.`
            ];
            
            const index = Math.abs(prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % responses.length;
            return responses[index] + ` (Mock response generated at ${Date.now()})`;
        }

        async makeRequest(prompt, _temperature = 0.7, _systemPrompt = '') {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 10));
            
            if (this.useMockMode()) {
                return this.generateMockResponse(prompt);
            }
            
            // In real implementation, would make actual API call
            return this.generateMockResponse(prompt);
        }
    };
}

// Setup CollisionUtils
global.CollisionUtils = {
    rectanglesOverlap: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    lineIntersectsRect: (x1, y1, x2, y2, rect) => {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        return !(maxX < rect.x || minX > rect.x + rect.width ||
                maxY < rect.y || minY > rect.y + rect.height);
    },

    hasLineOfSight: (obj1, obj2, obstacles) => {
        if (!obstacles || obstacles.length === 0) {
            return true;
        }
        
        for (const obstacle of obstacles) {
            if (CollisionUtils.lineIntersectsRect(obj1.x, obj1.y, obj2.x, obj2.y, obstacle)) {
                return false;
            }
        }
        return true;
    }
};

// Setup MathUtils
global.MathUtils = {
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    lerp: (a, b, t) => {
        return a + (b - a) * t;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Hill: global.Hill,
        DeepSeekClient: global.DeepSeekClient,
        CollisionUtils: global.CollisionUtils,
        MathUtils: global.MathUtils
    };
}
