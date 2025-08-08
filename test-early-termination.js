// Test script for early battle termination feature
// This script tests that battles can end early when all tanks of one or both colors are destroyed

console.log('🧪 Testing Early Battle Termination Feature');

// Mock the necessary globals
global.window = {
    dispatchEvent: function(event) {
        console.log(`📡 Event dispatched: ${event.type}`, event.detail ? event.detail : '');
    }
};

// Import the Tank class first, then the game engine
const fs = require('fs');
const tankCode = fs.readFileSync('tank-ai.js', 'utf8');
const gameEngineCode = fs.readFileSync('game-engine.js', 'utf8');

// Create a test canvas element mock
const mockCanvas = {
    getContext: () => ({
        fillStyle: '',
        font: '',
        fillText: () => {},
        fillRect: () => {},
        strokeStyle: '',
        lineWidth: 0,
        strokeRect: () => {},
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        setLineDash: () => {}
    }),
    width: 800,
    height: 600
};

// Mock document.getElementById
global.document = {
    getElementById: (id) => {
        if (id === 'gameCanvas') {
            return mockCanvas;
        }
        return null;
    }
};

// Extract and evaluate the Tank class first
eval(tankCode);

// Extract and evaluate the GameEngine class
eval(gameEngineCode);

// Test 1: Normal win condition (red team eliminated)
console.log('\n🔴 Test 1: Red team eliminated - Blue should win');
const game1 = new GameEngine('gameCanvas');

// Mock teams with some tanks dead
game1.redTeam = [
    { isAlive: false },
    { isAlive: false }
];
game1.blueTeam = [
    { isAlive: true },
    { isAlive: true }
];

game1.battleStarted = true;
game1.battleTime = 5; // Less than minimum time, but should still end
game1.gameState = 'running';

console.log('Before checkWinConditions:', game1.gameState);
game1.checkWinConditions();
console.log('After checkWinConditions:', game1.gameState);

// Test 2: Blue team eliminated (red team wins)
console.log('\n🔵 Test 2: Blue team eliminated - Red should win');
const game2 = new GameEngine('gameCanvas');

game2.redTeam = [
    { isAlive: true },
    { isAlive: true }
];
game2.blueTeam = [
    { isAlive: false },
    { isAlive: false }
];

game2.battleStarted = true;
game2.battleTime = 8; // Less than minimum time, but should still end
game2.gameState = 'running';

console.log('Before checkWinConditions:', game2.gameState);
game2.checkWinConditions();
console.log('After checkWinConditions:', game2.gameState);

// Test 3: Both teams eliminated (draw)
console.log('\n⚖️ Test 3: Both teams eliminated - Should be draw');
const game3 = new GameEngine('gameCanvas');

game3.redTeam = [
    { isAlive: false },
    { isAlive: false }
];
game3.blueTeam = [
    { isAlive: false },
    { isAlive: false }
];

game3.battleStarted = true;
game3.battleTime = 3; // Very short battle
game3.gameState = 'running';

console.log('Before checkWinConditions:', game3.gameState);
game3.checkWinConditions();
console.log('After checkWinConditions:', game3.gameState);

// Test 4: Timeout scenario (should still respect minimum time)
console.log('\n⏰ Test 4: Timeout scenario - Should respect minimum time');
const game4 = new GameEngine('gameCanvas');

game4.redTeam = [
    { isAlive: true },
    { isAlive: true }
];
game4.blueTeam = [
    { isAlive: true },
    { isAlive: true }
];

game4.battleStarted = true;
game4.battleTime = 5; // Less than minimum time
game4.gameState = 'running';

console.log('Before endBattle(timeout):', game4.gameState);
game4.endBattle('timeout');
console.log('After endBattle(timeout):', game4.gameState);

// Test 5: Timeout after minimum time
console.log('\n⏰ Test 5: Timeout after minimum time - Should end');
const game5 = new GameEngine('gameCanvas');

game5.redTeam = [
    { isAlive: true },
    { isAlive: true }
];
game5.blueTeam = [
    { isAlive: true },
    { isAlive: true }
];

game5.battleStarted = true;
game5.battleTime = 20; // More than minimum time
game5.gameState = 'running';

console.log('Before endBattle(timeout):', game5.gameState);
game5.endBattle('timeout');
console.log('After endBattle(timeout):', game5.gameState);

console.log('\n✅ Early Termination Tests Complete!');
console.log('\nExpected Results:');
console.log('- Test 1: Game should end (blue wins)');
console.log('- Test 2: Game should end (red wins)'); 
console.log('- Test 3: Game should end (draw)');
console.log('- Test 4: Game should NOT end (timeout too early)');
console.log('- Test 5: Game should end (timeout after minimum time)');
