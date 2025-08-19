// Unit tests for GameEngine pause/resume functionality

// Since game-engine.js uses window exports, we need to simulate that environment
// Mock DOM elements for testing
global.document = {
    getElementById: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillStyle: '',
            font: '',
            fillRect: jest.fn(),
            fillText: jest.fn(),
            strokeStyle: '',
            lineWidth: 0,
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            strokeRect: jest.fn(),
            imageSmoothingEnabled: false
        })),
        width: 800,
        height: 600,
        parentElement: {
            clientWidth: 800,
            clientHeight: 600
        }
    }))
};

// Mock window and requestAnimationFrame
global.window = {
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    GameEngine: undefined, // Will be set after loading
    Obstacle: undefined,
    Projectile: undefined // Will be set after defining mock
};

global.requestAnimationFrame = jest.fn();

// Mock Tank class
global.Tank = class Tank {
    constructor(x, y, team, genome) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.genome = genome;
        this.isAlive = true;
        this.width = 20;
        this.height = 20;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.survivalTime = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
    }
    
    update() {}
    render() {}
    takeDamage() {}
};

// Mock Projectile class
global.Projectile = class Projectile {
    constructor(x, y, dx, dy, owner) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.owner = owner;
        this.isActive = true;
    }
    
    update() {}
    render() {}
};

// Set global references for the game engine
global.window.Projectile = global.Projectile;

// Mock Hill class
global.Hill = class Hill {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.controlPoints = { red: 0, blue: 0 };
    }
};

// Load the game engine file (it will set window.GameEngine)
require('../game-engine.js');
const GameEngine = global.window.GameEngine;

describe('GameEngine Pause/Resume Functionality', () => {
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
        gameEngine.initializeBattle(3, 3);
    });
    
    describe('State Management', () => {
        test('should initialize in ready state', () => {
            expect(gameEngine.gameState).toBe('ready');
            expect(gameEngine.battleTime).toBe(0);
            expect(gameEngine.lastTime).toBe(0);
        });
        
        test('should transition to running state on start', () => {
            gameEngine.start();
            expect(gameEngine.gameState).toBe('running');
            expect(gameEngine.battleTime).toBe(0);
            expect(gameEngine.lastTime).toBe(0);
        });
        
        test('should transition to paused state on pause', () => {
            gameEngine.start();
            gameEngine.battleTime = 15.7; // Simulate some battle time
            gameEngine.pause();
            
            expect(gameEngine.gameState).toBe('paused');
            expect(gameEngine.battleTime).toBe(15.7); // Should preserve battle time
        });
        
        test('should transition back to running state on resume', () => {
            gameEngine.start();
            gameEngine.battleTime = 15.7;
            gameEngine.pause();
            gameEngine.resume();
            
            expect(gameEngine.gameState).toBe('running');
            expect(gameEngine.battleTime).toBe(15.7); // Should preserve battle time
            expect(gameEngine.lastTime).toBe(0); // Should reset timing
        });
    });
    
    describe('Battle Time Management', () => {
        test('should reset battle time on new battle start', () => {
            gameEngine.battleTime = 25.3; // Previous battle time
            gameEngine.start();
            
            expect(gameEngine.battleTime).toBe(0);
        });
        
        test('should preserve battle time on resume', () => {
            gameEngine.start();
            gameEngine.battleTime = 42.8;
            gameEngine.pause();
            
            const preservedTime = gameEngine.battleTime;
            gameEngine.resume();
            
            expect(gameEngine.battleTime).toBe(preservedTime);
        });
        
        test('should handle multiple pause/resume cycles', () => {
            gameEngine.start();
            
            // First pause/resume cycle
            gameEngine.battleTime = 10.5;
            gameEngine.pause();
            gameEngine.resume();
            expect(gameEngine.battleTime).toBe(10.5);
            
            // Second pause/resume cycle
            gameEngine.battleTime = 23.7;
            gameEngine.pause();
            gameEngine.resume();
            expect(gameEngine.battleTime).toBe(23.7);
        });
    });
    
    describe('Tank State Preservation', () => {
        test('should preserve tank positions on pause/resume', () => {
            gameEngine.start();
            
            // Record initial tank positions
            const initialPositions = gameEngine.tanks.map(tank => ({
                x: tank.x,
                y: tank.y,
                team: tank.team
            }));
            
            gameEngine.pause();
            gameEngine.resume();
            
            // Verify positions are preserved
            gameEngine.tanks.forEach((tank, index) => {
                expect(tank.x).toBe(initialPositions[index].x);
                expect(tank.y).toBe(initialPositions[index].y);
                expect(tank.team).toBe(initialPositions[index].team);
            });
        });
        
        test('should preserve tank genomes on pause/resume', () => {
            gameEngine.start();
            
            // Record initial tank genomes
            const initialGenomes = gameEngine.tanks.map(tank => [...tank.genome]);
            
            gameEngine.pause();
            gameEngine.resume();
            
            // Verify genomes are preserved
            gameEngine.tanks.forEach((tank, index) => {
                expect(tank.genome).toEqual(initialGenomes[index]);
            });
        });
        
        test('should preserve team composition on pause/resume', () => {
            gameEngine.start();
            
            const initialRedCount = gameEngine.redTeam.length;
            const initialBlueCount = gameEngine.blueTeam.length;
            
            gameEngine.pause();
            gameEngine.resume();
            
            expect(gameEngine.redTeam.length).toBe(initialRedCount);
            expect(gameEngine.blueTeam.length).toBe(initialBlueCount);
        });
    });
    
    describe('GameLoop Timing Logic', () => {
        test('should initialize lastTime on first frame', () => {
            gameEngine.start();
            gameEngine.gameLoop(1000); // First frame at 1000ms
            
            expect(gameEngine.lastTime).toBe(1000);
        });
        
        test('should calculate proper deltaTime on subsequent frames', () => {
            gameEngine.start();
            
            // First frame
            gameEngine.gameLoop(1000);
            expect(gameEngine.lastTime).toBe(1000);
            
            // Second frame
            const updateSpy = jest.spyOn(gameEngine, 'update');
            gameEngine.gameLoop(1016.67); // 16.67ms later
            
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.01667, 4));
            expect(gameEngine.lastTime).toBe(1016.67);
        });
        
        test('should skip updates for invalid deltaTime', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            // First frame
            gameEngine.gameLoop(1000);
            updateSpy.mockClear(); // Clear the first valid call
            
            // Frame with negative deltaTime (shouldn't happen but safety check)
            gameEngine.lastTime = 2000;
            gameEngine.gameLoop(1900);
            
            // Should not call update at all when deltaTime is invalid
            expect(updateSpy).not.toHaveBeenCalled();
        });
        
        test('should cap deltaTime to prevent large jumps', () => {
            gameEngine.start();
            const updateSpy = jest.spyOn(gameEngine, 'update');
            
            // First frame
            gameEngine.gameLoop(1000);
            
            // Frame with huge gap (4 seconds)
            gameEngine.gameLoop(5000);
            
            // Should cap deltaTime to 0.1 seconds
            expect(updateSpy).toHaveBeenCalledWith(0.1);
        });
    });
    
    describe('Resume Flag Integration', () => {
        test('should support resumedFromPause flag for external systems', () => {
            gameEngine.start();
            gameEngine.pause();
            
            // External system can set this flag
            gameEngine.resumedFromPause = true;
            gameEngine.resume();
            
            expect(gameEngine.resumedFromPause).toBe(true);
            expect(gameEngine.gameState).toBe('running');
        });
        
        test('should maintain resumedFromPause flag during resume', () => {
            gameEngine.start();
            gameEngine.battleTime = 30.2;
            gameEngine.pause();
            
            gameEngine.resumedFromPause = true;
            const preservedBattleTime = gameEngine.battleTime;
            
            gameEngine.resume();
            
            expect(gameEngine.resumedFromPause).toBe(true);
            expect(gameEngine.battleTime).toBe(preservedBattleTime);
        });
    });
    
    describe('Reset Functionality', () => {
        test('should reset all state properly', () => {
            gameEngine.start();
            gameEngine.battleTime = 45.6;
            gameEngine.lastTime = 5000;
            
            gameEngine.reset();
            
            expect(gameEngine.gameState).toBe('ready');
            expect(gameEngine.battleTime).toBe(0);
            expect(gameEngine.lastTime).toBe(0);
            expect(gameEngine.tanks).toHaveLength(0);
            expect(gameEngine.projectiles).toHaveLength(0);
            expect(gameEngine.redTeam).toHaveLength(0);
            expect(gameEngine.blueTeam).toHaveLength(0);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle pause when already paused', () => {
            gameEngine.start();
            gameEngine.battleTime = 12.3;
            gameEngine.pause();
            
            const battleTimeAfterFirstPause = gameEngine.battleTime;
            gameEngine.pause(); // Pause again
            
            expect(gameEngine.gameState).toBe('paused');
            expect(gameEngine.battleTime).toBe(battleTimeAfterFirstPause);
        });
        
        test('should handle resume when already running', () => {
            gameEngine.start();
            gameEngine.battleTime = 8.9;
            
            const battleTimeBeforeResume = gameEngine.battleTime;
            gameEngine.resume(); // Resume when already running
            
            expect(gameEngine.gameState).toBe('running');
            expect(gameEngine.battleTime).toBe(battleTimeBeforeResume);
        });
        
        test('should handle start after pause without resume', () => {
            gameEngine.start();
            gameEngine.battleTime = 33.7;
            gameEngine.pause();
            
            gameEngine.start(); // Start new battle
            
            expect(gameEngine.gameState).toBe('running');
            expect(gameEngine.battleTime).toBe(0); // Should reset for new battle
        });
    });
    
    describe('Integration with Game Systems', () => {
        test('should maintain tank count during pause/resume', () => {
            gameEngine.initializeBattle(5, 3);
            gameEngine.start();
            
            expect(gameEngine.tanks).toHaveLength(8);
            expect(gameEngine.redTeam).toHaveLength(5);
            expect(gameEngine.blueTeam).toHaveLength(3);
            
            gameEngine.pause();
            gameEngine.resume();
            
            expect(gameEngine.tanks).toHaveLength(8);
            expect(gameEngine.redTeam).toHaveLength(5);
            expect(gameEngine.blueTeam).toHaveLength(3);
        });
        
        test('should preserve projectiles array during pause/resume', () => {
            gameEngine.start();
            
            // Add some mock projectiles
            gameEngine.projectiles = [
                new global.Projectile(100, 200, 1, 1, null),
                new global.Projectile(300, 400, -1, -1, null)
            ];
            
            gameEngine.pause();
            gameEngine.resume();
            
            expect(gameEngine.projectiles).toHaveLength(2);
        });
    });
});

module.exports = {};
