// Evolution Engine - ASI-ARCH implementation for tank behavior evolution
// Manages battleResults tracking, nextGeneration cycles, and evolvePopulation mechanics
class EvolutionEngine {
    constructor() {
        this.currentGeneration = 0;
        this.generation = 1; // For test compatibility
        this.totalExperiments = 0;
        this.totalBattles = 0;
        
        // ASI-ARCH components
        this.researcher = new TankResearcher();
        this.engineer = new TankEngineer();
        this.analyst = new TankAnalyst();
        this.cognitionBase = new MilitaryTacticsKnowledge();
        this.asiArch = new ASIArchModules(); // For test compatibility
        
        // Population arrays for test compatibility
        this.redPopulation = [];
        this.bluePopulation = [];
        
        // Initialize populations
        this.initializePopulations();
        
        // Evolution state with battleResults tracking
        this.candidatePool = []; // Top performing genomes
        this.experimentHistory = [];
        this.battleResults = {
            red: { wins: 0, totalBattles: 0 },
            blue: { wins: 0, totalBattles: 0 }
        }; // Track all battle outcomes for analysis
        this.isEvolutionRunning = false;
        this.evolutionSpeed = 1.0; // Speed multiplier
        
        // Statistics
        this.redTeamWins = 0;
        this.blueTeamWins = 0;
        this.draws = 0;
        
        this.bindEvents();
    }
    
    initializePopulations() {
        // Initialize with 10 tanks per team
        for (let i = 0; i < 10; i++) {
            this.redPopulation.push(this.createTank(100 + i * 50, 300, 'red'));
            this.bluePopulation.push(this.createTank(500 + i * 50, 300, 'blue'));
        }
    }
    
    generateTankGenome() {
        // Generate a random 9-trait genome
        const genome = [];
        for (let i = 0; i < 9; i++) {
            genome.push(Math.random());
        }
        return genome;
    }
    
    createTank(x, y, team) {
        const genome = this.generateTankGenome();
        const tank = {
            x: x,
            y: y,
            team: team,
            genome: genome,
            fitness: 0.5,
            health: 100
        };
        // Create AI with reference to tank, and set up circular reference
        tank.ai = new TankAI(tank);
        return tank;
    }
    
    calculateTeamFitness(teamOrGenomes, battleResults, team) {
        // Handle different calling patterns from tests
        if (typeof teamOrGenomes === 'string') {
            // Called with team name - calculate fitness from battle results
            const teamName = teamOrGenomes;
            if (this.battleResults[teamName] && this.battleResults[teamName].totalBattles > 0) {
                const winRate = this.battleResults[teamName].wins / this.battleResults[teamName].totalBattles;
                
                // Red Queen competitive weighting system
                const redQueenWeight = winRate > 0.7 ? 1.05 : 1.0; // Competitive weight for arms race
                const redQueenBoost = winRate > 0.7 ? 0.05 : 0; // 5% boost for dominant teams
                
                return Math.min(1.0, winRate * redQueenWeight + redQueenBoost);
            }
            return 0.5; // Default fitness
        }
        
        // Called with genomes array
        const genomes = teamOrGenomes;
        if (!Array.isArray(genomes)) {
            return 0.5;
        }
        
        return genomes.map(item => {
            // Handle both genome arrays and tank objects with genome property
            let genome = Array.isArray(item) ? item : (item.genome || item);
            
            // Convert genome object to array format if needed
            if (!Array.isArray(genome) && genome && typeof genome === 'object') {
                genome = [
                    genome.aggression || 0.5,
                    genome.caution || 0.5,
                    genome.speed || 0.5,
                    genome.accuracy || 0.5,
                    genome.cooperation || 0.5,
                    genome.formation || 0.5,
                    genome.flanking || 0,
                    genome.ambush || 0,
                    genome.sacrifice || 0
                ];
            }
            
            if (!Array.isArray(genome)) {
                console.warn('⚠️ Invalid genome format:', item);
                return 0.5; // Default fitness
            }

            // Calculate fitness based on actual battle performance, not just genome traits
            if (battleResults && team) {
                return this.calculateBattlePerformanceFitness(item, battleResults, team);
            }
            
            // Fallback: basic genome-based fitness (for initialization)
            const baseFitness = genome.reduce((sum, trait) => sum + trait, 0) / genome.length;
            return Math.max(0, Math.min(1, baseFitness));
        });
    }
    
    calculateBattlePerformanceFitness(tankOrGenome, battleResults, team) {
        // Extract tank object if we have it, otherwise use basic metrics
        const tank = tankOrGenome.genome ? tankOrGenome : null;
        
        let fitnessScore = 0.5; // Base fitness
        
        // 1. Battle Outcome (40% of fitness)
        if (battleResults.winner === team) {
            fitnessScore += 0.4; // Full win bonus
        } else if (battleResults.winner === 'timeout') {
            // For timeouts, award based on survivors and performance
            const teamSurvivors = battleResults[`${team}Survivors`] || 0;
            const enemyTeam = team === 'red' ? 'blue' : 'red';
            const enemySurvivors = battleResults[`${enemyTeam}Survivors`] || 0;
            
            if (teamSurvivors > enemySurvivors) {
                fitnessScore += 0.3; // Winning timeout
            } else if (teamSurvivors === enemySurvivors) {
                fitnessScore += 0.2; // Draw timeout
            } else {
                fitnessScore += 0.1; // Losing timeout
            }
        }
        // Losing gets no bonus (stays at 0.5 base)
        
        // 2. Individual Tank Performance (30% of fitness) - if we have tank data
        if (tank) {
            let performanceScore = 0;
            
            // Survival bonus
            if (tank.isAlive) {
                performanceScore += 0.1;
            }
            
            // Combat effectiveness
            const accuracy = tank.shotsFired > 0 ? tank.shotsHit / tank.shotsFired : 0;
            performanceScore += accuracy * 0.05;
            
            // Damage efficiency 
            const damageRatio = tank.damageTaken > 0 ? tank.damageDealt / tank.damageTaken : 
                              tank.damageDealt > 0 ? 1.0 : 0.5;
            performanceScore += Math.min(damageRatio, 1.0) * 0.1;
            
            // Kill contribution
            performanceScore += tank.kills * 0.05;
            
            fitnessScore += performanceScore * 0.3;
        }
        
        // 3. Team Performance Metrics (20% of fitness)
        const totalKills = battleResults.totalKills || 0;
        const battleDuration = battleResults.duration || 30;
        
        // Reward quick decisive battles
        if (battleResults.winner !== 'timeout') {
            const speedBonus = Math.max(0, (30 - battleDuration) / 30) * 0.1;
            fitnessScore += speedBonus;
        }
        
        // Reward action/engagement
        const engagementBonus = Math.min(totalKills / 6, 1.0) * 0.1; // 6 kills = full bonus
        fitnessScore += engagementBonus;
        
        // 4. Genome Quality Bonus (10% of fitness)
        const genome = tank?.genome || tankOrGenome;
        if (Array.isArray(genome)) {
            // Reward balanced genomes (avoid extreme values)
            const balance = 1 - genome.reduce((acc, trait) => acc + Math.abs(trait - 0.5), 0) / genome.length / 0.5;
            fitnessScore += balance * 0.1;
        }
        
        // Ensure fitness stays in valid range [0, 1]
        return Math.max(0, Math.min(1, fitnessScore));
    }

    evolvePopulation(team) {
        const population = team === 'red' ? this.redPopulation : this.bluePopulation;
        
        // Preserve elite individuals (top 20% by fitness)
        const sortedByFitness = [...population].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        const eliteCount = Math.floor(population.length * 0.2);
        const elites = sortedByFitness.slice(0, eliteCount);
        
        // Apply ASI-ARCH modules if available
        if (this.asiArch) {
            let evolvedPopulation = this.asiArch.applyResearcher(population, team);
            evolvedPopulation = this.asiArch.applyEngineer(evolvedPopulation, team);
            
            const otherPopulation = team === 'red' ? this.bluePopulation : this.redPopulation;
            evolvedPopulation = this.asiArch.applyAnalyst(evolvedPopulation, otherPopulation, team);
            evolvedPopulation = this.asiArch.applyCognition(evolvedPopulation, team);
            
            // Preserve elites by replacing some evolved individuals
            for (let i = 0; i < elites.length; i++) {
                evolvedPopulation[i] = { ...elites[i] };
            }
            
            // Update the actual population
            if (team === 'red') {
                this.redPopulation = evolvedPopulation;
            } else {
                this.bluePopulation = evolvedPopulation;
            }
        } else {
            // Basic mutation if no ASI-ARCH modules - ensure genomes actually change
            population.forEach((tank, index) => {
                // Skip elite individuals
                if (index < eliteCount) {return;}
                
                tank.genome = tank.genome.map(gene => {
                    // 30% mutation chance to ensure changes
                    if (Math.random() < 0.3) {
                        return Math.max(0, Math.min(1, gene + (Math.random() - 0.5) * 0.2));
                    }
                    return gene;
                });
            });
        }
        
        return team === 'red' ? this.redPopulation : this.bluePopulation;
    }
    
    recordBattleResult(winner) {
        if (this.battleResults[winner]) {
            this.battleResults[winner].wins++;
            this.battleResults[winner].totalBattles++;
        }
        
        // Also increment the other team's total battles
        const otherTeam = winner === 'red' ? 'blue' : 'red';
        if (this.battleResults[otherTeam]) {
            this.battleResults[otherTeam].totalBattles++;
        }
    }
    
    updateFitnessDisplay() {
        // Update DOM elements with fitness information
        try {
            const redFitnessEl = document.getElementById('redFitness');
            const blueFitnessEl = document.getElementById('blueFitness');
            
            if (redFitnessEl) {
                // Use battle results fitness if available
                const redFitness = this.calculateTeamFitness('red');
                redFitnessEl.textContent = `Red Fitness: ${redFitness.toFixed(2)}`;
            }
            
            if (blueFitnessEl) {
                // Use battle results fitness if available
                const blueFitness = this.calculateTeamFitness('blue');
                blueFitnessEl.textContent = `Blue Fitness: ${blueFitness.toFixed(2)}`;
            }
        } catch (_e) {
            // DOM elements may not exist in test environment
        }
    }
    
    bindEvents() {
        window.addEventListener('battleEnd', (event) => {
            this.handleBattleEnd(event.detail);
        });
    }
    
    startEvolution() {
        console.log('🧬 Starting ASI-ARCH Evolution System');
        this.isEvolutionRunning = true;
        this.logEvolutionEvent('Evolution system started', 'system');
        
        // Initialize with basic genomes if candidate pool is empty
        if (this.candidatePool.length === 0) {
            this.initializeCandidatePool();
        }
        
        this.runNextExperiment();
    }
    
    pauseEvolution() {
        this.isEvolutionRunning = false;
        this.logEvolutionEvent('Evolution paused', 'system');
    }
    
    resetEvolution() {
        this.currentGeneration = 0;
        this.totalExperiments = 0;
        this.totalBattles = 0;
        this.candidatePool = [];
        this.experimentHistory = [];
        this.redTeamWins = 0;
        this.blueTeamWins = 0;
        this.draws = 0;
        
        this.logEvolutionEvent('Evolution system reset', 'system');
        this.updateUI();
    }
    
    initializeCandidatePool() {
        console.log('🔬 Initializing candidate pool with baseline genomes');
        
        // Create diverse initial population
        for (let i = 0; i < 10; i++) {
            const genome = this.generateRandomGenome();
            this.candidatePool.push({
                genome: genome,
                fitness: 0,
                generation: 0,
                battles: 0,
                wins: 0,
                strategy: this.classifyStrategy(genome)
            });
        }
        
        this.logEvolutionEvent('Candidate pool initialized with 10 baseline genomes', 'initialization');
    }
    
    generateRandomGenome() {
        return {
            aggression: Math.random(),
            caution: Math.random(),
            speed: Math.random(),
            accuracy: Math.random(),
            cooperation: Math.random(),
            formation: Math.random(),
            // Advanced traits (initially zero, evolve over time)
            flanking: 0,
            ambush: 0,
            sacrifice: 0
        };
    }
    
    classifyStrategy(genome) {
        if (genome.aggression > 0.7) {return 'Aggressive';}
        if (genome.caution > 0.7) {return 'Defensive';}
        if (genome.cooperation > 0.7) {return 'Cooperative';}
        if (genome.formation > 0.7) {return 'Formation';}
        return 'Balanced';
    }
    
    async runNextExperiment() {
        if (!this.isEvolutionRunning) {return;}
        
        this.totalExperiments++;
        
        // ASI-ARCH Module 1: Researcher - Propose new architectures
        const { redGenomes, blueGenomes } = this.researcher.proposeExperiment(
            this.candidatePool,
            this.experimentHistory,
            this.cognitionBase
        );
        
        // ASI-ARCH Module 2: Engineer - Evaluate in real environment
        const battleResult = await this.engineer.runBattle(redGenomes, blueGenomes);
        
        // ASI-ARCH Module 3: Analyst - Generate insights
        const analysis = this.analyst.analyzeResults(battleResult, this.experimentHistory);
        
        // Record experiment
        const experiment = {
            id: this.totalExperiments,
            generation: this.currentGeneration,
            redGenomes,
            blueGenomes,
            result: battleResult,
            analysis,
            timestamp: Date.now()
        };
        
        this.experimentHistory.push(experiment);
        
        // Update candidate pool
        this.updateCandidatePool(experiment);
        
        // Log insights
        if (analysis.significantDiscovery) {
            this.logEvolutionEvent(analysis.significantDiscovery, 'discovery');
        }
        
        // Continue evolution
        setTimeout(() => {
            if (this.isEvolutionRunning) {
                this.runNextExperiment();
            }
        }, 1000 / this.evolutionSpeed);
    }
    
    handleBattleEnd(battleResult) {
        this.totalBattles++;
        
        // Update win statistics
        if (battleResult.winner === 'red') {
            this.redTeamWins++;
        } else if (battleResult.winner === 'blue') {
            this.blueTeamWins++;
        } else {
            this.draws++;
        }
        
        this.updateUI();
        
        this.logEvolutionEvent(
            `Battle ${this.totalBattles}: ${battleResult.winner} wins in ${battleResult.duration.toFixed(1)}s`,
            'battle'
        );
        
        // If evolution is running and this was a manual battle, don't interfere
        // The evolution system handles its own battle flow through runNextExperiment
    }
    
    updateCandidatePool(experiment) {
        // Extract genomes from tank objects if needed
        const redGenomes = experiment.redGenomes.map(tank => tank.genome || tank);
        const blueGenomes = experiment.blueGenomes.map(tank => tank.genome || tank);
        
        const redFitness = this.calculateTeamFitness(redGenomes, experiment.result, 'red');
        const blueFitness = this.calculateTeamFitness(blueGenomes, experiment.result, 'blue');
        
        // DEBUG: Check if blue fitness is being calculated correctly
        if (experiment.result.winner === 'blue') {
            console.log(`🔬 Blue team won! Blue fitness values:`, blueFitness.map(f => f.toFixed(3)));
        }
        
        // RED QUEEN RACE: Add team-specific candidates to maintain lineages
        redGenomes.forEach((genome, index) => {
            this.addToPool({
                genome,
                fitness: redFitness[index],
                generation: this.currentGeneration,
                battles: 1,
                wins: experiment.result.winner === 'red' ? 1 : 0,
                team: 'red', // RED QUEEN: Track team lineage
                strategy: this.classifyStrategy(genome)
            });
        });
        
        blueGenomes.forEach((genome, index) => {
            this.addToPool({
                genome,
                fitness: blueFitness[index],
                generation: this.currentGeneration,
                battles: 1,
                wins: experiment.result.winner === 'blue' ? 1 : 0,
                team: 'blue', // RED QUEEN: Track team lineage
                strategy: this.classifyStrategy(genome)
            });
        });
        
        // Keep only top performers (like ASI-ARCH's top-50)
        this.candidatePool.sort((a, b) => b.fitness - a.fitness);
        this.candidatePool = this.candidatePool.slice(0, 20);
        
        // Check for generation advancement
        if (this.totalExperiments % 5 === 0) {
            this.currentGeneration++;
            this.logEvolutionEvent(`Advanced to Generation ${this.currentGeneration}`, 'generation');
        }
    }
    
    addToPool(candidate) {
        // Check if similar genome already exists
        const existingIndex = this.candidatePool.findIndex(c => 
            this.genomeSimilarity(c.genome, candidate.genome) > 0.9
        );
        
        if (existingIndex !== -1) {
            // Update existing candidate
            const existing = this.candidatePool[existingIndex];
            existing.battles++;
            existing.wins += candidate.wins;
            existing.fitness = (existing.fitness + candidate.fitness) / 2;
        } else {
            // Add new candidate
            this.candidatePool.push(candidate);
        }
    }
    
    genomeSimilarity(genome1, genome2) {
        const keys = Object.keys(genome1);
        let similarity = 0;
        
        keys.forEach(key => {
            similarity += 1 - Math.abs(genome1[key] - genome2[key]);
        });
        
        return similarity / keys.length;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    assessArchitecturalQuality(genome) {
        // Evaluate genome complexity and balance
        const traits = Object.values(genome);
        const variance = this.calculateVariance(traits);
        const complexity = traits.filter(t => t > 0.1).length / traits.length;
        const balance = 1 - Math.abs(0.5 - traits.reduce((a, b) => a + b) / traits.length);
        
        return (variance + complexity + balance) / 3;
    }
    
    evaluateTacticalSophistication(genome, stats) {
        // Rate the sophistication of the tank's behavior
        let sophistication = 0;
        
        // Reward balanced approaches
        if (genome.aggression > 0.3 && genome.caution > 0.3) {sophistication += 0.2;}
        if (genome.cooperation > 0.5) {sophistication += 0.2;}
        if (genome.formation > 0.4) {sophistication += 0.1;}
        
        // Reward advanced traits
        if (genome.flanking > 0.1) {sophistication += 0.3;}
        if (genome.ambush > 0.1) {sophistication += 0.2;}
        
        // Performance bonuses
        if (stats.accuracy > 0.6) {sophistication += 0.1;}
        if (stats.averageSurvivalTime > 60) {sophistication += 0.1;}
        
        return Math.min(sophistication, 1.0);
    }
    
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    getBestGenome(team = null) {
        if (this.candidatePool.length === 0) {return null;}
        
        let pool = this.candidatePool;
        if (team) {
            // Filter by team preference if needed
            pool = this.candidatePool.filter(c => {
                const strategy = this.classifyStrategy(c.genome);
                return team === 'red' ? 
                    (strategy === 'Aggressive' || strategy === 'Balanced') :
                    (strategy === 'Defensive' || strategy === 'Cooperative');
            });
        }
        
        return pool.length > 0 ? pool[0] : this.candidatePool[0];
    }
    
    getEvolutionStats() {
        // RED QUEEN: Calculate separate team fitness averages
        const redCandidates = this.candidatePool.filter(c => c.team === 'red');
        const blueCandidates = this.candidatePool.filter(c => c.team === 'blue');
        const unassignedCandidates = this.candidatePool.filter(c => !c.team);
        
        const redAvgFitness = redCandidates.length > 0 ?
            redCandidates.reduce((sum, c) => sum + c.fitness, 0) / redCandidates.length : 0;
            
        const blueAvgFitness = blueCandidates.length > 0 ?
            blueCandidates.reduce((sum, c) => sum + c.fitness, 0) / blueCandidates.length : 0;
            
        // DEBUG: Only log if blue fitness is still 0 but blue has candidates
        if (blueAvgFitness === 0 && blueCandidates.length > 0) {
            console.log(`📊 Blue Fitness Debug: ${blueCandidates.length} blue candidates but avg fitness is 0`);
            console.log('📊 Blue candidates sample:', blueCandidates.slice(0, 3).map(c => ({ fitness: c.fitness, team: c.team })));
        }
        
        // Overall average for compatibility
        const overallAvgFitness = this.candidatePool.length > 0 ?
            this.candidatePool.reduce((sum, c) => sum + c.fitness, 0) / this.candidatePool.length : 0;
        
        const bestCandidate = this.candidatePool.length > 0 ? this.candidatePool[0] : null;
        const bestRedCandidate = redCandidates.length > 0 ? redCandidates.reduce((best, current) => 
            current.fitness > best.fitness ? current : best) : null;
        const bestBlueCandidate = blueCandidates.length > 0 ? blueCandidates.reduce((best, current) => 
            current.fitness > best.fitness ? current : best) : null;
        
        return {
            generation: this.currentGeneration,
            experiments: this.totalExperiments,
            battles: this.totalBattles,
            candidatePoolSize: this.candidatePool.length,
            averageFitness: overallAvgFitness,
            redAverageFitness: redAvgFitness,
            blueAverageFitness: blueAvgFitness,
            redCandidates: redCandidates.length,
            blueCandidates: blueCandidates.length,
            unassignedCandidates: unassignedCandidates.length,
            bestFitness: bestCandidate ? bestCandidate.fitness : 0,
            bestRedFitness: bestRedCandidate ? bestRedCandidate.fitness : 0,
            bestBlueFitness: bestBlueCandidate ? bestBlueCandidate.fitness : 0,
            bestStrategy: bestCandidate ? bestCandidate.strategy : 'None',
            redWins: this.redTeamWins,
            blueWins: this.blueTeamWins,
            draws: this.draws
        };
    }
    
    updateUI() {
        const stats = this.getEvolutionStats();
        
        // DEBUG: Log fitness calculation details
        if (stats.blueCandidates > 0) {
            const blueCandidates = this.candidatePool.filter(c => c.team === 'blue');
            console.log(`🐛 Blue UI Debug: ${blueCandidates.length} candidates, avg fitness: ${stats.blueAverageFitness.toFixed(3)}`);
            console.log(`🐛 Recent blue fitness values:`, blueCandidates.slice(-3).map(c => c.fitness.toFixed(3)));
        }
        
        document.getElementById('generationDisplay').textContent = `Generation: ${stats.generation}`;
        document.getElementById('experiments').textContent = stats.experiments;
        document.getElementById('battles').textContent = stats.battles;
        document.getElementById('redWins').textContent = stats.redWins;
        document.getElementById('blueWins').textContent = stats.blueWins;
        
        // RED QUEEN: Use separate team fitness averages
        const redFitnessText = isNaN(stats.redAverageFitness) ? '0.000' : stats.redAverageFitness.toFixed(3);
        const blueFitnessText = isNaN(stats.blueAverageFitness) ? '0.000' : stats.blueAverageFitness.toFixed(3);
        
        document.getElementById('redFitness').textContent = redFitnessText;
        document.getElementById('blueFitness').textContent = blueFitnessText;
        
        document.getElementById('redBest').textContent = stats.bestStrategy;
        document.getElementById('blueBest').textContent = stats.bestStrategy;
        document.getElementById('novelDesigns').textContent = stats.candidatePoolSize;
        
        // Update red/blue adaptations instead of successfulMutations
        // Note: These are updated by the visualizer, so we don't need to update them here
        
        // Update team-specific fitness thresholds
        document.getElementById('redFitnessThreshold').textContent = stats.bestRedFitness.toFixed(3);
        document.getElementById('blueFitnessThreshold').textContent = stats.bestBlueFitness.toFixed(3);
    }
    
    logEvolutionEvent(message, type = 'info') {
        const log = document.getElementById('evolutionLog');
        if (log) {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            
            // Keep only last 50 entries
            while (log.children.length > 50) {
                log.removeChild(log.firstChild);
            }
        }
        
        console.log(`🧬 [${type.toUpperCase()}] ${message}`);
    }
    
    setEvolutionSpeed(speed) {
        this.evolutionSpeed = speed;
        this.logEvolutionEvent(`Evolution speed set to ${speed}x`, 'system');
    }
    
    // Additional evolution management methods for validation
    nextGeneration() {
        // Advance to the next generation of evolution
        this.currentGeneration++;
        this.generation = this.currentGeneration + 1; // Keep both for compatibility
        this.logEvolutionEvent(`Advancing to generation ${this.generation}`, 'evolution');
        
        // Trigger evolution for both teams
        this.evolvePopulation('red');
        this.evolvePopulation('blue');
        
        // Update generation display
        try {
            const generationElement = document.getElementById('generationDisplay');
            if (generationElement) {
                generationElement.textContent = `Generation: ${this.generation}`;
            }
        } catch (_e) {
            // DOM elements may not exist in test environment
        }
    }
}

// Military Tactics Knowledge Base (ASI-ARCH Cognition module)
class MilitaryTacticsKnowledge {
    constructor() {
        this.formations = {
            "phalanx": {
                scenario: "Defensive stand against superior numbers",
                strategy: "Tight formation, coordinated defense",
                traits: { formation: 0.8, caution: 0.6, cooperation: 0.9 }
            },
            "pincer": {
                scenario: "Flanking maneuver against concentrated enemy",
                strategy: "Split force, attack from multiple directions",
                traits: { flanking: 0.7, cooperation: 0.8, aggression: 0.5 }
            },
            "blitzkrieg": {
                scenario: "Quick decisive victory needed",
                strategy: "Fast, aggressive, concentrated assault",
                traits: { speed: 0.9, aggression: 0.9, formation: 0.1 }
            },
            "guerrilla": {
                scenario: "Harass superior enemy force",
                strategy: "Hit and run, avoid direct confrontation",
                traits: { ambush: 0.8, speed: 0.7, caution: 0.8 }
            }
        };
        
        this.principles = {
            "concentration_of_force": "Focus maximum power at decisive point",
            "economy_of_force": "Use minimum necessary force elsewhere",
            "surprise": "Strike when and where enemy doesn't expect",
            "mobility": "Speed and positioning create advantages"
        };
    }
    
    searchKnowledge(query) {
        // Emit visualization event for knowledge search
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('cognition', 'search_knowledge', { 
                trait: 'query',
                query: query 
            });
        }
        
        // Simple keyword matching for tactical knowledge
        const results = [];
        
        Object.entries(this.formations).forEach(([name, formation]) => {
            if (formation.scenario.includes(query) || formation.strategy.includes(query)) {
                results.push({ name, ...formation });
            }
        });
        
        // Emit results event
        if (window.emitASIArchEvent && results.length > 0) {
            window.emitASIArchEvent('cognition', 'knowledge_found', { 
                trait: 'tactical_match',
                formations: results.map(r => r.name).join(', ') 
            });
        }
        
        return results;
    }
    
    getRandomTactic() {
        const formations = Object.keys(this.formations);
        const randomKey = formations[Math.floor(Math.random() * formations.length)];
        const tactic = { name: randomKey, ...this.formations[randomKey] };
        
        // Emit visualization event for tactic selection
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('cognition', 'apply_tactic', { 
                trait: 'formation',
                tactic: tactic.name 
            });
        }
        
        return tactic;
    }
}

// Export classes to global scope
window.EvolutionEngine = EvolutionEngine;
window.MilitaryTacticsKnowledge = MilitaryTacticsKnowledge;
