// Debug script to check genome update status in the browser
// Run this in the browser console

console.log('🔍 Debugging Genome Update Issue');
console.log('================================');

// Check if evolution system is available
if (typeof evolution !== 'undefined' && evolution.candidatePool) {
    console.log('Evolution system found with', evolution.candidatePool.length, 'candidates');
    
    // Show candidate pool by team
    const redCandidates = evolution.candidatePool.filter(c => c.team === 'red');
    const blueCandidates = evolution.candidatePool.filter(c => c.team === 'blue');
    
    console.log('\n🔴 Red candidates:', redCandidates.length);
    redCandidates.forEach((c, i) => {
        console.log(`  ${i}: Fitness=${c.fitness?.toFixed(3)}, Battles=${c.battles}, Wins=${c.wins}`);
    });
    
    console.log('\n🔵 Blue candidates:', blueCandidates.length);
    blueCandidates.forEach((c, i) => {
        console.log(`  ${i}: Fitness=${c.fitness?.toFixed(3)}, Battles=${c.battles}, Wins=${c.wins}`);
    });
    
    // Test the getBestGenomeForTeam function
    if (typeof getBestGenomeForTeam === 'function') {
        console.log('\n🧬 Testing getBestGenomeForTeam:');
        
        const redBest = getBestGenomeForTeam('red');
        const blueBest = getBestGenomeForTeam('blue');
        
        console.log('Red best:', redBest ? {
            team: redBest.team,
            fitness: redBest.fitness?.toFixed(3),
            battles: redBest.battles,
            wins: redBest.wins,
            genome: redBest.genome?.slice(0, 3).map(v => v.toFixed(2)) + '...'
        } : 'null');
        
        console.log('Blue best:', blueBest ? {
            team: blueBest.team,
            fitness: blueBest.fitness?.toFixed(3),
            battles: blueBest.battles,
            wins: blueBest.wins,
            genome: blueBest.genome?.slice(0, 3).map(v => v.toFixed(2)) + '...'
        } : 'null');
        
        // Check cache state
        if (typeof genomeCache !== 'undefined') {
            console.log('\n💾 Cache state:');
            console.log('  Pool size:', genomeCache.lastPoolSize);
            console.log('  Checksum:', genomeCache.lastPoolChecksum);
            console.log('  Has red cached:', !!genomeCache.redBest);
            console.log('  Has blue cached:', !!genomeCache.blueBest);
            console.log('  Cache age:', Date.now() - genomeCache.lastCacheTime, 'ms');
        }
    } else {
        console.log('❌ getBestGenomeForTeam function not found');
    }
    
    // Check DOM elements
    console.log('\n🎯 DOM Elements Check:');
    const redElements = ['redAggression', 'redSpeed', 'redAccuracy'];
    const blueElements = ['blueAggression', 'blueSpeed', 'blueAccuracy'];
    
    redElements.forEach(id => {
        const el = document.getElementById(id);
        console.log(`  ${id}:`, el ? el.textContent : 'NOT FOUND');
    });
    
    blueElements.forEach(id => {
        const el = document.getElementById(id);
        console.log(`  ${id}:`, el ? el.textContent : 'NOT FOUND');
    });
    
} else {
    console.log('❌ Evolution system not found or no candidate pool');
}

// Instructions
console.log('\n📋 To test the fix:');
console.log('1. Start evolution or run some battles');
console.log('2. Run this script again to see updated values');
console.log('3. Both red and blue genome values should change');
