// Jest test setup file
// This file is run before each test file

// Mock performance.now() for consistent timing tests
global.performance = {
    now: jest.fn(() => Date.now())
};

// Mock console methods to reduce noise during tests (optional)
// global.console = {
//     log: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn(),
//     info: jest.fn()
// };

// Global test utilities
global.createMockGameEngine = () => {
    // Factory function for creating mock game engines in tests
    return {
        gameState: 'ready',
        battleTime: 0,
        lastTime: 0,
        tanks: [],
        projectiles: [],
        redTeam: [],
        blueTeam: [],
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        reset: jest.fn(),
        gameLoop: jest.fn(),
        update: jest.fn(),
        render: jest.fn()
    };
};
