/**
 * Researcher Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankResearcher module functions in the ASI-ARCH system.
 */

class ResearcherInsights {
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
        
        this.setupInsightsDashboard();
    }

    setupInsightsDashboard() {
        // Create insights dashboard in DOM
        const dashboard = document.createElement('div');
        dashboard.id = 'researcher-insights-dashboard';
        dashboard.innerHTML = `
            <div class="insights-header">
                <h2>🔬 Researcher Module Insights</h2>
                <button id="toggle-insights" onclick="researcherInsights.toggle()">Toggle Dashboard</button>
            </div>
            <div class="insights-content">
                <div class="metrics-panel">
                    <h3>📊 Real-time Metrics</h3>
                    <div id="live-metrics"></div>
                </div>
                <div class="evolution-panel">
                    <h3>🧬 Evolution Tracking</h3>
                    <div id="evolution-charts"></div>
                </div>
                <div class="logs-panel">
                    <h3>📝 Detailed Logs</h3>
                    <div id="researcher-logs" style="height: 300px; overflow-y: scroll;"></div>
                </div>
            </div>
        `;
        
        dashboard.style.cssText = `
            position: fixed; top: 10px; right: 10px; width: 400px; 
            background: rgba(0,0,0,0.9); color: white; padding: 15px;
            border-radius: 10px; font-family: monospace; z-index: 1000;
            font-size: 12px; max-height: 80vh; overflow-y: auto;
        `;
        
        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        this.updateMetricsDisplay();
    }

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
        if (this.logs.length > 100) {
            this.logs.shift();
        }
        
        this.updateLogsDisplay();
        console.log(`[${timestamp}] RESEARCHER ${category}: ${message}`, data);
    }

    trackGenomeGeneration(type, genome, team = null) {
        this.metrics.genomeGenerations++;
        this.log('GENERATION', `Generated ${type} genome`, { 
            type, 
            team, 
            genome: genome.map(g => g.toFixed(3)),
            traits: this.analyzeGenomeTraits(genome)
        });
        
        if (team) {
            this.teamEvolution[team].genomes.push(genome);
        }
        
        this.updateMetricsDisplay();
    }

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
        
        this.updateMetricsDisplay();
    }

    trackCrossover(parent1, parent2, child, team) {
        this.metrics.crossovers++;
        const inheritance = this.analyzeCrossoverInheritance(parent1, parent2, child);
        
        this.log('CROSSOVER', `Crossover produced new ${team} genome`, {
            team,
            parent1Traits: this.analyzeGenomeTraits(parent1),
            parent2Traits: this.analyzeGenomeTraits(parent2),
            childTraits: this.analyzeGenomeTraits(child),
            inheritance
        });
        
        this.updateMetricsDisplay();
    }

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
        
        this.updateMetricsDisplay();
    }

    trackExperiment(experiment, candidatePoolSize, historySize) {
        this.metrics.experiments++;
        
        const redTraits = this.analyzeTeamTraits(experiment.redGenomes);
        const blueTraits = this.analyzeTeamTraits(experiment.blueGenomes);
        
        this.log('EXPERIMENT', `New experiment proposed`, {
            redGenomes: experiment.redGenomes.length,
            blueGenomes: experiment.blueGenomes.length,
            candidatePoolSize,
            historySize,
            redTeamProfile: redTraits,
            blueTeamProfile: blueTraits,
            strategicDifferences: this.compareTeamStrategies(redTraits, blueTraits)
        });
        
        this.updateMetricsDisplay();
    }

    trackRedQueenAdaptation(team, opponentStrategies, adaptations) {
        this.metrics.redQueenAdaptations++;
        
        this.log('RED_QUEEN', `${team} team adapted to opponent strategies`, {
            team,
            opponentStrategies,
            adaptations,
            adaptationStrength: Object.values(adaptations).reduce((sum, val) => sum + Math.abs(val), 0)
        });
        
        this.updateMetricsDisplay();
    }

    trackGenerationComplete(generation, battleResults) {
        const generationData = {
            generation,
            timestamp: Date.now(),
            battleResults,
            teamStats: {
                red: this.calculateTeamEvolutionStats('red'),
                blue: this.calculateTeamEvolutionStats('blue')
            }
        };
        
        this.generationData.push(generationData);
        
        this.log('GENERATION_COMPLETE', `Generation ${generation} evolution complete`, {
            generation,
            winner: battleResults.winner,
            redFitness: battleResults.redTeamStats?.averageFitness || 0,
            blueFitness: battleResults.blueTeamStats?.averageFitness || 0,
            evolutionaryPressure: this.calculateEvolutionaryPressure(generationData)
        });
        
        this.updateEvolutionCharts();
    }

    // Analysis Helper Methods
    analyzeGenomeTraits(genome) {
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];
        
        const traits = {};
        genome.forEach((value, index) => {
            if (traitNames[index]) {
                traits[traitNames[index]] = parseFloat(value.toFixed(3));
            }
        });
        
        // Calculate derived characteristics
        traits.combatEffectiveness = (traits.aggression + traits.accuracy) / 2;
        traits.tacticalSophistication = (traits.cooperation + traits.formation + traits.flanking) / 3;
        traits.survivalInstinct = (traits.defense + (1 - traits.riskTaking)) / 2;
        
        return traits;
    }

    analyzeTeamTraits(genomes) {
        const teamTraits = {};
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];
        
        traitNames.forEach(trait => {
            const values = genomes.map(genome => {
                const traits = this.analyzeGenomeTraits(genome);
                return traits[trait];
            });
            
            teamTraits[trait] = {
                avg: values.reduce((sum, val) => sum + val, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                diversity: this.calculateDiversity(values)
            };
        });
        
        return teamTraits;
    }

    calculateGenomeChanges(original, mutated) {
        const changes = {
            changedIndices: [],
            changes: [],
            affectedTraits: []
        };
        
        const traitNames = ['aggression', 'speed', 'accuracy', 'defense', 'cooperation', 
                          'formation', 'flanking', 'ambush', 'riskTaking'];
        
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

    calculateDiversity(values) {
        if (values.length <= 1) {
            return 0;
        }
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    calculateTeamEvolutionStats(team) {
        const genomes = this.teamEvolution[team].genomes;
        if (genomes.length === 0) {
            return {};
        }
        
        const recent = genomes.slice(-10); // Last 10 genomes
        const traits = recent.map(genome => this.analyzeGenomeTraits(genome));
        
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
            const firstHalf = values.slice(0, Math.floor(values.length / 2));
            const secondHalf = values.slice(Math.floor(values.length / 2));
            
            const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
            
            trends[trait] = secondAvg - firstAvg;
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

    calculateEvolutionaryPressure(generationData) {
        // Calculate how much evolutionary pressure exists based on fitness differences
        const redFitness = generationData.battleResults.redTeamStats?.averageFitness || 0;
        const blueFitness = generationData.battleResults.blueTeamStats?.averageFitness || 0;
        
        return Math.abs(redFitness - blueFitness);
    }

    // Display Update Methods
    updateMetricsDisplay() {
        const metricsDiv = document.getElementById('live-metrics');
        if (!metricsDiv) {
            return;
        }
        
        metricsDiv.innerHTML = `
            <div class="metric">🧬 Genomes Generated: ${this.metrics.genomeGenerations}</div>
            <div class="metric">🔀 Mutations: ${this.metrics.mutations}</div>
            <div class="metric">🔗 Crossovers: ${this.metrics.crossovers}</div>
            <div class="metric">🏆 Tournaments: ${this.metrics.tournaments}</div>
            <div class="metric">🧪 Experiments: ${this.metrics.experiments}</div>
            <div class="metric">⚔️ Red Queen Adaptations: ${this.metrics.redQueenAdaptations}</div>
        `;
    }

    updateLogsDisplay() {
        const logsDiv = document.getElementById('researcher-logs');
        if (!logsDiv) {
            return;
        }
        
        const recentLogs = this.logs.slice(-20); // Show last 20 logs
        logsDiv.innerHTML = recentLogs.map(log => `
            <div class="log-entry" style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1);">
                <strong>[${log.timestamp}] ${log.category}:</strong> ${log.message}
                ${Object.keys(log.data).length > 0 ? 
                    `<pre style="font-size: 10px; margin: 5px 0;">${JSON.stringify(log.data, null, 2)}</pre>` : 
                    ''}
            </div>
        `).join('');
        
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }

    updateEvolutionCharts() {
        const chartsDiv = document.getElementById('evolution-charts');
        if (!chartsDiv || this.generationData.length === 0) {
            return;
        }
        
        const recentGenerations = this.generationData.slice(-10);
        
        chartsDiv.innerHTML = `
            <div class="chart">
                <h4>🏆 Fitness Evolution</h4>
                ${this.renderFitnessChart(recentGenerations)}
            </div>
            <div class="chart">
                <h4>🔄 Evolutionary Pressure</h4>
                ${this.renderPressureChart(recentGenerations)}
            </div>
        `;
    }

    renderFitnessChart(generations) {
        if (generations.length === 0) {
            return '<div>No data yet</div>';
        }
        
        const redFitness = generations.map(g => g.battleResults.redTeamStats?.averageFitness || 0);
        const blueFitness = generations.map(g => g.battleResults.blueTeamStats?.averageFitness || 0);
        
        const maxFitness = Math.max(...redFitness, ...blueFitness);
        const minFitness = Math.min(...redFitness, ...blueFitness);
        const range = maxFitness - minFitness || 1;
        
        return generations.map((gen, i) => {
            const redHeight = ((redFitness[i] - minFitness) / range) * 50;
            const blueHeight = ((blueFitness[i] - minFitness) / range) * 50;
            
            return `
                <div style="display: inline-block; margin: 0 2px; text-align: center;">
                    <div style="width: 20px; background: red; height: ${redHeight}px; display: inline-block; vertical-align: bottom;"></div>
                    <div style="width: 20px; background: blue; height: ${blueHeight}px; display: inline-block; vertical-align: bottom;"></div>
                    <div style="font-size: 8px;">${gen.generation}</div>
                </div>
            `;
        }).join('');
    }

    renderPressureChart(generations) {
        if (generations.length === 0) {
            return '<div>No data yet</div>';
        }
        
        const pressures = generations.map(g => this.calculateEvolutionaryPressure(g));
        const maxPressure = Math.max(...pressures) || 1;
        
        return generations.map((gen, i) => {
            const height = (pressures[i] / maxPressure) * 50;
            
            return `
                <div style="display: inline-block; margin: 0 2px; text-align: center;">
                    <div style="width: 20px; background: orange; height: ${height}px; display: inline-block; vertical-align: bottom;"></div>
                    <div style="font-size: 8px;">${gen.generation}</div>
                </div>
            `;
        }).join('');
    }

    toggle() {
        const content = this.dashboard.querySelector('.insights-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }

    // Export data methods
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `researcher-logs-${Date.now()}.json`;
        link.click();
    }

    exportMetrics() {
        const data = {
            metrics: this.metrics,
            generationData: this.generationData,
            teamEvolution: this.teamEvolution
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `researcher-metrics-${Date.now()}.json`;
        link.click();
    }

    generateReport() {
        const report = {
            summary: {
                totalGenerations: this.generationData.length,
                totalMetrics: this.metrics,
                analysisTimestamp: new Date().toISOString()
            },
            evolutionaryTrends: this.analyzeEvolutionaryTrends(),
            teamComparison: this.compareTeamEvolution(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    analyzeEvolutionaryTrends() {
        if (this.generationData.length < 3) {
            return "Insufficient data for trend analysis";
        }
        
        const trends = {
            fitnessProgression: this.analyzeFitnessProgression(),
            diversityTrends: this.analyzeDiversityTrends(),
            tacticalEvolution: this.analyzeTacticalEvolution()
        };
        
        return trends;
    }

    compareTeamEvolution() {
        return {
            red: this.calculateTeamEvolutionStats('red'),
            blue: this.calculateTeamEvolutionStats('blue'),
            competitiveBalance: this.assessCompetitiveBalance()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Analyze mutation rate effectiveness
        if (this.metrics.mutations > 0 && this.generationData.length > 5) {
            const recentImprovement = this.calculateRecentImprovement();
            if (recentImprovement < 0.01) {
                recommendations.push("Consider increasing mutation rate to promote more exploration");
            }
        }
        
        // Analyze team balance
        const balance = this.assessCompetitiveBalance();
        if (Math.abs(balance) > 0.2) {
            recommendations.push(`${balance > 0 ? 'Red' : 'Blue'} team is dominating - consider rebalancing`);
        }
        
        // Analyze diversity
        const redDiversity = this.calculateTeamDiversity(this.teamEvolution.red.genomes.slice(-10));
        const blueDiversity = this.calculateTeamDiversity(this.teamEvolution.blue.genomes.slice(-10));
        
        if (redDiversity < 0.1 || blueDiversity < 0.1) {
            recommendations.push("Low genetic diversity detected - consider increasing mutation or introducing new blood");
        }
        
        return recommendations;
    }

    calculateRecentImprovement() {
        if (this.generationData.length < 5) {
            return 0;
        }
        
        const recent = this.generationData.slice(-5);
        const early = recent.slice(0, 2);
        const late = recent.slice(-2);
        
        const earlyAvg = early.reduce((sum, g) => {
            const redFit = g.battleResults.redTeamStats?.averageFitness || 0;
            const blueFit = g.battleResults.blueTeamStats?.averageFitness || 0;
            return sum + Math.max(redFit, blueFit);
        }, 0) / early.length;
        
        const lateAvg = late.reduce((sum, g) => {
            const redFit = g.battleResults.redTeamStats?.averageFitness || 0;
            const blueFit = g.battleResults.blueTeamStats?.averageFitness || 0;
            return sum + Math.max(redFit, blueFit);
        }, 0) / late.length;
        
        return lateAvg - earlyAvg;
    }

    assessCompetitiveBalance() {
        if (this.generationData.length === 0) {
            return 0;
        }
        
        const redWins = this.generationData.filter(g => g.battleResults.winner === 'red').length;
        const blueWins = this.generationData.filter(g => g.battleResults.winner === 'blue').length;
        const total = redWins + blueWins;
        
        if (total === 0) {
            return 0;
        }
        
        return (redWins - blueWins) / total;
    }

    analyzeFitnessProgression() {
        return "Fitness progression analysis not yet implemented";
    }

    analyzeDiversityTrends() {
        return "Diversity trends analysis not yet implemented";
    }

    analyzeTacticalEvolution() {
        return "Tactical evolution analysis not yet implemented";
    }
}

// Global instance
window.researcherInsights = new ResearcherInsights();
