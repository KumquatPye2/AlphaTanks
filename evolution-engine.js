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
        
        // Store previous team statistics to avoid showing "None" or "Evolving..." during transitions
        this.previousStats = {
            redFitness: null,
            blueFitness: null,
            redBest: null,
            blueBest: null
        };
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
        
        // Create proper Tank instance (same as game engine does)
        const tank = new Tank(x, y, team, genome);
        tank.fitness = 0.5;
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
        
        // 1. Battle Outcome (25% of fitness) - REDUCED from 40% to encourage tactical variety
        if (battleResults.winner === team) {
            fitnessScore += 0.25; // Reduced win bonus
        } else if (battleResults.winner === 'timeout') {
            // For timeouts, award based on survivors and performance
            const teamSurvivors = battleResults[`${team}Survivors`] || 0;
            const enemyTeam = team === 'red' ? 'blue' : 'red';
            const enemySurvivors = battleResults[`${enemyTeam}Survivors`] || 0;
            if (teamSurvivors > enemySurvivors) {
                fitnessScore += 0.18; // Winning timeout
            } else if (teamSurvivors === enemySurvivors) {
                fitnessScore += 0.12; // Draw timeout
            } else {
                fitnessScore += 0.06; // Losing timeout
            }
        }
        // Losing gets no bonus (stays at 0.5 base)
        
        // 1.5. NEW: Tactical Innovation Bonus (15% of fitness)
        const tacticScore = this.calculateTacticalInnovation(tank, battleResults, team);
        fitnessScore += tacticScore * 0.15;
        // 2. Individual Tank Performance (25% of fitness) - Slightly reduced to make room for tactical scoring
        if (tank) {
            let performanceScore = 0;
            // Survival bonus
            if (tank.isAlive) {
                performanceScore += 0.08;
            }
            // Combat effectiveness
            const accuracy = tank.shotsFired > 0 ? tank.shotsHit / tank.shotsFired : 0;
            performanceScore += accuracy * 0.04;
            // Damage efficiency 
            const damageRatio = tank.damageTaken > 0 ? tank.damageDealt / tank.damageTaken : 
                              tank.damageDealt > 0 ? 1.0 : 0.5;
            performanceScore += Math.min(damageRatio, 1.0) * 0.08;
            // Kill contribution
            performanceScore += tank.kills * 0.05;
            fitnessScore += performanceScore * 0.25;
        }
        
        // 3. Team Performance Metrics (15% of fitness) - Reduced
        const totalKills = battleResults.totalKills || 0;
        const battleDuration = battleResults.duration || 120;
        // Reward quick decisive battles
        if (battleResults.winner !== 'timeout') {
            const speedBonus = Math.max(0, (60 - battleDuration) / 60) * 0.075;
            fitnessScore += speedBonus;
        }
        // Reward action/engagement
        const engagementBonus = Math.min(totalKills / 6, 1.0) * 0.075; // 6 kills = full bonus
        fitnessScore += engagementBonus;
        
        // 4. Strategic Diversity Bonus (10% of fitness) - NEW
        const diversityScore = this.calculateStrategicDiversity(tank, team);
        fitnessScore += diversityScore * 0.10;
        
        // 5. Genome Quality Bonus (10% of fitness) - Modified for tactical complexity
        const genome = tank?.genome || tankOrGenome;
        if (Array.isArray(genome)) {
            // NEW: Reward tactical complexity instead of just balance
            const complexityScore = this.calculateTacticalComplexity(genome);
            fitnessScore += complexityScore * 0.10;
        }
        
        // Ensure fitness stays in valid range [0, 1]
        return Math.max(0, Math.min(1, fitnessScore));
    }

    calculateTacticalInnovation(tank, battleResults, team) {
        let innovationScore = 0;
        
        if (!tank || !tank.genome) {
            return 0;
        }
        
        const genome = tank.genome;
        
        // 1. Unconventional Genome Combinations (reward rare trait combinations)
        const isUnconventional = this.isUnconventionalStrategy(genome);
        if (isUnconventional) {
            innovationScore += 0.3;
        }
        
        // 2. Hill Control Innovation (not just rushing)
        if (battleResults.hillControlData) {
            const hillTime = battleResults.hillControlData[`${team}ControlTime`] || 0;
            const totalHillTime = battleResults.hillControlData.totalControlTime || 120;
            const controlRatio = hillTime / totalHillTime;
            
            // Reward sustained control over quick rushes
            if (controlRatio > 0.6 && battleResults.duration > 15) {
                innovationScore += 0.25; // Sustained control strategy
            }
            
            // Reward efficient hill captures (quick control establishment)
            if (controlRatio > 0.3 && battleResults.duration < 20) {
                innovationScore += 0.2; // Efficient capture strategy
            }
        }
        
        // 3. Combat Pattern Innovation
        if (tank.shotsFired > 0) {
            const accuracy = tank.shotsHit / tank.shotsFired;
            const damageEfficiency = tank.damageTaken > 0 ? tank.damageDealt / tank.damageTaken : tank.damageDealt > 0 ? 2.0 : 0;
            
            // Reward precision tactics (high accuracy, low shots)
            if (accuracy > 0.7 && tank.shotsFired < 10) {
                innovationScore += 0.2; // Precision sniper tactics
            }
            
            // Reward efficient brawlers (high damage ratio, many shots)
            if (damageEfficiency > 1.5 && tank.shotsFired > 15) {
                innovationScore += 0.2; // Efficient aggressive tactics
            }
        }
        
        // 4. Survival Innovation (winning while damaged)
        if (tank.isAlive && tank.health < 50 && battleResults.winner === team) {
            innovationScore += 0.25; // Clutch survival tactics
        }
        
        return Math.min(1.0, innovationScore);
    }

    calculateStrategicDiversity(tank, team) {
        if (!tank || !tank.genome) {
            return 0;
        }
        
        const genome = tank.genome;
        let diversityScore = 0;
        
        // 1. Multi-trait specialization (reward tanks that excel in multiple areas)
        const highTraits = genome.filter(trait => trait > 0.7).length;
        const lowTraits = genome.filter(trait => trait < 0.3).length;
        
        if (highTraits >= 2 && lowTraits >= 1) {
            diversityScore += 0.4; // Specialized multi-trait tank
        }
        
        // 2. Balanced excellence (all traits reasonably high)
        const averageTrait = genome.reduce((sum, trait) => sum + trait, 0) / genome.length;
        const traitVariance = genome.reduce((sum, trait) => sum + Math.pow(trait - averageTrait, 2), 0) / genome.length;
        
        if (averageTrait > 0.6 && traitVariance < 0.05) {
            diversityScore += 0.3; // Well-rounded excellence
        }
        
        // 3. Counter-meta strategies (reward tactics that are uncommon)
        const strategy = this.classifyAdvancedStrategy(genome);
        const strategyRarity = this.calculateStrategyRarity(strategy, team);
        diversityScore += strategyRarity * 0.3;
        
        return Math.min(1.0, diversityScore);
    }

    calculateTacticalComplexity(genome) {
        // Reward genomes that show tactical sophistication
        let complexityScore = 0;
        
        // 1. Trait synergy (certain combinations work well together)
        const aggression = genome[0] || 0;
        const speed = genome[1] || 0;
        const accuracy = genome[2] || 0;
        const defense = genome[3] || 0;
        const teamwork = genome[4] || 0;
        const adaptability = genome[5] || 0;
        const learning = genome[6] || 0;
        const riskTaking = genome[7] || 0;
        const evasion = genome[8] || 0;
        
        // Synergistic combinations:
        // Sniper: High accuracy + high caution + low aggression
        if (accuracy > 0.7 && defense > 0.6 && aggression < 0.4) {
            complexityScore += 0.25;
        }
        
        // Berserker: High aggression + high speed + high risk-taking
        if (aggression > 0.7 && speed > 0.6 && riskTaking > 0.6) {
            complexityScore += 0.25;
        }
        
        // Support: High teamwork + high adaptability + moderate defense
        if (teamwork > 0.7 && adaptability > 0.6 && defense > 0.4 && defense < 0.8) {
            complexityScore += 0.25;
        }
        
        // Assassin: High evasion + high speed + moderate accuracy
        if (evasion > 0.7 && speed > 0.6 && accuracy > 0.5 && accuracy < 0.8) {
            complexityScore += 0.25;
        }
        
        // Adaptive: High learning + high adaptability + balanced other traits
        if (learning > 0.7 && adaptability > 0.7) {
            const balanceScore = 1 - (genome.reduce((sum, trait) => sum + Math.abs(trait - 0.5), 0) / genome.length / 0.5);
            if (balanceScore > 0.6) {
                complexityScore += 0.3;
            }
        }
        
        // 2. Anti-patterns penalty (reduce score for ineffective combinations)
        // High caution + high aggression (contradictory)
        if (defense > 0.7 && aggression > 0.7) {
            complexityScore -= 0.1;
        }
        
        // High teamwork + low cooperation synergy traits
        if (teamwork > 0.7 && (accuracy < 0.3 || adaptability < 0.3)) {
            complexityScore -= 0.1;
        }
        
        return Math.max(0, Math.min(1.0, complexityScore));
    }

    isUnconventionalStrategy(genome) {
        // Define what makes a strategy "unconventional"
        const aggression = genome[0] || 0;
        const speed = genome[1] || 0;
        const accuracy = genome[2] || 0;
        const defense = genome[3] || 0;
        const teamwork = genome[4] || 0;
        const adaptability = genome[5] || 0;
        const learning = genome[6] || 0;
        const _riskTaking = genome[7] || 0;
        const evasion = genome[8] || 0;
        
        // Unconventional combinations:
        // 1. Pacifist tank (low aggression, high defense, high evasion)
        if (aggression < 0.3 && defense > 0.7 && evasion > 0.6) {
            return true;
        }
        
        // 2. Kamikaze (very high aggression, very low defense, high speed)
        if (aggression > 0.8 && defense < 0.2 && speed > 0.7) {
            return true;
        }
        
        // 3. Learner (very high learning and adaptability, others moderate)
        if (learning > 0.8 && adaptability > 0.8) {
            return true;
        }
        
        // 4. Glass cannon (very high accuracy, very low defense, low evasion)
        if (accuracy > 0.8 && defense < 0.3 && evasion < 0.4) {
            return true;
        }
        
        // 5. Team coordinator (very high teamwork, moderate combat stats)
        if (teamwork > 0.8 && aggression < 0.6 && accuracy < 0.6) {
            return true;
        }
        
        return false;
    }

    classifyAdvancedStrategy(genome) {
        // Expanded strategy classification with 12 distinct archetypes
        const aggression = genome[0] || 0;
        const speed = genome[1] || 0;
        const accuracy = genome[2] || 0;
        const defense = genome[3] || 0;
        const teamwork = genome[4] || 0;
        const adaptability = genome[5] || 0;
        const learning = genome[6] || 0;
        const riskTaking = genome[7] || 0;
        const evasion = genome[8] || 0;
        
        // Primary archetype classification
        if (accuracy > 0.7 && defense > 0.6 && aggression < 0.4) {
            return 'Sniper';
        }
        if (aggression > 0.7 && speed > 0.6 && riskTaking > 0.6) {
            return 'Berserker';
        }
        if (teamwork > 0.7 && adaptability > 0.6) {
            return 'Support';
        }
        if (evasion > 0.7 && speed > 0.6) {
            return 'Assassin';
        }
        if (learning > 0.7 && adaptability > 0.7) {
            return 'Adaptive';
        }
        if (defense > 0.8 && evasion > 0.6 && aggression < 0.4) {
            return 'Fortress';
        }
        if (speed > 0.8 && riskTaking > 0.7 && accuracy < 0.5) {
            return 'Scout';
        }
        if (accuracy > 0.8 && defense < 0.3) {
            return 'GlassCannon';
        }
        if (teamwork > 0.8 && aggression < 0.5) {
            return 'Coordinator';
        }
        if (aggression > 0.8 && defense < 0.3) {
            return 'Kamikaze';
        }
        if (learning > 0.6 && adaptability > 0.6 && Math.abs(0.5 - (genome.reduce((sum, trait) => sum + trait, 0) / genome.length)) < 0.1) {
            return 'Generalist';
        }
        
        // Fallback to basic classification
        if (aggression > 0.6) {
            return 'Aggressive';
        }
        if (defense > 0.6) {
            return 'Defensive';
        }
        if (teamwork > 0.6) {
            return 'Cooperative';
        }
        return 'Balanced';
    }

    calculateStrategyRarity(strategy, team) {
        // Calculate how rare this strategy is in the current candidate pool
        const teamCandidates = this.candidatePool.filter(c => c.team === team);
        if (teamCandidates.length === 0) {
            return 0.5; // Default rarity
        }
        
        const sameStrategyCount = teamCandidates.filter(c => 
            this.classifyAdvancedStrategy(c.genome) === strategy
        ).length;
        
        const rarity = 1 - (sameStrategyCount / teamCandidates.length);
        return rarity;
    }
    evolvePopulation(team) {
        const population = team === 'red' ? this.redPopulation : this.bluePopulation;
        // TEAM SEPARATION: Validate population contains only the correct team
        const validatedPopulation = population.filter(tank => 
            !tank.team || tank.team === team
        );
        if (validatedPopulation.length !== population.length) {
            console.warn(`Team validation filtered out ${population.length - validatedPopulation.length} tanks from ${team} population`);
        }
        // Preserve elite individuals (top 20% by fitness)
        const sortedByFitness = [...validatedPopulation].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        const eliteCount = Math.floor(validatedPopulation.length * 0.2);
        const elites = sortedByFitness.slice(0, eliteCount);
        // Apply ASI-ARCH modules if available
        if (this.asiArch) {
            let evolvedPopulation = this.asiArch.applyResearcher(validatedPopulation, team);
            evolvedPopulation = this.asiArch.applyEngineer(evolvedPopulation, team);
            const otherPopulation = team === 'red' ? this.bluePopulation : this.redPopulation;
            evolvedPopulation = this.asiArch.applyAnalyst(evolvedPopulation, otherPopulation, team);
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
        if (winner === 'draw') {
            // For draws, increment total battles for both teams but no wins
            this.battleResults.red.totalBattles++;
            this.battleResults.blue.totalBattles++;
        } else if (this.battleResults[winner]) {
            this.battleResults[winner].wins++;
            this.battleResults[winner].totalBattles++;
            // Also increment the other team's total battles
            const otherTeam = winner === 'red' ? 'blue' : 'red';
            if (this.battleResults[otherTeam]) {
                this.battleResults[otherTeam].totalBattles++;
            }
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
        
        // Evolution continues via handleBattleEnd after battle completes
        // This allows the battle to actually run and generate results
    }
    handleBattleEnd(battleResult) {
        this.totalBattles++;
        // Update win statistics
        if (battleResult.winner === 'red') {
            this.redTeamWins++;
        } else if (battleResult.winner === 'blue') {
            this.blueTeamWins++;
        } else if (battleResult.winner === 'draw') {
            this.draws++;
        } else {
            // Handle timeout as draw for statistics
            this.draws++;
        }
        this.updateUI();
        
        // Update tactical evolution display if available
        if (window.tacticalDisplay) {
            window.tacticalDisplay.updateDisplay(this, battleResult);
        }
        
        // Provide more descriptive logging for battle outcomes
        let outcomeText = '';
        if (battleResult.winner === 'draw') {
            outcomeText = `Battle ${this.totalBattles}: DRAW - All tanks destroyed in ${battleResult.duration.toFixed(1)}s`;
        } else if (battleResult.winner === 'timeout') {
            outcomeText = `Battle ${this.totalBattles}: TIMEOUT after ${battleResult.duration.toFixed(1)}s`;
        } else {
            outcomeText = `Battle ${this.totalBattles}: ${battleResult.winner.toUpperCase()} wins in ${battleResult.duration.toFixed(1)}s`;
        }
        this.logEvolutionEvent(outcomeText, 'battle');
        
        // If evolution is running, trigger the next experiment after processing
        if (this.isEvolutionRunning) {
            // Short delay to allow battle result processing, then continue evolution
            setTimeout(() => {
                if (this.isEvolutionRunning) {
                    this.runNextExperiment();
                }
            }, 800); // Slightly shorter than index.html timeout to avoid conflicts
        }
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
                parentTeam: 'red', // Ensure no cross-team contamination
                isInitial: false // Battle-earned fitness, not initial placeholder
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
                parentTeam: 'blue', // Ensure no cross-team contamination
                isInitial: false // Battle-earned fitness, not initial placeholder
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
            
            // Update UI immediately when generation advances
            this.updateUI();
            
            // Update tactical evolution display if available
            if (window.tacticalDisplay) {
                window.tacticalDisplay.updateDisplay(this);
            }
            
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
        if (stats.averageSurvivalTime > 90) {sophistication += 0.1;} // Adjusted for 120s battles
        return Math.min(sophistication, 1.0);
    }
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    getBestGenome(team = null) {
        if (this.candidatePool.length === 0) {return null;}
        // TEAM SEPARATION: If team is specified, only return genomes from that team's lineage
        if (team) {
            const teamCandidates = this.candidatePool.filter(c => 
                c.team === team && (c.lineage === team || !c.lineage)
            );
            if (teamCandidates.length > 0) {
                // Sort by fitness and return the best from this team
                teamCandidates.sort((a, b) => b.fitness - a.fitness);
                const best = teamCandidates[0];
                return best;
            }
            // Fallback: if no team-specific candidates, return null rather than cross-contaminate
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
            bestRedStrategy: bestRedCandidate ? bestRedCandidate.strategy : 'None',
            bestBlueStrategy: bestBlueCandidate ? bestBlueCandidate.strategy : 'None',
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
        
        // Debug logging to understand the issue
        console.log('Debug - Candidate Pool:', this.candidatePool.length, 'candidates');
        console.log('Debug - hasAnyBattleEarnedFitness:', hasAnyBattleEarnedFitness);
        console.log('Debug - Stats:', {
            redAvg: stats.redAverageFitness,
            blueAvg: stats.blueAverageFitness,
            redBest: stats.bestRedStrategy,
            blueBest: stats.bestBlueStrategy
        });
        
        const redFitnessText = hasAnyBattleEarnedFitness ? 
            (isNaN(stats.redAverageFitness) ? '0.000' : stats.redAverageFitness.toFixed(3)) : 
            'Evolving...';
        const blueFitnessText = hasAnyBattleEarnedFitness ? 
            (isNaN(stats.blueAverageFitness) ? '0.000' : stats.blueAverageFitness.toFixed(3)) : 
            'Evolving...';
            
        // Apply persistence for fitness values
        if (hasAnyBattleEarnedFitness && !isNaN(stats.redAverageFitness)) {
            this.previousStats.redFitness = redFitnessText;
            document.getElementById('redFitness').textContent = redFitnessText;
        } else if (this.previousStats.redFitness) {
            document.getElementById('redFitness').textContent = this.previousStats.redFitness + ' (Previous)';
        } else {
            document.getElementById('redFitness').textContent = redFitnessText;
        }
        
        if (hasAnyBattleEarnedFitness && !isNaN(stats.blueAverageFitness)) {
            this.previousStats.blueFitness = blueFitnessText;
            document.getElementById('blueFitness').textContent = blueFitnessText;
        } else if (this.previousStats.blueFitness) {
            document.getElementById('blueFitness').textContent = this.previousStats.blueFitness + ' (Previous)';
        } else {
            document.getElementById('blueFitness').textContent = blueFitnessText;
        }
        // Apply persistence for best architecture values
        if (stats.bestRedStrategy && stats.bestRedStrategy !== 'None') {
            this.previousStats.redBest = stats.bestRedStrategy;
            document.getElementById('redBest').textContent = stats.bestRedStrategy;
        } else if (this.previousStats.redBest) {
            document.getElementById('redBest').textContent = this.previousStats.redBest + ' (Previous)';
        } else {
            document.getElementById('redBest').textContent = stats.bestRedStrategy;
        }
        
        if (stats.bestBlueStrategy && stats.bestBlueStrategy !== 'None') {
            this.previousStats.blueBest = stats.bestBlueStrategy;
            document.getElementById('blueBest').textContent = stats.bestBlueStrategy;
        } else if (this.previousStats.blueBest) {
            document.getElementById('blueBest').textContent = this.previousStats.blueBest + ' (Previous)';
        } else {
            document.getElementById('blueBest').textContent = stats.bestBlueStrategy;
        }
        document.getElementById('novelDesigns').textContent = stats.candidatePoolSize;
        
        // Update red/blue adaptations instead of successfulMutations
        // Note: These are updated by the visualizer, so we don't need to update them here
        // Fitness thresholds are now handled by the Tactical Evolution Monitor
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
        this.evolvePopulation('red');
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
