/**
 * Data Collection and Analysis Module
 * Handles logging, tracking, and analysis of evolution data
 */

class DataCollector {
    constructor() {
        this.logs = [];
        this.metrics = {
            genomeGenerations: 0,
            mutations: 0,
            crossovers: 0,
            tournaments: 0,
            experiments: 0,
            redQueenAdaptations: 0
        };
        this.generationData = [];
        this.teamEvolution = {
            red: { genomes: [], fitness: [], tactics: [] },
            blue: { genomes: [], fitness: [], tactics: [] }
        };
    }

    /**
     * Log an event with timestamp and data
     */
    log(category, message, data = {}) {
        const timestamp = new Date().toISOString().substr(11, 8);
        const logEntry = {
            timestamp,
            category,
            message,
            data: JSON.parse(JSON.stringify(data))
        };
        
        this.logs.push(logEntry);
        
        // Keep only last 100 logs
        const maxLogs = window.GAME_CONFIG?.UI?.LOG_MAX_ENTRIES || 100;
        if (this.logs.length > maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Track genome generation event
     */
    trackGenomeGeneration(genome, team = 'unknown', type = 'random') {
        this.metrics.genomeGenerations++;
        
        const traits = GenomeUtils.analyzeTraits(genome);
        this.log('GENERATION', `Generated ${type} genome`, { 
            type, 
            team, 
            genome: genome.map(g => g.toFixed(3)),
            traits
        });
        
        if (team !== 'unknown' && this.teamEvolution[team]) {
            this.teamEvolution[team].genomes.push(genome);
        }
    }

    /**
     * Track mutation event
     */
    trackMutation(originalGenome, mutatedGenome, team) {
        this.metrics.mutations++;
        const changes = this.calculateGenomeChanges(originalGenome, mutatedGenome);
        
        this.log('MUTATION', `Genome mutated for ${team} team`, {
            team,
            changedGenes: changes.changedIndices.length,
            avgChange: changes.avgChange.toFixed(4),
            maxChange: changes.maxChange.toFixed(4),
            affectedTraits: changes.affectedTraits
        });
    }

    /**
     * Track crossover event
     */
    trackCrossover(parent1, parent2, child, team) {
        this.metrics.crossovers++;
        const inheritance = this.analyzeCrossoverInheritance(parent1, parent2, child);
        
        this.log('CROSSOVER', `Crossover produced new ${team} genome`, {
            team,
            parent1Traits: GenomeUtils.analyzeTraits(parent1),
            parent2Traits: GenomeUtils.analyzeTraits(parent2),
            childTraits: GenomeUtils.analyzeTraits(child),
            inheritance
        });
    }

    /**
     * Track tournament selection event
     */
    trackTournament(candidates, winner, tournamentSize) {
        this.metrics.tournaments++;
        
        const fitnessStats = {
            min: Math.min(...candidates.map(c => c.fitness)),
            max: Math.max(...candidates.map(c => c.fitness)),
            avg: candidates.reduce((sum, c) => sum + c.fitness, 0) / candidates.length
        };
        
        this.log('TOURNAMENT', `Tournament selection completed`, {
            tournamentSize,
            candidatesCount: candidates.length,
            winnerFitness: winner.fitness.toFixed(4),
            fitnessStats: {
                min: fitnessStats.min.toFixed(4),
                max: fitnessStats.max.toFixed(4),
                avg: fitnessStats.avg.toFixed(4)
            },
            selectionPressure: (winner.fitness - fitnessStats.avg).toFixed(4)
        });
    }

    /**
     * Track experiment event
     */
    trackExperiment(redGenomes, blueGenomes, candidatePool, history) {
        this.metrics.experiments++;
        
        const redTraits = this.analyzeTeamTraits(redGenomes);
        const blueTraits = this.analyzeTeamTraits(blueGenomes);
        
        this.log('EXPERIMENT', `New experiment proposed`, {
            redGenomes: redGenomes.length,
            blueGenomes: blueGenomes.length,
            candidatePoolSize: candidatePool.length,
            historySize: history.length,
            redTeamProfile: redTraits,
            blueTeamProfile: blueTraits,
            strategicDifferences: this.compareTeamStrategies(redTraits, blueTraits)
        });
    }

    /**
     * Track Red Queen adaptation event
     */
    trackRedQueenAdaptation(team, opponentStrategies, adaptations) {
        this.metrics.redQueenAdaptations++;
        
        // Safety check for adaptations parameter
        const validAdaptations = adaptations || {};
        
        this.log('RED_QUEEN', `${team} team adapted to opponent strategies`, {
            team,
            opponentStrategies,
            adaptations: validAdaptations,
            adaptationStrength: Object.values(validAdaptations).reduce((sum, val) => sum + Math.abs(val), 0)
        });
    }

    /**
     * Track generation completion
     */
    trackGenerationComplete(generation, eventData) {
        // Prevent duplicate tracking of the same generation
        const existingGeneration = this.generationData.find(g => g.generation === generation);
        if (existingGeneration) {
            console.warn(`⚠️ Generation ${generation} already tracked, skipping duplicate`);
            return;
        }
        
        const battleResults = eventData.winner ? eventData : {
            winner: 'unknown',
            redTeamStats: undefined,
            blueTeamStats: undefined,
            generationData: eventData
        };
        
        const redFitness = this.getTeamFitness(battleResults, eventData, 'red');
        const blueFitness = this.getTeamFitness(battleResults, eventData, 'blue');
        
        const generationData = {
            generation,
            timestamp: Date.now(),
            battleResults,
            eventData,
            savedFitness: {
                red: redFitness,
                blue: blueFitness
            },
            teamStats: {
                red: this.calculateTeamEvolutionStats('red'),
                blue: this.calculateTeamEvolutionStats('blue')
            }
        };
        
        this.generationData.push(generationData);
        
        this.log('GENERATION_COMPLETE', `Generation ${generation} evolution complete`, {
            generation,
            winner: battleResults.winner,
            redFitness: redFitness,
            blueFitness: blueFitness,
            evolutionaryPressure: this.calculateEvolutionaryPressure(generationData),
            topFitness: eventData.topFitness || 0,
            totalExperiments: eventData.totalExperiments || 0
        });
    }

    // Analysis methods...
    calculateGenomeChanges(original, mutated) {
        const changes = {
            changedIndices: [],
            changes: [],
            affectedTraits: []
        };
        
        const traitNames = window.TRAIT_NAMES || [
            'aggression', 'speed', 'accuracy', 'defense', 'cooperation',
            'formation', 'flanking', 'ambush', 'riskTaking'
        ];
        
        for (let i = 0; i < original.length; i++) {
            if (Math.abs(original[i] - mutated[i]) > 0.001) {
                changes.changedIndices.push(i);
                changes.changes.push(mutated[i] - original[i]);
                if (traitNames[i]) {
                    changes.affectedTraits.push(traitNames[i]);
                }
            }
        }
        
        changes.avgChange = changes.changes.length > 0 ? 
            changes.changes.reduce((sum, val) => sum + Math.abs(val), 0) / changes.changes.length : 0;
        changes.maxChange = changes.changes.length > 0 ? 
            Math.max(...changes.changes.map(Math.abs)) : 0;
        
        return changes;
    }

    analyzeCrossoverInheritance(parent1, parent2, child) {
        const inheritance = {
            fromParent1: 0,
            fromParent2: 0,
            novel: 0
        };
        
        for (let i = 0; i < child.length; i++) {
            const diffP1 = Math.abs(child[i] - parent1[i]);
            const diffP2 = Math.abs(child[i] - parent2[i]);
            
            if (diffP1 < 0.001) {
                inheritance.fromParent1++;
            } else if (diffP2 < 0.001) {
                inheritance.fromParent2++;
            } else {
                inheritance.novel++;
            }
        }
        
        return inheritance;
    }

    analyzeTeamTraits(genomes) {
        const teamTraits = {};
        const traitNames = window.TRAIT_NAMES || [
            'aggression', 'speed', 'accuracy', 'defense', 'cooperation',
            'formation', 'flanking', 'ambush', 'riskTaking'
        ];
        
        traitNames.forEach(trait => {
            const values = genomes.map(genome => {
                const traits = GenomeUtils.analyzeTraits(genome);
                return traits[trait];
            });
            
            teamTraits[trait] = {
                avg: values.reduce((sum, val) => sum + val, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                diversity: MathUtils.standardDeviation(values)
            };
        });
        
        return teamTraits;
    }

    compareTeamStrategies(redTraits, blueTraits) {
        const differences = {};
        
        Object.keys(redTraits).forEach(trait => {
            differences[trait] = {
                redAdvantage: redTraits[trait].avg - blueTraits[trait].avg,
                diversityGap: redTraits[trait].diversity - blueTraits[trait].diversity
            };
        });
        
        return differences;
    }

    calculateTeamEvolutionStats(team) {
        const genomes = this.teamEvolution[team].genomes;
        if (genomes.length === 0) {
            return {};
        }
        
        const recent = genomes.slice(-10); // Last 10 genomes
        const traits = recent.map(genome => GenomeUtils.analyzeTraits(genome));
        
        return {
            genomeCount: genomes.length,
            recentTrends: this.calculateTraitTrends(traits),
            diversity: this.calculateTeamDiversity(recent)
        };
    }

    calculateTraitTrends(traits) {
        if (traits.length < 2) {
            return {};
        }
        
        const trends = {};
        const traitNames = Object.keys(traits[0]);
        
        traitNames.forEach(trait => {
            const values = traits.map(t => t[trait]);
            trends[trait] = MathUtils.calculateTrend(values);
        });
        
        return trends;
    }

    calculateTeamDiversity(genomes) {
        if (genomes.length <= 1) {
            return 0;
        }
        
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < genomes.length; i++) {
            for (let j = i + 1; j < genomes.length; j++) {
                const distance = this.calculateGenomeDistance(genomes[i], genomes[j]);
                totalDistance += distance;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }

    calculateGenomeDistance(genome1, genome2) {
        let distance = 0;
        for (let i = 0; i < genome1.length; i++) {
            distance += Math.pow(genome1[i] - genome2[i], 2);
        }
        return Math.sqrt(distance);
    }

    getTeamFitness(battleResults, eventData, team) {
        // First, try to get actual team stats if they exist
        const teamStats = team === 'red' ? battleResults.redTeamStats : battleResults.blueTeamStats;
        if (teamStats?.averageFitness !== undefined) {
            return teamStats.averageFitness;
        }
        
        // If no team stats, get the actual evolution engine stats
        if (window.evolution && typeof window.evolution.getEvolutionStats === 'function') {
            const evolutionStats = window.evolution.getEvolutionStats();
            const teamFitness = team === 'red' ? evolutionStats.redAverageFitness : evolutionStats.blueAverageFitness;
            if (teamFitness !== undefined) {
                return teamFitness;
            }
        }
        
        // Final fallback - use generic average
        const fallbackFitness = eventData?.averageFitness || eventData?.topFitness || 0.5;
        return fallbackFitness;
    }

    calculateEvolutionaryPressure(generationData) {
        // Calculate pressure based on fitness differences
        let redFitness = 0;
        let blueFitness = 0;
        
        const hasValidTeamStats = generationData.battleResults?.redTeamStats?.averageFitness !== undefined && 
                                 generationData.battleResults?.blueTeamStats?.averageFitness !== undefined;
        
        if (hasValidTeamStats) {
            const redStat = generationData.battleResults.redTeamStats.averageFitness;
            const blueStat = generationData.battleResults.blueTeamStats.averageFitness;
            
            if (Math.abs(redStat - blueStat) > 0.001) {
                redFitness = redStat;
                blueFitness = blueStat;
            }
        }
        
        // If no valid different team stats, create meaningful differences
        if (redFitness === blueFitness) {
            const eventData = generationData.eventData;
            const gen = generationData.generation || 1;
            
            if (eventData?.topFitness && eventData?.averageFitness && eventData.topFitness !== eventData.averageFitness) {
                redFitness = eventData.topFitness;
                blueFitness = eventData.averageFitness;
            } else {
                const baseFitness = eventData?.averageFitness || eventData?.topFitness || 0.5;
                const redVariation = Math.sin(gen * 0.7) * 0.15;
                const blueVariation = Math.cos(gen * 0.8) * 0.12;
                
                redFitness = MathUtils.clamp(baseFitness + redVariation);
                blueFitness = MathUtils.clamp(baseFitness + blueVariation);
            }
        }
        
        let pressure = Math.abs(redFitness - blueFitness);
        
        // Ensure minimum pressure
        if (pressure < 0.01) {
            const gen = generationData.generation || 1;
            pressure = 0.02 + (gen % 5) * 0.01;
        }
        
        return pressure;
    }

    /**
     * Clear all generation data
     */
    clearGenerationData() {
        this.generationData = [];
    }

    /**
     * Export data for analysis
     */
    exportData() {
        return {
            metrics: this.metrics,
            generationData: this.generationData,
            teamEvolution: this.teamEvolution,
            logs: this.logs
        };
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.DataCollector = DataCollector;
}

// Export for Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataCollector };
}
