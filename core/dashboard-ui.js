/**
 * Dashboard UI Module
 * Handles all UI rendering and interaction for the insights dashboard
 */
class DashboardUI {
    constructor(dataCollector, eventManager) {
        this.dataCollector = dataCollector;
        this.eventManager = eventManager;
        this.chartManager = new ChartManager();
        this.dashboard = null;
        this.isVisible = false;
        this.setupDashboard();
        this.bindEvents();
    }
    /**
     * Set up the main dashboard structure
     */
    setupDashboard() {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDashboard());
            return;
        }
        // Remove any existing dashboard
        DOMUtils.removeElement('#researcher-insights-dashboard');
        this.injectStyles();
        this.createDashboardHTML();
        this.updateDisplay();
    }
    /**
     * Inject CSS styles for the dashboard
     */
    injectStyles() {
        const css = `
            .researcher-insights-dashboard {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 500px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                font-family: monospace;
                z-index: 1000;
                font-size: 12px;
                max-height: 80vh;
                overflow-y: auto;
                border: 2px solid #00ff88;
                display: none;
            }
            .insights-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 1px solid #00ff88;
                padding-bottom: 10px;
            }
            .insights-content {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .metrics-panel, .evolution-panel, .logs-panel {
                background: rgba(255,255,255,0.05);
                border-radius: 5px;
                padding: 10px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .chart-container {
                margin: 10px 0;
                padding: 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 5px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .chart-container h4 {
                margin: 0 0 10px 0;
                color: #00ff88;
                text-align: center;
            }
            .chart-container canvas {
                max-width: 100%;
                height: auto !important;
            }
            .metric-item {
                margin: 5px 0;
                padding: 5px;
                background: rgba(0,255,136,0.1);
                border-radius: 3px;
            }
            .log-entry {
                margin: 5px 0;
                padding: 5px;
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
                font-size: 10px;
            }
            .control-button {
                background: #0066cc;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 4px 8px;
                cursor: pointer;
                font-size: 12px;
                margin-left: 5px;
            }
            .control-button:hover {
                background: #0080ff;
            }
            .control-button.close {
                background: #ff4444;
            }
            .control-button.close:hover {
                background: #ff6666;
            }
            .logs-container {
                height: 300px;
                overflow-y: scroll;
                background: rgba(0,0,0,0.3);
                padding: 10px;
                border-radius: 5px;
            }
        `;
        DOMUtils.injectCSS(css, 'researcher-insights-styles');
    }
    /**
     * Create the dashboard HTML structure
     */
    createDashboardHTML() {
        const dashboard = DOMUtils.createElement('div', {
            id: 'researcher-insights-dashboard',
            class: 'researcher-insights-dashboard'
        });
        dashboard.innerHTML = `
            <div class="insights-header">
                <h2>🔬 Researcher Module Insights</h2>
                <div>
                    <button class="control-button" onclick="window.open('researcher-insights-demo.html', '_blank')">
                        📊 Demo
                    </button>
                    <button class="control-button close" onclick="window.dashboardUI?.toggle()">
                        ✕
                    </button>
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
                    <div class="logs-container" id="researcher-logs"></div>
                </div>
            </div>
        `;
        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        // Make globally accessible for button clicks
        window.dashboardUI = this;
    }
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for data updates
        this.eventManager.on('dataUpdate', () => {
            this.updateDisplay();
        });
        this.eventManager.on('generationComplete', () => {
            this.updateEvolutionCharts();
        });
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
    }
    /**
     * Update the metrics display
     */
    updateMetricsDisplay() {
        const metricsDiv = DOMUtils.getElementById('live-metrics');
        if (!metricsDiv) {
            return;
        }
        const metrics = this.dataCollector.metrics;
        metricsDiv.innerHTML = `
            <div class="metric-item">🧬 Genomes Generated: ${metrics.genomeGenerations} <span title="Total number of unique tank AI genomes created through evolution" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div class="metric-item">🔀 Mutations: ${metrics.mutations} <span title="Number of random genetic modifications applied to tank behaviors" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div class="metric-item">🔗 Crossovers: ${metrics.crossovers} <span title="Number of breeding operations combining traits from two parent tanks" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div class="metric-item">🏆 Tournaments: ${metrics.tournaments} <span title="Number of competitive selection events to choose breeding candidates" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div class="metric-item">🧪 Experiments: ${metrics.experiments} <span title="Number of controlled test battles run to evaluate tank performance" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div class="metric-item">⚔️ Red Queen Adaptations: ${metrics.redQueenAdaptations} <span title="Co-evolutionary adaptations where both teams evolve in response to each other" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            <div style="border-top: 1px solid #00ff88; margin-top: 10px; padding-top: 10px;">
                <div style="color: #00ff88; font-weight: bold; margin-bottom: 5px;">📊 Advanced Scenarios <span title="Complex battle scenarios that test tank adaptability beyond standard combat" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
                <div class="metric-item">🎯 Current Scenario: ${metrics.currentScenario || 'None'} <span title="The active battle scenario defining terrain, objectives, and special conditions" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
                <div class="metric-item">📋 Scenario Contexts: ${metrics.scenarioContexts} <span title="Number of different scenario configurations tested in this session" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
                <div class="metric-item">🎲 Total Seeds Used: ${metrics.totalSeeds} <span title="Number of random seed values used to ensure reproducible scenario generation" style="color: #007acc; cursor: help; font-weight: bold;">?</span></div>
            </div>
        `;
    }
    /**
     * Update the logs display
     */
    updateLogsDisplay() {
        const logsDiv = DOMUtils.getElementById('researcher-logs');
        if (!logsDiv) {
            return;
        }
        const recentLogs = this.dataCollector.logs.slice(-20);
        logsDiv.innerHTML = recentLogs.map(log => {
            // Phase 2: Add color coding for scenario context logs
            const categoryColors = {
                'SCENARIO_CONTEXT': '#00ff88',
                'GENERATION': '#ffff00',
                'MUTATION': '#ff6600',
                'CROSSOVER': '#00ffff',
                'TOURNAMENT': '#ff00ff',
                'EXPERIMENT': '#ffffff'
            };
            const color = categoryColors[log.category] || '#cccccc';
            const borderColor = log.category === 'SCENARIO_CONTEXT' ? '#00ff88' : 'rgba(255,255,255,0.2)';
            return `
            <div class="log-entry" style="border-left: 3px solid ${borderColor};">
                <strong style="color: ${color};">[${log.timestamp}] ${log.category}:</strong> 
                <span style="color: #ffffff;">${log.message}</span>
                ${Object.keys(log.data).length > 0 ? 
                    `<pre style="font-size: 10px; margin: 5px 0; color: #aaaaaa;">${JSON.stringify(log.data, null, 2)}</pre>` : 
                    ''}
            </div>
        `}).join('');
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
    /**
     * Update evolution charts
     */
    updateEvolutionCharts() {
        const chartsDiv = DOMUtils.getElementById('evolution-charts');
        if (!chartsDiv) {
            return;
        }
        // Create canvas elements if they don't exist
        if (!DOMUtils.getElementById('fitness-chart-canvas')) {
            chartsDiv.innerHTML = `
                <div class="chart-container">
                    <h4>Team Fitness Evolution</h4>
                    <canvas id="fitness-chart-canvas" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Evolutionary Pressure</h4>
                    <canvas id="pressure-chart-canvas" width="400" height="200"></canvas>
                </div>
            `;
        }
        const generationData = this.dataCollector.generationData;
        if (generationData.length === 0) {
            this.renderEmptyCharts();
            return;
        }
        const maxPoints = window.GAME_CONFIG?.UI?.CHART_MAX_POINTS || 10;
        const recentGenerations = generationData.slice(-maxPoints);
        this.renderFitnessChart(recentGenerations);
        this.renderPressureChart(recentGenerations);
    }
    /**
     * Render fitness evolution chart
     */
    renderFitnessChart(generations) {
        let labels = [];
        let redFitness = [];
        let blueFitness = [];
        if (generations.length > 0) {
            redFitness = generations.map(g => {
                const fitness = g.savedFitness ? g.savedFitness.red : 
                              this.dataCollector.getTeamFitness(g.battleResults, g.eventData, 'red');
                return fitness;
            });
            blueFitness = generations.map(g => {
                const fitness = g.savedFitness ? g.savedFitness.blue : 
                               this.dataCollector.getTeamFitness(g.battleResults, g.eventData, 'blue');
                return fitness;
            });
            labels = generations.map(g => `Gen ${g.generation}`);
        } else {
            labels = ['Waiting for evolution data...'];
            redFitness = [null];
            blueFitness = [null];
        }
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Red Team Fitness',
                        data: redFitness,
                        borderColor: window.TEAM_COLORS?.red?.primary || 'rgb(255, 99, 132)',
                        backgroundColor: window.TEAM_COLORS?.red?.background || 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: 'Blue Team Fitness',
                        data: blueFitness,
                        borderColor: window.TEAM_COLORS?.blue?.primary || 'rgb(54, 162, 235)',
                        backgroundColor: window.TEAM_COLORS?.blue?.background || 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        };
        this.chartManager.createChart('fitness-chart-canvas', config);
    }
    /**
     * Render evolutionary pressure chart
     */
    renderPressureChart(generations) {
        let labels = [];
        let pressures = [];
        if (generations.length > 0) {
            pressures = generations.map(g => this.dataCollector.calculateEvolutionaryPressure(g));
            labels = generations.map(g => `Gen ${g.generation}`);
        } else {
            labels = ['Waiting for evolution data...'];
            pressures = [null];
        }
        const config = {
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
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: 1.0,
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(3);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        };
        this.chartManager.createChart('pressure-chart-canvas', config);
    }
    /**
     * Render empty charts as placeholders
     */
    renderEmptyCharts() {
        this.renderFitnessChart([]);
        this.renderPressureChart([]);
    }
    /**
     * Update all display components
     */
    updateDisplay() {
        this.updateMetricsDisplay();
        this.updateLogsDisplay();
    }
    /**
     * Toggle dashboard visibility
     */
    toggle() {
        if (!this.dashboard) {
            return;
        }
        this.isVisible = !this.isVisible;
        this.dashboard.style.display = this.isVisible ? 'block' : 'none';
        // Update button text in main app if it exists
        const button = DOMUtils.getElementById('researcherInsightsButton');
        if (button) {
            button.textContent = this.isVisible ? '🔬 Hide Researcher' : '🔬 Researcher Insights';
        }
        if (this.isVisible) {
            // Update everything when showing
            this.updateDisplay();
            this.updateEvolutionCharts();
        } else {
            // Clean up charts when hiding to save memory
            this.chartManager.destroyAll();
        }
    }
    /**
     * Show the dashboard
     */
    show() {
        if (!this.isVisible) {
            this.toggle();
        }
    }
    /**
     * Hide the dashboard
     */
    hide() {
        if (this.isVisible) {
            this.toggle();
        }
    }
    /**
     * Export data methods
     */
    exportLogs() {
        const data = this.dataCollector.exportData();
        const dataStr = JSON.stringify(data.logs, null, 2);
        this.downloadData(dataStr, `researcher-logs-${Date.now()}.json`);
    }
    exportMetrics() {
        const data = this.dataCollector.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        this.downloadData(dataStr, `researcher-metrics-${Date.now()}.json`);
    }
    /**
     * Helper to download data as file
     */
    downloadData(dataStr, filename) {
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        // Clean up
        URL.revokeObjectURL(url);
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.chartManager.destroyAll();
        this.eventManager.clear();
        if (this.dashboard) {
            DOMUtils.removeElement(this.dashboard);
            this.dashboard = null;
        }
        // Remove global reference
        if (window.dashboardUI === this) {
            delete window.dashboardUI;
        }
    }
}
// Export to global scope
if (typeof window !== 'undefined') {
    window.DashboardUI = DashboardUI;
}
// Export for Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardUI };
}
