// Debug helper script - paste this into browser console
// This will enable debugging and show what's happening with genome updates

console.log('🔧 Enabling Genome Debug Mode');

// Enable debug logging
window.DEBUG_GENOME = true;

// Helper function to show current genome state
function showGenomeState() {
    console.log('\n📊 Current Genome State:');
    console.log('========================');
    
    if (typeof evolution !== 'undefined' && evolution.candidatePool) {
        console.log('Candidate pool size:', evolution.candidatePool.length);
        
        const redCandidates = evolution.candidatePool.filter(c => c.team === 'red');
        const blueCandidates = evolution.candidatePool.filter(c => c.team === 'blue');
        
        console.log('\n🔴 Red candidates:', redCandidates.length);
        redCandidates.forEach((c, i) => {
            console.log(`  ${i}: ID=${c.id || 'unknown'}, Fitness=${c.fitness?.toFixed(3)}, Battles=${c.battles}, Wins=${c.wins}`);
        });
        
        console.log('\n🔵 Blue candidates:', blueCandidates.length);
        blueCandidates.forEach((c, i) => {
            console.log(`  ${i}: ID=${c.id || 'unknown'}, Fitness=${c.fitness?.toFixed(3)}, Battles=${c.battles}, Wins=${c.wins}`);
        });
        
        // Test getBestGenomeForTeam for both teams
        if (typeof getBestGenomeForTeam === 'function') {
            console.log('\n🧬 Testing getBestGenomeForTeam:');
            
            console.log('\n--- Red Team Selection ---');
            const redBest = getBestGenomeForTeam('red');
            console.log('Red result:', redBest ? {
                id: redBest.id,
                team: redBest.team,
                fitness: redBest.fitness?.toFixed(3),
                battles: redBest.battles,
                wins: redBest.wins
            } : 'null');
            
            console.log('\n--- Blue Team Selection ---');
            const blueBest = getBestGenomeForTeam('blue');
            console.log('Blue result:', blueBest ? {
                id: blueBest.id,
                team: blueBest.team,
                fitness: blueBest.fitness?.toFixed(3),
                battles: blueBest.battles,
                wins: blueBest.wins
            } : 'null');
        } else {
            console.log('❌ getBestGenomeForTeam function not found');
        }
        
        // Check DOM elements
        console.log('\n🎯 Current DOM Values:');
        const redAggression = document.getElementById('redAggression');
        const blueAggression = document.getElementById('blueAggression');
        const redFitness = document.getElementById('redChampionFitness');
        const blueFitness = document.getElementById('blueChampionFitness');
        
        console.log('Red Aggression:', redAggression?.textContent || 'NOT FOUND');
        console.log('Blue Aggression:', blueAggression?.textContent || 'NOT FOUND');
        console.log('Red Fitness:', redFitness?.textContent || 'NOT FOUND');
        console.log('Blue Fitness:', blueFitness?.textContent || 'NOT FOUND');
        
    } else {
        console.log('❌ Evolution system not found');
    }
}

// Helper function to force genome display update
function forceGenomeUpdate() {
    console.log('\n🔄 Forcing genome display update...');
    if (typeof updateGenomeDisplay === 'function') {
        updateGenomeDisplay();
        console.log('✅ updateGenomeDisplay() called');
    } else {
        console.log('❌ updateGenomeDisplay function not found');
    }
}

// Show initial state
showGenomeState();

// Expose helper functions
window.showGenomeState = showGenomeState;
window.forceGenomeUpdate = forceGenomeUpdate;

console.log('\n📝 Available commands:');
console.log('- showGenomeState() - Show current genome data');
console.log('- forceGenomeUpdate() - Force genome display update');
console.log('- Start evolution to see debug output');

console.log('\n✅ Debug mode enabled. Start evolution to see detailed logs.');
