// ASI-ARCH Researcher Module - Proposes new tank architectures
class TankResearcher {
    constructor() {
        this.mutationRate = 0.3;
        this.crossoverRate = 0.7;
    }
    
    proposeExperiment(candidatePool, history, cognitionBase) {
        console.log('🔬 Researcher: Proposing new tank architectures...');
        
        // Emit visualization event
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('researcher', 'propose_experiment');
        }
        
        // RED QUEEN RACE: Separate evolution for each team
        // Split candidate pool by team affiliation and recent performance
        const redPool = this.getTeamCandidates(candidatePool, history, 'red');
        const bluePool = this.getTeamCandidates(candidatePool, history, 'blue');
        
        // Select parents from each team's lineage
        const redParents = this.selectParents(redPool, 2);
        const blueParents = this.selectParents(bluePool, 2);
        
        // Generate team-specific architectures with counter-evolution
        const redGenomes = this.generateTeamGenomes(redParents, cognitionBase, 'red', history);
        const blueGenomes = this.generateTeamGenomes(blueParents, cognitionBase, 'blue', history);
        
        return { redGenomes, blueGenomes };
    }
    
    getTeamCandidates(candidatePool, history, team) {
        // Get candidates that performed well for this specific team
        const teamCandidates = candidatePool.filter(candidate => 
            candidate.team === team || !candidate.team // Include unassigned for initial pool
        );
        
        // If not enough team-specific candidates, analyze recent history
        if (teamCandidates.length < 3 && history.length > 0) {
            const recentBattles = history.slice(-3);
            recentBattles.forEach(battle => {
                const teamGenomes = team === 'red' ? battle.redGenomes : battle.blueGenomes;
                const teamWon = battle.result.winner === team;
                const fitnessBonus = teamWon ? 0.2 : 0;
                
                teamGenomes.forEach(genomeItem => {
                    // Extract genome and ensure it's in array format
                    let genome = genomeItem.genome || genomeItem;
                    
                    // Convert object genomes to array format if needed
                    if (!Array.isArray(genome) && genome && typeof genome === 'object') {
                        genome = [
                            genome.aggression || 0.5,           // 0: Aggression
                            genome.speed || 0.5,                // 1: Speed  
                            genome.accuracy || 0.5,             // 2: Accuracy
                            genome.defense || genome.caution || 0.5,  // 3: Defense
                            genome.teamwork || genome.cooperation || 0.5,  // 4: Teamwork
                            genome.adaptability || genome.formation || 0.5,  // 5: Adaptability
                            genome.learning || genome.flanking || 0.5,     // 6: Learning
                            genome.riskTaking || genome.ambush || 0.5,      // 7: RiskTaking
                            genome.evasion || genome.sacrifice || 0.5       // 8: Evasion
                        ];
                    }
                    
                    teamCandidates.push({
                        genome,
                        fitness: this.calculateGenomeFitness(genome, battle.result, team) + fitnessBonus,
                        team,
                        generation: battle.generation,
                        battles: 1,
                        wins: teamWon ? 1 : 0
                    });
                });
            });
        }
        
        // If still not enough, create team-specific genomes
        if (teamCandidates.length < 2) {
            for (let i = teamCandidates.length; i < 4; i++) {
                teamCandidates.push({
                    genome: this.generateTeamSpecificGenome(team),
                    fitness: 0.3,
                    team,
                    generation: 0,
                    battles: 0,
                    wins: 0
                });
            }
        }
        
        return teamCandidates;
    }
    
    generateTeamSpecificGenome(team) {
        // Create genomes with team-specific tendencies for Red Queen evolution
        const baseGenome = this.generateRandomGenome();
        
        if (team === 'red') {
            // Red team: More aggressive, faster, risk-taking
            // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
            baseGenome[0] = Math.min(1, baseGenome[0] + 0.2); // Aggression
            baseGenome[1] = Math.min(1, baseGenome[1] + 0.1); // Speed
            baseGenome[3] = Math.max(0, baseGenome[3] - 0.1); // Defense (less defensive)
            baseGenome[7] = Math.min(1, baseGenome[7] + 0.2); // RiskTaking
        } else {
            // Blue team: More defensive, accurate, cooperative
            baseGenome[2] = Math.min(1, baseGenome[2] + 0.2); // Accuracy
            baseGenome[4] = Math.min(1, baseGenome[4] + 0.1); // Teamwork
            baseGenome[3] = Math.min(1, baseGenome[3] + 0.1); // Defense
        }
        
        return baseGenome;
    }
    
    selectParents(candidatePool, count) {
        if (candidatePool.length === 0) {
            // Generate random parents if pool is empty - ensure consistent format
            return Array(count).fill().map(() => ({ 
                genome: this.generateRandomGenome(),
                fitness: 0.5,
                generation: 0,
                battles: 0,
                wins: 0
            }));
        }
        
        // Tournament selection (like ASI-ARCH)
        const parents = [];
        for (let i = 0; i < count; i++) {
            const tournament = this.runTournament(candidatePool, 3);
            parents.push(tournament);
        }
        
        return parents;
    }
    
    runTournament(pool, size) {
        // Emit visualization event
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('researcher', 'parent_selection');
        }
        
        const contestants = [];
        for (let i = 0; i < size && i < pool.length; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            contestants.push(pool[randomIndex]);
        }
        
        // Return best contestant
        return contestants.reduce((best, current) => 
            current.fitness > best.fitness ? current : best
        );
    }
    
    generateTeamGenomes(parents, cognitionBase, team, history) {
        const genomes = [];
        
        // RED QUEEN RACE: Analyze opponent strategies for counter-evolution
        const opponentTeam = team === 'red' ? 'blue' : 'red';
        const opponentStrategies = this.analyzeOpponentStrategies(history, opponentTeam);
        
        // Generate 3 tanks per team
        for (let i = 0; i < 3; i++) {
            let genome;
            
            if (parents.length >= 2 && Math.random() < this.crossoverRate) {
                // Crossover between two parents
                genome = this.crossover(parents[0].genome, parents[1].genome);
            } else if (parents.length >= 1) {
                // Mutation of single parent with team tracking
                genome = this.mutateWithTeamTracking(parents[0].genome, team);
            } else {
                // Random genome with team specialization
                genome = this.generateTeamSpecificGenome(team);
            }
            
            // Apply cognition-based improvements with team focus and performance context
            genome = this.applyCognition(genome, cognitionBase, team, history);
            
            // RED QUEEN ADAPTATION: Counter-evolve against opponent strategies
            if (history && history.length > 0) {
                genome = this.applyCounterEvolution(genome, opponentStrategies, team);
            }
            
            // Apply novel traits (ASI-ARCH emergent behaviors)
            genome = this.applyNovelTraits(genome);
            
            genomes.push(genome);
        }
        
        return genomes;
    }
    
    crossover(parent1, parent2) {
        // Emit visualization event
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('researcher', 'crossover');
        }
        
        // Create child array with same length as parents
        const child = new Array(parent1.length);
        
        for (let i = 0; i < parent1.length; i++) {
            // Uniform crossover with slight bias toward better parent
            if (Math.random() < 0.5) {
                child[i] = parent1[i];
            } else {
                child[i] = parent2[i];
            }
            
            // Add small random variation
            child[i] += (Math.random() - 0.5) * 0.1;
            child[i] = Math.max(0, Math.min(1, child[i]));
        }
        
        return child;
    }
    
    mutate(parent) {
        const child = [...parent]; // Create array copy
        
        const mutatedTraits = [];
        const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
        
        for (let i = 0; i < child.length; i++) {
            if (Math.random() < this.mutationRate) {
                // Gaussian mutation
                const mutation = this.gaussianRandom() * 0.2;
                child[i] += mutation;
                child[i] = Math.max(0, Math.min(1, child[i]));
                mutatedTraits.push(traitNames[i] || `trait${i}`);
            }
        }
        
        // Emit visualization event for mutations
        if (mutatedTraits.length > 0 && window.emitASIArchEvent) {
            window.emitASIArchEvent('researcher', 'generate_mutation', { 
                trait: mutatedTraits.join(', '),
                count: mutatedTraits.length 
            });
        }
        
        return child;
    }
    
    mutateWithTeamTracking(parent, team) {
        const child = [...parent]; // Create array copy
        
        const mutatedTraits = [];
        const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
        
        for (let i = 0; i < child.length; i++) {
            if (Math.random() < this.mutationRate) {
                // Gaussian mutation
                const mutation = this.gaussianRandom() * 0.2;
                child[i] += mutation;
                child[i] = Math.max(0, Math.min(1, child[i]));
                mutatedTraits.push(traitNames[i] || `trait${i}`);
            }
        }
        
        // Emit team-specific visualization event for mutations
        if (mutatedTraits.length > 0 && window.emitASIArchEvent) {
            const teamIcon = team === 'red' ? '🔴' : '🔵';
            window.emitASIArchEvent('researcher', 'generate_mutation', { 
                trait: mutatedTraits.join(', '),
                count: mutatedTraits.length,
                team: team,
                teamIcon: teamIcon
            });
        }
        
        return child;
    }
    
    gaussianRandom() {
        // Box-Muller transformation for Gaussian distribution
        let u = 0, v = 0;
        while(u === 0) {u = Math.random();}
        while(v === 0) {v = Math.random();}
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    
    applyCognition(genome, cognitionBase, team, history = []) {
        // Apply military tactics knowledge (ASI-ARCH Cognition integration)
        const tactics = cognitionBase.formations;
        let significantLearning = false;
        
        // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        
        // Analyze team performance to determine learning urgency
        const recentBattles = history.slice(-5); // Last 5 battles
        const teamWins = recentBattles.filter(battle => battle.result.winner === team).length;
        const learningUrgency = teamWins < 2 ? 2.0 : (teamWins < 3 ? 1.5 : 1.0); // Losing teams learn more aggressively
        
        if (team === 'red') {
            // Red team: Apply aggressive blitzkrieg or pincer tactics
            const blitzkrieg = tactics.blitzkrieg.traits;
            const oldSpeed = genome[1];
            const oldAggression = genome[0];
            
            genome[1] = Math.max(genome[1], blitzkrieg.speed * 0.7); // Speed
            genome[0] = Math.max(genome[0], blitzkrieg.aggression * 0.7); // Aggression
            
            // Only emit learning event if significant tactical improvement occurred
            const speedImprovement = genome[1] - oldSpeed;
            const aggressionImprovement = genome[0] - oldAggression;
            const totalImprovement = speedImprovement + aggressionImprovement;
            significantLearning = (totalImprovement > 0.1) && (Math.random() < (0.2 * learningUrgency));
            
            if (significantLearning && window.emitASIArchEvent) {
                window.emitASIArchEvent('cognition', 'team_tactics_learned', { 
                    team: 'red',
                    tactic: 'blitzkrieg',
                    improvement: totalImprovement.toFixed(3)
                });
            }
        } else if (team === 'blue') {
            // Blue team: Apply defensive phalanx tactics  
            const phalanx = tactics.phalanx.traits;
            const oldAdaptability = genome[5];
            const oldTeamwork = genome[4];
            
            genome[5] = Math.max(genome[5], phalanx.formation * 0.7); // Adaptability (was formation)
            genome[4] = Math.max(genome[4], phalanx.cooperation * 0.7); // Teamwork (was cooperation)
            
            // Only emit learning event if significant tactical improvement occurred
            const adaptabilityImprovement = genome[5] - oldAdaptability;
            const teamworkImprovement = genome[4] - oldTeamwork;
            const totalImprovement = adaptabilityImprovement + teamworkImprovement;
            significantLearning = (totalImprovement > 0.1) && (Math.random() < (0.2 * learningUrgency));
            
            if (significantLearning && window.emitASIArchEvent) {
                window.emitASIArchEvent('cognition', 'team_tactics_learned', { 
                    team: 'blue',
                    tactic: 'phalanx',
                    improvement: totalImprovement.toFixed(3)
                });
            }
        }
        
        return genome;
    }
    
    applyNovelTraits(genome) {
        // ASI-ARCH emergent behavior discovery
        // Randomly introduce advanced traits that might emerge
        // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        
        if (Math.random() < 0.1) { // 10% chance
            // Flanking behavior: high aggression + speed boost evasion
            if (genome[0] > 0.6 && genome[1] > 0.5) {
                genome[8] = Math.min(1, genome[8] + 0.2); // Evasion
            }
        }
        
        if (Math.random() < 0.05) { // 5% chance
            // Ambush behavior: high defense + accuracy boost learning
            if (genome[3] > 0.7 && genome[2] > 0.6) {
                genome[6] = Math.min(1, genome[6] + 0.3); // Learning
            }
        }
        
        if (Math.random() < 0.02) { // 2% chance (rare trait)
            // Sacrifice behavior: high teamwork boosts risk-taking
            if (genome[4] > 0.8) {
                genome[7] = Math.min(1, genome[7] + 0.1); // RiskTaking
            }
        }
        
        return genome;
    }
    
    generateRandomGenome() {
        // Return 9-trait array format: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        return [
            Math.random(), // Aggression
            Math.random(), // Speed
            Math.random(), // Accuracy
            Math.random(), // Defense (was caution)
            Math.random(), // Teamwork (was cooperation)
            Math.random(), // Adaptability (was formation)
            Math.random(), // Learning
            Math.random(), // RiskTaking
            Math.random()  // Evasion
        ];
    }
    
    analyzeOpponentStrategies(history, opponentTeam) {
        if (!history || history.length === 0) {
            return { avgAggression: 0.5, avgSpeed: 0.5, avgAccuracy: 0.5, winningTactics: [] };
        }
        
        const recentBattles = history.slice(-3);
        let totalAggression = 0, totalSpeed = 0, totalAccuracy = 0;
        let sampleCount = 0;
        const winningTactics = [];
        
        recentBattles.forEach(battle => {
            const opponentGenomes = opponentTeam === 'red' ? battle.redGenomes : battle.blueGenomes;
            const opponentWon = battle.result.winner === opponentTeam;
            
            opponentGenomes.forEach(genome => {
                // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
                totalAggression += genome[0]; // Aggression
                totalSpeed += genome[1]; // Speed
                totalAccuracy += genome[2]; // Accuracy
                sampleCount++;
                
                if (opponentWon) {
                    // Record successful opponent tactics
                    if (genome[0] > 0.7) {winningTactics.push('high_aggression');}
                    if (genome[1] > 0.7) {winningTactics.push('high_speed');}
                    if (genome[2] > 0.7) {winningTactics.push('high_accuracy');}
                    if (genome[5] > 0.6) {winningTactics.push('formation_fighting');} // Adaptability (was formation)
                }
            });
        });
        
        return {
            avgAggression: sampleCount > 0 ? totalAggression / sampleCount : 0.5,
            avgSpeed: sampleCount > 0 ? totalSpeed / sampleCount : 0.5,
            avgAccuracy: sampleCount > 0 ? totalAccuracy / sampleCount : 0.5,
            winningTactics
        };
    }
    
        applyCounterEvolution(genome, opponentStrategies, team) {
            // RED QUEEN RACE: Evolve specific counters to opponent strategies in an evolutionary arms race
            // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
            let counterTacticLearned = false;
            let tacticName = '';

            // Counter high-aggression opponents with defensive tactics
            if (opponentStrategies.avgAggression > 0.6) {
                genome[3] = Math.min(1, genome[3] + 0.2); // Defense (was caution)
                genome[5] = Math.min(1, genome[5] + 0.15); // Adaptability (was formation)
                genome[6] = Math.min(1, genome[6] + 0.1); // Learning (similar to ambush planning)
                counterTacticLearned = true;
                tacticName = 'defensive_counter';
            }
            
            // Counter high-speed opponents with accuracy and prediction
            if (opponentStrategies.avgSpeed > 0.6) {
                genome[2] = Math.min(1, genome[2] + 0.2); // Accuracy
                genome[4] = Math.min(1, genome[4] + 0.1); // Teamwork (was cooperation)
                counterTacticLearned = true;
                tacticName = 'precision_counter';
            }
            
            // Counter high-accuracy opponents with mobility and flanking
            if (opponentStrategies.avgAccuracy > 0.6) {
                genome[1] = Math.min(1, genome[1] + 0.2); // Speed
                genome[8] = Math.min(1, genome[8] + 0.15); // Evasion (flanking behavior)
                counterTacticLearned = true;
                tacticName = 'mobility_counter';
            }
            
            // Counter formation fighting with disruption tactics
            if (opponentStrategies.winningTactics.includes('formation_fighting')) {
                genome[8] = Math.min(1, genome[8] + 0.2); // Evasion (flanking)
                genome[0] = Math.min(1, genome[0] + 0.1); // Aggression
                counterTacticLearned = true;
                tacticName = 'disruption_counter';
            }
            
            // Emit counter-evolution event
            if (window.emitASIArchEvent && opponentStrategies.winningTactics.length > 0) {
                window.emitASIArchEvent('researcher', 'counter_evolve', { 
                    trait: 'adaptation',
                    team: team,
                    counter: opponentStrategies.winningTactics[0] 
                });
            }
            
            // Emit team-specific tactical learning for counter-evolution
            // Only when significant counter-strategy is needed and occasionally to avoid spam
            if (counterTacticLearned && window.emitASIArchEvent && Math.random() < 0.3) {
                window.emitASIArchEvent('cognition', 'team_tactics_learned', { 
                    team: team,
                    tactic: tacticName
                });
            }
            
            return genome;
        }
    
    calculateGenomeFitness(genome, battleResult, team) {
        // Calculate fitness for a specific genome in the context of its team
        const teamStats = team === 'red' ? battleResult.redTeamStats : battleResult.blueTeamStats;
        const teamWon = battleResult.winner === team;
        
        let fitness = 0.0;
        
        // Base fitness from survival and performance
        fitness += teamStats.averageSurvivalTime / 120.0 * 0.3; // Survival component
        fitness += teamStats.accuracy * 0.3; // Accuracy component
        fitness += Math.min(teamStats.totalDamageDealt / 100, 0.2); // Damage component
        
        // Team victory bonus/penalty creates competitive pressure
        fitness += teamWon ? 0.3 : -0.1;
        
        // Individual genome contribution (estimated)
        const genomeContribution = this.estimateGenomeContribution(genome, teamStats);
        fitness += genomeContribution * 0.2;
        
        return Math.max(0, Math.min(1, fitness));
    }
    
    estimateGenomeContribution(genome, teamStats) {
        // Estimate how much this specific genome contributed to team performance
        let contribution = 0;
        
        // High aggression genomes get credit for high damage
        if (genome[0] > 0.7 && teamStats.totalDamageDealt > 50) { // Aggression
            contribution += 0.3;
        }
        
        // High accuracy genomes get credit for team accuracy
        if (genome[2] > 0.7 && teamStats.accuracy > 0.6) { // Accuracy
            contribution += 0.3;
        }
        
        // Cooperative genomes get credit for team survival
        if (genome[4] > 0.6 && teamStats.averageSurvivalTime > 40) { // Teamwork (was cooperation)
            contribution += 0.3;
        }
        
        return contribution;
    }
}

// ASI-ARCH Engineer Module - Evaluates architectures in real environment
class TankEngineer {
    constructor() {
        this.battleTimeLimit = 60; // Seconds for quick evaluation
    }
    
    async runBattle(redGenomes, blueGenomes) {
        console.log('⚔️ Engineer: Running battle simulation...');
        
        // Emit visualization event for battle start
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('engineer', 'run_battle', { 
                trait: 'battle_setup',
                teams: `Red: ${redGenomes.length} vs Blue: ${blueGenomes.length}`
            });
        }
        
        return new Promise((resolve) => {
            // Initialize battle with evolved genomes
            if (window.game) {
                window.game.tanks = [];
                window.game.projectiles = [];
                window.game.redTeam = [];
                window.game.blueTeam = [];
                window.game.battleTime = 0;
                window.game.battleStarted = false; // Reset timer flag for new battle
                window.game.gameState = 'running';
                
                // Create red team with evolved genomes
                redGenomes.forEach((genome, i) => {
                    const tank = new Tank(
                        50 + i * 30,
                        window.game.height * 0.3 + i * 40,
                        'red',
                        genome
                    );
                    window.game.tanks.push(tank);
                    window.game.redTeam.push(tank);
                });
                
                // Create blue team with evolved genomes
                blueGenomes.forEach((genome, i) => {
                    const tank = new Tank(
                        window.game.width - 100 - i * 30,
                        window.game.height * 0.3 + i * 40,
                        'blue',
                        genome
                    );
                    window.game.tanks.push(tank);
                    window.game.blueTeam.push(tank);
                });
                
                // Set up battle end listener
                const battleEndHandler = (event) => {
                    window.removeEventListener('battleEnd', battleEndHandler);
                    
                    // Emit visualization event for battle completion
                    if (window.emitASIArchEvent) {
                        window.emitASIArchEvent('engineer', 'battle_complete', { 
                            trait: 'result',
                            winner: event.detail.winner,
                            duration: event.detail.duration 
                        });
                    }
                    
                    resolve(event.detail);
                };
                
                window.addEventListener('battleEnd', battleEndHandler);
                
                // Start the game loop for this battle
                if (window.game.gameState === 'running') {
                    window.game.gameLoop();
                }
                
                // Force battle end after time limit
                setTimeout(() => {
                    if (window.game.gameState === 'running') {
                        window.game.endBattle('timeout');
                    }
                }, this.battleTimeLimit * 1000);
            }
        });
    }
    
    evaluateGenomePerformance(genome, battleResult, team) {
        // Detailed performance analysis for individual genome
        const teamStats = team === 'red' ? battleResult.redTeamStats : battleResult.blueTeamStats;
        
        return {
            survival: battleResult.duration,
            combat_effectiveness: teamStats.totalDamageDealt / Math.max(teamStats.totalDamageTaken, 1),
            accuracy: teamStats.accuracy,
            team_synergy: this.calculateTeamSynergy(genome, teamStats),
            adaptability: this.calculateAdaptability(genome, battleResult)
        };
    }
    
    calculateTeamSynergy(genome, stats) {
        // How well the tank worked with its team
        // Array indices: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
        return genome[4] * genome[5] * 0.5 + // Teamwork * Adaptability (was cooperation * formation)
               (stats.accuracy > 0.5 ? 0.3 : 0) +
               (stats.averageSurvivalTime > 30 ? 0.2 : 0);
    }
    
    calculateAdaptability(genome, result) {
        // How well the tank adapted to the battle situation
        const survived = result.duration > 30;
        const effectiveCombat = result.redTeamStats.accuracy > 0.4 || result.blueTeamStats.accuracy > 0.4;
        
        return (survived ? 0.5 : 0) + (effectiveCombat ? 0.5 : 0);
    }
}

// ASI-ARCH Analyst Module - Generates insights from experimental results
class TankAnalyst {
    constructor() {
        this.insightThreshold = 0.1; // Minimum improvement to be considered significant
    }
    
    analyzeResults(battleResult, history) {
        console.log('📊 Analyst: Analyzing battle results...');
        
        // Emit visualization event for analysis start
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'analyze_results', { 
                trait: 'battle_data',
                historySize: history.length 
            });
        }
        
        const analysis = {
            performance_trends: this.analyzePerformanceTrends(history),
            emergent_behaviors: this.identifyEmergentBehaviors(battleResult),
            strategic_insights: this.generateStrategicInsights(battleResult, history),
            fitness_progression: this.analyzeFitnessProgression(history),
            significantDiscovery: null
        };
        
        // Check for significant discoveries
        if (this.detectSignificantImprovement(battleResult, history)) {
            analysis.significantDiscovery = this.generateDiscoveryReport(battleResult, history);
            
            // Emit visualization event for discovery
            if (window.emitASIArchEvent) {
                window.emitASIArchEvent('analyst', 'discovery_found', { 
                    trait: 'insight',
                    type: 'significant_improvement' 
                });
            }
        }
        
        // Emit completion event
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'analysis_complete', { 
                trait: 'report',
                insights: analysis.strategic_insights ? analysis.strategic_insights.length : 0 
            });
        }
        
        return analysis;
    }
    
    analyzePerformanceTrends(history) {
        // Emit visualization event for performance analysis
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'analyze_trends', { 
                trait: 'performance',
                historySize: history.length 
            });
        }
        
        if (history.length < 3) {return null;}
        
        const recent = history.slice(-5);
        const avgFitness = recent.reduce((sum, exp) => {
            const redFitness = this.calculateBattleFitness(exp.result, 'red');
            const blueFitness = this.calculateBattleFitness(exp.result, 'blue');
            return sum + (redFitness + blueFitness) / 2;
        }, 0) / recent.length;
        
        return {
            average_fitness: avgFitness,
            improvement_rate: this.calculateImprovementRate(recent),
            battle_duration_trend: this.analyzeDurationTrend(recent)
        };
    }
    
    identifyEmergentBehaviors(result) {
        // Emit visualization event for behavior analysis
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'identify_behaviors', { 
                trait: 'emergence',
                duration: result.duration.toFixed(1) 
            });
        }
        
        const behaviors = [];
        
        // Analyze if tanks showed sophisticated behaviors
        if (result.duration > 45) {
            behaviors.push('Extended tactical engagement');
        }
        
        if (result.redTeamStats.accuracy > 0.7 || result.blueTeamStats.accuracy > 0.7) {
            behaviors.push('High-precision targeting');
        }
        
        if (result.redTeamStats.totalDamageDealt > result.redTeamStats.totalDamageTaken * 2 ||
            result.blueTeamStats.totalDamageDealt > result.blueTeamStats.totalDamageTaken * 2) {
            behaviors.push('Superior tactical positioning');
        }
        
        return behaviors;
    }
    
    generateStrategicInsights(result, _history) {
        // Emit visualization event for strategic analysis
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'generate_insights', { 
                trait: 'strategy',
                winner: result.winner 
            });
        }
        
        const insights = [];
        
        // Analyze winning strategies
        if (result.winner !== 'timeout') {
            const winnerStats = result.winner === 'red' ? result.redTeamStats : result.blueTeamStats;
            
            if (winnerStats.accuracy > 0.6) {
                insights.push('Accuracy-focused strategy showed effectiveness');
            }
            
            if (winnerStats.averageSurvivalTime > 40) {
                insights.push('Defensive positioning improved survivability');
            }
            
            if (result.duration < 30) {
                insights.push('Aggressive early engagement led to quick victory');
            }
        }
        
        return insights;
    }
    
    analyzeFitnessProgression(history) {
        // Emit visualization event for fitness analysis
        if (window.emitASIArchEvent) {
            window.emitASIArchEvent('analyst', 'analyze_fitness', { 
                trait: 'progression',
                generations: history.length 
            });
        }
        
        if (history.length < 2) {return null;}
        
        const fitnessOverTime = history.map(exp => {
            const redFitness = this.calculateBattleFitness(exp.result, 'red');
            const blueFitness = this.calculateBattleFitness(exp.result, 'blue');
            return (redFitness + blueFitness) / 2;
        });
        
        return {
            current_fitness: fitnessOverTime[fitnessOverTime.length - 1],
            fitness_trend: this.calculateTrend(fitnessOverTime),
            best_fitness: Math.max(...fitnessOverTime),
            improvement_consistency: this.calculateConsistency(fitnessOverTime)
        };
    }
    
    detectSignificantImprovement(result, history) {
        if (history.length < 3) {return false;}
        
        const currentFitness = this.calculateBattleFitness(result, result.winner);
        const recentAvg = history.slice(-3).reduce((sum, exp) => {
            const fitness = this.calculateBattleFitness(exp.result, exp.result.winner);
            return sum + fitness;
        }, 0) / 3;
        
        return currentFitness > recentAvg + this.insightThreshold;
    }
    
    generateDiscoveryReport(result, history) {
        const improvement = this.calculateImprovement(result, history);
        const behaviors = this.identifyEmergentBehaviors(result);
        
        return `Significant improvement detected: +${(improvement * 100).toFixed(1)}% performance gain. ` +
               `Emergent behaviors: ${behaviors.join(', ') || 'Standard tactics'}`;
    }
    
    calculateBattleFitness(result, team) {
        if (team === 'timeout') {return 0.3;} // Draw fitness
        
        const teamStats = team === 'red' ? result.redTeamStats : result.blueTeamStats;
        const won = result.winner === team;
        
        return (won ? 0.5 : 0) + 
               (teamStats.averageSurvivalTime / 120) * 0.2 +
               teamStats.accuracy * 0.2 +
               Math.min(teamStats.totalDamageDealt / 100, 0.1);
    }
    
    calculateImprovementRate(experiments) {
        if (experiments.length < 2) {return 0;}
        
        const first = this.calculateBattleFitness(experiments[0].result, experiments[0].result.winner);
        const last = this.calculateBattleFitness(experiments[experiments.length - 1].result, experiments[experiments.length - 1].result.winner);
        
        return (last - first) / experiments.length;
    }
    
    analyzeDurationTrend(experiments) {
        const durations = experiments.map(exp => exp.result.duration);
        return {
            average: durations.reduce((a, b) => a + b, 0) / durations.length,
            trend: this.calculateTrend(durations)
        };
    }
    
    calculateTrend(values) {
        if (values.length < 2) {return 0;}
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }
    
    calculateConsistency(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return 1 / (1 + Math.sqrt(variance)); // Higher is more consistent
    }
    
    calculateImprovement(result, history) {
        if (history.length === 0) {return 0;}
        
        const current = this.calculateBattleFitness(result, result.winner);
        const baseline = this.calculateBattleFitness(history[0].result, history[0].result.winner);
        
        return (current - baseline) / Math.max(baseline, 0.1);
    }
}

// ASI-ARCH Unified Module System
class ASIArchModules {
    constructor() {
        this.researcherModule = new TankResearcher();
        this.engineerModule = new TankEngineer();
        this.analystModule = new TankAnalyst();
        this.cognitionModule = new MilitaryTacticsKnowledge();
        
        // Team performance tracking
        this.teamPerformance = {
            red: 0.5,
            blue: 0.5
        };
        
        // Statistics tracking for visualization
        this.stats = {
            red: {
                mutations: 0,
                insights: 0,
                tactics: 0,
                adaptations: 0
            },
            blue: {
                mutations: 0,
                insights: 0,
                tactics: 0,
                adaptations: 0
            }
        };
    }
    
    // Researcher Module Interface
        applyResearcher(population, team, _history) {
        const researched = population.map(individual => {
            // Genome should already be in array format, just pass it directly
            let genome = individual.genome;
            
            // Ensure it's an array, if not convert properly
            if (!Array.isArray(genome)) {
                // Convert object to new array format: [Aggression, Speed, Accuracy, Defense, Teamwork, Adaptability, Learning, RiskTaking, Evasion]
                genome = [
                    genome.aggression || 0.5,    // [0] Aggression
                    genome.speed || 0.5,         // [1] Speed  
                    genome.accuracy || 0.5,      // [2] Accuracy
                    genome.caution || 0.5,       // [3] Defense (was caution)
                    genome.cooperation || 0.5,   // [4] Teamwork (was cooperation)
                    genome.formation || 0.5,     // [5] Adaptability (was formation)
                    genome.flanking || 0.5,      // [6] Learning (was flanking)
                    genome.ambush || 0.5,        // [7] RiskTaking (was ambush)
                    genome.sacrifice || 0.5      // [8] Evasion (was sacrifice)
                ];
            }
            
            const mutated = this.researcherModule.mutate(genome);
            this.stats[team].mutations++;
            
            // mutated should already be an array, no conversion needed
            return { ...individual, genome: mutated };
        });
        this.updateDisplay();
        return researched;
    }
    
        // Engineer Module Interface
        applyEngineer(population, team) {
            // Optimize configurations through systematic evaluation and optimization
            const optimized = population.map(individual => {
                this.engineerModule.evaluateGenomePerformance(
                    individual.genome, 
                    { duration: 60, redTeamStats: {}, blueTeamStats: {} }, 
                    team
                );
                this.stats[team].insights++;
                return individual;
            });
            this.updateDisplay();
            return optimized;
        }    // Analyst Module Interface
    applyAnalyst(redPopulation, bluePopulation, team) {
        this.analystModule.analyzeResults(
            { 
                winner: team,
                redTeamStats: { accuracy: 0.5, averageSurvivalTime: 30, totalDamageDealt: 50, totalDamageTaken: 40 },
                blueTeamStats: { accuracy: 0.4, averageSurvivalTime: 25, totalDamageDealt: 40, totalDamageTaken: 50 },
                duration: 45
            },
            []
        );
        
        // Conditional tactical learning - only when performing well
        // This implements conditional learning based on performance thresholds
        const teamPopulation = team === 'red' ? redPopulation : bluePopulation;
        const avgFitness = teamPopulation.reduce((sum, t) => sum + t.fitness, 0) / teamPopulation.length;
        
        if (avgFitness > 0.6) {
            this.stats[team].tactics++;
        }
        
        this.updateDisplay();
        return teamPopulation;
    }
    
    // Cognition Module Interface
    applyCognition(population, team) {
        const enhanced = population.map(individual => {
            // Apply meta-learning based on team performance-based learning system
            const performance = this.getTeamPerformance(team);
            
            // Always increment adaptations when cognition is applied
            this.stats[team].adaptations++;
            
            // Additional adaptations for high-performing teams
            if (performance > 0.5) {
                this.stats[team].adaptations++;
            }
            return individual;
        });
        this.updateDisplay();
        return enhanced;
    }
    
    // Team Performance Management
    setTeamPerformance(team, performance) {
        this.teamPerformance[team] = performance;
    }
    
    getTeamPerformance(team) {
        return this.teamPerformance[team];
    }
    
    // Display Update
    updateDisplay() {
        // Update DOM elements if they exist
        try {
            const redMutationsEl = document.getElementById('researcherRedMutations');
            const blueMutationsEl = document.getElementById('researcherBlueMutations');
            const redInsightsEl = document.getElementById('analystRedInsights');
            const blueInsightsEl = document.getElementById('analystBlueInsights');
            const redTacticsEl = document.getElementById('cognitionRedTactics');
            const blueTacticsEl = document.getElementById('cognitionBlueTactics');
            const redAdaptationsEl = document.getElementById('redAdaptations');
            const blueAdaptationsEl = document.getElementById('blueAdaptations');
            
            if (redMutationsEl) {redMutationsEl.textContent = this.stats.red.mutations;}
            if (blueMutationsEl) {blueMutationsEl.textContent = this.stats.blue.mutations;}
            if (redInsightsEl) {redInsightsEl.textContent = this.stats.red.insights;}
            if (blueInsightsEl) {blueInsightsEl.textContent = this.stats.blue.insights;}
            if (redTacticsEl) {redTacticsEl.textContent = this.stats.red.tactics;}
            if (blueTacticsEl) {blueTacticsEl.textContent = this.stats.blue.tactics;}
            if (redAdaptationsEl) {redAdaptationsEl.textContent = this.stats.red.adaptations;}
            if (blueAdaptationsEl) {blueAdaptationsEl.textContent = this.stats.blue.adaptations;}
        } catch (_e) {
            // DOM elements may not exist in test environment
        }
    }
}

// Export classes to global scope
window.TankResearcher = TankResearcher;
window.TankEngineer = TankEngineer;
window.TankAnalyst = TankAnalyst;
window.ASIArchModules = ASIArchModules;
