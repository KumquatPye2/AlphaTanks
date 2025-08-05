// Jest test setup file
// This file is run before each test file

// Mock performance.now() for consistent timing tests
global.performance = {
    now: jest.fn(() => Date.now())
};

// Mock DOM elements for testing
global.HTMLCanvasElement = class HTMLCanvasElement {
    constructor() {
        this.width = 800;
        this.height = 600;
    }
    getContext() {
        return {
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn()
        };
    }
};

// Mock requestAnimationFrame for testing
global.requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16); // 60 FPS simulation
});

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
