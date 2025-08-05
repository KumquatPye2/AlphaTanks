// Debug script to check class loading
// Check if scripts are accessible
setTimeout(() => {
    // List all available classes
    Object.getOwnPropertyNames(window).filter(name => 
        typeof window[name] === 'function' && 
        name[0] === name[0].toUpperCase()
    ).forEach(name => console.log(`  ${name}: ${typeof window[name]}`));
}, 1000);
