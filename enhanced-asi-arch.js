/**
 * Enhanced ASI-ARCH Modules with Researcher Insights Integration
 * This file extends the original ASI-ARCH modules to provide deep insights
 * into how the Researcher module functions and evolves over time.
 */

// Enhanced TankResearcher with detailed logging and insights
class EnhancedTankResearcher extends TankResearcher {
    constructor() {
        super();
        this.insights = window.researcherInsights;
        this.generationCounter = 0;
        this.detailedLogs = true;
    }

    generateRandomGenome() {
        const genome = super.generateRandomGenome();
        
        if (this.insights) {
            this.insights.trackGenomeGeneration('random', genome);
        }
        
        return genome;
    }

    generateTeamSpecificGenome(team) {
        const genome = super.generateTeamSpecificGenome(team);
        
        if (this.insights) {
            this.insights.trackGenomeGeneration('team-specific', genome, team);
        }
        
        return genome;
    }

    mutate(genome) {
        const originalGenome = [...genome];
        const mutatedGenome = super.mutate(genome);
        
        if (this.insights && this.detailedLogs) {
            // Determine team from context or use 'unknown'
            const team = this.currentTeam || 'unknown';
            this.insights.trackMutation(originalGenome, mutatedGenome, team);
        }
        
        return mutatedGenome;
    }

    crossover(parent1, parent2) {
        const child = super.crossover(parent1, parent2);
        
        if (this.insights && this.detailedLogs) {
            const team = this.currentTeam || 'unknown';
            this.insights.trackCrossover(parent1, parent2, child, team);
        }
        
        return child;
    }

    runTournament(candidatePool, tournamentSize) {
        const winner = super.runTournament(candidatePool, tournamentSize);
        
        if (this.insights) {
            this.insights.trackTournament(candidatePool, winner, tournamentSize);
        }
        
        return winner;
    }

    proposeExperiment(candidatePool, history, cognitionBase) {
        this.generationCounter++;
        
        const experiment = super.proposeExperiment(candidatePool, history, cognitionBase);
        
        if (this.insights) {
            this.insights.trackExperiment(experiment, candidatePool.length, history.length);
        }
        
        return experiment;
    }

    applyCounterEvolution(genome, opponentStrategies, team) {
        const originalGenome = [...genome];
        const adaptedGenome = super.applyCounterEvolution(genome, opponentStrategies, team);
        
        if (this.insights) {
            const adaptations = {};
            for (let i = 0; i < originalGenome.length; i++) {
                if (Math.abs(originalGenome[i] - adaptedGenome[i]) > 0.001) {
                    adaptations[`trait_${i}`] = adaptedGenome[i] - originalGenome[i];
                }
            }
            
            this.insights.trackRedQueenAdaptation(team, opponentStrategies, adaptations);
        }
        
        return adaptedGenome;
    }

    generateTeamGenomes(parents, cognitionBase, team, history) {
        this.currentTeam = team; // Set context for mutation/crossover tracking
        
        const genomes = super.generateTeamGenomes(parents, cognitionBase, team, history);
        
        this.currentTeam = null; // Clear context
        
        return genomes;
    }

    // New method: Analyze current population diversity
    analyzePopulationDiversity(candidatePool) {
        if (!candidatePool || candidatePool.length < 2) {
            return { diversity: 0, clusters: 0, outliers: 0 };
        }

        let totalDistance = 0;
        let comparisons = 0;
        const distances = [];

        for (let i = 0; i < candidatePool.length; i++) {
            for (let j = i + 1; j < candidatePool.length; j++) {
                const distance = this.calculateGenomeDistance(
                    candidatePool[i].genome, 
                    candidatePool[j].genome
                );
                distances.push(distance);
                totalDistance += distance;
                comparisons++;
            }
        }

        const avgDistance = totalDistance / comparisons;
        const stdDev = Math.sqrt(
            distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length
        );

        // Simple clustering analysis
        const clusters = this.identifyGenomeClusters(candidatePool);
        const outliers = this.identifyOutliers(candidatePool, avgDistance, stdDev);

        return {
            diversity: avgDistance,
            standardDeviation: stdDev,
            clusters: clusters.length,
            outliers: outliers.length,
            clusterDetails: clusters,
            outlierDetails: outliers
        };
    }

    calculateGenomeDistance(genome1, genome2) {
        let distance = 0;
        for (let i = 0; i < genome1.length; i++) {
            distance += Math.pow(genome1[i] - genome2[i], 2);
        }
        return Math.sqrt(distance);
    }

    identifyGenomeClusters(candidatePool, threshold = 0.3) {
        const clusters = [];
        const visited = new Set();

        for (let i = 0; i < candidatePool.length; i++) {
            if (visited.has(i)) {
                continue;
            }

            const cluster = [i];
            visited.add(i);

            for (let j = i + 1; j < candidatePool.length; j++) {
                if (visited.has(j)) {
                    continue;
                }

                const distance = this.calculateGenomeDistance(
                    candidatePool[i].genome,
                    candidatePool[j].genome
                );

                if (distance < threshold) {
                    cluster.push(j);
                    visited.add(j);
                }
            }

            if (cluster.length > 1) {
                clusters.push({
                    indices: cluster,
                    size: cluster.length,
                    centroid: this.calculateClusterCentroid(candidatePool, cluster)
                });
            }
        }

        return clusters;
    }

    calculateClusterCentroid(candidatePool, clusterIndices) {
        const centroid = new Array(9).fill(0);
        
        clusterIndices.forEach(index => {
            candidatePool[index].genome.forEach((gene, i) => {
                centroid[i] += gene;
            });
        });

        return centroid.map(sum => sum / clusterIndices.length);
    }

    identifyOutliers(candidatePool, avgDistance, stdDev, threshold = 2) {
        const outliers = [];
        
        for (let i = 0; i < candidatePool.length; i++) {
            let totalDistance = 0;
            let comparisons = 0;

            for (let j = 0; j < candidatePool.length; j++) {
                if (i !== j) {
                    totalDistance += this.calculateGenomeDistance(
                        candidatePool[i].genome,
                        candidatePool[j].genome
                    );
                    comparisons++;
                }
            }

            const avgDistanceFromOthers = totalDistance / comparisons;
            const zScore = (avgDistanceFromOthers - avgDistance) / stdDev;

            if (Math.abs(zScore) > threshold) {
                outliers.push({
                    index: i,
                    genome: candidatePool[i].genome,
                    fitness: candidatePool[i].fitness,
                    zScore: zScore,
                    isExtreme: zScore > threshold
                });
            }
        }

        return outliers;
    }

    // Method to analyze tactical evolution patterns
    analyzeTacticalEvolution(history) {
        if (!history || history.length < 3) {
            return { insufficient_data: true };
        }

        const analysis = {
            red: this.analyzeTeamTacticalEvolution(history, 'red'),
            blue: this.analyzeTeamTacticalEvolution(history, 'blue'),
            convergence: this.analyzeTeamConvergence(history),
            armsRace: this.analyzeArmsRacePatterns(history)
        };

        return analysis;
    }

    analyzeTeamTacticalEvolution(history, team) {
        const teamGenomes = history.map(h => team === 'red' ? h.redGenomes : h.blueGenomes);
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];

        const evolution = {
            traits: {},
            volatility: {},
            trends: {},
            phases: []
        };

        traitNames.forEach((trait, traitIndex) => {
            const traitHistory = teamGenomes.map(genomes => {
                const avgTrait = genomes.reduce((sum, genome) => sum + genome[traitIndex], 0) / genomes.length;
                return avgTrait;
            });

            evolution.traits[trait] = traitHistory;
            evolution.volatility[trait] = this.calculateVolatility(traitHistory);
            evolution.trends[trait] = this.calculateTrend(traitHistory);
        });

        // Identify tactical phases
        evolution.phases = this.identifyTacticalPhases(teamGenomes, team);

        return evolution;
    }

    calculateVolatility(values) {
        if (values.length < 2) {
            return 0;
        }

        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(Math.abs(values[i] - values[i-1]));
        }

        return changes.reduce((sum, change) => sum + change, 0) / changes.length;
    }

    calculateTrend(values) {
        if (values.length < 2) {
            return 0;
        }

        const n = values.length;
        const sumX = n * (n - 1) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
        const sumX2 = n * (n - 1) * (2 * n - 1) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    identifyTacticalPhases(teamGenomes, team) {
        const phases = [];
        let currentPhase = null;

        teamGenomes.forEach((genomes, generation) => {
            const dominantTactic = this.identifyDominantTactic(genomes);
            
            if (!currentPhase || currentPhase.tactic !== dominantTactic.name) {
                if (currentPhase) {
                    currentPhase.endGeneration = generation - 1;
                    currentPhase.duration = currentPhase.endGeneration - currentPhase.startGeneration + 1;
                    phases.push(currentPhase);
                }

                currentPhase = {
                    tactic: dominantTactic.name,
                    startGeneration: generation,
                    strength: dominantTactic.strength,
                    team: team
                };
            } else {
                // Update strength for continuing phase
                currentPhase.strength = Math.max(currentPhase.strength, dominantTactic.strength);
            }
        });

        // Close final phase
        if (currentPhase) {
            currentPhase.endGeneration = teamGenomes.length - 1;
            currentPhase.duration = currentPhase.endGeneration - currentPhase.startGeneration + 1;
            phases.push(currentPhase);
        }

        return phases;
    }

    identifyDominantTactic(genomes) {
        const avgTraits = new Array(9).fill(0);
        
        genomes.forEach(genome => {
            genome.forEach((trait, i) => {
                avgTraits[i] += trait;
            });
        });

        avgTraits.forEach((sum, i) => {
            avgTraits[i] = sum / genomes.length;
        });

        // Identify dominant tactical pattern
        const tactics = {
            aggressive: avgTraits[0] * 0.4 + avgTraits[8] * 0.3 + (1 - avgTraits[3]) * 0.3,
            defensive: avgTraits[3] * 0.5 + avgTraits[4] * 0.3 + (1 - avgTraits[8]) * 0.2,
            mobile: avgTraits[1] * 0.4 + avgTraits[6] * 0.3 + avgTraits[7] * 0.3,
            formation: avgTraits[5] * 0.4 + avgTraits[4] * 0.3 + avgTraits[2] * 0.3
        };

        const dominantTactic = Object.entries(tactics).reduce((max, [name, strength]) => 
            strength > max.strength ? { name, strength } : max
        , { name: 'balanced', strength: 0 });

        return dominantTactic;
    }

    analyzeTeamConvergence(history) {
        if (history.length < 3) {
            return null;
        }

        const redDiversity = [];
        const blueDiversity = [];

        history.forEach(battle => {
            redDiversity.push(this.calculateTeamDiversity(battle.redGenomes));
            blueDiversity.push(this.calculateTeamDiversity(battle.blueGenomes));
        });

        return {
            red: {
                trend: this.calculateTrend(redDiversity),
                current: redDiversity[redDiversity.length - 1],
                volatility: this.calculateVolatility(redDiversity)
            },
            blue: {
                trend: this.calculateTrend(blueDiversity),
                current: blueDiversity[blueDiversity.length - 1],
                volatility: this.calculateVolatility(blueDiversity)
            }
        };
    }

    calculateTeamDiversity(genomes) {
        if (genomes.length <= 1) {
            return 0;
        }

        let totalDistance = 0;
        let comparisons = 0;

        for (let i = 0; i < genomes.length; i++) {
            for (let j = i + 1; j < genomes.length; j++) {
                totalDistance += this.calculateGenomeDistance(genomes[i], genomes[j]);
                comparisons++;
            }
        }

        return comparisons > 0 ? totalDistance / comparisons : 0;
    }

    analyzeArmsRacePatterns(history) {
        const patterns = {
            escalation: this.detectEscalationPatterns(history),
            cycles: this.detectCyclicalPatterns(history),
            innovation: this.detectInnovationEvents(history)
        };

        return patterns;
    }

    detectEscalationPatterns(history) {
        // Analyze if traits are consistently increasing over time
        const escalationMetrics = {};
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];

        traitNames.forEach((trait, index) => {
            const redValues = history.map(h => {
                return h.redGenomes.reduce((sum, g) => sum + g[index], 0) / h.redGenomes.length;
            });
            const blueValues = history.map(h => {
                return h.blueGenomes.reduce((sum, g) => sum + g[index], 0) / h.blueGenomes.length;
            });

            const redTrend = this.calculateTrend(redValues);
            const blueTrend = this.calculateTrend(blueValues);

            escalationMetrics[trait] = {
                red: redTrend,
                blue: blueTrend,
                mutual: redTrend > 0 && blueTrend > 0,
                competition: Math.abs(redTrend - blueTrend)
            };
        });

        return escalationMetrics;
    }

    detectCyclicalPatterns(history) {
        // Look for repeating patterns in team strategies
        if (history.length < 6) {
            return null;
        }

        // This is a simplified cycle detection - could be enhanced with FFT
        const cycles = {};
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];

        traitNames.forEach((trait, index) => {
            const redValues = history.map(h => {
                return h.redGenomes.reduce((sum, g) => sum + g[index], 0) / h.redGenomes.length;
            });

            // Simple peak detection for cycles
            const peaks = this.detectPeaks(redValues);
            if (peaks.length >= 2) {
                const intervals = [];
                for (let i = 1; i < peaks.length; i++) {
                    intervals.push(peaks[i] - peaks[i-1]);
                }
                
                const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                cycles[trait] = {
                    detected: intervals.length > 1,
                    averageInterval: avgInterval,
                    peaks: peaks
                };
            }
        });

        return cycles;
    }

    detectPeaks(values, threshold = 0.1) {
        const peaks = [];
        
        for (let i = 1; i < values.length - 1; i++) {
            if (values[i] > values[i-1] && values[i] > values[i+1] && 
                values[i] - Math.min(values[i-1], values[i+1]) > threshold) {
                peaks.push(i);
            }
        }

        return peaks;
    }

    detectInnovationEvents(history) {
        // Identify sudden changes in strategy that lead to success
        const innovations = [];

        for (let i = 1; i < history.length; i++) {
            const prevBattle = history[i-1];
            const currBattle = history[i];

            // Check for significant strategy changes
            const redChange = this.calculateStrategyChange(prevBattle.redGenomes, currBattle.redGenomes);
            const blueChange = this.calculateStrategyChange(prevBattle.blueGenomes, currBattle.blueGenomes);

            // Check if change led to improved performance
            if (redChange.magnitude > 0.2 && currBattle.result.winner === 'red') {
                innovations.push({
                    generation: i,
                    team: 'red',
                    change: redChange,
                    result: 'victory'
                });
            }

            if (blueChange.magnitude > 0.2 && currBattle.result.winner === 'blue') {
                innovations.push({
                    generation: i,
                    team: 'blue',
                    change: blueChange,
                    result: 'victory'
                });
            }
        }

        return innovations;
    }

    calculateStrategyChange(previousGenomes, currentGenomes) {
        const prevAvg = this.calculateAverageGenome(previousGenomes);
        const currAvg = this.calculateAverageGenome(currentGenomes);

        let totalChange = 0;
        const changes = {};

        for (let i = 0; i < prevAvg.length; i++) {
            const change = Math.abs(currAvg[i] - prevAvg[i]);
            totalChange += change;
            changes[`trait_${i}`] = change;
        }

        return {
            magnitude: totalChange / prevAvg.length,
            changes: changes,
            direction: currAvg.map((val, i) => val - prevAvg[i])
        };
    }

    calculateAverageGenome(genomes) {
        const avg = new Array(9).fill(0);
        
        genomes.forEach(genome => {
            genome.forEach((trait, i) => {
                avg[i] += trait;
            });
        });

        return avg.map(sum => sum / genomes.length);
    }
}

// Replace the original TankResearcher with enhanced version
if (typeof window !== 'undefined') {
    window.TankResearcher = EnhancedTankResearcher;
}
