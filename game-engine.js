// Game Engine - Core game loop and battlefield management
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error(`❌ Canvas element with ID '${canvasId}' not found`);
            throw new Error(`Canvas element with ID '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        
        this.tanks = [];
        this.projectiles = [];
        this.obstacles = [];
        
        this.lastTime = 0;
        this.gameState = 'ready'; // 'ready', 'running', 'paused', 'ended'
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
        // Create strategic obstacles for interesting battles
        const obstacles = [
            { x: this.width * 0.3, y: this.height * 0.3, width: 60, height: 60 },
            { x: this.width * 0.7, y: this.height * 0.3, width: 60, height: 60 },
            { x: this.width * 0.5, y: this.height * 0.5, width: 80, height: 40 },
            { x: this.width * 0.3, y: this.height * 0.7, width: 60, height: 60 },
            { x: this.width * 0.7, y: this.height * 0.7, width: 60, height: 60 }
        ];
        
        this.obstacles = obstacles.map(obs => new Obstacle(obs.x, obs.y, obs.width, obs.height));
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    initializeBattle(redTanks = 5, blueTanks = 5) {
        this.tanks = [];
        this.projectiles = [];
        this.redTeam = [];
        this.blueTeam = [];
        this.battleTime = 0;
        this.gameState = 'ready'; // Don't automatically start - let start() method handle it
        this.battleStarted = false; // Reset battle started flag
        
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
            battleTime: this.battleTime,
            width: this.width,
            height: this.height
        };
    }
    
    checkCollisions() {
        const aliveTanks = this.tanks.filter(tank => tank.isAlive);
        
        // Optimize: Early exit if no active entities
        if (aliveTanks.length === 0 || this.projectiles.length === 0) {
            return;
        }
        
        // Tank-obstacle collisions (only for living tanks)
        aliveTanks.forEach(tank => {
            this.obstacles.forEach(obstacle => {
                if (this.isColliding(tank, obstacle)) {
                    this.resolveTankObstacleCollision(tank, obstacle);
                }
            });
        });
        
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
        
        // Projectile-obstacle collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let hit = false;
            
            for (let j = 0; j < this.obstacles.length && !hit; j++) {
                if (this.isColliding(projectile, this.obstacles[j])) {
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
    
    resolveTankObstacleCollision(tank, obstacle) {
        // Simple collision resolution - push tank away from obstacle
        const tankCenterX = tank.x + tank.width / 2;
        const tankCenterY = tank.y + tank.height / 2;
        const obsCenterX = obstacle.x + obstacle.width / 2;
        const obsCenterY = obstacle.y + obstacle.height / 2;
        
        const dx = tankCenterX - obsCenterX;
        const dy = tankCenterY - obsCenterY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            tank.x = dx > 0 ? obstacle.x + obstacle.width : obstacle.x - tank.width;
        } else {
            tank.y = dy > 0 ? obstacle.y + obstacle.height : obstacle.y - tank.height;
        }
    }
    
    checkWinConditions() {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        if (aliveRed === 0 && aliveBlue > 0) {
            this.endBattle('blue');
        } else if (aliveBlue === 0 && aliveRed > 0) {
            this.endBattle('red');
        }
    }
    
    endBattle(winner) {
        // Enforce minimum battle duration of 15 seconds if battle has started
        const minimumBattleTime = 15; // seconds
        
        if (this.battleStarted && this.battleTime < minimumBattleTime) {
            // Don't end battle yet, let it continue until minimum time
            return;
        }
        
        this.gameState = 'ended';
        // Emit battle end event
        const battleResult = this.getBattleResult(winner);
        window.dispatchEvent(new CustomEvent('battleEnd', { detail: battleResult }));
    }
    
    getBattleResult(winner) {
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        return {
            winner,
            duration: this.battleTime,
            redSurvivors: aliveRed,
            blueSurvivors: aliveBlue,
            totalKills: this.redTeam.length + this.blueTeam.length - aliveRed - aliveBlue,
            redTeamStats: this.calculateTeamStats(this.redTeam),
            blueTeamStats: this.calculateTeamStats(this.blueTeam)
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
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        
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
        } else {
            this.ctx.fillText(`Battle Time: ${this.battleTime.toFixed(1)}s`, 10, 25);
        }
        
        const aliveRed = this.redTeam.filter(tank => tank.isAlive).length;
        const aliveBlue = this.blueTeam.filter(tank => tank.isAlive).length;
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillText(`Red: ${aliveRed}`, 10, 50);
        
        this.ctx.fillStyle = '#4444ff';
        this.ctx.fillText(`Blue: ${aliveBlue}`, 10, 75);
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