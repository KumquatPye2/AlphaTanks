// King of the Hill - Control Point System
class Hill {
    constructor(x, y, radius = 60) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.controllingTeam = null;
        this.controlProgress = 0; // 0-100, how contested the hill is
        this.captureTime = 3.0; // Seconds to capture
        this.contestRadius = this.radius + 20; // Larger radius for contesting
        
        // Scoring
        this.pointsPerSecond = 10;
        this.redScore = 0;
        this.blueScore = 0;
        this.maxScore = 500; // First to 500 wins
        
        // Visual effects
        this.pulseTimer = 0;
        this.captureEffects = [];
        
        // Capture history for AI learning
        this.captureEvents = [];
    }
    
    update(deltaTime, tanks) {
        this.pulseTimer += deltaTime;
        
        // Find tanks on the hill
        const tanksOnHill = this.getTanksInArea(tanks, this.contestRadius);
        const redTanks = tanksOnHill.filter(tank => tank.team === 'red');
        const blueTanks = tanksOnHill.filter(tank => tank.team === 'blue');
        
        // Determine hill status
        const redCount = redTanks.length;
        const blueCount = blueTanks.length;
        
        if (redCount > 0 && blueCount === 0) {
            // Red team capturing/holding
            this.updateCapture('red', deltaTime);
        } else if (blueCount > 0 && redCount === 0) {
            // Blue team capturing/holding
            this.updateCapture('blue', deltaTime);
        } else if (redCount > 0 && blueCount > 0) {
            // Contested - no progress
            this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 30);
        } else {
            // Empty hill - slow decay
            this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 10);
            if (this.controlProgress === 0) {
                this.controllingTeam = null;
            }
        }
        
        // Award points if hill is controlled
        if (this.controllingTeam && this.controlProgress >= 100) {
            const pointsToAdd = this.pointsPerSecond * deltaTime;
            if (this.controllingTeam === 'red') {
                this.redScore += pointsToAdd;
            } else {
                this.blueScore += pointsToAdd;
            }
        }
        
        // Update visual effects
        this.updateEffects(deltaTime);
    }
    
    updateCapture(team, deltaTime) {
        if (this.controllingTeam === team) {
            // Same team, increase control
            this.controlProgress = Math.min(100, this.controlProgress + deltaTime * (100 / this.captureTime));
        } else if (this.controllingTeam === null) {
            // Neutral hill, start capturing
            this.controllingTeam = team;
            this.controlProgress = deltaTime * (100 / this.captureTime);
        } else {
            // Enemy team, contest the hill
            this.controlProgress = Math.max(0, this.controlProgress - deltaTime * 40);
            if (this.controlProgress === 0) {
                this.controllingTeam = team;
                this.controlProgress = deltaTime * (100 / this.captureTime);
                
                // Record capture event for AI learning
                this.captureEvents.push({
                    time: Date.now(),
                    previousTeam: this.controllingTeam,
                    newTeam: team,
                    contestDuration: deltaTime
                });
            }
        }
    }
    
    getTanksInArea(tanks, radius) {
        return tanks.filter(tank => {
            if (!tank.isAlive) {
                return false;
            }
            
            const dx = tank.x + tank.width / 2 - this.x;
            const dy = tank.y + tank.height / 2 - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= radius;
        });
    }
    
    updateEffects(deltaTime) {
        // Update capture effects
        this.captureEffects = this.captureEffects.filter(effect => {
            effect.life -= deltaTime;
            effect.scale += deltaTime * 2;
            effect.alpha = effect.life / effect.maxLife;
            return effect.life > 0;
        });
        
        // Add new effects when capturing
        if (this.controlProgress > 0 && this.controlProgress < 100 && Math.random() < 0.3) {
            this.captureEffects.push({
                x: this.x + (Math.random() - 0.5) * this.radius,
                y: this.y + (Math.random() - 0.5) * this.radius,
                scale: 0.5,
                life: 1.0,
                maxLife: 1.0,
                alpha: 1.0,
                color: this.controllingTeam === 'red' ? '#ff4444' : '#4444ff'
            });
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Hill base (always visible)
        const pulseScale = 1 + Math.sin(this.pulseTimer * 2) * 0.05;
        
        // Outer contest radius (faint)
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.contestRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Main hill circle
        ctx.fillStyle = this.getHillColor();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Control progress ring
        if (this.controlProgress > 0) {
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = this.controllingTeam === 'red' ? '#ff4444' : '#4444ff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 
                   -Math.PI / 2, 
                   -Math.PI / 2 + (this.controlProgress / 100) * Math.PI * 2);
            ctx.stroke();
        }
        
        // Hill center indicator
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = this.controllingTeam === 'red' ? '#ff6666' : 
                       this.controllingTeam === 'blue' ? '#6666ff' : '#888888';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Render capture effects
        this.captureEffects.forEach(effect => {
            ctx.globalAlpha = effect.alpha;
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.scale * 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
        
        // Score display
        this.renderScoreUI(ctx);
    }
    
    getHillColor() {
        if (this.controllingTeam === 'red') {
            return '#ff4444';
        } else if (this.controllingTeam === 'blue') {
            return '#4444ff';
        } else {
            return '#888888';
        }
    }
    
    renderScoreUI(ctx) {
        // Score display in top center
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - 150, 10, 300, 60);
        
        // Red team score
        ctx.fillStyle = '#ff4444';
        ctx.fillText(`Red: ${Math.floor(this.redScore)}`, this.x - 60, 40);
        
        // Blue team score
        ctx.fillStyle = '#4444ff';
        ctx.fillText(`Blue: ${Math.floor(this.blueScore)}`, this.x + 60, 40);
        
        // Hill status
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffffff';
        let statusText = 'Neutral';
        if (this.controllingTeam) {
            const progress = Math.floor(this.controlProgress);
            statusText = `${this.controllingTeam.toUpperCase()} ${progress}%`;
        }
        ctx.fillText(statusText, this.x, 58);
        
        ctx.restore();
    }
    
    // Check if game is won
    isGameWon() {
        return this.redScore >= this.maxScore || this.blueScore >= this.maxScore;
    }
    
    getWinner() {
        if (this.redScore >= this.maxScore) {
            return 'red';
        }
        if (this.blueScore >= this.maxScore) {
            return 'blue';
        }
        return null;
    }
    
    // Get strategic information for AI
    getStrategicInfo() {
        return {
            position: { x: this.x, y: this.y },
            radius: this.radius,
            contestRadius: this.contestRadius,
            controllingTeam: this.controllingTeam,
            controlProgress: this.controlProgress,
            redScore: this.redScore,
            blueScore: this.blueScore,
            isContested: this.controlProgress > 0 && this.controlProgress < 100,
            isNeutral: this.controllingTeam === null,
            isSecure: this.controlProgress >= 100
        };
    }
}
