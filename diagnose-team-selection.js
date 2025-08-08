// Diagnostic script to test Blue vs Red genome selection
console.log('🔍 Diagnosing Blue vs Red Team Genome Selection');
console.log('=============================================');

// Test the specific scenario where Blue team gets different treatment
const mockCandidatePool = [
    {
        genome: [0.8, 0.6, 0.7, 0.5, 0.9, 0.4, 0.6, 0.7, 0.5], // High aggression (0.8)
        fitness: 0.85,
        team: 'red',
        battles: 6,
        wins: 4,
        id: 'red_1'
    },
    {
        genome: [0.4, 0.8, 0.9, 0.7, 0.6, 0.8, 0.5, 0.3, 0.7], // Low aggression (0.4), high teamwork (0.6)
        fitness: 0.78,
        team: 'blue', 
        battles: 6,
        wins: 3,
        id: 'blue_1'
    }
];

console.log('\n📊 Mock Candidate Pool:');
mockCandidatePool.forEach((candidate, i) => {
    const genome = candidate.genome;
    console.log(`Candidate ${i + 1} (${candidate.team}):`);
    console.log(`  Aggression: ${genome[0]}, Teamwork: ${genome[4]}, Defense: ${genome[3]}`);
    console.log(`  Fitness: ${candidate.fitness}, Team: ${candidate.team}`);
});

// Test trait-based selection logic
console.log('\n🎯 Testing Trait-Based Selection Logic:');

function testTraitSelection(team, candidates) {
    console.log(`\nTesting ${team} team selection:`);
    
    for (const candidate of candidates) {
        const genome = candidate.genome;
        const aggression = genome[0] || 0;
        const teamwork = genome[4] || 0;
        const defense = genome[3] || 0;
        
        console.log(`  Candidate ${candidate.id}: Aggression=${aggression}, Teamwork=${teamwork}, Defense=${defense}`);
        
        // Apply the selection logic from the main code
        if (team === 'red' && aggression > 0.3) {
            console.log(`  ✅ ${team} would select this candidate (aggression > 0.3)`);
            return candidate;
        } else if (team === 'blue' && (teamwork > 0.3 || defense > 0.3)) {
            console.log(`  ✅ ${team} would select this candidate (teamwork > 0.3 OR defense > 0.3)`);
            return candidate;
        } else {
            console.log(`  ❌ ${team} would NOT select this candidate`);
        }
    }
    
    console.log(`  🔄 ${team} team falls back to general selection`);
    return null;
}

const redSelection = testTraitSelection('red', mockCandidatePool);
const blueSelection = testTraitSelection('blue', mockCandidatePool);

console.log('\n📈 Selection Results:');
console.log('Red team selected:', redSelection ? `${redSelection.id} (fitness: ${redSelection.fitness})` : 'none');
console.log('Blue team selected:', blueSelection ? `${blueSelection.id} (fitness: ${blueSelection.fitness})` : 'none');

// Test fallback logic
console.log('\n🔄 Testing Fallback Logic:');
console.log('If no trait-based matches, fallback assignment:');

// Sort by fitness (as the code does)
const sortedCandidates = [...mockCandidatePool].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
console.log('Candidates sorted by fitness:');
sortedCandidates.forEach((c, i) => {
    console.log(`  ${i}: ${c.id} (fitness: ${c.fitness})`);
});

console.log('\nFallback assignments:');
if (sortedCandidates.length > 0) {
    console.log('Red team gets:', sortedCandidates[0].id, '(first/best)');
    if (sortedCandidates.length > 1) {
        console.log('Blue team gets:', sortedCandidates[1].id, '(second-best)');
    } else {
        console.log('Blue team gets: NOTHING (only 1 candidate available)');
    }
}

console.log('\n🚨 Potential Issues Identified:');
console.log('1. Red team gets first priority in trait selection');
console.log('2. Blue team requires specific traits (teamwork OR defense > 0.3)');
console.log('3. Red team only needs aggression > 0.3 (more lenient)');
console.log('4. In fallback, Red gets best candidate, Blue gets second-best');
console.log('5. If only 1 candidate exists, Blue team gets nothing in original code');

console.log('\n✅ Our fixes should address issues #4 and #5');
