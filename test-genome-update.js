// Test script to verify genome update fix
// This simulates the scenario where genome values should update for both teams

// Mock DOM elements
const mockElements = {};
global.document = {
    getElementById: (id) => mockElements[id] || { textContent: '', style: {} }
};
global.window = {
    DEBUG_GENOME: false
};

// Mock evolution engine
global.evolution = {
    candidatePool: [
        {
            genome: [0.8, 0.6, 0.7, 0.5, 0.9, 0.4, 0.6, 0.7, 0.5],
            fitness: 0.75,
            generation: 1,
            team: 'red',
            battles: 5,
            wins: 3,
            id: 'red_test_1'
        },
        {
            genome: [0.4, 0.8, 0.9, 0.7, 0.6, 0.8, 0.5, 0.3, 0.7],
            fitness: 0.68,
            generation: 1,
            team: 'blue',
            battles: 5,
            wins: 2,
            id: 'blue_test_1'
        }
    ]
};

// Load the main.js file to get the functions
const fs = require('fs');
const mainContent = fs.readFileSync('./main.js', 'utf8');

// Extract the getBestGenomeForTeam function
const functionMatch = mainContent.match(/function getBestGenomeForTeam\(team\)[\s\S]*?(?=function [a-zA-Z]|$)/);
if (!functionMatch) {
    console.error('Could not find getBestGenomeForTeam function');
    process.exit(1);
}

// Extract the genomeCache definition
const cacheMatch = mainContent.match(/const genomeCache = \{[\s\S]*?\};/);
if (!cacheMatch) {
    console.error('Could not find genomeCache definition');
    process.exit(1);
}

console.log('Cache definition found:', cacheMatch[0].substring(0, 100) + '...');
console.log('Function definition found:', functionMatch[0].substring(0, 100) + '...');

// Evaluate the cache definition and functions
eval(cacheMatch[0]);
eval(functionMatch[0]);

console.log('🧬 Testing Genome Update Fix');
console.log('===========================');

// Test 1: Initial state - both teams should return their respective best genomes
console.log('\n1. Testing initial state:');
const redBest1 = getBestGenomeForTeam('red');
const blueBest1 = getBestGenomeForTeam('blue');

console.log('Red best:', redBest1 ? `Team: ${redBest1.team}, Fitness: ${redBest1.fitness}` : 'null');
console.log('Blue best:', blueBest1 ? `Team: ${blueBest1.team}, Fitness: ${blueBest1.fitness}` : 'null');

// Test 2: Simulate fitness update (this was the issue - fitness changes without pool size change)
console.log('\n2. Simulating fitness update (Red team improves):');
evolution.candidatePool[0].fitness = 0.85;
evolution.candidatePool[0].wins = 4;
evolution.candidatePool[0].battles = 6;

const redBest2 = getBestGenomeForTeam('red');
const blueBest2 = getBestGenomeForTeam('blue');

console.log('Red best after update:', redBest2 ? `Team: ${redBest2.team}, Fitness: ${redBest2.fitness}` : 'null');
console.log('Blue best after update:', blueBest2 ? `Team: ${blueBest2.team}, Fitness: ${blueBest2.fitness}` : 'null');

// Test 3: Simulate Blue team fitness update
console.log('\n3. Simulating Blue team fitness update:');
evolution.candidatePool[1].fitness = 0.78;
evolution.candidatePool[1].wins = 3;
evolution.candidatePool[1].battles = 6;

const redBest3 = getBestGenomeForTeam('red');
const blueBest3 = getBestGenomeForTeam('blue');

console.log('Red best after Blue update:', redBest3 ? `Team: ${redBest3.team}, Fitness: ${redBest3.fitness}` : 'null');
console.log('Blue best after Blue update:', blueBest3 ? `Team: ${blueBest3.team}, Fitness: ${blueBest3.fitness}` : 'null');

// Test 4: Verify cache is working but updates properly
console.log('\n4. Testing cache behavior:');
console.log('Cache state:', {
    lastPoolSize: genomeCache.lastPoolSize,
    hasRedBest: !!genomeCache.redBest,
    hasBlueBest: !!genomeCache.blueBest,
    lastChecksum: genomeCache.lastPoolChecksum
});

// Test 5: Add a small delay and test again (cache should be valid for same data)
console.log('\n5. Testing cache validity:');
const redBest4 = getBestGenomeForTeam('red');
const blueBest4 = getBestGenomeForTeam('blue');

console.log('Red best (cached):', redBest4 ? `Team: ${redBest4.team}, Fitness: ${redBest4.fitness}` : 'null');
console.log('Blue best (cached):', blueBest4 ? `Team: ${blueBest4.team}, Fitness: ${blueBest4.fitness}` : 'null');

// Verify the fix works
const fixWorking = redBest3?.fitness === 0.85 && blueBest3?.fitness === 0.78;
console.log('\n✅ Fix Status:', fixWorking ? 'WORKING' : 'FAILED');

if (fixWorking) {
    console.log('✅ Both Red and Blue Champion genome values are updating correctly!');
} else {
    console.log('❌ Genome update fix is not working properly.');
}
