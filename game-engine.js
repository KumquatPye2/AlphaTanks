// Game Engine - Core game loop and battlefield management
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with ID '${canvasId}' not found`);
        }
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.tanks = [];
        this.projectiles = [];
        this.obstacles = [];
        this.hill = null; // King of the Hill control point
        this.lastTime = 0;
        this.gameState = 'ready'; // 'ready', 'running', 'paused', 'ended'
        this.gameMode = 'king_of_hill'; // King of the Hill mode
        this.battleTime = 0;
        this.maxBattleTime = 120; // 2 minutes max battle time
        this.battleStarted = false; // Flag to track when battle timer should start
        this.redTeam = [];
        this.blueTeam = [];
        this.setupCanvas();
        this.createObstacles();
        this.bindEvents();
    }
    setupCanvas() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // Set up coordinate system
        this.ctx.imageSmoothingEnabled = false;
    }
    createObstacles() {
        // No obstacles - clear battlefield for King of the Hill
        this.obstacles = [];
    }
    bindEvents() {
        window.addEventListener('resize', () => this.setupCanvas());
    }
    initializeBattle(redTanks = 5, blueTanks = 5, mode = 'king_of_hill') {
        this.tanks = [];
        this.projectiles = [];
        this.redTeam = [];
        this.blueTeam = [];
        this.battleTime = 0;
        this.gameState = 'ready'; // Don't automatically start - let start() method handle it
        this.battleStarted = false; // Reset battle started flag
        this.gameMode = mode;
        // Initialize King of the Hill mode
        if (mode === 'king_of_hill') {
            this.initializeKingOfHill();
        } else {
            this.hill = null;
        }
        // Create red team (left side)
        for (let i = 0; i < redTanks; i++) {
            const tank = new Tank(
                50 + Math.random() * 100,
                this.height * 0.2 + Math.random() * this.height * 0.6,
                'red',
                this.generateBasicGenome()
            );
            this.tanks.push(tank);
            this.redTeam.push(tank);
        }
        // Create blue team (right side)
        for (let i = 0; i < blueTanks; i++) {
            const tank = new Tank(
                this.width - 150 + Math.random() * 100,
                this.height * 0.2 + Math.random() * this.height * 0.6,
                'blue',
                this.generateBasicGenome()
            );
            this.tanks.push(tank);
            this.blueTeam.push(tank);
        }
    }
    generateBasicGenome() {
        // Basic random genome for initial tanks - returns array format
        // [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        return [
            0.3 + Math.random() * 0.4,  // 0: Aggression
            0.4 + Math.random() * 0.4,  // 1: Speed
            0.4 + Math.random() * 0.4,  // 2: Accuracy
            0.3 + Math.random() * 0.4,  // 3: Defense (was caution)
            0.3 + Math.random() * 0.4,  // 4: Teamwork (was cooperation)
            0.2 + Math.random() * 0.4,  // 5: Adaptability
            0.2 + Math.random() * 0.4,  // 6: Learning
            0.3 + Math.random() * 0.4,  // 7: RiskTaking
            0.3 + Math.random() * 0.4   // 8: Evasion
        ];
    }
    initializeKingOfHill() {
        // Create hill in the center of the battlefield
        if (!this.hill) {
            this.hill = new Hill(this.width / 2, this.height / 2, 60);
        }
        // Reset hill to neutral state for new battle
        this.hill.reset();
    }
    start() {
        this.gameState = 'running';
        this.battleTime = 0; // Reset battle time for new battle
        this.lastTime = 0; // Reset to 0 so gameLoop will handle first frame properly
        this.battleStarted = false; // Battle timer hasn't started yet
        this.gameLoop();
    }
    pause() {
        this.gameState = 'paused';
    }
    resume() {
        this.gameState = 'running';
        // Keep existing battleTime - don't reset it!
        // Keep existing battleStarted state - don't reset it!
        this.lastTime = 0; // Reset to 0 so gameLoop will handle first frame properly
        this.gameLoop();
    }
    reset() {
        this.gameState = 'ready';
        this.lastTime = 0;
        this.battleTime = 0;
        this.battleStarted = false;
        this.tanks = [];
        this.projectiles = [];
        this.redTeam = [];
        this.blueTeam = [];
    }
    setEvolutionEngine(evolutionEngine) {
        this.evolutionEngine = evolutionEngine;
    }
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'running') {
            return;
        }
        // Initialize lastTime on first frame
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            // On first frame, use a small deltaTime to start immediately
            this.update(1/60); // Assume 60fps for first frame
            this.render();
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap deltaTime to prevent large jumps
        this.lastTime = currentTime;
        // Only update if we have a reasonable deltaTime (prevent negative time and huge jumps)
        if (deltaTime > 0 && deltaTime <= 0.1) {
            this.update(deltaTime);
        }
        this.render();
        // Continue the game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    update(deltaTime) {
        // Check for first tank movement in every battle (not just when battleStarted is false)
        if (!this.battleStarted && this.tanks.length > 0) {
            const anyTankMoved = this.tanks.some(tank => {
                if (!tank.isAlive) {
                    return false;
                }
                const deltaX = Math.abs(tank.x - tank.spawnX);
                const deltaY = Math.abs(tank.y - tank.spawnY);
                return deltaX > 5 || deltaY > 5; // Tank moved more than 5 pixels
            });
            if (anyTankMoved) {
                this.battleStarted = true;
            }
        }
        // Only increment battle time after first tank movement
        if (this.battleStarted) {
            this.battleTime += deltaTime;
        }
        // Optimize: Only update living tanks
        const aliveTanks = this.tanks.filter(tank => tank.isAlive);
        aliveTanks.forEach(tank => {
            tank.update(deltaTime, this.getGameState());
        });
        // Update King of the Hill
        if (this.hill) {
            this.hill.update(deltaTime, aliveTanks);
        }
        // Optimize: Batch update projectiles and filter in one pass
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            if (projectile.shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
        // Optimize: Only check collisions if there are active entities
        if (aliveTanks.length > 0 && this.projectiles.length > 0) {
            this.checkCollisions();
        }
        // Check win conditions
        this.checkWinConditions();
        // Time limit (only apply if battle has actually started)
        if (this.battleStarted && this.battleTime > this.maxBattleTime) {
            console.log(`⏰ Game engine timeout! Battle time: ${this.battleTime}s > ${this.maxBattleTime}s`);
            this.endBattle('timeout');
        }
        // Update UI
        this.updateUI();
    }
    getGameState() {
        return {
            tanks: this.tanks,
            obstacles: this.obstacles,
            projectiles: this.projectiles,
            hill: this.hill,
            battleTime: this.battleTime,
            width: this.width,
            height: this.height,
            gameMode: this.gameMode
        };
    }
    checkCollisions() {
        const aliveTanks = this.tanks.filter(tank => tank.isAlive);
        // Optimize: Early exit if no active entities
        if (aliveTanks.length === 0 || this.projectiles.length === 0) {
            return;
        }
        // Projectile-tank collisions (optimized)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let hit = false;
            for (let j = 0; j < aliveTanks.length && !hit; j++) {
                const tank = aliveTanks[j];
                if (tank.team !== projectile.team && this.isColliding(projectile, tank)) {
                    tank.takeDamage(projectile.damage);
                    this.projectiles.splice(i, 1);
                    hit = true;
                }
            }
        }
    }
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    checkWinConditions() {
        // Check elimination victory conditions first
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        if (aliveRed === 0 && aliveBlue === 0) {
            // Both teams eliminated - draw
            this.endBattle('draw');
            return;
        } else if (aliveRed === 0) {
            // Red team eliminated - blue wins
            this.endBattle('blue');
            return;
        } else if (aliveBlue === 0) {
            // Blue team eliminated - red wins
            this.endBattle('red');
            return;
        }
        
        // Check King of the Hill victory conditions (30-second occupation)
        if (this.hill && this.hill.isGameWon()) {
            this.endBattle(this.hill.getWinner());
            return;
        }
    }
    endBattle(winner) {
        console.log(`🏁 endBattle called with winner: ${winner}, battle time: ${this.battleTime.toFixed(1)}s`);
        console.trace('endBattle call stack'); // Show where the call came from
        console.log(`🏁 endBattle called with winner: ${winner}, battleTime: ${this.battleTime}s`);
        console.trace('endBattle call stack');
        
        // Allow immediate battle termination when all tanks of one or both teams are destroyed
        // Only apply minimum battle time restriction for timeout scenarios
        const minimumBattleTime = 15; // seconds
        if (winner === 'timeout' && this.battleStarted && this.battleTime < minimumBattleTime) {
            // Don't end battle yet for timeout, let it continue until minimum time
            return;
        }
        
        // Debug logging to track early battle termination
        console.log(`🏁 Battle ended after ${this.battleTime.toFixed(1)}s - Winner: ${winner}`);
        if (this.battleTime < 30) {
            const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
            const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
            console.log(`⚡ Quick battle: Red=${aliveRed} alive, Blue=${aliveBlue} alive`);
            if (this.hill) {
                console.log(`🏔️ Hill control: Red=${this.hill.redControlTime.toFixed(1)}s, Blue=${this.hill.blueControlTime.toFixed(1)}s`);
            }
        }
        
        this.gameState = 'ended';
        // Emit battle end event
        const battleResult = this.getBattleResult(winner);
        window.dispatchEvent(new CustomEvent('battleEnd', { detail: battleResult }));
    }
    getBattleResult(winner) {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        // Determine victory type
        let victoryType = 'timeout';
        if (aliveRed === 0 && aliveBlue === 0) {
            victoryType = 'mutual_elimination';
        } else if (aliveRed === 0 || aliveBlue === 0) {
            victoryType = 'elimination';
        } else if (this.hill && this.hill.isGameWon()) {
            victoryType = 'hill_control';
        }
        
        // Enhanced hill control data for tactical analysis
        const hillControlData = this.hill ? {
            redControlTime: this.hill.redControlTime,
            blueControlTime: this.hill.blueControlTime,
            totalControlTime: this.hill.redControlTime + this.hill.blueControlTime,
            neutralTime: this.battleTime - (this.hill.redControlTime + this.hill.blueControlTime),
            controlChanges: this.hill.controlChanges || 0,
            maxContinuousControl: {
                red: this.hill.maxRedControl || 0,
                blue: this.hill.maxBlueControl || 0
            }
        } : null;
        
        return {
            winner,
            victoryType,
            duration: this.battleTime,
            redSurvivors: aliveRed,
            blueSurvivors: aliveBlue,
            totalKills: this.redTeam.length + this.blueTeam.length - aliveRed - aliveBlue,
            redTeamStats: this.calculateTeamStats(this.redTeam),
            blueTeamStats: this.calculateTeamStats(this.blueTeam),
            hillControlData, // Enhanced hill control metrics
            tacticalMetrics: this.calculateTacticalMetrics() // NEW: Comprehensive tactical analysis
        };
    }
    calculateTeamStats(team) {
        return {
            totalDamageDealt: team.reduce((sum, tank) => sum + tank.damageDealt, 0),
            totalDamageTaken: team.reduce((sum, tank) => sum + tank.damageTaken, 0),
            averageSurvivalTime: team.reduce((sum, tank) => sum + tank.survivalTime, 0) / team.length,
            accuracy: team.reduce((sum, tank) => sum + (tank.shotsFired > 0 ? tank.shotsHit / tank.shotsFired : 0), 0) / team.length,
            shotsFired: team.reduce((sum, tank) => sum + tank.shotsFired, 0),
            shotsHit: team.reduce((sum, tank) => sum + tank.shotsHit, 0)
        };
    }

    calculateTacticalMetrics() {
        // Comprehensive tactical analysis for evolution fitness
        const redTanks = this.redTeam;
        const blueTanks = this.blueTeam;
        
        return {
            red: this.calculateTeamTacticalMetrics(redTanks, 'red'),
            blue: this.calculateTeamTacticalMetrics(blueTanks, 'blue'),
            battleComplexity: this.calculateBattleComplexity()
        };
    }

    calculateTeamTacticalMetrics(team, _teamName) {
        if (team.length === 0) {
            return {
                averageEngagementRange: 0,
                coordinationScore: 0,
                adaptabilityScore: 0,
                survivalEfficiency: 0,
                tacticDiversity: 0
            };
        }
        
        // 1. Average engagement range (closer = more aggressive)
        const engagementDistances = team.map(tank => {
            if (tank.shotsFired === 0) {
                return 200; // Max range if no shots
            }
            return tank.averageEngagementDistance || 150; // Default medium range
        });
        const averageEngagementRange = engagementDistances.reduce((sum, dist) => sum + dist, 0) / engagementDistances.length;
        
        // 2. Coordination score (based on positioning and timing)
        const coordinationScore = this.calculateCoordinationScore(team);
        
        // 3. Adaptability score (behavior changes during battle)
        const adaptabilityScore = this.calculateAdaptabilityScore(team);
        
        // 4. Survival efficiency (damage dealt vs damage taken)
        const totalDamageDealt = team.reduce((sum, tank) => sum + (tank.damageDealt || 0), 0);
        const totalDamageTaken = team.reduce((sum, tank) => sum + (tank.damageTaken || 0), 0);
        const survivalEfficiency = totalDamageTaken > 0 ? totalDamageDealt / totalDamageTaken : totalDamageDealt > 0 ? 2.0 : 1.0;
        
        // 5. Tactic diversity (variety in tank behaviors)
        const tacticDiversity = this.calculateTacticDiversity(team);
        
        return {
            averageEngagementRange,
            coordinationScore,
            adaptabilityScore,
            survivalEfficiency,
            tacticDiversity
        };
    }

    calculateCoordinationScore(team) {
        // Measure how well the team coordinated their actions
        let coordinationScore = 0;
        const aliveTanks = team.filter(tank => tank.isAlive);
        
        if (aliveTanks.length < 2) {
            return 0.5; // Default for single tank
        }
        
        // Check for synchronized attacks (shots fired within 2 seconds of each other)
        let synchronizedAttacks = 0;
        let totalAttackWindows = 0;
        
        aliveTanks.forEach((tank1, i) => {
            aliveTanks.slice(i + 1).forEach(tank2 => {
                if (tank1.lastShotTime && tank2.lastShotTime) {
                    totalAttackWindows++;
                    if (Math.abs(tank1.lastShotTime - tank2.lastShotTime) < 2.0) {
                        synchronizedAttacks++;
                    }
                }
            });
        });
        
        if (totalAttackWindows > 0) {
            coordinationScore += (synchronizedAttacks / totalAttackWindows) * 0.5;
        }
        
        // Check for formation maintenance (tanks staying within reasonable distance)
        let formationMaintained = 0;
        let formationChecks = 0;
        
        aliveTanks.forEach((tank1, i) => {
            aliveTanks.slice(i + 1).forEach(tank2 => {
                formationChecks++;
                const distance = Math.sqrt(
                    Math.pow(tank1.x - tank2.x, 2) + Math.pow(tank1.y - tank2.y, 2)
                );
                if (distance < 200 && distance > 50) { // Good formation distance
                    formationMaintained++;
                }
            });
        });
        
        if (formationChecks > 0) {
            coordinationScore += (formationMaintained / formationChecks) * 0.5;
        }
        
        return Math.min(1.0, coordinationScore);
    }

    calculateAdaptabilityScore(team) {
        // Measure how much tanks adapted their behavior during the battle
        let adaptabilityScore = 0;
        
        team.forEach(tank => {
            if (!tank.ai) {
                return;
            }
            
            // Check for state changes (indicating adaptation)
            const stateChanges = tank.ai.stateChanges || 0;
            const adaptabilityBonus = Math.min(stateChanges / 5, 1.0); // Max bonus for 5+ state changes
            
            // Check for target switching (tactical awareness)
            const targetSwitches = tank.ai.targetSwitches || 0;
            const targetingBonus = Math.min(targetSwitches / 3, 1.0); // Max bonus for 3+ target switches
            
            adaptabilityScore += (adaptabilityBonus + targetingBonus) / 2;
        });
        
        return team.length > 0 ? adaptabilityScore / team.length : 0;
    }

    calculateTacticDiversity(team) {
        // Measure the variety of tactics used by the team
        const strategies = team.map(tank => {
            if (!tank.genome) {
                return 'Unknown';
            }
            
            // Classify based on genome traits
            const aggression = tank.genome[0] || 0;
            const defense = tank.genome[3] || 0;
            const teamwork = tank.genome[4] || 0;
            const evasion = tank.genome[8] || 0;
            
            if (aggression > 0.7) {
                return 'Aggressive';
            }
            if (defense > 0.7) {
                return 'Defensive';
            }
            if (evasion > 0.7) {
                return 'Evasive';
            }
            if (teamwork > 0.7) {
                return 'Supportive';
            }
            return 'Balanced';
        });
        
        const uniqueStrategies = new Set(strategies);
        return uniqueStrategies.size / Math.max(team.length, 1); // Diversity ratio
    }

    calculateBattleComplexity() {
        // Overall measure of how complex/interesting the battle was
        let complexity = 0;
        
        // 1. Combat intensity (shots fired per second)
        const totalShots = [...this.redTeam, ...this.blueTeam].reduce((sum, tank) => sum + (tank.shotsFired || 0), 0);
        const shotsPerSecond = this.battleTime > 0 ? totalShots / this.battleTime : 0;
        complexity += Math.min(shotsPerSecond / 5, 1.0) * 0.3; // Max at 5 shots/second
        
        // 2. Battle duration (longer battles can be more complex)
        const durationComplexity = Math.min(this.battleTime / 60, 1.0); // Max at 60 seconds
        complexity += durationComplexity * 0.2;
        
        // 3. Hill control changes (more back-and-forth = more complex)
        if (this.hill) {
            const controlChanges = this.hill.controlChanges || 0;
            complexity += Math.min(controlChanges / 5, 1.0) * 0.3; // Max at 5 control changes
        }
        
        // 4. Damage exchange ratio (close battles = more complex)
        const redDamage = this.redTeam.reduce((sum, tank) => sum + (tank.damageDealt || 0), 0);
        const blueDamage = this.blueTeam.reduce((sum, tank) => sum + (tank.damageDealt || 0), 0);
        const totalDamage = redDamage + blueDamage;
        if (totalDamage > 0) {
            const damageBalance = 1 - Math.abs(redDamage - blueDamage) / totalDamage;
            complexity += damageBalance * 0.2;
        }
        
        return Math.min(1.0, complexity);
    }
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        // Draw grid
        this.drawGrid();
        // Draw King of the Hill
        if (this.hill) {
            this.hill.render(this.ctx);
        }
        // Draw tanks
        this.tanks.forEach(tank => tank.render(this.ctx));
        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        // Draw UI overlay
        this.drawBattleInfo();
    }
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        const gridSize = 50;
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    drawBattleInfo() {
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px Courier New';
        // Show battle time or waiting status
        if (!this.battleStarted) {
            this.ctx.fillText(`Status: Waiting for tanks to move...`, 10, 25);
        } else if (this.gameState === 'ended') {
            this.ctx.fillText(`Battle Ended at: ${this.battleTime.toFixed(1)}s`, 10, 25);
        } else {
            this.ctx.fillText(`Battle Time: ${this.battleTime.toFixed(1)}s`, 10, 25);
        }
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillText(`Red: ${aliveRed}`, 10, 50);
        this.ctx.fillStyle = '#4444ff';
        this.ctx.fillText(`Blue: ${aliveBlue}`, 10, 75);
        // Show battle result when game has ended
        if (this.gameState === 'ended') {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '16px Courier New';
            let resultText = '';
            if (aliveRed === 0 && aliveBlue === 0) {
                resultText = 'DRAW - All tanks destroyed!';
            } else if (aliveRed === 0) {
                resultText = 'BLUE TEAM WINS!';
            } else if (aliveBlue === 0) {
                resultText = 'RED TEAM WINS!';
            } else if (this.hill && this.hill.isGameWon()) {
                // Hill control victory
                const hillWinner = this.hill.getWinner();
                if (hillWinner === 'red') {
                    resultText = 'RED TEAM WINS - Hill Control!';
                } else if (hillWinner === 'blue') {
                    resultText = 'BLUE TEAM WINS - Hill Control!';
                } else {
                    resultText = 'BATTLE TIMEOUT';
                }
            } else {
                resultText = 'BATTLE TIMEOUT';
            }
            this.ctx.fillText(resultText, 10, 105);
        }
    }
    updateUI() {
        // Current Battle panel has been removed - no UI updates needed
        // Battle information is displayed directly on the battlefield
        // This function is kept for compatibility but does nothing
        return;
    }
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
}
// Obstacle class
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    render(ctx) {
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
    // Export classes to global scope
    window.GameEngine = GameEngine;
    window.Obstacle = Obstacle;
    // Dependencies for system integration
    // Requires: EvolutionEngine, ASIArchModules, ASIArchVisualizer