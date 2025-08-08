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
        
        // Defer candidate pool initialization until after ResearcherInsights is available
        // This will be called by initializeGame() after ResearcherInsights is created
        this.candidatePoolInitialized = false;
        
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
    
    initializeCandidatePool() {
        // Create initial candidate pool with team-specific diverse genomes
        // Create 10 red-oriented genomes
        for (let i = 0; i < 10; i++) {
            const genome = this.generateTankGenome();
            // Make red genomes more aggressive and risk-taking
            genome[0] = Math.min(1, genome[0] + 0.2); // More aggression
            genome[1] = Math.min(1, genome[1] + 0.1); // More speed
            genome[7] = Math.min(1, genome[7] + 0.2); // More risk-taking
            genome[3] = Math.max(0, genome[3] - 0.1); // Less defensive
            
            // Track team-specific genome generation
            if (window.researcherInsights) {
                window.researcherInsights.trackGenomeGeneration(genome, 'red', 'team-specific');
            }
            
            const candidate = {
                genome: genome,
                fitness: Math.random() * 0.3 + 0.4, // Random fitness between 0.4 and 0.7
                generation: 0,
                team: 'red', // Assign to red team
                lineage: 'red', // Track pure red lineage
                parentTeam: 'red', // Source team for evolution tracking
                id: `red_init_${i}`,
                isInitial: true // Flag to identify initial placeholder fitness
            };
            this.candidatePool.push(candidate);
        }
        
        // Create 10 blue-oriented genomes
        for (let i = 0; i < 10; i++) {
            const genome = this.generateTankGenome();
            // Make blue genomes more defensive and cooperative
            genome[2] = Math.min(1, genome[2] + 0.2); // More accuracy
            genome[3] = Math.min(1, genome[3] + 0.1); // More defense
            genome[4] = Math.min(1, genome[4] + 0.1); // More teamwork
            genome[0] = Math.max(0, genome[0] - 0.1); // Less aggression
            
            // Track team-specific genome generation
            if (window.researcherInsights) {
                window.researcherInsights.trackGenomeGeneration(genome, 'blue', 'team-specific');
            }
            
            const candidate = {
                genome: genome,
                fitness: Math.random() * 0.3 + 0.4, // Random fitness between 0.4 and 0.7
                generation: 0,
                team: 'blue', // Assign to blue team
                lineage: 'blue', // Track pure blue lineage
                parentTeam: 'blue', // Source team for evolution tracking
                id: `blue_init_${i}`,
                isInitial: true // Flag to identify initial placeholder fitness
            };
            this.candidatePool.push(candidate);
        }
    }
    
    generateTankGenome() {
        // Generate a random 9-trait genome with explicit trait mapping
        // Trait order matches display function: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        const genome = [
            Math.random(),  // 0: Aggression
            Math.random(),  // 1: Speed
            Math.random(),  // 2: Accuracy
            Math.random(),  // 3: Defense
            Math.random(),  // 4: Teamwork
            Math.random(),  // 5: Adaptability
            Math.random(),  // 6: Learning
            Math.random(),  // 7: RiskTaking
            Math.random()   // 8: Evasion
        ];
        
        return genome;
    }
    
    createTank(x, y, team) {
        const genome = this.generateTankGenome();
        
        // Track genome generation
        if (window.researcherInsights) {
            window.researcherInsights.trackGenomeGeneration(genome, team, 'tank-creation');
        }
        
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
                // Map object properties to array indices to match display function
                // [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
                genome = [
                    genome.aggression || 0.5,           // 0: Aggression
                    genome.speed || 0.5,                // 1: Speed  
                    genome.accuracy || 0.5,             // 2: Accuracy
                    genome.defense || genome.caution || 0.5,  // 3: Defense
                    genome.teamwork || genome.cooperation || 0.5,  // 4: Teamwork
                    genome.adaptability || 0.5,         // 5: Adaptability
                    genome.learning || 0.5,             // 6: Learning
                    genome.riskTaking || 0.5,           // 7: RiskTaking
                    genome.evasion || 0.5               // 8: Evasion
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
        console.log('DEBUG: evolvePopulation called for team:', team);
        const population = team === 'red' ? this.redPopulation : this.bluePopulation;
        
        // TEAM SEPARATION: Validate population contains only the correct team
        const validatedPopulation = population.filter(tank => 
            !tank.team || tank.team === team
        );
        
        if (validatedPopulation.length !== population.length) {
            console.warn(`⚠️ Removed ${population.length - validatedPopulation.length} cross-team tanks from ${team} population`);
        }
        
        // Preserve elite individuals (top 20% by fitness)
        const sortedByFitness = [...validatedPopulation].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        const eliteCount = Math.floor(validatedPopulation.length * 0.2);
        const elites = sortedByFitness.slice(0, eliteCount);
        
        // Apply ASI-ARCH modules if available
        console.log('DEBUG: Checking if asiArch is available:', !!this.asiArch);
        if (this.asiArch) {
            console.log('DEBUG: Applying ASI-ARCH modules for team:', team);
            let evolvedPopulation = this.asiArch.applyResearcher(validatedPopulation, team);
            evolvedPopulation = this.asiArch.applyEngineer(evolvedPopulation, team);
            
            const otherPopulation = team === 'red' ? this.bluePopulation : this.redPopulation;
            evolvedPopulation = this.asiArch.applyAnalyst(evolvedPopulation, otherPopulation, team);
            console.log('DEBUG: About to call applyCognition for team:', team);
            evolvedPopulation = this.asiArch.applyCognition(evolvedPopulation, team);
            
            // Preserve elites by replacing some evolved individuals
            for (let i = 0; i < elites.length; i++) {
                evolvedPopulation[i] = { ...elites[i] };
            }
            
            // TEAM SEPARATION: Ensure all evolved tanks maintain team identity
            evolvedPopulation.forEach(tank => {
                tank.team = team; // Force correct team assignment
                if (tank.genome) {
                    // Mark genome with team lineage
                    tank.lineage = team;
                    tank.parentTeam = team;
                }
            });
            
            // Update the actual population
            if (team === 'red') {
                this.redPopulation = evolvedPopulation;
            } else {
                this.bluePopulation = evolvedPopulation;
            }
        } else {
            // Basic mutation if no ASI-ARCH modules - ensure genomes actually change
            validatedPopulation.forEach((tank, index) => {
                // Skip elite individuals
                if (index < eliteCount) {
                    return;
                }
                
                // TEAM SEPARATION: Maintain team identity during mutation
                tank.team = team;
                tank.lineage = team;
                tank.parentTeam = team;
                
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
        this.isEvolutionRunning = true;
        this.logEvolutionEvent('Evolution system started', 'system');
        
        // Ensure candidate pool is initialized before starting evolution
        this.ensureCandidatePoolInitialized();
        
        this.runNextExperiment();
    }
    
    ensureCandidatePoolInitialized() {
        if (!this.candidatePoolInitialized) {
            this.initializeCandidatePool();
            this.candidatePoolInitialized = true;
        }
    }
    
    classifyStrategy(genome) {
        // Handle both array and object genome formats
        let aggression, caution, cooperation, formation;
        
        if (Array.isArray(genome)) {
            // Array format: [aggression, speed, accuracy, defense, teamwork, adaptability, learning, riskTaking, evasion]
            aggression = genome[0] || 0;
            caution = genome[3] || 0; // Use defense as caution
            cooperation = genome[4] || 0; // Use teamwork as cooperation  
            formation = genome[4] || 0; // Use teamwork as formation indicator
        } else if (genome && typeof genome === 'object') {
            // Object format: {aggression: 0.5, caution: 0.3, ...}
            aggression = genome.aggression || 0;
            caution = genome.caution || genome.defense || 0;
            cooperation = genome.cooperation || genome.teamwork || 0;
            formation = genome.formation || genome.teamwork || 0;
        } else {
            return 'Balanced';
        }
        
        if (aggression > 0.7) {return 'Aggressive';}
        if (caution > 0.7) {return 'Defensive';}
        if (cooperation > 0.7) {return 'Cooperative';}
        if (formation > 0.7) {return 'Formation';}
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
        }, 1000); // Fixed 1 second delay between battles
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
        
        // SEPARATE EVOLUTION: Ensure strict team lineage separation
        // Red team genomes ONLY go to red candidate pool
        redGenomes.forEach((genome, index) => {
            this.addToPool({
                genome,
                fitness: redFitness[index],
                generation: this.currentGeneration,
                battles: 1,
                wins: experiment.result.winner === 'red' ? 1 : 0,
                team: 'red', // STRICT: Red lineage only
                strategy: this.classifyStrategy(genome),
                lineage: 'red', // Additional lineage tracking
                parentTeam: 'red' // Ensure no cross-team contamination
            });
        });
        
        // Blue team genomes ONLY go to blue candidate pool
        blueGenomes.forEach((genome, index) => {
            this.addToPool({
                genome,
                fitness: blueFitness[index],
                generation: this.currentGeneration,
                battles: 1,
                wins: experiment.result.winner === 'blue' ? 1 : 0,
                team: 'blue', // STRICT: Blue lineage only
                strategy: this.classifyStrategy(genome),
                lineage: 'blue', // Additional lineage tracking
                parentTeam: 'blue' // Ensure no cross-team contamination
            });
        });
        
        // STRICT TEAM SEPARATION: Filter candidates by exact team and lineage
        const redCandidates = this.candidatePool.filter(c => 
            c.team === 'red' && (c.lineage === 'red' || !c.lineage)
        );
        const blueCandidates = this.candidatePool.filter(c => 
            c.team === 'blue' && (c.lineage === 'blue' || !c.lineage)
        );
        const otherCandidates = this.candidatePool.filter(c => 
            !c.team || (c.team !== 'red' && c.team !== 'blue')
        );
        
        // Log team separation before sorting
        this.logEvolutionEvent(
            `Candidate Pool Separation - Red: ${redCandidates.length}, Blue: ${blueCandidates.length}, Others: ${otherCandidates.length}`,
            'pool_management'
        );
        
        // Sort each team by fitness and keep top 8 from each team (16 total)
        redCandidates.sort((a, b) => b.fitness - a.fitness);
        blueCandidates.sort((a, b) => b.fitness - a.fitness);
        otherCandidates.sort((a, b) => b.fitness - a.fitness);
        
        // Ensure equal representation: 8 red, 8 blue, 4 others/unassigned
        const topRed = redCandidates.slice(0, 8);
        const topBlue = blueCandidates.slice(0, 8);
        const topOthers = otherCandidates.slice(0, 4);
        
        // Validate team purity before reconstruction
        const redPurity = topRed.every(c => c.team === 'red');
        const bluePurity = topBlue.every(c => c.team === 'blue');
        
        if (!redPurity || !bluePurity) {
            this.logEvolutionEvent('⚠️ Team purity violation detected in candidate pool!', 'error');
        }
        
        // Reconstruct candidate pool with strict team separation
        this.candidatePool = [...topRed, ...topBlue, ...topOthers];
        
        // Check for generation advancement
        if (this.totalExperiments % 5 === 0) {
            this.currentGeneration++;
            this.logEvolutionEvent(`Advanced to Generation ${this.currentGeneration}`, 'generation');
            
            // Dispatch generation complete event for tracking
            const generationCompleteEvent = new CustomEvent('generationComplete', {
                detail: {
                    generation: this.currentGeneration,
                    totalExperiments: this.totalExperiments,
                    candidatePoolSize: this.candidatePool.length,
                    topFitness: this.candidatePool[0]?.fitness || 0,
                    averageFitness: this.candidatePool.reduce((sum, c) => sum + c.fitness, 0) / this.candidatePool.length || 0,
                    timestamp: Date.now() // Add timestamp to help identify duplicates
                }
            });
            window.dispatchEvent(generationCompleteEvent);
        }
    }
    
    addToPool(candidate) {
        // STRICT TEAM SEPARATION: Only compare with same team lineage
        const existingIndex = this.candidatePool.findIndex(c => 
            c.team === candidate.team && // Must be exact same team
            c.lineage === candidate.lineage && // Must be same lineage
            this.genomeSimilarity(c.genome, candidate.genome) > 0.9
        );
        
        if (existingIndex !== -1) {
            // Update existing candidate from same team lineage only
            const existing = this.candidatePool[existingIndex];
            existing.battles++;
            existing.wins += candidate.wins;
            // Use the better fitness value, not average (rewards improvement)
            existing.fitness = Math.max(existing.fitness, candidate.fitness);
            existing.generation = Math.max(existing.generation, candidate.generation);
        } else {
            // Add new candidate (different team or different genome)
            this.candidatePool.push(candidate);
        }
    }
    
    genomeSimilarity(genome1, genome2) {
        // Handle both array and object formats
        if (Array.isArray(genome1) && Array.isArray(genome2)) {
            if (genome1.length !== genome2.length) {
                return 0;
            }
            
            let similarity = 0;
            for (let i = 0; i < genome1.length; i++) {
                similarity += 1 - Math.abs(genome1[i] - genome2[i]);
            }
            return similarity / genome1.length;
        } else if (typeof genome1 === 'object' && typeof genome2 === 'object') {
            const keys = Object.keys(genome1);
            let similarity = 0;
            
            keys.forEach(key => {
                similarity += 1 - Math.abs((genome1[key] || 0) - (genome2[key] || 0));
            });
            
            return similarity / keys.length;
        }
        
        return 0; // Different formats
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
        console.log(`🧬 EvolutionEngine.getBestGenome called for team: ${team}, pool size: ${this.candidatePool.length}`);
        
        if (this.candidatePool.length === 0) {return null;}
        
        // TEAM SEPARATION: If team is specified, only return genomes from that team's lineage
        if (team) {
            const teamCandidates = this.candidatePool.filter(c => 
                c.team === team && (c.lineage === team || !c.lineage)
            );
            
            console.log(`🔍 getBestGenome for ${team}: Found ${teamCandidates.length} team candidates out of ${this.candidatePool.length} total`);
            
            if (teamCandidates.length > 0) {
                // Sort by fitness and return the best from this team
                teamCandidates.sort((a, b) => b.fitness - a.fitness);
                const best = teamCandidates[0];
                console.log(`✅ Best ${team} genome: fitness=${best.fitness.toFixed(3)}, generation=${best.generation}, strategy=${best.strategy}`);
                return best;
            }
            
            // Fallback: if no team-specific candidates, return null rather than cross-contaminate
            console.warn(`⚠️ No candidates found for team ${team} in candidate pool`);
            return null;
        }
        
        // If no team specified, return overall best
        return this.candidatePool.length > 0 ? this.candidatePool[0] : null;
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
        document.getElementById('generationDisplay').textContent = `Generation: ${stats.generation}`;
        document.getElementById('experiments').textContent = stats.experiments;
        document.getElementById('battles').textContent = stats.battles;
        document.getElementById('redWins').textContent = stats.redWins;
        document.getElementById('blueWins').textContent = stats.blueWins;
        
        // RED QUEEN: Use separate team fitness averages
        // Check if we have any real battle-earned fitness values
        // Note: Initially all candidates are isInitial=true, so we need battle-earned candidates
        const hasAnyBattleEarnedFitness = this.candidatePool.some(c => 
            (c.battles && c.battles > 0) || (c.isInitial === false)
        );
        
        const redFitnessText = hasAnyBattleEarnedFitness ? 
            (isNaN(stats.redAverageFitness) ? '0.000' : stats.redAverageFitness.toFixed(3)) : 
            'Evolving...';
        const blueFitnessText = hasAnyBattleEarnedFitness ? 
            (isNaN(stats.blueAverageFitness) ? '0.000' : stats.blueAverageFitness.toFixed(3)) : 
            'Evolving...';
        
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
    }
    
    pauseEvolution() {
        this.isEvolutionRunning = false;
        this.logEvolutionEvent('Evolution system paused', 'system');
    }
    
    resetEvolution() {
        this.isEvolutionRunning = false;
        this.currentGeneration = 0;
        this.generation = 1;
        this.totalExperiments = 0;
        this.totalBattles = 0;
        this.redTeamWins = 0;
        this.blueTeamWins = 0;
        this.draws = 0;
        
        // Reset battle results
        this.battleResults = {
            red: { wins: 0, totalBattles: 0 },
            blue: { wins: 0, totalBattles: 0 }
        };
        
        // Clear experiment history
        this.experimentHistory = [];
        
        // Reinitialize candidate pool with fresh genomes
        this.candidatePool = [];
        this.initializeCandidatePool();
        
        // Reinitialize populations
        this.redPopulation = [];
        this.bluePopulation = [];
        this.initializePopulations();
        
        this.logEvolutionEvent('Evolution system reset - Ready for new cycle', 'system');
    }
    
    // Additional evolution management methods for validation
    nextGeneration() {
        // Advance to the next generation of evolution
        this.currentGeneration++;
        this.generation = this.currentGeneration + 1; // Keep both for compatibility
        this.logEvolutionEvent(`Advancing to generation ${this.generation}`, 'evolution');
        
        // Dispatch generation complete event for tracking
        const generationCompleteEvent = new CustomEvent('generationComplete', {
            detail: {
                generation: this.currentGeneration,
                totalExperiments: this.totalExperiments,
                candidatePoolSize: this.candidatePool.length,
                topFitness: this.candidatePool[0]?.fitness || 0,
                averageFitness: this.candidatePool.reduce((sum, c) => sum + c.fitness, 0) / this.candidatePool.length || 0
            }
        });
        window.dispatchEvent(generationCompleteEvent);
        
        // Trigger evolution for both teams SEPARATELY
        console.log('🔴 Evolving Red Team Population - Generation', this.generation);
        this.evolvePopulation('red');
        console.log('🔵 Evolving Blue Team Population - Generation', this.generation);
        this.evolvePopulation('blue');
        
        // Log team separation validation
        const redCount = this.redPopulation.filter(tank => tank.team === 'red' || !tank.team).length;
        const blueCount = this.bluePopulation.filter(tank => tank.team === 'blue' || !tank.team).length;
        const redContamination = this.redPopulation.filter(tank => tank.team === 'blue').length;
        const blueContamination = this.bluePopulation.filter(tank => tank.team === 'red').length;
        
        this.logEvolutionEvent(
            `Team Validation - Red: ${redCount}/${this.redPopulation.length} valid (${redContamination} contamination), ` +
            `Blue: ${blueCount}/${this.bluePopulation.length} valid (${blueContamination} contamination)`,
            'validation'
        );
        
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
        
        // Track in cognition insights
        if (window.cognitionInsights) {
            window.cognitionInsights.trackKnowledgeSearch(query);
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
        
        // Track knowledge search results in cognition insights
        if (window.cognitionInsights) {
            window.cognitionInsights.trackKnowledgeSearch(query, results.length);
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
        
        // Track formation usage in cognition insights
        if (window.cognitionInsights) {
            window.cognitionInsights.trackFormationUsage(tactic.name);
        }
        
        return tactic;
    }
}

// Export classes to global scope
window.EvolutionEngine = EvolutionEngine;
window.MilitaryTacticsKnowledge = MilitaryTacticsKnowledge;
