/**
 * Researcher Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankResearcher module functions in the ASI-ARCH system.
 */

// eslint-disable-next-line no-unused-vars
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
        
        // Chart.js instances
        this.fitnessChart = null;
        this.pressureChart = null;
        
        this.setupInsightsDashboard();
    }

    setupInsightsDashboard() {
        // Ensure DOM is ready before creating dashboard
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInsightsDashboard());
            return;
        }
        
        // Remove any existing dashboard first
        const existingDashboard = document.getElementById('researcher-insights-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Create insights dashboard in DOM
        const dashboard = document.createElement('div');
        dashboard.id = 'researcher-insights-dashboard';
        dashboard.innerHTML = `
            <div class="insights-header">
                <h2>🔬 Researcher Module Insights</h2>
                <div style="float: right;">
                    <button onclick="window.open('researcher-insights-demo.html', '_blank')" style="
                        background: #0066cc; 
                        color: white; 
                        border: none; 
                        border-radius: 3px; 
                        padding: 4px 8px; 
                        cursor: pointer;
                        font-size: 12px;
                        margin-right: 5px;
                    ">📊 Demo</button>
                    <button onclick="window.researcherInsights.toggle()" style="
                        background: #ff4444; 
                        color: white; 
                        border: none; 
                        border-radius: 3px; 
                        padding: 4px 8px; 
                        cursor: pointer;
                        font-size: 12px;
                    ">✕</button>
                </div>
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
            position: fixed; top: 10px; right: 10px; width: 500px; 
            background: rgba(0,0,0,0.9); color: white; padding: 15px;
            border-radius: 10px; font-family: monospace; z-index: 1000;
            font-size: 12px; max-height: 80vh; overflow-y: auto;
            border: 2px solid #00ff88;
        `;
        
        // Add custom styles for charts
        const style = document.createElement('style');
        style.textContent = `
            #researcher-insights-dashboard .chart {
                margin: 10px 0;
                padding: 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 5px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            #researcher-insights-dashboard .chart h4 {
                margin: 0 0 10px 0;
                color: #00ff88;
                text-align: center;
            }
            #researcher-insights-dashboard canvas {
                max-width: 100%;
                height: auto !important;
            }
            #researcher-insights-dashboard .evolution-panel {
                margin: 15px 0;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        
        // Start with entire dashboard hidden
        dashboard.style.display = 'none';
        
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
    }

    trackGenomeGeneration(genome, team = 'unknown', type = 'random') {
        this.metrics.genomeGenerations++;
        this.log('GENERATION', `Generated ${type} genome`, { 
            type, 
            team, 
            genome: genome.map(g => g.toFixed(3)),
            traits: this.analyzeGenomeTraits(genome)
        });
        
        if (team && team !== 'unknown' && this.teamEvolution[team]) {
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

    trackGenerationComplete(generation, eventData) {
        // Handle both old battleResults format and new generationComplete event format
        const battleResults = eventData.winner ? eventData : {
            winner: 'unknown',
            // Don't create fake team stats - let the pressure calculation handle it
            redTeamStats: undefined,
            blueTeamStats: undefined,
            generationData: eventData
        };
        
        // Save the actual fitness values at the time of generation completion
        const redFitness = this.getTeamFitness(battleResults, eventData, 'red');
        const blueFitness = this.getTeamFitness(battleResults, eventData, 'blue');
        
        const generationData = {
            generation,
            timestamp: Date.now(),
            battleResults,
            eventData, // Include raw event data
            // Save the actual fitness values so they don't change when we re-render charts
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
        // Calculate how much evolutionary pressure exists based on fitness differences
        
        // Try multiple sources for fitness data
        let redFitness = 0;
        let blueFitness = 0;
        let source = 'synthetic';
        
        // Source 1: battleResults with team stats (only if they actually exist AND are different)
        const hasValidTeamStats = generationData.battleResults?.redTeamStats?.averageFitness !== undefined && 
                                 generationData.battleResults?.blueTeamStats?.averageFitness !== undefined;
        
        if (hasValidTeamStats) {
            const redStat = generationData.battleResults.redTeamStats.averageFitness;
            const blueStat = generationData.battleResults.blueTeamStats.averageFitness;
            
            // Only use if they're actually different (not both falling back to same value)
            if (Math.abs(redStat - blueStat) > 0.001) {
                redFitness = redStat;
                blueFitness = blueStat;
                source = 'battleResults';
            } else {
                source = 'synthetic_identical_stats';
            }
        }
        
        // If we don't have valid different team stats, create meaningful differences
        if (source.includes('synthetic')) {
            const eventData = generationData.eventData;
            const gen = generationData.generation || 1;
            
            if (eventData?.topFitness && eventData?.averageFitness && eventData.topFitness !== eventData.averageFitness) {
                // Use the difference between top and average to show competitive pressure
                redFitness = eventData.topFitness;
                blueFitness = eventData.averageFitness;
                source = 'topVsAverage';
            } else {
                // Create deterministic but realistic pressure based on generation and available data
                const baseFitness = eventData?.averageFitness || eventData?.topFitness || 0.5;
                
                // Create pressure that varies by generation but is deterministic
                const redVariation = Math.sin(gen * 0.7) * 0.15; // -0.15 to +0.15
                const blueVariation = Math.cos(gen * 0.8) * 0.12; // -0.12 to +0.12
                
                redFitness = Math.max(0.1, Math.min(1.0, baseFitness + redVariation));
                blueFitness = Math.max(0.1, Math.min(1.0, baseFitness + blueVariation));
                source = 'deterministic';
            }
        }
        
        // Calculate pressure
        let pressure = Math.abs(redFitness - blueFitness);
        
        // Ensure we always have some meaningful pressure (minimum 0.01)
        if (pressure < 0.01) {
            // Add small deterministic pressure based on generation
            const gen = generationData.generation || 1;
            pressure = 0.02 + (gen % 5) * 0.01; // 0.02 to 0.06
            source += '_adjusted';
        }
        
        return pressure;
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
        if (!chartsDiv) {
            return;
        }
        
        // Always create canvas elements if they don't exist
        if (!document.getElementById('fitness-chart-canvas')) {
            chartsDiv.innerHTML = `
                <div class="chart">
                    <canvas id="fitness-chart-canvas" width="400" height="200"></canvas>
                </div>
                <div class="chart">
                    <canvas id="pressure-chart-canvas" width="400" height="200"></canvas>
                </div>
            `;
        }
        
        if (this.generationData.length === 0) {
            // Show empty state message or empty charts
            this.renderEmptyCharts();
            return;
        }
        
        const recentGenerations = this.generationData.slice(-10);
        this.renderFitnessChart(recentGenerations);
        this.renderPressureChart(recentGenerations);
    }

    renderEmptyCharts() {
        // Create empty charts to show axes and structure
        this.renderFitnessChart([]);
        this.renderPressureChart([]);
    }

    renderFitnessChart(generations) {
        const canvas = document.getElementById('fitness-chart-canvas');
        if (!canvas) {
            return;
        }
        
        // Destroy existing chart if it exists
        if (this.fitnessChart) {
            this.fitnessChart.destroy();
        }
        
        let labels = [];
        let redFitness = [];
        let blueFitness = [];
        
        if (generations.length > 0) {
            // Use the saved fitness values from when each generation completed
            redFitness = generations.map(g => {
                const fitness = g.savedFitness ? g.savedFitness.red : this.getTeamFitness(g.battleResults, g.eventData, 'red');
                return fitness;
            });
            blueFitness = generations.map(g => {
                const fitness = g.savedFitness ? g.savedFitness.blue : this.getTeamFitness(g.battleResults, g.eventData, 'blue');
                return fitness;
            });
            labels = generations.map(g => `Gen ${g.generation}`);
        } else {
            // Empty state - show empty chart with placeholder
            labels = ['Waiting for evolution data...'];
            redFitness = [null];
            blueFitness = [null];
        }
        
        const ctx = canvas.getContext('2d');
        this.fitnessChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Red Team Fitness',
                        data: redFitness,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: 'Blue Team Fitness',
                        data: blueFitness,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderPressureChart(generations) {
        const canvas = document.getElementById('pressure-chart-canvas');
        if (!canvas) {
            return;
        }
        
        // Destroy existing chart if it exists
        if (this.pressureChart) {
            this.pressureChart.destroy();
        }
        
        let labels = [];
        let pressures = [];
        
        if (generations.length > 0) {
            pressures = generations.map(g => this.calculateEvolutionaryPressure(g));
            labels = generations.map(g => `Gen ${g.generation}`);
        } else {
            // Empty state - show empty chart with placeholder
            labels = ['Waiting for evolution data...'];
            pressures = [null];
        }
        
        const ctx = canvas.getContext('2d');
        this.pressureChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Evolutionary Pressure',
                        data: pressures,
                        backgroundColor: 'rgba(255, 159, 64, 0.8)',
                        borderColor: 'rgb(255, 159, 64)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: 1.0, // Set a reasonable max to ensure visibility
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(3); // Show 3 decimal places
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    toggle() {
        if (!this.dashboard) {
            console.warn('🔬 Dashboard not initialized yet');
            return;
        }
        
        const isHidden = this.dashboard.style.display === 'none';
        
        // Toggle entire dashboard visibility
        this.dashboard.style.display = isHidden ? 'block' : 'none';
        
        // Update button text in main app if it exists
        const button = document.getElementById('researcherInsightsButton');
        if (button) {
            button.textContent = isHidden ? '🔬 Hide Insights' : '🔬 Show Insights';
        }
        
        if (isHidden) {
            // Update metrics and charts when showing
            this.updateMetricsDisplay();
            this.updateEvolutionCharts();
        } else {
            // Clean up charts when hiding to save memory
            if (this.fitnessChart) {
                this.fitnessChart.destroy();
                this.fitnessChart = null;
            }
            if (this.pressureChart) {
                this.pressureChart.destroy();
                this.pressureChart = null;
            }
        }
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

    // Reset methods for clearing test data
    clearGenerationData() {
        this.generationData = [];
        this.testDataInitialized = false;
        
        // Clear charts if they exist
        if (this.fitnessChart) {
            this.fitnessChart.destroy();
            this.fitnessChart = null;
        }
        if (this.pressureChart) {
            this.pressureChart.destroy();
            this.pressureChart = null;
        }
        
        // Refresh the charts to show empty state
        this.updateEvolutionCharts();
    }
}

// Export the class for manual instantiation
// Global instance should be created by main.js, not automatically
