// Main application bootstrap and initialization
let game;
let evolution;

document.addEventListener('DOMContentLoaded', function() {
    // Check if canvas exists before creating GameEngine
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('❌ Canvas not found! Retrying in 100ms...');
        setTimeout(() => {
            const retryCanvas = document.getElementById('gameCanvas');
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
    // Initialize game engine
    game = new GameEngine('gameCanvas');
    window.game = game; // Make globally accessible
    
    // Initialize evolution engine
    evolution = new EvolutionEngine();
    window.evolution = evolution; // Make globally accessible
    
    // Initialize researcher insights with new modular system
    if (typeof ResearcherInsights !== 'undefined') {
        // Clean up any existing instance first
        if (window.researcherInsights) {
            if (typeof window.researcherInsights.destroy === 'function') {
                window.researcherInsights.destroy();
            }
            
            // Remove existing dashboard if it exists
            const existingDashboard = document.getElementById('researcher-insights-dashboard');
            if (existingDashboard) {
                existingDashboard.remove();
            }
        }
        
        // Create new instance using the refactored modular system
        window.researcherInsights = new ResearcherInsights();
        
        // Also ensure backward compatibility by making components available globally
        window.dataCollector = window.researcherInsights.dataCollector;
        window.dashboardUI = window.researcherInsights.dashboardUI;
        
        // Now initialize the candidate pool since ResearcherInsights is available
        if (evolution && !evolution.candidatePoolInitialized) {
            evolution.ensureCandidatePoolInitialized();
        }
        
    } else {
        console.warn('🔬 ResearcherInsights class not available');
    }
    
    // Setup UI event handlers
    setupEventHandlers();
    
    // Initialize first battle
    game.initializeBattle(3, 3);
    
    // Force update genome display immediately
    setTimeout(() => {
        updateGenomeDisplay();
    }, 100);
    
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
    document.getElementById('researcherInsightsButton').addEventListener('click', openResearcherInsights);
    document.getElementById('engineerInsightsButton').addEventListener('click', openEngineerInsights);
    document.getElementById('analystInsightsButton').addEventListener('click', openAnalystInsights);
    document.getElementById('cognitionInsightsButton').addEventListener('click', openCognitionInsights);
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
    
    // Battle end handler
    window.addEventListener('battleEnd', (event) => {
        if (game) {
            game.resumedFromPause = false; // Clear resume flag when battle ends
        }
        
        // Track knowledge searches in cognition insights after each battle
        if (window.cognitionInsights && event.detail) {
            const battleResult = event.detail;
            
            // Search for tactics based on battle outcome
            if (battleResult.winner === 'red') {
                window.cognitionInsights.trackKnowledgeSearch('red_victory_tactics', 2);
            } else if (battleResult.winner === 'blue') {
                window.cognitionInsights.trackKnowledgeSearch('blue_victory_tactics', 2);
            } else {
                window.cognitionInsights.trackKnowledgeSearch('defensive_stalemate_tactics', 1);
            }
            
            // Search for counter-tactics based on battle duration
            if (battleResult.duration > 30) {
                window.cognitionInsights.trackKnowledgeSearch('prolonged_battle_analysis', 3);
            }
            
            // Track cognitive adaptations based on battle outcome
            if (battleResult.winner) {
                // Teams adapt their strategies after each battle
                window.cognitionInsights.trackCognitiveAdaptation();
                
                // Additional adaptation for decisive victories (short battles)
                if (battleResult.duration < 15) {
                    window.cognitionInsights.trackCognitiveAdaptation();
                }
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
}

    function startEvolution() {
        // Check current game state and respond accordingly
        if (game.gameState === 'paused') {
            // Resume from pause - don't start new evolution experiment, just resume current battle
            game.resume();
            game.resumedFromPause = true; // Flag to prevent genome selection
            evolution.isEvolutionRunning = true; // Resume evolution tracking
            evolution.logEvolutionEvent('AlphaTanks evolution system resumed', 'system');
            
            // Clear the resumedFromPause flag after 5 seconds to allow normal genome display
            setTimeout(() => {
                if (game) {
                    game.resumedFromPause = false;
                }
            }, 5000);
            
        } else if (game.gameState === 'ready' || game.gameState === 'ended') {
            // Start fresh battle and evolution
            game.resumedFromPause = false; // Clear flag for fresh start
            
            // Clear genome cache so we get fresh data for new battle
            genomeCache.lastPoolSize = 0;
            genomeCache.lastCacheTime = 0;
            genomeCache.redBest = null;
            genomeCache.blueBest = null;
            
            game.start();
            evolution.startEvolution(); // This will start new experiments
            
            // Track knowledge search for battle preparation
            if (window.cognitionInsights) {
                const battleQueries = [
                    'pre_battle_reconnaissance',
                    'tactical_formation_analysis', 
                    'enemy_pattern_assessment'
                ];
                const randomQuery = battleQueries[Math.floor(Math.random() * battleQueries.length)];
                window.cognitionInsights.trackKnowledgeSearch(randomQuery, Math.floor(Math.random() * 3) + 1);
                
                // Track cognitive adaptations for battle preparation
                window.cognitionInsights.trackCognitiveAdaptation();
            }
            
            // Update genome display immediately for new battle (but don't spam it)
            setTimeout(() => {
                updateGenomeDisplay();
            }, 1000);
        } else if (game.gameState === 'running') {
            // Already running, no action needed
            return;
        }
        
        // Update UI
        document.getElementById('startEvolution').disabled = true;
        document.getElementById('pauseEvolution').disabled = false;
        
        // Log start/resume
        if (game.gameState === 'running') {
            evolution.logEvolutionEvent('AlphaTanks evolution system resumed', 'system');
        }
    }function pauseEvolution() {
    // Pause evolution
    evolution.pauseEvolution();
    
    // Pause game
    game.pause();
    game.resumedFromPause = false; // Clear resume flag when pausing
    
    // Update UI
    document.getElementById('startEvolution').disabled = false;
    document.getElementById('pauseEvolution').disabled = true;
}

function resetBattle() {
    // Reset evolution
    evolution.resetEvolution();
    
    // Reset game state first
    game.reset();
    
    // Then initialize new battle (this sets state to 'ready')
    game.initializeBattle(3, 3);
    
    // Update UI - reset button should enable start button
    document.getElementById('startEvolution').disabled = false;
    document.getElementById('pauseEvolution').disabled = true;
    
    evolution.logEvolutionEvent('System reset - Ready for new evolution cycle', 'system');
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
        
        // Only update genome display if game is not actively running a battle
        // AND reduce frequency during gameplay to improve performance
        if ((!game || game.gameState !== 'running') && (!game || !game.initializationComplete)) {
            updateGenomeDisplay();
        } else if (game && game.gameState === 'running') {
            // During battles, only update genome display every 10 seconds to reduce load
            if (!window.lastGenomeUpdate || Date.now() - window.lastGenomeUpdate > 10000) {
                updateGenomeDisplay();
                window.lastGenomeUpdate = Date.now();
            }
        }
        
        // Log performance issues (throttled to avoid spam)
        if (stats.fps < 30 && game && game.gameState === 'running') {
            if (!window.lastPerfWarning || Date.now() - window.lastPerfWarning > 10000) {
                console.warn(`⚠️ Performance warning: FPS dropped to ${stats.fps.toFixed(1)}`);
                window.lastPerfWarning = Date.now();
            }
        }
        
        // Update debug display if enabled
        if (window.DEBUG) {
            updateDebugDisplay(stats);
        }
    }, 5000); // Reduced frequency from 2s to 5s to improve performance
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
}

// Export for global access
window.startEvolution = startEvolution;
window.pauseEvolution = pauseEvolution;
window.resetBattle = resetBattle;
window.toggleDebugMode = toggleDebugMode;
window.enableAutoStart = enableAutoStart;

// Start performance monitoring
startPerformanceMonitoring();

// Researcher Insights function - now toggleable
function openResearcherInsights() {
    // Initialize basic tracking only once (no test data)
    if (window.researcherInsights && !window.researcherInsights.testDataInitialized) {
        // Mark as initialized without adding test data
        window.researcherInsights.testDataInitialized = true;
    }
    
    // Always toggle the dashboard
    if (window.researcherInsights) {
        window.researcherInsights.toggle();
    } else {
        console.warn('🔬 Researcher insights not initialized');
    }
}

function openEngineerInsights() {
    // Always toggle the dashboard
    if (window.engineerInsights) {
        window.engineerInsights.toggle();
    } else {
        console.warn('⚙️ Engineer insights not initialized');
    }
}

function openAnalystInsights() {
    // Always toggle the dashboard
    if (window.analystInsights) {
        window.analystInsights.toggle();
    } else {
        console.warn('📊 Analyst insights not initialized');
    }
}

function openCognitionInsights() {
    // Always toggle the dashboard
    if (window.cognitionInsights) {
        window.cognitionInsights.toggle();
    } else {
        console.warn('🧠 Cognition insights not initialized');
    }
}

// Helper function to clear test data (for debugging)
function _clearResearcherTestData() {
    if (window.researcherInsights) {
        window.researcherInsights.clearGenerationData();
    } else {
        console.warn('🔬 Researcher insights not available');
    }
}

// Make it available globally for console debugging
window.clearResearcherTestData = _clearResearcherTestData;

// Credits modal functions
function showCredits() {
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

// Genome display functionality
// NOTE: Team selection logic is tested in tests/blue-team-core.test.js
function updateGenomeDisplay() {
    // If we recently resumed from pause and tanks exist, show current tank genomes
    if (game && game.tanks && game.tanks.length > 0 && game.resumedFromPause) {
        displayCurrentTankGenomes();
        return;
    }

    // If game is paused, show genomes of current tanks instead of selecting new ones
    if (game && game.gameState === 'paused' && game.tanks && game.tanks.length > 0) {
        displayCurrentTankGenomes();
        return;
    }

    if (!evolution || !evolution.candidatePool || evolution.candidatePool.length === 0) {
        // Show "waiting for evolution" state
        displayNoGenomeData();
        return;
    }

    try {
        // Get best performing genomes for each team
        const redBest = getBestGenomeForTeam('red');
        const blueBest = getBestGenomeForTeam('blue');
        
        if (redBest && redBest.genome) {
            // Check if this is a real battle-earned fitness or just initial placeholder
            const hasRealFitness = (redBest.battles && redBest.battles > 0) || !redBest.isInitial;
            if (hasRealFitness && typeof redBest.fitness === 'number') {
                displayGenome('red', redBest.genome, redBest.fitness);
            } else {
                // Show genome traits but indicate fitness is still evolving
                displayGenomeWithEvolvingFitness('red', redBest.genome);
            }
        } else {
            displayNoGenomeDataForTeam('red');
        }
        
        if (blueBest && blueBest.genome) {
            // Check if this is a real battle-earned fitness or just initial placeholder
            const hasRealFitness = (blueBest.battles && blueBest.battles > 0) || !blueBest.isInitial;
            if (hasRealFitness && typeof blueBest.fitness === 'number') {
                displayGenome('blue', blueBest.genome, blueBest.fitness);
            } else {
                // Show genome traits but indicate fitness is still evolving
                displayGenomeWithEvolvingFitness('blue', blueBest.genome);
            }
        } else {
            // EMERGENCY FALLBACK: If Blue team has no champion, ensure it gets one
            console.warn(`🧬 Emergency fallback: Blue team has no champion, creating one...`);
            
            // If Red has a champion, create a Blue variant
            if (redBest && redBest.genome) {
                // Create a Blue team variant by modifying Red's genome slightly
                const blueGenome = Array.isArray(redBest.genome) ? [...redBest.genome] : { ...redBest.genome };
                
                // Slightly modify some traits to differentiate Blue from Red
                if (Array.isArray(blueGenome)) {
                    // Array format: [aggression, speed, accuracy, defense, teamwork, adaptability, learning, riskTaking, evasion]
                    blueGenome[0] = Math.max(0, Math.min(1, (blueGenome[0] || 0.5) * 0.9)); // Slightly less aggressive
                    blueGenome[1] = Math.max(0, Math.min(1, (blueGenome[1] || 0.5) * 1.1)); // Slightly faster
                    blueGenome[3] = Math.max(0, Math.min(1, (blueGenome[3] || 0.5) * 1.1)); // More defensive
                } else {
                    // Object format
                    blueGenome.aggression = Math.max(0, Math.min(1, (blueGenome.aggression || 0.5) * 0.9));
                    blueGenome.speed = Math.max(0, Math.min(1, (blueGenome.speed || 0.5) * 1.1));
                    blueGenome.defense = Math.max(0, Math.min(1, (blueGenome.defense || blueGenome.caution || 0.5) * 1.1));
                }
                
                displayGenomeWithEvolvingFitness('blue', blueGenome);
                console.log(`🧬 ✅ Emergency Blue champion created from Red template`);
            } else {
                displayNoGenomeDataForTeam('blue');
            }
        }
    } catch (error) {
        console.error('Error updating genome display:', error);
    }
}

function displayCurrentTankGenomes() {
    // Display genomes of currently active tanks when paused
    if (!game || !game.tanks || game.tanks.length === 0) {
        displayNoGenomeData();
        return;
    }
    
    // Get representative tanks from each team
    const redTanks = game.tanks.filter(tank => tank.team === 'red' && tank.isAlive);
    const blueTanks = game.tanks.filter(tank => tank.team === 'blue' && tank.isAlive);
    
    // Display genomes of the first alive tank from each team
    if (redTanks.length > 0 && redTanks[0].genome) {
        // Calculate average fitness of red team or use first tank's fitness
        const avgFitness = redTanks.reduce((sum, tank) => sum + (tank.fitness || 0.5), 0) / redTanks.length;
        displayGenome('red', redTanks[0].genome, avgFitness);
    } else {
        displayNoGenomeDataForTeam('red');
    }
    
    if (blueTanks.length > 0 && blueTanks[0].genome) {
        // Calculate average fitness of blue team or use first tank's fitness
        const avgFitness = blueTanks.reduce((sum, tank) => sum + (tank.fitness || 0.5), 0) / blueTanks.length;
        displayGenome('blue', blueTanks[0].genome, avgFitness);
    } else {
        displayNoGenomeDataForTeam('blue');
    }
}

function displayNoGenomeData() {
    displayNoGenomeDataForTeam('red');
    displayNoGenomeDataForTeam('blue');
}

function displayNoGenomeDataForTeam(team) {
    const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
    
    // Update fitness display
    const fitnessElement = document.getElementById(`${team}ChampionFitness`);
    if (fitnessElement) {
        fitnessElement.textContent = 'Evolving...';
    }
    
    // Update each trait to show evolving state
    traitNames.forEach((traitName, _index) => {
        // Update trait value
        const valueElement = document.getElementById(`${team}${traitName}`);
        if (valueElement) {
            valueElement.textContent = '—';
        }
        
        // Update trait bar to show minimal width
        const barElement = document.getElementById(`${team}${traitName}Bar`);
        if (barElement) {
            barElement.style.width = '0%';
            barElement.style.background = '#333';
        }
    });
}

// Cache for getBestGenomeForTeam to avoid heavy recomputation
const genomeCache = {
    lastPoolSize: 0,
    lastCacheTime: 0,
    lastPoolChecksum: null, // Track actual pool content changes
    redBest: null,
    blueBest: null
};

function getBestGenomeForTeam(team) {
    if (!evolution || !evolution.candidatePool || evolution.candidatePool.length === 0) {
        return null;
    }
    
    const currentTime = Date.now();
    const poolSize = evolution.candidatePool.length;
    
    // Calculate a simple checksum of pool content to detect fitness updates
    const poolChecksum = evolution.candidatePool.reduce((sum, candidate, index) => {
        const fitness = candidate.fitness || 0;
        const battles = candidate.battles || 0;
        const wins = candidate.wins || 0;
        return sum + (fitness * 1000 + battles * 100 + wins * 10) * (index + 1);
    }, 0);
    
    // Debug logging (reduced frequency to improve performance)
    const shouldLog = !window.lastDebugLog || (currentTime - window.lastDebugLog > 5000);
    if (window.DEBUG_GENOME && shouldLog) {
        console.log(`🧬 getBestGenomeForTeam(${team}): Pool size=${poolSize}, Checksum=${poolChecksum}`);
        console.log(`  Team candidates in pool: ${evolution.candidatePool.filter(c => c.team === team).length}`);
        window.lastDebugLog = currentTime;
    }
    
    // Check team-specific cache validity
    const teamCacheKey = team === 'red' ? 'redBest' : 'blueBest';
    const cached = genomeCache[teamCacheKey];
    
    // Use cache if pool hasn't changed (size AND content) and team-specific cache is less than 2 seconds old
    const cacheValid = (
        poolSize === genomeCache.lastPoolSize && 
        poolChecksum === genomeCache.lastPoolChecksum &&
        currentTime - genomeCache.lastCacheTime < 2000 &&
        cached !== null
    );
    
    if (cacheValid && cached) {
        if (window.DEBUG_GENOME && shouldLog) {
            console.log(`🧬 ${team} using cached result: fitness=${cached.fitness?.toFixed(3)}, battles=${cached.battles}`);
        }
        return cached;
    }
    
    // Force fresh selection for this team - clear its cache entry
    genomeCache[teamCacheKey] = null;
    
    try {
        // First, try to filter candidates by actual team assignment AND battle experience
        let championCandidates = evolution.candidatePool.filter(candidate => {
            if (!candidate || !candidate.genome) {
                return false;
            }
            
            // Check genome format
            const isValidArray = Array.isArray(candidate.genome) && candidate.genome.length >= 9;
            const isValidObject = !Array.isArray(candidate.genome) && typeof candidate.genome === 'object';
            
            if (!isValidArray && !isValidObject) {
                return false;
            }
            
            // Filter by team assignment AND battle experience (proven champions only)
            const isTeamMember = candidate.team === team;
            const hasBattleExperience = candidate.battles && candidate.battles > 0;
            const hasWins = candidate.wins && candidate.wins > 0;
            
            if (isTeamMember && hasBattleExperience && hasWins) {
                return true;
            }
            
            return false;
        });
        
        if (window.DEBUG_GENOME) {
            console.log(`🧬 ${team} proven champions found: ${championCandidates.length}`);
        }
        // If no proven champions yet, fall back to experienced fighters (even without wins)
        if (championCandidates.length === 0) {
            // Reduce debug logging frequency for performance
            const shouldLogSearch = !window.lastSearchLog || (currentTime - window.lastSearchLog > 10000);
            if (shouldLogSearch) {
                console.log(`🔍 getBestGenomeForTeam(${team}): No proven champions, searching experienced fighters...`);
                if (evolution.candidatePool.length > 0) {
                    const teamBreakdown = evolution.candidatePool.reduce((acc, c) => {
                        const teamKey = c.team || 'unassigned';
                        acc[teamKey] = (acc[teamKey] || 0) + 1;
                        return acc;
                    }, {});
                    console.log(`📊 Pool breakdown: Red=${teamBreakdown.red || 0}, Blue=${teamBreakdown.blue || 0}, Unassigned=${teamBreakdown.unassigned || 0}`);
                }
                window.lastSearchLog = currentTime;
            }
            
            championCandidates = evolution.candidatePool.filter(candidate => {
                if (!candidate || !candidate.genome) {
                    return false;
                }
                
                const isValidArray = Array.isArray(candidate.genome) && candidate.genome.length >= 9;
                const isValidObject = !Array.isArray(candidate.genome) && typeof candidate.genome === 'object';
                
                if (!isValidArray && !isValidObject) {
                    return false;
                }
                
                // Look for team members with any battle experience
                const isTeamMember = candidate.team === team;
                const hasBattleExperience = candidate.battles && candidate.battles > 0;
                
                if (isTeamMember && hasBattleExperience) {
                    return true;
                }
                
                return false;
            });
        }
        
        // If still no battle-tested candidates, use current generation team members (early generation case)
        if (championCandidates.length === 0) {
            championCandidates = evolution.candidatePool.filter(candidate => {
                if (!candidate || !candidate.genome) {
                    return false;
                }
                
                const isValidArray = Array.isArray(candidate.genome) && candidate.genome.length >= 9;
                const isValidObject = !Array.isArray(candidate.genome) && typeof candidate.genome === 'object';
                
                if (!isValidArray && !isValidObject) {
                    return false;
                }
                
                // Filter by team assignment only (for early generations)
                if (candidate.team === team) {
                    return true;
                }
                
                return false;
            });
            // Reduce debug logging frequency for performance  
            const shouldLogTeam = !window.lastTeamLog || (currentTime - window.lastTeamLog > 10000);
            if (shouldLogTeam) {
                console.log(`🔍 Team ${team}: Found ${championCandidates.length} early generation team candidates`);
                window.lastTeamLog = currentTime;
            }
        }
        
        // If no team-specific candidates, get overall best and assign based on traits
        if (championCandidates.length === 0) {
            const allCandidates = evolution.candidatePool.filter(candidate => {
                if (!candidate || !candidate.genome) {
                    return false;
                }
                
                const isValidArray = Array.isArray(candidate.genome) && candidate.genome.length >= 9;
                const isValidObject = !Array.isArray(candidate.genome) && typeof candidate.genome === 'object';
                
                return isValidArray || isValidObject;
            });
            
            if (allCandidates.length === 0) {
                console.warn(`🧬 No valid candidates found for team ${team}`);
                return null;
            }
            
            allCandidates.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
            
            // IMPROVED TEAM DISTRIBUTION: Ensure both teams get fair representation
            if (window.DEBUG_GENOME) {
                console.log(`🧬 ${team} fallback selection from ${allCandidates.length} candidates`);
            }
            
            // Find a candidate that isn't already assigned to the other team
            let selectedCandidate = null;
            
            if (team === 'red') {
                // For Red, prefer candidates that aren't explicitly assigned to Blue
                selectedCandidate = allCandidates.find(c => c.team !== 'blue') || allCandidates[0];
            } else if (team === 'blue') {
                // For Blue, prefer candidates that aren't explicitly assigned to Red  
                selectedCandidate = allCandidates.find(c => c.team !== 'red') || allCandidates[Math.min(1, allCandidates.length - 1)];
            }
            
            if (selectedCandidate) {
                selectedCandidate.tempTeam = team;
                if (window.DEBUG_GENOME) {
                    console.log(`🧬 ${team} assigned fallback candidate: fitness=${selectedCandidate.fitness?.toFixed(3)}, original_team=${selectedCandidate.team}`);
                }
                return selectedCandidate;
            }
            
            return null;
        }
        
        // Sort by fitness and return the best
        championCandidates.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        const best = championCandidates[0];
        
        if (best) {
            // Reduce success logging frequency for performance
            const shouldLogSuccess = !window.lastSuccessLog || (currentTime - window.lastSuccessLog > 15000);
            if (shouldLogSuccess) {
                console.log(`✅ Selected ${team} champion: fitness=${best.fitness?.toFixed(3) || 'N/A'}, team=${best.team}, battles=${best.battles || 0}, strategy=${best.strategy || 'Unknown'}`);
                window.lastSuccessLog = currentTime;
            }
        } else {
            console.warn(`❌ No champion found for team ${team}`);
        }
        
        // Update cache - but don't override other team's cache unless both teams are being updated
        if (team === 'red') {
            genomeCache.redBest = best;
        } else {
            genomeCache.blueBest = best;
        }
        
        // Update global cache metadata only if this is a fresh fetch (not using cached data)
        genomeCache.lastPoolSize = poolSize;
        genomeCache.lastPoolChecksum = poolChecksum;
        genomeCache.lastCacheTime = currentTime;
        
        return best;
    } catch (error) {
        console.error('Error in getBestGenomeForTeam:', error);
        return null;
    }
}

function displayGenome(team, genome, fitness) {
    const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
    
    // Validate inputs and handle both array and object genome formats
    if (!genome || typeof fitness !== 'number') {
        console.warn('Invalid genome data provided to displayGenome:', { team, genome, fitness });
        return;
    }
    
    // Convert object genome to array format if needed
    let genomeArray;
    if (Array.isArray(genome)) {
        genomeArray = genome;
    } else if (typeof genome === 'object') {
        // Convert object format to array format
        genomeArray = [
            genome.aggression || 0,
            genome.speed || 0,
            genome.accuracy || 0,
            genome.defense || genome.caution || 0,
            genome.teamwork || genome.cooperation || 0,
            genome.adaptability || 0,
            genome.learning || 0,
            genome.riskTaking || 0,
            genome.evasion || 0
        ];
    } else {
        console.warn('Invalid genome format provided to displayGenome:', { team, genome, fitness });
        return;
    }
    
    // Update fitness display
    const fitnessElement = document.getElementById(`${team}ChampionFitness`);
    if (fitnessElement) {
        fitnessElement.textContent = fitness.toFixed(3);
    }
    
    // Update each trait using the genomeArray
    traitNames.forEach((traitName, index) => {
        const value = genomeArray[index];
        
        // Handle undefined or invalid values
        if (typeof value !== 'number' || isNaN(value)) {
            console.warn(`Invalid trait value at index ${index} for team ${team}:`, value);
            return; // Skip this trait
        }
        
        const displayValue = value.toFixed(2);
        const percentage = Math.max(0, Math.min(100, (value * 100))).toFixed(0);
        
        // Update trait value
        const valueElement = document.getElementById(`${team}${traitName}`);
        if (valueElement) {
            valueElement.textContent = displayValue;
        }
        
        // Update trait bar
        const barElement = document.getElementById(`${team}${traitName}Bar`);
        if (barElement) {
            barElement.style.width = `${percentage}%`;
            
            // Color coding based on value
            if (value < 0.3) {
                barElement.style.background = '#ff4444'; // Low - Red
            } else if (value < 0.7) {
                barElement.style.background = '#ffaa00'; // Medium - Orange
            } else {
                barElement.style.background = '#00ff88'; // High - Green
            }
        }
    });
}

function displayGenomeWithEvolvingFitness(team, genome) {
    const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
    
    // Convert object genome to array format if needed
    let genomeArray;
    if (Array.isArray(genome)) {
        genomeArray = genome;
    } else if (typeof genome === 'object' && genome) {
        // Convert object format to array format
        genomeArray = [
            genome.aggression || 0,
            genome.speed || 0,
            genome.accuracy || 0,
            genome.defense || genome.caution || 0,
            genome.teamwork || genome.cooperation || 0,
            genome.adaptability || 0,
            genome.learning || 0,
            genome.riskTaking || 0,
            genome.evasion || 0
        ];
    } else {
        console.warn('Invalid genome format in displayGenomeWithEvolvingFitness:', genome);
        genomeArray = null;
    }
    
    // Update fitness display to show "Evolving..." - use the correct element ID
    const fitnessElement = document.getElementById(`${team}ChampionFitness`);
    if (fitnessElement) {
        fitnessElement.textContent = 'Evolving...';
    }
    
    // Update each trait with actual values but show fitness as evolving
    traitNames.forEach((traitName, index) => {
        // Update trait value with actual genome data
        const valueElement = document.getElementById(`${team}${traitName}`);
        if (valueElement && genomeArray && genomeArray[index] !== undefined) {
            const value = genomeArray[index];
            valueElement.textContent = value.toFixed(2);
        } else if (valueElement) {
            valueElement.textContent = '—';
        }
        
        // Update trait bar with actual values
        const barElement = document.getElementById(`${team}${traitName}Bar`);
        if (barElement && genomeArray && genomeArray[index] !== undefined) {
            const value = genomeArray[index];
            barElement.style.width = `${value * 100}%`;
            
            // Color coding based on value
            if (value < 0.3) {
                barElement.style.background = '#ff4444'; // Low - Red
            } else if (value < 0.7) {
                barElement.style.background = '#ffaa00'; // Medium - Orange
            } else {
                barElement.style.background = '#00ff88'; // High - Green
            }
        }
    });
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
