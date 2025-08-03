// Debug script to check class loading
console.log('🔍 Debug: Checking script loading...');

// Check if scripts are accessible
setTimeout(() => {
    console.log('🔍 Debug: After 1 second...');
    console.log('GameEngine:', typeof GameEngine);
    console.log('Tank:', typeof Tank);
    console.log('Projectile:', typeof Projectile);
    console.log('EvolutionEngine:', typeof EvolutionEngine);
    console.log('TankResearcher:', typeof TankResearcher);
    console.log('window.GameEngine:', typeof window.GameEngine);
    console.log('window.Tank:', typeof window.Tank);
    
    // List all available classes
    console.log('🔍 Available window properties:');
    Object.getOwnPropertyNames(window).filter(name => 
        typeof window[name] === 'function' && 
        name[0] === name[0].toUpperCase()
    ).forEach(name => console.log(`  ${name}: ${typeof window[name]}`));
}, 1000);
