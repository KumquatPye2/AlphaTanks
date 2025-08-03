// Main application bootstrap and initialization
let game;
let evolution;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing AlphaTanks ASI-ARCH System... [Cache Test: ' + new Date().getTime() + ']');
    console.log('📄 DOM Content Loaded event fired');
    console.log('📄 Document ready state:', document.readyState);
    
    // Check if canvas exists before creating GameEngine
    const canvas = document.getElementById('gameCanvas');
    console.log('🎯 Canvas element check:', canvas);
    
    if (!canvas) {
        console.error('❌ Canvas not found! Retrying in 100ms...');
        setTimeout(() => {
            const retryCanvas = document.getElementById('gameCanvas');
            console.log('🔄 Retry canvas check:', retryCanvas);
            if (retryCanvas) {
                initializeGame();
            } else {
                console.error('❌ Canvas still not found after retry');
            }
        }, 100);
        return;
    }
    
    initializeGame();
});

function initializeGame() {
    console.log('🎮 Starting game initialization...');
    
    // Initialize game engine
    game = new GameEngine('gameCanvas');
    window.game = game; // Make globally accessible
    
    // Initialize evolution engine
    evolution = new EvolutionEngine();
    window.evolution = evolution; // Make globally accessible
    
    // Setup UI event handlers
    setupEventHandlers();
    
    // Initialize first battle
    game.initializeBattle(3, 3);
    
    console.log('✅ AlphaTanks system ready!');
    
    // Auto-start if desired
    if (window.AUTO_START) {
        setTimeout(() => {
            startEvolution();
        }, 1000);
    }
}

function setupEventHandlers() {
    // Evolution control buttons
    document.getElementById('startEvolution').addEventListener('click', startEvolution);
    document.getElementById('pauseEvolution').addEventListener('click', pauseEvolution);
    document.getElementById('resetBattle').addEventListener('click', resetBattle);
    document.getElementById('fastMode').addEventListener('click', toggleFastMode);
    document.getElementById('creditsButton').addEventListener('click', showCredits);
    
    // Credits modal handlers
    const modal = document.getElementById('creditsModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', hideCredits);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideCredits();
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
    
    console.log('🎮 Event handlers setup complete');
}

    function startEvolution() {
        console.log('🧬 Starting evolution system...');
        
        // Start the game with main game loop using requestAnimationFrame
        game.start();
        
        // Start evolution
        evolution.startEvolution();
        
        // Update UI
        document.getElementById('startEvolution').disabled = true;
        document.getElementById('pauseEvolution').disabled = false;
        
        // Log start
        evolution.logEvolutionEvent('AlphaTanks evolution system started - Beginning autonomous tank AI development', 'system');
    }function pauseEvolution() {
    console.log('⏸️ Pausing evolution...');
    
    // Pause evolution
    evolution.pauseEvolution();
    
    // Pause game
    game.pause();
    
    // Update UI
    document.getElementById('startEvolution').disabled = false;
    document.getElementById('pauseEvolution').disabled = true;
}

function resetBattle() {
    console.log('🔄 Resetting battle...');
    
    // Reset evolution
    evolution.resetEvolution();
    
    // Reset game
    game.initializeBattle(3, 3);
    
    // Update UI
    document.getElementById('startEvolution').disabled = false;
    document.getElementById('pauseEvolution').disabled = true;
    
    evolution.logEvolutionEvent('System reset - Ready for new evolution cycle', 'system');
}

let fastModeEnabled = false;
function toggleFastMode() {
    fastModeEnabled = !fastModeEnabled;
    
    if (fastModeEnabled) {
        evolution.setEvolutionSpeed(3.0);
        game.maxBattleTime = 30; // Shorter battles
        document.getElementById('fastMode').textContent = 'Normal Mode';
        document.getElementById('fastMode').style.background = '#ffaa00';
    } else {
        evolution.setEvolutionSpeed(1.0);
        game.maxBattleTime = 120; // Normal battles
        document.getElementById('fastMode').textContent = 'Fast Mode';
        document.getElementById('fastMode').style.background = '#00ff88';
    }
    
    console.log(`🏃 Fast mode ${fastModeEnabled ? 'enabled' : 'disabled'}`);
}

function handleResize() {
    if (game) {
        game.setupCanvas();
    }
}

function handleKeydown(event) {
    switch(event.key) {
        case 'Escape':
            // Close credits modal if open
            const modal = document.getElementById('creditsModal');
            if (modal.style.display === 'block') {
                event.preventDefault();
                hideCredits();
            }
            break;
        case ' ': // Spacebar
            event.preventDefault();
            if (evolution.isEvolutionRunning) {
                pauseEvolution();
            } else {
                startEvolution();
            }
            break;
        case 'r':
        case 'R':
            event.preventDefault();
            resetBattle();
            break;
        case 'f':
        case 'F':
            event.preventDefault();
            toggleFastMode();
            break;
        case 'c':
        case 'C':
            event.preventDefault();
            showCredits();
            break;
        case 'd':
        case 'D':
            event.preventDefault();
            toggleDebugMode();
            break;
    }
}

function toggleDebugMode() {
    window.DEBUG = !window.DEBUG;
    console.log(`🐛 Debug mode ${window.DEBUG ? 'enabled' : 'disabled'}`);
    
    if (window.DEBUG) {
        evolution.logEvolutionEvent('Debug mode enabled - Additional tank AI information displayed', 'system');
    }
}

// Performance monitoring
function startPerformanceMonitoring() {
    setInterval(() => {
        const stats = {
            fps: calculateFPS(),
            tankCount: game ? game.tanks.length : 0,
            projectileCount: game ? game.projectiles.length : 0,
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
        };
        
        // Log performance issues (throttled to avoid spam)
        if (stats.fps < 30 && game && game.gameState === 'running') {
            if (!window.lastPerfWarning || Date.now() - window.lastPerfWarning > 5000) {
                console.warn(`⚠️ Performance warning: FPS dropped to ${stats.fps.toFixed(1)}`);
                window.lastPerfWarning = Date.now();
            }
        }
        
        // Update debug display if enabled
        if (window.DEBUG) {
            updateDebugDisplay(stats);
        }
    }, 2000);
}

let frameCount = 0;
let lastFPSTime = performance.now();

function calculateFPS() {
    const now = performance.now();
    frameCount++;
    
    if (now - lastFPSTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastFPSTime));
        frameCount = 0;
        lastFPSTime = now;
        return fps;
    }
    
    return 60; // Default assumption
}

function updateDebugDisplay(stats) {
    // Create debug overlay if it doesn't exist
    let debugPanel = document.getElementById('debugPanel');
    if (!debugPanel) {
        debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #00ff88;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 1px solid #00ff88;
            border-radius: 3px;
            z-index: 1000;
        `;
        document.body.appendChild(debugPanel);
    }
    
    debugPanel.innerHTML = `
        <div>FPS: ${stats.fps}</div>
        <div>Tanks: ${stats.tankCount}</div>
        <div>Projectiles: ${stats.projectileCount}</div>
        <div>Memory: ${stats.memoryUsage} MB</div>
        <div>Generation: ${evolution ? evolution.currentGeneration : 0}</div>
        <div>Experiments: ${evolution ? evolution.totalExperiments : 0}</div>
    `;
}

// Auto-start for demonstration
function enableAutoStart() {
    window.AUTO_START = true;
    console.log('🤖 Auto-start enabled - System will begin evolution automatically');
}

// Export for global access
window.startEvolution = startEvolution;
window.pauseEvolution = pauseEvolution;
window.resetBattle = resetBattle;
window.toggleFastMode = toggleFastMode;
window.toggleDebugMode = toggleDebugMode;
window.enableAutoStart = enableAutoStart;

// Start performance monitoring
startPerformanceMonitoring();

// Welcome message
console.log(`
🔬 AlphaTanks: ASI-ARCH Coevolution System
==========================================

Controls:
• SPACE: Start/Pause Evolution
• R: Reset Battle
• F: Toggle Fast Mode  
• D: Toggle Debug Mode

The system implements ASI-ARCH methodology:
✅ Researcher: Proposes new tank architectures
✅ Engineer: Evaluates performance in battle
✅ Analyst: Generates insights from results
✅ Cognition: Military tactics knowledge base

Watch as tank AI evolves autonomously, demonstrating
computational scaling of research breakthroughs!
`);

// Credits modal functions
function showCredits() {
    console.log('📚 Showing credits and attribution');
    const modal = document.getElementById('creditsModal');
    modal.style.display = 'block';
    
    // Add some animation
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.7)';
    
    setTimeout(() => {
        modalContent.style.transition = 'all 0.3s ease';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
}

function hideCredits() {
    console.log('📚 Hiding credits modal');
    const modal = document.getElementById('creditsModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.style.transition = 'all 0.2s ease';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.7)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modalContent.style.transition = '';
    }, 200);
}

// Demo data for initial showcase
window.DEMO_MODE = false;

// Demo mode functionality (can be called from console for testing)
window.enableDemoMode = function() {
    window.DEMO_MODE = true;
    window.AUTO_START = true;
    
    // Pre-populate some evolution history for demo
    setTimeout(() => {
        if (evolution) {
            evolution.logEvolutionEvent('Demo mode activated - Showcasing ASI-ARCH capabilities', 'system');
            evolution.logEvolutionEvent('Loading pre-trained tank architectures...', 'initialization');
            evolution.logEvolutionEvent('Defensive formation strategy discovered', 'discovery');
            evolution.logEvolutionEvent('Flanking behavior emerged in Generation 2', 'discovery');
            evolution.logEvolutionEvent('High-accuracy targeting pattern identified', 'fitness');
        }
    }, 500);
}

// Call enableDemoMode() to showcase the system
// enableDemoMode();
