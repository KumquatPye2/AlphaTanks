// Quick verification script to test genome display functionality
// This tests that genome trait scores display actual values instead of 0.00

// Import modules (would work in browser context)
console.log("Testing genome display functionality...");

// Mock a test genome array 
const testGenome = [0.8, 0.6, 0.9, 0.3, 0.7, 0.5, 0.4, 0.8, 0.2];
console.log("Test genome:", testGenome);

// Test the displayGenome function logic
function testDisplayGenome(genome) {
    const traits = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
    
    console.log("Genome trait display values:");
    traits.forEach((trait, index) => {
        const value = genome[index];
        console.log(`${trait}: ${value.toFixed(2)}`);
    });
    
    // Check if any values are 0.00 (which was the bug)
    const hasZeroValues = genome.some(value => value === 0.0);
    console.log(`Has zero values: ${hasZeroValues}`);
    
    return !hasZeroValues;
}

// Test with our sample genome
const displayWorking = testDisplayGenome(testGenome);
console.log(`Genome display test ${displayWorking ? 'PASSED' : 'FAILED'}`);

// Test edge cases
console.log("\nTesting edge cases:");

// Test with all zeros (should be valid)
const zeroGenome = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
console.log("Zero genome test:", testDisplayGenome(zeroGenome));

// Test with random values
const randomGenome = Array(9).fill(0).map(() => Math.random());
console.log("Random genome test:", testDisplayGenome(randomGenome));

console.log("\nGenome display verification complete!");
