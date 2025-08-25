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
        this.initializeEvolutionCharts();
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
                width: 550px;
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
            .metrics-panel, .logs-panel {
                background: rgba(255,255,255,0.05);
                border-radius: 5px;
                padding: 10px;
                border: 1px solid rgba(255,255,255,0.1);
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
            .evolution-tracking-panel {
                background: rgba(255,255,255,0.05);
                border-radius: 5px;
                padding: 15px;
                border: 1px solid rgba(255,255,255,0.1);
                margin-top: 15px;
            }
            .chart-container {
                background: rgba(0,0,0,0.3);
                border-radius: 5px;
                padding: 10px;
                margin: 10px 0;
                height: 200px;
                position: relative;
            }
            .chart-title {
                color: #00ff88;
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
                font-size: 14px;
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
                <div class="evolution-tracking-panel">
                    <h3>📈 Evolution Tracking</h3>
                    <div class="chart-container">
                        <div class="chart-title">Fitness Evolution</div>
                        <canvas id="fitness-evolution-chart"></canvas>
                    </div>
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
     * Update all display components
     */
    updateDisplay() {
        this.updateMetricsDisplay();
        this.updateLogsDisplay();
        this.updateEvolutionCharts();
    }

    /**
     * Initialize evolution tracking charts
     */
    initializeEvolutionCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, evolution charts disabled');
            return;
        }

        this.initializeFitnessChart();
    }

    /**
     * Initialize fitness evolution chart
     */
    initializeFitnessChart() {
        const canvas = DOMUtils.getElementById('fitness-evolution-chart');
        if (!canvas) {
            return;
        }

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Red Team Fitness',
                    data: [],
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Blue Team Fitness',
                    data: [],
                    borderColor: '#4444ff',
                    backgroundColor: 'rgba(68, 68, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        };

        this.chartManager.createChart('fitness-evolution-chart', config);
    }

    /**
     * Update fitness evolution chart
     */
    updateFitnessChart() {
        const chart = this.chartManager.getChart('fitness-evolution-chart');
        if (!chart) {
            return;
        }

        const data = this.dataCollector.exportData();
        const generationData = data.generationData.slice(-20); // Last 20 generations

        if (generationData.length === 0) {
            return;
        }

        const labels = generationData.map(g => `Gen ${g.generation}`);
        const redFitness = generationData.map(g => g.savedFitness?.red || 0.5);
        const blueFitness = generationData.map(g => g.savedFitness?.blue || 0.5);

        chart.data.labels = labels;
        chart.data.datasets[0].data = redFitness;
        chart.data.datasets[1].data = blueFitness;
        chart.update('none');
    }

    /**
     * Update evolution charts with current data
     */
    updateEvolutionCharts() {
        if (!this.isVisible || typeof Chart === 'undefined') {
            return;
        }

        this.updateFitnessChart();
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
            // Initialize charts if not already done
            this.initializeEvolutionCharts();
            // Update everything when showing
            this.updateDisplay();
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
