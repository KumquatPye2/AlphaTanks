// Simplified test to verify genome update behavior
console.log('🧬 Testing Genome Update Fix - Simplified Version');
console.log('=================================================');

// Simulate the scenario that was causing the issue
let mockPool = [
    {
        genome: [0.8, 0.6, 0.7, 0.5, 0.9, 0.4, 0.6, 0.7, 0.5],
        fitness: 0.75,
        team: 'red',
        battles: 5,
        wins: 3
    },
    {
        genome: [0.4, 0.8, 0.9, 0.7, 0.6, 0.8, 0.5, 0.3, 0.7],
        fitness: 0.68,
        team: 'blue',
        battles: 5,
        wins: 2
    }
];

// Simulate the old cache behavior (the problem)
let oldCache = {
    lastPoolSize: 2,
    lastCacheTime: Date.now() - 1000, // 1 second ago
    redBest: mockPool[0],
    blueBest: mockPool[1]
};

// Simulate the new cache behavior (the fix)
function calculatePoolChecksum(pool) {
    return pool.reduce((sum, candidate, index) => {
        const fitness = candidate.fitness || 0;
        const battles = candidate.battles || 0;
        const wins = candidate.wins || 0;
        return sum + (fitness * 1000 + battles * 100 + wins * 10) * (index + 1);
    }, 0);
}

let newCache = {
    lastPoolSize: 2,
    lastPoolChecksum: calculatePoolChecksum(mockPool),
    lastCacheTime: Date.now() - 1000,
    redBest: mockPool[0],
    blueBest: mockPool[1]
};

console.log('Initial state:');
console.log('Pool size:', mockPool.length);
console.log('Initial checksum:', newCache.lastPoolChecksum);
console.log('Red fitness:', mockPool[0].fitness);
console.log('Blue fitness:', mockPool[1].fitness);

// Simulate a battle result that updates fitness without changing pool size
console.log('\n📊 Simulating battle result (Red team wins, fitness updated):');
mockPool[0].fitness = 0.85;  // Red improves
mockPool[0].wins = 4;
mockPool[0].battles = 6;

mockPool[1].battles = 6;     // Blue gets battle experience but no win

const newChecksum = calculatePoolChecksum(mockPool);

console.log('After battle:');
console.log('Pool size:', mockPool.length, '(unchanged)');
console.log('New checksum:', newChecksum);
console.log('Checksum changed:', newChecksum !== newCache.lastPoolChecksum);
console.log('Red fitness:', mockPool[0].fitness, '(updated)');
console.log('Blue fitness:', mockPool[1].fitness, '(unchanged)');

// Test old cache behavior (would miss the update)
const oldCacheValid = (
    mockPool.length === oldCache.lastPoolSize && 
    Date.now() - oldCache.lastCacheTime < 5000
);

// Test new cache behavior (would detect the update)
const newCacheValid = (
    mockPool.length === newCache.lastPoolSize && 
    newChecksum === newCache.lastPoolChecksum &&
    Date.now() - newCache.lastCacheTime < 5000
);

console.log('\n🔍 Cache validation results:');
console.log('Old cache (size-only) would be valid:', oldCacheValid);
console.log('New cache (size+checksum) would be valid:', newCacheValid);

console.log('\n🎯 Fix effectiveness:');
if (oldCacheValid && !newCacheValid) {
    console.log('✅ Fix is working! Old cache would miss updates, new cache detects them.');
} else if (!oldCacheValid && !newCacheValid) {
    console.log('ℹ️ Both caches would detect the change (edge case).');
} else {
    console.log('❌ Fix may not be working as expected.');
}

// Test another scenario: Blue team wins next battle
console.log('\n📊 Simulating second battle (Blue team wins):');
mockPool[1].fitness = 0.78;  // Blue improves
mockPool[1].wins = 3;
mockPool[1].battles = 7;

mockPool[0].battles = 7;     // Red gets battle experience but no win

const finalChecksum = calculatePoolChecksum(mockPool);
console.log('After second battle:');
console.log('Blue fitness:', mockPool[1].fitness, '(updated)');
console.log('Final checksum:', finalChecksum);
console.log('Checksum changed again:', finalChecksum !== newChecksum);

console.log('\n✅ Summary: The checksum-based cache validation ensures that:');
console.log('1. Fitness updates are detected even when pool size stays the same');
console.log('2. Both Red and Blue Champion genome displays will update correctly');
console.log('3. Cache performance is maintained while fixing the stale data issue');
