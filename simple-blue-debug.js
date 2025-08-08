// Simple test to check if Blue team genome updates are working
// Paste this into the browser console after the game has loaded

console.log('🔍 Simple Blue Team Debug Test');
console.log('==============================');

// Check if evolution system exists
if (typeof evolution === 'undefined') {
    console.log('❌ Evolution system not found. Please wait for the page to load completely.');
} else {
    console.log('✅ Evolution system found');
    
    // Clear cache to force fresh lookup
    if (typeof genomeCache !== 'undefined') {
        genomeCache.lastPoolSize = 0;
        genomeCache.lastCacheTime = 0;
        genomeCache.lastPoolChecksum = null;
        genomeCache.redBest = null;
        genomeCache.blueBest = null;
        console.log('🧹 Cache cleared');
    }
    
    // Force update genome display
    if (typeof updateGenomeDisplay === 'function') {
        updateGenomeDisplay();
        console.log('🔄 Forced genome display update');
    }
    
    // Check DOM elements after update
    setTimeout(() => {
        console.log('\n📊 Current DOM Values:');
        
        const elements = [
            'redAggression', 'redSpeed', 'redAccuracy', 'redChampionFitness',
            'blueAggression', 'blueSpeed', 'blueAccuracy', 'blueChampionFitness'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            const value = element ? element.textContent : 'NOT FOUND';
            const team = id.startsWith('red') ? '🔴' : '🔵';
            console.log(`${team} ${id}: ${value}`);
        });
        
        // Check if values are actually different
        const redAgg = document.getElementById('redAggression')?.textContent;
        const blueAgg = document.getElementById('blueAggression')?.textContent;
        
        if (redAgg && blueAgg) {
            if (redAgg === blueAgg) {
                console.log('\n⚠️ WARNING: Red and Blue aggression values are identical!');
                console.log('This suggests they might be getting the same genome data.');
            } else {
                console.log('\n✅ Red and Blue aggression values are different - good!');
            }
        }
        
        // Show candidate pool info
        if (evolution.candidatePool) {
            console.log('\n📋 Candidate Pool Info:');
            console.log(`Total candidates: ${evolution.candidatePool.length}`);
            
            const redCount = evolution.candidatePool.filter(c => c.team === 'red').length;
            const blueCount = evolution.candidatePool.filter(c => c.team === 'blue').length;
            const unassignedCount = evolution.candidatePool.filter(c => !c.team).length;
            
            console.log(`🔴 Red candidates: ${redCount}`);
            console.log(`🔵 Blue candidates: ${blueCount}`);
            console.log(`❓ Unassigned candidates: ${unassignedCount}`);
            
            if (blueCount === 0) {
                console.log('\n🚨 ISSUE FOUND: No Blue team candidates in pool!');
                console.log('This explains why Blue team genome values are not updating.');
            }
        }
    }, 100);
}

console.log('\n📝 Instructions:');
console.log('1. If Blue team has no candidates, start evolution to generate some');
console.log('2. If values are identical, there may be a selection bias issue');
console.log('3. Run this script again after starting evolution to see changes');
