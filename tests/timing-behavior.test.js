// Unit tests for GameEngine timing and deltaTime behavior

// Mock DOM and global objects
global.document = {
    getElementById: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillStyle: '', font: '', fillRect: jest.fn(), fillText: jest.fn(),
            strokeStyle: '', lineWidth: 0, beginPath: jest.fn(), moveTo: jest.fn(),
            lineTo: jest.fn(), stroke: jest.fn(), strokeRect: jest.fn(),
            imageSmoothingEnabled: false
        })),
        width: 800, height: 600,
        parentElement: { clientWidth: 800, clientHeight: 600 }
    }))
};

global.window = { 
    addEventListener: jest.fn(), 
    dispatchEvent: jest.fn(),
    GameEngine: undefined,
    Obstacle: undefined
};
global.requestAnimationFrame = jest.fn();
global.Tank = class Tank {
    constructor(x, y, team, genome) {
        this.x = x; this.y = y; this.team = team; this.genome = genome;
        this.isAlive = true; this.width = 20; this.height = 20;
        this.damageDealt = 0; this.damageTaken = 0; this.survivalTime = 0;
        this.shotsFired = 0; this.shotsHit = 0;
    }
    update() {} render() {} takeDamage() {}
};

global.Hill = class Hill {
    constructor(x, y, radius) {
        this.x = x; this.y = y; this.radius = radius;
        this.controlPoints = { red: 0, blue: 0 };
    }
    reset() {
        this.controlPoints = { red: 0, blue: 0 };
    }
    update(_deltaTime, _tanks) {
        // Mock update method - no-op for tests
    }
};

// Load the game engine file
require('../game-engine.js');
const GameEngine = global.window.GameEngine;

describe('GameEngine Timing Behavior', () => {
    let gameEngine;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Set up DOM mocks for the GameEngine
        document.body.innerHTML = '<div id="gameContainer"><canvas id="testCanvas" width="800" height="600"></canvas></div>';
        
        // Get the canvas element and container
        const mockContainer = document.getElementById('gameContainer');
        const mockCanvas = document.getElementById('testCanvas');
        
        // Mock container properties
        Object.defineProperty(mockContainer, 'clientWidth', { value: 800 });
        Object.defineProperty(mockContainer, 'clientHeight', { value: 600 });
        
        // Mock canvas properties and methods
        Object.defineProperty(mockCanvas, 'width', { value: 800, writable: true });
        Object.defineProperty(mockCanvas, 'height', { value: 600, writable: true });
        Object.defineProperty(mockCanvas, 'parentElement', { value: mockContainer });
        
        // Mock canvas context
        mockCanvas.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            canvas: mockCanvas
        }));

        // Ensure getElementById works properly
        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'testCanvas') {
                return mockCanvas;
            }
            if (id === 'gameContainer') {
                return mockContainer;
            }
            return null;
        });

        gameEngine = new GameEngine('testCanvas');
        gameEngine.initializeBattle(2, 2);
    });
    
    describe('DeltaTime Calculation', () => {
        test('should call update with fixed deltaTime on first frame', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            // First frame - uses fixed 1/60 deltaTime for initialization
            gameEngine.gameLoop(1000);
            
            // First frame always calls update with 1/60 ≈ 0.0167
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(1/60, 4));
            expect(gameEngine.lastTime).toBe(1000);
        });
        
        test('should calculate correct deltaTime for normal frame rates', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            // First frame
            gameEngine.gameLoop(1000);
            
            // Second frame at 60 FPS (16.67ms later)
            gameEngine.gameLoop(1016.67);
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.01667, 4));
            
            // Third frame
            gameEngine.gameLoop(1033.34);
            expect(updateSpy).toHaveBeenLastCalledWith(expect.closeTo(0.01667, 4));
        });
        
        test('should cap deltaTime to prevent large jumps', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            gameEngine.gameLoop(1000); // First frame
            gameEngine.gameLoop(2500); // 1.5 second gap (too large)
            
            // Should cap to 0.1 seconds maximum
            expect(updateSpy).toHaveBeenCalledWith(0.1);
        });
        
        test('should skip updates for negative deltaTime', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            gameEngine.gameLoop(1000); // First frame
            updateSpy.mockClear(); // Clear the first frame call
            
            // Simulate time going backwards (shouldn't happen but safety check)
            gameEngine.lastTime = 1500;
            gameEngine.gameLoop(1200);
            
            // Should not call update with negative deltaTime
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('Battle Time Progression', () => {
        test('should accumulate battle time correctly', () => {
            gameEngine.start();
            
            // Force battleStarted to true to simulate tanks having moved
            gameEngine.battleStarted = true;
            
            // Simulate several frames
            gameEngine.gameLoop(1000); // First frame
            expect(gameEngine.battleTime).toBeCloseTo(1/60, 4); // First frame adds 1/60
            
            gameEngine.gameLoop(1016.67); // +16.67ms
            expect(gameEngine.battleTime).toBeCloseTo(1/60 + 0.01667, 4);
            
            gameEngine.gameLoop(1033.34); // +16.67ms
            expect(gameEngine.battleTime).toBeCloseTo(1/60 + 0.03334, 4);
            
            gameEngine.gameLoop(1050.01); // +16.67ms
            expect(gameEngine.battleTime).toBeCloseTo(1/60 + 0.05001, 4);
        });
        
        test('should preserve battle time during pause', () => {
            gameEngine.start();
            gameEngine.battleStarted = true; // Force battle to be active
            
            // Build up some battle time
            gameEngine.gameLoop(1000);
            gameEngine.gameLoop(1100);
            gameEngine.gameLoop(1200);
            
            const battleTimeBeforePause = gameEngine.battleTime;
            gameEngine.pause();
            
            // Battle time should not change while paused
            expect(gameEngine.battleTime).toBe(battleTimeBeforePause);
            
            // Simulate time passing while paused (no gameLoop calls)
            // Battle time should remain the same
            expect(gameEngine.battleTime).toBe(battleTimeBeforePause);
        });
        
        test('should continue battle time from resume point', () => {
            gameEngine.start();
            gameEngine.battleStarted = true; // Force battle to be active
            
            // Build up battle time
            gameEngine.gameLoop(1000);
            gameEngine.gameLoop(1100); // +0.1s
            gameEngine.gameLoop(1200); // +0.1s
            
            const battleTimeAtPause = gameEngine.battleTime;
            gameEngine.pause();
            
            // While paused, no gameLoop calls happen, so battleTime shouldn't change
            expect(gameEngine.battleTime).toBe(battleTimeAtPause);
            
            // Spy on gameLoop to prevent automatic call during resume
            const gameLoopSpy = jest.spyOn(gameEngine, 'gameLoop');
            gameLoopSpy.mockImplementation(() => {}); // Mock to do nothing
            
            gameEngine.resume();
            
            // After resume (but before any new frames), battleTime should be the same
            expect(gameEngine.battleTime).toBe(battleTimeAtPause);
            
            // Restore original gameLoop and manually call with new times
            gameLoopSpy.mockRestore();
            
            // Continue with more frames - these will add to battle time
            gameEngine.gameLoop(3000); // First frame after resume - resets lastTime, uses 1/60
            gameEngine.gameLoop(3050); // +0.05s
            
            const expectedTime = battleTimeAtPause + 1/60 + 0.05;
            expect(gameEngine.battleTime).toBeCloseTo(expectedTime, 4);
        });
        
        test('should reset battle time on new battle start', () => {
            gameEngine.start();
            gameEngine.battleStarted = true; // Force battle to be active
            
            // Build up battle time - need proper deltaTime for accurate testing
            gameEngine.gameLoop(1000);  // First frame initializes lastTime
            gameEngine.gameLoop(1100);  // 100ms later = 0.1s deltaTime
            expect(gameEngine.battleTime).toBeGreaterThan(0);
            
            // Start new battle
            gameEngine.start();
            expect(gameEngine.battleTime).toBe(0);
            
            // Verify timing restarts correctly
            gameEngine.battleStarted = true; // Force battle to be active again
            gameEngine.gameLoop(2000);  // Initialize lastTime again
            gameEngine.gameLoop(2100);  // 100ms later = 0.1s deltaTime
            expect(gameEngine.battleTime).toBeGreaterThan(0);
        });
    });
    
    describe('Timing Edge Cases', () => {
        test('should handle very small deltaTime values', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            gameEngine.gameLoop(1000);
            gameEngine.gameLoop(1000.5); // 0.5ms later
            
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.0005, 6));
        });
        
        test('should handle high frame rates without issues', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            gameEngine.gameLoop(1000);
            
            // Simulate 120 FPS (8.33ms per frame)
            const frameTime = 8.33;
            for (let i = 1; i <= 5; i++) {
                gameEngine.gameLoop(1000 + (i * frameTime));
                expect(updateSpy).toHaveBeenLastCalledWith(expect.closeTo(frameTime / 1000, 5));
            }
        });
        
        test('should handle inconsistent frame times', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            gameEngine.gameLoop(1000); // First frame - uses 1/60
            gameEngine.gameLoop(1016); // 16ms (0.016s)
            gameEngine.gameLoop(1040); // 24ms (0.024s)
            gameEngine.gameLoop(1055); // 15ms (0.015s)
            
            // Each frame should get its correct deltaTime
            // First call is with 1/60, then subsequent calls with calculated deltaTime
            expect(updateSpy).toHaveBeenNthCalledWith(1, expect.closeTo(1/60, 3));
            expect(updateSpy).toHaveBeenNthCalledWith(2, expect.closeTo(0.016, 3));
            expect(updateSpy).toHaveBeenNthCalledWith(3, expect.closeTo(0.024, 3));
            expect(updateSpy).toHaveBeenNthCalledWith(4, expect.closeTo(0.015, 3));
        });
    });
    
    describe('GameLoop State Management', () => {
        test('should not run gameLoop when not in running state', () => {
            const updateSpy = jest.spyOn(gameEngine, 'update');
            const renderSpy = jest.spyOn(gameEngine, 'render');
            
            // Try to run gameLoop in ready state
            gameEngine.gameLoop(1000);
            expect(updateSpy).not.toHaveBeenCalled();
            expect(renderSpy).not.toHaveBeenCalled();
            
            // Try to run gameLoop in paused state
            gameEngine.gameState = 'paused';
            gameEngine.gameLoop(1000);
            expect(updateSpy).not.toHaveBeenCalled();
            expect(renderSpy).not.toHaveBeenCalled();
        });
        
        test('should always call render when in running state', () => {
            gameEngine.start();
            const renderSpy = jest.spyOn(gameEngine, 'render');
            
            // Even when update is skipped (first frame), render should be called
            gameEngine.gameLoop(1000);
            expect(renderSpy).toHaveBeenCalled();
            
            renderSpy.mockClear();
            
            // Normal frame should also call render
            gameEngine.gameLoop(1050);
            expect(renderSpy).toHaveBeenCalled();
        });
        
        test('should continue requesting animation frames', () => {
            // Clear any previous calls from beforeEach
            jest.clearAllMocks();
            
            // Manually set to running state instead of calling start() to avoid extra gameLoop call
            gameEngine.gameState = 'running';
            
            gameEngine.gameLoop(1000);
            expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
            
            gameEngine.gameLoop(1050);
            expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('Performance Characteristics', () => {
        test('should handle rapid pause/resume cycles', () => {
            gameEngine.start();
            gameEngine.battleStarted = true; // Force battle to be active
            
            for (let i = 0; i < 10; i++) {
                gameEngine.gameLoop(1000 + (i * 16.67));
                if (i % 3 === 0) {
                    gameEngine.pause();
                    gameEngine.resume();
                }
            }
            
            // Should not crash and should maintain reasonable battle time
            expect(gameEngine.battleTime).toBeGreaterThan(0);
            expect(gameEngine.battleTime).toBeLessThan(1); // Less than 1 second
            expect(gameEngine.gameState).toBe('running');
        });
        
        test('should maintain accuracy over many frames', () => {
            gameEngine.start();
            gameEngine.battleStarted = true; // Force battle to be active
            
            // Simulate 1 second of 60 FPS gameplay
            const frameTime = 16.6667; // 60 FPS
            const numFrames = 60;
            
            gameEngine.gameLoop(1000); // First frame
            
            for (let i = 1; i <= numFrames; i++) {
                gameEngine.gameLoop(1000 + (i * frameTime));
            }
            
            // Should be close to 1 second (allowing for small floating point errors)
            // First frame adds 1/60, then 60 frames of ~16.67ms each
            const expectedTime = 1/60 + 1.0;
            expect(gameEngine.battleTime).toBeCloseTo(expectedTime, 1);
        });
    });
});

module.exports = {};
