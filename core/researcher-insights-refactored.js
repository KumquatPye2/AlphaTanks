/**
 * Refactored Researcher Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankResearcher module functions in the ASI-ARCH system.
 * 
 * This is a clean, modular version that uses composition instead of
 * having everything in one large class.
 */

class ResearcherInsights {
    constructor() {
        // Initialize core components
        this.eventManager = new EventManager();
        this.dataCollector = new DataCollector();
        this.dashboardUI = new DashboardUI(this.dataCollector, this.eventManager);
        
        // Set up event listeners for automatic updates
        this.setupEventListeners();
        
        // Initialize with dashboard hidden
        this.dashboardUI.hide();
    }

    /**
     * Set up event listeners for data collection
     */
    setupEventListeners() {
        // Listen for window events and forward to data collector
        window.addEventListener('generationComplete', (event) => {
            this.trackGenerationComplete(event.detail.generation, event.detail);
            this.eventManager.emit('generationComplete', event.detail);
        });
        
        // Auto-update UI when data changes
        this.eventManager.on('dataUpdate', () => {
            this.dashboardUI.updateDisplay();
        });
    }

    /**
     * Track genome generation event
     */
    trackGenomeGeneration(genome, team = 'unknown', type = 'random') {
        this.dataCollector.trackGenomeGeneration(genome, team, type);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track mutation event
     */
    trackMutation(originalGenome, mutatedGenome, team) {
        this.dataCollector.trackMutation(originalGenome, mutatedGenome, team);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track crossover event
     */
    trackCrossover(parent1, parent2, child, team) {
        this.dataCollector.trackCrossover(parent1, parent2, child, team);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track tournament selection event
     */
    trackTournament(candidates, winner, tournamentSize) {
        this.dataCollector.trackTournament(candidates, winner, tournamentSize);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track experiment event
     */
    trackExperiment(redGenomes, blueGenomes, candidatePool, history) {
        this.dataCollector.trackExperiment(redGenomes, blueGenomes, candidatePool, history);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track Red Queen adaptation event
     */
    trackRedQueenAdaptation(team, opponentStrategies, adaptations) {
        this.dataCollector.trackRedQueenAdaptation(team, opponentStrategies, adaptations);
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Track generation completion
     */
    trackGenerationComplete(generation, eventData) {
        this.dataCollector.trackGenerationComplete(generation, eventData);
        this.eventManager.emit('dataUpdate');
        this.eventManager.emit('generationComplete', { generation, eventData });
    }

    /**
     * Phase 2: Track tactical scenario context for research reproducibility
     */
    trackScenarioContext(scenarioId, seed, researchContext) {
        // Use DataCollector's new tracking method
        this.dataCollector.trackScenarioContext(scenarioId, seed, researchContext);
        this.eventManager.emit('dataUpdate');
        
        // Log for research documentation
        console.log(`🔬 Research Context: ${scenarioId} (seed: ${seed}) - ${researchContext}`);
    }

    /**
     * Classify scenario type for research documentation
     */
    classifyScenarioType(scenarioId) {
        const typeMap = {
            'open_field': 'minimal_constraints',
            'urban_warfare': 'high_obstacle_density',
            'chokepoint_control': 'strategic_bottlenecks',
            'fortress_assault': 'defensive_positioning'
        };
        return typeMap[scenarioId] || 'unknown_environment';
    }

    /**
     * Toggle dashboard visibility
     */
    toggle() {
        this.dashboardUI.toggle();
    }

    /**
     * Show the dashboard
     */
    show() {
        this.dashboardUI.show();
    }

    /**
     * Hide the dashboard
     */
    hide() {
        this.dashboardUI.hide();
    }

    /**
     * Export logs to file
     */
    exportLogs() {
        this.dashboardUI.exportLogs();
    }

    /**
     * Export metrics to file
     */
    exportMetrics() {
        this.dashboardUI.exportMetrics();
    }

    /**
     * Generate comprehensive analysis report
     */
    generateReport() {
        const data = this.dataCollector.exportData();
        
        const report = {
            summary: {
                totalGenerations: data.generationData.length,
                totalMetrics: data.metrics,
                analysisTimestamp: new Date().toISOString()
            },
            evolutionaryTrends: this.analyzeEvolutionaryTrends(data),
            teamComparison: this.compareTeamEvolution(data),
            recommendations: this.generateRecommendations(data)
        };
        
        return report;
    }

    /**
     * Analyze evolutionary trends from data
     */
    analyzeEvolutionaryTrends(data) {
        if (data.generationData.length < 3) {
            return "Insufficient data for trend analysis";
        }
        
        const recentGenerations = data.generationData.slice(-10);
        const fitnessValues = recentGenerations.map(g => {
            const redFit = g.savedFitness?.red || 0.5;
            const blueFit = g.savedFitness?.blue || 0.5;
            return Math.max(redFit, blueFit);
        });
        
        return {
            fitnessProgression: {
                trend: MathUtils.calculateTrend(fitnessValues),
                variance: MathUtils.variance(fitnessValues),
                latest: fitnessValues[fitnessValues.length - 1]
            },
            diversityTrends: this.calculateDiversityTrends(data),
            competitivePressure: recentGenerations.map(g => 
                this.dataCollector.calculateEvolutionaryPressure(g)
            )
        };
    }

    /**
     * Calculate diversity trends
     */
    calculateDiversityTrends(data) {
        const redDiversity = data.teamEvolution.red.genomes.length > 0 ?
            this.dataCollector.calculateTeamDiversity(data.teamEvolution.red.genomes.slice(-10)) : 0;
        const blueDiversity = data.teamEvolution.blue.genomes.length > 0 ?
            this.dataCollector.calculateTeamDiversity(data.teamEvolution.blue.genomes.slice(-10)) : 0;
        
        return {
            red: redDiversity,
            blue: blueDiversity,
            difference: Math.abs(redDiversity - blueDiversity)
        };
    }

    /**
     * Compare team evolution
     */
    compareTeamEvolution(data) {
        return {
            red: this.dataCollector.calculateTeamEvolutionStats('red'),
            blue: this.dataCollector.calculateTeamEvolutionStats('blue'),
            competitiveBalance: this.assessCompetitiveBalance(data)
        };
    }

    /**
     * Assess competitive balance
     */
    assessCompetitiveBalance(data) {
        if (data.generationData.length === 0) {
            return 0;
        }
        
        const redWins = data.generationData.filter(g => g.battleResults.winner === 'red').length;
        const blueWins = data.generationData.filter(g => g.battleResults.winner === 'blue').length;
        const total = redWins + blueWins;
        
        if (total === 0) {
            return 0;
        }
        
        return (redWins - blueWins) / total;
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(data) {
        const recommendations = [];
        
        // Check mutation effectiveness
        if (data.metrics.mutations > 0 && data.generationData.length > 5) {
            const recentImprovement = this.calculateRecentImprovement(data);
            if (recentImprovement < 0.01) {
                recommendations.push("Consider increasing mutation rate to promote more exploration");
            }
        }
        
        // Check team balance
        const balance = this.assessCompetitiveBalance(data);
        if (Math.abs(balance) > 0.2) {
            recommendations.push(`${balance > 0 ? 'Red' : 'Blue'} team is dominating - consider rebalancing`);
        }
        
        // Check diversity
        const diversityTrends = this.calculateDiversityTrends(data);
        if (diversityTrends.red < 0.1 || diversityTrends.blue < 0.1) {
            recommendations.push("Low genetic diversity detected - consider increasing mutation or introducing new blood");
        }
        
        // Check experimental activity
        if (data.metrics.experiments < 10) {
            recommendations.push("Consider running more experiments to gather sufficient data");
        }
        
        return recommendations;
    }

    /**
     * Calculate recent improvement
     */
    calculateRecentImprovement(data) {
        if (data.generationData.length < 5) {
            return 0;
        }
        
        const recent = data.generationData.slice(-5);
        const early = recent.slice(0, 2);
        const late = recent.slice(-2);
        
        const earlyAvg = early.reduce((sum, g) => {
            const redFit = g.savedFitness?.red || 0;
            const blueFit = g.savedFitness?.blue || 0;
            return sum + Math.max(redFit, blueFit);
        }, 0) / early.length;
        
        const lateAvg = late.reduce((sum, g) => {
            const redFit = g.savedFitness?.red || 0;
            const blueFit = g.savedFitness?.blue || 0;
            return sum + Math.max(redFit, blueFit);
        }, 0) / late.length;
        
        return lateAvg - earlyAvg;
    }

    /**
     * Clear generation data (for testing)
     */
    clearGenerationData() {
        this.dataCollector.clearGenerationData();
        this.eventManager.emit('dataUpdate');
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return this.dataCollector.metrics;
    }

    /**
     * Get generation data
     */
    getGenerationData() {
        return this.dataCollector.generationData;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.dashboardUI.destroy();
        this.eventManager.clear();
        
        // Remove global reference
        if (window.researcherInsights === this) {
            delete window.researcherInsights;
        }
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ResearcherInsights = ResearcherInsights;
}

// Export for Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResearcherInsights };
}
