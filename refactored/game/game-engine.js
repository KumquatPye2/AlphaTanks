/**
 * Refactored Game Engine - Core game orchestration
 * Uses composition of managers for better separation of concerns
 * Significantly reduced complexity compared to the original monolithic GameEngine
 */

class GameEngine {
    constructor(canvasOrId, options = {}) {
        // Canvas setup - handle both canvas element and canvas ID
        if (typeof canvasOrId === 'string') {
            this.canvas = document.getElementById(canvasOrId);
            if (!this.canvas) {
                throw new Error(`Canvas element with ID '${canvasOrId}' not found`);
            }
        } else if (canvasOrId instanceof HTMLCanvasElement) {
            this.canvas = canvasOrId;
        } else {
            throw new Error('First parameter must be either a canvas element or canvas ID string');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.setupCanvas();
        
        // Apply options
        this.populationSize = options.populationSize || GAME_CONFIG.EVOLUTION.POPULATION_SIZE;
        this.gameMode = options.gameMode || 'king_of_hill';
        this.timeScale = options.timeScale || 1.0;
        
        // Core game state
        this.gameState = GAME_STATES.READY;
        this.lastTime = 0;
        this.maxBattleTime = GAME_CONFIG.BATTLE.MAX_DURATION;
        
        // Victory message system
        this.victoryMessage = null;
        this.victoryMessageTime = 0;
        this.showVictoryMessage = false;
        
        // Game entities
        this.tanks = [];
        this.redTeam = [];
        this.blueTeam = [];
        
        // Managers - composition pattern
        this.battlefield = new BattlefieldManager(this.width, this.height);
        this.combat = new CombatManager();
        this.stats = new BattleStatsManager();
        
        // Evolution integration
        this.evolutionEngine = null;
        
        // Performance monitoring
        this.performanceMonitor = PerformanceUtils.createPerformanceMonitor();
        
        this.bindEvents();
    }
    
    /**
     * Setup canvas dimensions and properties
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        
        // Handle case where canvas has no parent (e.g., in tests)
        if (container) {
            this.width = container.clientWidth;
            this.height = container.clientHeight;
        } else {
            // Default dimensions when no parent container
            this.width = this.canvas.width || 800;
            this.height = this.canvas.height || 600;
        }
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.imageSmoothingEnabled = false;
        
        // Update battlefield if it exists
        if (this.battlefield) {
            this.battlefield.width = this.width;
            this.battlefield.height = this.height;
            this.battlefield.createObstacles();
        }
    }
    
    /**
     * Bind window events
     */
    bindEvents() {
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    /**
     * Initialize a new battle
     */
    initializeBattle(redTanks = 3, blueTanks = 3, mode = 'king_of_hill') {
        // Reset all systems
        this.tanks = [];
        this.redTeam = [];
        this.blueTeam = [];
        this.combat.clear();
        this.stats.reset();
        
        // Reset victory message
        this.victoryMessage = null;
        this.showVictoryMessage = false;
        this.victoryMessageTime = 0;
        
    // Do not change gameState here; caller controls RUNNING/READY state
        
        // Set game mode
        this.battlefield.mode = mode;
        
        // Initialize battlefield for this mode
        if (mode === 'king_of_hill') {
            this.battlefield.initializeKingOfHill();
        }
        
        // Create red team
        for (let i = 0; i < redTanks; i++) {
            const spawnPos = this.battlefield.getSpawnPosition('red', i, redTanks);
            const tank = new Tank(
                spawnPos.x,
                spawnPos.y,
                'red',
                this.generateBasicGenome()
            );
            // Debug logging removed for performance
            this.tanks.push(tank);
            this.redTeam.push(tank);
        }
        
        // Create blue team
        for (let i = 0; i < blueTanks; i++) {
            const spawnPos = this.battlefield.getSpawnPosition('blue', i, blueTanks);
            const tank = new Tank(
                spawnPos.x,
                spawnPos.y,
                'blue',
                this.generateBasicGenome()
            );
            // Debug logging removed for performance
            this.tanks.push(tank);
            this.blueTeam.push(tank);
        }
        
        // Debug logging removed for performance
    }
    
    /**
     * Generate a basic genome for tanks
     */
    generateBasicGenome() {
        return GenomeUtils.generateRandom(GAME_CONFIG.EVOLUTION.GENOME_LENGTH);
    }
    
    /**
     * Start the game
     */
    start() {
        this.gameState = GAME_STATES.RUNNING;
        this.stats.battleTime = 0;
        this.lastTime = 0;
        this.stats.battleStarted = false;
        this.gameLoop();
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.gameState = GAME_STATES.PAUSED;
    }
    
    /**
     * Resume the game
     */
    resume() {
        this.gameState = GAME_STATES.RUNNING;
        this.lastTime = 0; // Reset to prevent large delta time
        this.gameLoop();
    }
    
    /**
     * Reset the game
     */
    reset() {
        this.gameState = GAME_STATES.READY;
        this.lastTime = 0;
        this.stats.reset();
        this.tanks = [];
        this.redTeam = [];
        this.blueTeam = [];
        this.combat.clear();
    }
    
    /**
     * Set evolution engine reference
     */
    setEvolutionEngine(evolutionEngine) {
        this.evolutionEngine = evolutionEngine;
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (this.gameState !== GAME_STATES.RUNNING) {
            return;
        }
        
        // Initialize timing on first frame
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            this.update((1/60) * this.timeScale); // Assume 60fps for first frame, scaled
            this.render();
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Calculate delta time with cap
    const rawDelta = (currentTime - this.lastTime) / 1000;
    const deltaTime = Math.min(rawDelta * this.timeScale, GAME_CONFIG.PERFORMANCE.DELTA_TIME_CAP);
        this.lastTime = currentTime;
        
        // Only update if delta time is reasonable
        if (deltaTime > GAME_CONFIG.PERFORMANCE.MIN_DELTA_TIME && deltaTime <= GAME_CONFIG.PERFORMANCE.DELTA_TIME_CAP) {
            this.update(deltaTime);
        }
        
        this.render();
        
        // Update performance monitor
        this.performanceMonitor.update();
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Update battle statistics
        this.stats.update(deltaTime, this.tanks);
        
        // Update UI statistics
        this.stats.updateUIStats(this.redTeam, this.blueTeam);
        
        // Update tanks
        const gameState = this.getGameState();
        const aliveTanks = this.tanks.filter(tank => tank.isAlive);
        
        aliveTanks.forEach(tank => {
            tank.update(deltaTime, gameState);
        });
        
        // Update battlefield (hill, etc.)
        this.battlefield.update(deltaTime, aliveTanks);
        
        // Update combat (projectiles)
        this.combat.update(deltaTime, this.battlefield);
        
        // Check collisions
        this.combat.checkCollisions(this.tanks, this.battlefield);
        
        // Check win conditions
        this.checkWinConditions();
        
        // Check battle time limit
        if (this.stats.battleStarted && this.stats.battleTime > this.maxBattleTime) {
            // Debug logging removed for performance
            this.endBattle(BATTLE_OUTCOMES.TIMEOUT);
        }
    }
    
    /**
     * Check win conditions
     */
    checkWinConditions() {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        // Debug logging removed for performance
        
        // Check elimination conditions
        if (aliveRed === 0 && aliveBlue === 0) {
            this.endBattle(BATTLE_OUTCOMES.DRAW);
            return;
        } else if (aliveRed === 0) {
            this.endBattle(BATTLE_OUTCOMES.BLUE_WINS);
            return;
        } else if (aliveBlue === 0) {
            this.endBattle(BATTLE_OUTCOMES.RED_WINS);
            return;
        }
        
        // Check King of the Hill victory
        if (this.battlefield.hill && this.battlefield.hill.isGameWon()) {
            this.endBattle(this.battlefield.hill.getWinner());
            return;
        }
    }
    
    /**
     * End the battle
     */
    endBattle(winner) {
        // Debug logging removed for performance
        
        // Only apply minimum battle time for timeout scenarios
        const minimumBattleTime = GAME_CONFIG.BATTLE.MIN_DURATION_FOR_TIMEOUT;
        if (winner === BATTLE_OUTCOMES.TIMEOUT && this.stats.battleStarted && this.stats.battleTime < minimumBattleTime) {
            // Debug logging removed for performance
            return;
        }
        
        this.gameState = GAME_STATES.ENDED;
        
        // Set victory message
        this.setVictoryMessage(winner);
        
        const battleResult = this.getBattleResult(winner);
        
        // Dispatch battle end event (evolution engine will handle via event listener)
        const event = new CustomEvent('battleEnd', { detail: battleResult });
        window.dispatchEvent(event);
    }
    
    /**
     * Get comprehensive battle result
     */
    getBattleResult(winner) {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        const totalKills = this.redTeam.length + this.blueTeam.length - aliveRed - aliveBlue;
        
        // Determine victory type
        let victoryType = 'elimination';
        if (winner === BATTLE_OUTCOMES.TIMEOUT) {
            victoryType = 'timeout';
        } else if (this.battlefield.hill && this.battlefield.hill.isGameWon()) {
            victoryType = 'king_of_hill';
        }
        
        // Hill control data
        const hillControlData = this.battlefield.hill ? {
            redControlTime: this.battlefield.hill.redControlTime || 0,
            blueControlTime: this.battlefield.hill.blueControlTime || 0,
            neutralTime: this.stats.battleTime - ((this.battlefield.hill.redControlTime || 0) + (this.battlefield.hill.blueControlTime || 0)),
            controlChanges: this.battlefield.hill.controlChanges || 0,
            maxContinuousControl: {
                red: this.battlefield.hill.maxRedControl || 0,
                blue: this.battlefield.hill.maxBlueControl || 0
            }
        } : null;
        
        return {
            winner,
            victoryType,
            duration: this.stats.battleTime,
            redSurvivors: aliveRed,
            blueSurvivors: aliveBlue,
            totalKills,
            redTeamStats: this.stats.calculateTeamStats(this.redTeam),
            blueTeamStats: this.stats.calculateTeamStats(this.blueTeam),
            hillControlData,
            tacticalMetrics: this.stats.calculateTacticalMetrics(this.redTeam, this.blueTeam)
        };
    }
    
    /**
     * Get current game state for AI systems
     */
    getGameState() {
        return {
            tanks: this.tanks,
            ...this.battlefield.getState(),
            battleTime: this.stats.battleTime,
            gameMode: this.battlefield.mode,
            addProjectile: (projectile) => this.combat.addProjectile(projectile)
        };
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.UI.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render battlefield
        this.battlefield.render(this.ctx);
        
        // Render tanks
        this.tanks.forEach(tank => tank.render(this.ctx));
        
        // Render projectiles
        this.combat.render(this.ctx);
        
        // Render battle info
        this.drawBattleInfo();
        
        // Render victory message if applicable
        this.drawVictoryMessage();
    }
    
    /**
     * Draw battle information overlay
     */
    drawBattleInfo() {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Red: ${aliveRed}/${this.redTeam.length}`, 10, 25);
        this.ctx.fillText(`Blue: ${aliveBlue}/${this.blueTeam.length}`, 10, 45);
        this.ctx.fillText(`Time: ${this.stats.battleTime.toFixed(1)}s`, 10, 65);
        
        if (GAME_CONFIG.DEBUG.SHOW_PERFORMANCE_STATS) {
            this.ctx.fillText(`FPS: ${this.performanceMonitor.getFPS()}`, 10, 85);
            this.ctx.fillText(`Projectiles: ${this.combat.getProjectileCount()}`, 10, 105);
        }
        
        // Show hill control info
        if (this.battlefield.hill) {
            const controller = this.battlefield.hill.controllingTeam || 'neutral';
            const controlTime = this.battlefield.hill.controlTime || 0;
            this.ctx.fillText(`Hill: ${controller} (${controlTime.toFixed(1)}s)`, 10, this.height - 20);
        }
    }
    
    /**
     * Add projectile (for compatibility)
     */
    addProjectile(projectile) {
        this.combat.addProjectile(projectile);
    }
    
    /**
     * Update UI (legacy compatibility)
     */
    updateUI() {
        // UI updates now handled by render method
        // Keep for compatibility
    }
    
    /**
     * Set time scale for game speed
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(5.0, scale));
    }
    
    /**
     * Set population size
     */
    setPopulationSize(size) {
        this.populationSize = Math.max(10, Math.min(100, size));
    }
    
    /**
     * Set game mode
     */
    setGameMode(mode) {
        this.gameMode = mode;
    }
    
    /**
     * Start evolution (placeholder)
     */
    startEvolution() {
        // Debug logging removed for performance
        this.initializeBattle();
        this.gameState = GAME_STATES.RUNNING;
        this.lastTime = 0;
    }
    
    /**
     * Start quick battle
     */
    startQuickBattle() {
        // Debug logging removed for performance
        this.initializeBattle();
        this.gameState = GAME_STATES.RUNNING;
        this.lastTime = 0;
    }
    
    /**
     * Get battle statistics (compatibility method)
     */
    getStats() {
        return this.stats.getStats();
    }
    
    /**
     * Set victory message for display
     */
    setVictoryMessage(winner) {
        let message = '';
        let color = '#fff';
        
        switch (winner) {
            case 'red':
            case BATTLE_OUTCOMES.RED_WINS:
                message = '🔴 RED TEAM WINS! 🔴';
                color = '#ff4444';
                break;
            case 'blue':
            case BATTLE_OUTCOMES.BLUE_WINS:
                message = '🔵 BLUE TEAM WINS! 🔵';
                color = '#4444ff';
                break;
            case 'timeout':
            case BATTLE_OUTCOMES.TIMEOUT:
                message = '⏰ BATTLE TIMEOUT - NO VICTOR ⏰';
                color = '#ffaa00';
                break;
            case 'draw':
            case BATTLE_OUTCOMES.DRAW:
                message = '⚖️ BATTLE ENDS IN DRAW ⚖️';
                color = '#aaaaaa';
                break;
            default:
                message = `🏆 ${winner.toUpperCase()} WINS! 🏆`;
                color = '#ffdd00';
        }
        
        this.victoryMessage = message;
        this.victoryColor = color;
        this.showVictoryMessage = true;
        this.victoryMessageTime = Date.now();
    }
    
    /**
     * Draw victory message overlay
     */
    drawVictoryMessage() {
        if (!this.showVictoryMessage || !this.victoryMessage) {
            return;
        }
        
        // Show victory message for 3 seconds
        const elapsed = Date.now() - this.victoryMessageTime;
        if (elapsed > 3000) {
            this.showVictoryMessage = false;
            return;
        }
        
        // Calculate opacity for fade effect
        let opacity = 1;
        if (elapsed > 2000) {
            opacity = 1 - (elapsed - 2000) / 1000; // Fade out in last second
        }
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Save context
        this.ctx.save();
        
        // Set opacity
        this.ctx.globalAlpha = opacity;
        
        // Draw semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, centerY - 60, this.width, 120);
        
        // Draw victory message
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text shadow for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillText(this.victoryMessage, centerX + 2, centerY + 2);
        
        // Main text
        this.ctx.fillStyle = this.victoryColor;
        this.ctx.fillText(this.victoryMessage, centerX, centerY);
        
        // Draw animated border around message
        const time = elapsed / 100;
        this.ctx.strokeStyle = this.victoryColor;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.lineDashOffset = -time % 15;
        this.ctx.strokeRect(50, centerY - 50, this.width - 100, 100);
        
        // Restore context
        this.ctx.restore();
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine };
} else {
    window.GameEngine = GameEngine;
}
