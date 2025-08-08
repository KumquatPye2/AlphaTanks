/**
 * Cognition Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankCognition (Military Tactics Knowledge) module functions in the ASI-ARCH system.
 */

class CognitionInsights {
    constructor() {
        this.logs = [];
        this.metrics = {
            tacticsApplied: 0,
            knowledgeSearches: 0,
            formationsUsed: 0,
            teamLearningEvents: 0,
            tacticalImprovements: 0,
            cognitiveAdaptations: 0
        };
        
        this.tacticsData = [];
        this.learningHistory = {
            red_tactics: [],
            blue_tactics: [],
            knowledge_searches: [],
            formations_applied: [],
            learning_events: []
        };
        
        // Chart.js instances
        this.tacticsChart = null;
        this.learningChart = null;
        this.formationChart = null;
        
        this.setupInsightsDashboard();
    }

    setupInsightsDashboard() {
        // Ensure DOM is ready before creating dashboard
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInsightsDashboard());
            return;
        }
        
        // Remove any existing dashboard first
        const existingDashboard = document.getElementById('cognition-insights-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Create insights dashboard in DOM
        const dashboard = document.createElement('div');
        dashboard.id = 'cognition-insights-dashboard';
        dashboard.innerHTML = `
            <div class="modal" id="cognitionInsightsModal" style="display: none;">
                <div class="modal-content" style="width: 90%; max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <span class="close" id="closeCognitionInsights">&times;</span>
                        <h2>🧠 Cognition Module Insights</h2>
                        <p>Military Tactics Knowledge and Adaptive Learning Analysis</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="insights-section">
                            <h3>📊 Cognitive Metrics</h3>
                            <div class="metrics-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                                <div><strong>Tactics Applied:</strong> <span id="cognition-tactics-applied">0</span></div>
                                <div><strong>Knowledge Searches:</strong> <span id="cognition-knowledge-searches">0</span></div>
                                <div><strong>Formations Used:</strong> <span id="cognition-formations-used">0</span></div>
                                <div><strong>Team Learning Events:</strong> <span id="cognition-team-learning">0</span></div>
                                <div><strong>Tactical Improvements:</strong> <span id="cognition-tactical-improvements">0</span></div>
                                <div><strong>Cognitive Adaptations:</strong> <span id="cognition-adaptations">0</span></div>
                            </div>
                        </div>
                        
                        <div class="insights-section">
                            <h3>🎯 Tactical Analysis</h3>
                            <div style="font-size: 11px; line-height: 1.4;">
                                <div><strong>Red Team Strategy:</strong> <span id="cognition-red-strategy">Analyzing...</span></div>
                                <div><strong>Blue Team Strategy:</strong> <span id="cognition-blue-strategy">Analyzing...</span></div>
                                <div><strong>Dominant Formation:</strong> <span id="cognition-dominant-formation">None</span></div>
                                <div><strong>Learning Rate:</strong> <span id="cognition-learning-rate">0%</span></div>
                                <div><strong>Adaptation Efficiency:</strong> <span id="cognition-adaptation-efficiency">0%</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="insights-section">
                            <h3>📈 Tactical Evolution</h3>
                            <div style="height: 150px;">
                                <canvas id="cognitionTacticsChart"></canvas>
                            </div>
                        </div>
                        
                        <div class="insights-section">
                            <h3>🧮 Learning Progress</h3>
                            <div style="height: 150px;">
                                <canvas id="cognitionLearningChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insights-section">
                        <h3>🏛️ Formation Usage</h3>
                        <div style="height: 200px;">
                            <canvas id="cognitionFormationChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="insights-section" style="margin-top: 20px;">
                        <h3>📋 Cognitive Event Log</h3>
                        <div id="cognitionLogContainer" style="height: 200px; overflow-y: auto; background: #111; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 11px;">
                            <!-- Log entries will be populated here -->
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="exportCognitionData" style="background: #00ff88; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                            💾 Export Cognition Data
                        </button>
                        <button id="resetCognitionData" style="background: #ff6600; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                            🔄 Reset Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        this.setupEventListeners();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeCognitionInsights');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide();
        }
        
        // Export button
        const exportBtn = document.getElementById('exportCognitionData');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportData();
        }
        
        // Reset button
        const resetBtn = document.getElementById('resetCognitionData');
        if (resetBtn) {
            resetBtn.onclick = () => this.reset();
        }
        
        // Modal click-outside-to-close
        const modal = document.getElementById('cognitionInsightsModal');
        if (modal) {
            modal.onclick = (event) => {
                if (event.target === modal) {
                    this.hide();
                }
            };
        }
    }

    initializeCharts() {
        // Initialize Chart.js charts
        const tacticsCtx = document.getElementById('cognitionTacticsChart')?.getContext('2d');
        const learningCtx = document.getElementById('cognitionLearningChart')?.getContext('2d');
        const formationCtx = document.getElementById('cognitionFormationChart')?.getContext('2d');
        
        if (tacticsCtx) {
            this.tacticsChart = new Chart(tacticsCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Red Team Tactics',
                        data: [],
                        borderColor: '#ff6666',
                        backgroundColor: 'rgba(255, 102, 102, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Blue Team Tactics',
                        data: [],
                        borderColor: '#6666ff',
                        backgroundColor: 'rgba(102, 102, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Tactical Applications',
                                color: '#ffffff'
                            },
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#ffffff', font: { size: 10 } }
                        }
                    }
                }
            });
        }
        
        if (learningCtx) {
            this.learningChart = new Chart(learningCtx, {
                type: 'bar',
                data: {
                    labels: ['Knowledge Searches', 'Learning Events', 'Adaptations'],
                    datasets: [{
                        label: 'Cognitive Activity',
                        data: [0, 0, 0],
                        backgroundColor: ['#ffaa00', '#00aaff', '#aa00ff'],
                        borderColor: ['#ff8800', '#0088cc', '#8800cc'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Event Count',
                                color: '#ffffff'
                            },
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#ffffff', font: { size: 10 } }
                        }
                    }
                }
            });
        }
        
        if (formationCtx) {
            this.formationChart = new Chart(formationCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Phalanx', 'Pincer', 'Blitzkrieg', 'Guerrilla'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
                        borderColor: '#333333',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: true
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { 
                                color: '#ffffff', 
                                font: { size: 10 },
                                padding: 10
                            }
                        }
                    }
                }
            });
        }
    }

    // === Tracking Methods ===

    trackTacticApplication(team, tactic, improvement) {
        const timestamp = new Date().toISOString();
        this.metrics.tacticsApplied++;
        this.metrics.tacticalImprovements += parseFloat(improvement) || 0;
        
        // Log the event
        this.log(`${team.toUpperCase()} team applied ${tactic} tactic (improvement: ${improvement})`);
        
        // Store in history
        const tacticData = {
            timestamp,
            team,
            tactic,
            improvement: parseFloat(improvement) || 0
        };
        
        if (team === 'red') {
            this.learningHistory.red_tactics.push(tacticData);
        } else {
            this.learningHistory.blue_tactics.push(tacticData);
        }
        
        this.updateUI();
    }

    trackKnowledgeSearch(query, results) {
        console.log('DEBUG: trackKnowledgeSearch called with:', query, results);
        const timestamp = new Date().toISOString();
        this.metrics.knowledgeSearches++;
        
        this.log(`Knowledge search: "${query}" (${results} results found)`);
        
        this.learningHistory.knowledge_searches.push({
            timestamp,
            query,
            results: results || 0
        });
        
        // Limit history
        if (this.learningHistory.knowledge_searches.length > 100) {
            this.learningHistory.knowledge_searches.shift();
        }
        
        this.updateUI();
    }

    trackFormationUsage(formation) {
        const timestamp = new Date().toISOString();
        this.metrics.formationsUsed++;
        this.log(`Formation applied: ${formation}`);
        
        // Store formation usage in history
        this.learningHistory.formations_applied.push({
            timestamp,
            tactic: formation,
            team: 'unknown', // Formation usage doesn't specify team
            improvement: 0
        });
        
        // Limit history size
        if (this.learningHistory.formations_applied.length > 50) {
            this.learningHistory.formations_applied.shift();
        }
        
        this.updateUI();
    }

    trackTeamLearning(team, tactic, improvement) {
        this.metrics.teamLearningEvents++;
        this.log(`Team learning event: ${team} mastered ${tactic} (${improvement} improvement)`);
        
        this.learningHistory.learning_events.push({
            timestamp: new Date().toISOString(),
            team,
            tactic,
            improvement: parseFloat(improvement) || 0
        });
        
        // Limit history
        if (this.learningHistory.learning_events.length > 100) {
            this.learningHistory.learning_events.shift();
        }
        
        this.updateUI();
    }

    trackCognitiveAdaptation() {
        this.metrics.cognitiveAdaptations++;
        this.log('Cognitive adaptation triggered');
        this.updateUI();
    }

    // === Analysis Methods ===

    analyzeTeamStrategy(team) {
        const teamTactics = team === 'red' ? 
            this.learningHistory.red_tactics : 
            this.learningHistory.blue_tactics;
        
        if (teamTactics.length === 0) {
            return 'No data';
        }
        
        // Find most common tactic
        const tacticCounts = {};
        teamTactics.forEach(t => {
            tacticCounts[t.tactic] = (tacticCounts[t.tactic] || 0) + 1;
        });
        
        const mostUsed = Object.entries(tacticCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        return mostUsed ? `${mostUsed[0]} (${mostUsed[1]}x)` : 'No data';
    }

    analyzeDominantFormation() {
        const formations = this.learningHistory.formations_applied;
        if (formations.length === 0) {
            return 'None';
        }
        
        const formationCounts = {};
        formations.forEach(f => {
            formationCounts[f.tactic] = (formationCounts[f.tactic] || 0) + 1;
        });
        
        const dominant = Object.entries(formationCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        return dominant ? `${dominant[0]} (${dominant[1]}x)` : 'None';
    }

    calculateLearningRate() {
        const recentEvents = this.learningHistory.learning_events.slice(-10);
        if (recentEvents.length === 0) {
            return '0%';
        }
        
        const avgImprovement = recentEvents.reduce((sum, event) => 
            sum + event.improvement, 0) / recentEvents.length;
        
        return `${(avgImprovement * 100).toFixed(1)}%`;
    }

    calculateAdaptationEfficiency() {
        if (this.metrics.cognitiveAdaptations === 0) {
            return '0%';
        }
        
        const efficiency = (this.metrics.tacticalImprovements / this.metrics.cognitiveAdaptations) * 100;
        return `${efficiency.toFixed(1)}%`;
    }

    // === UI Methods ===

    show() {
        const modal = document.getElementById('cognitionInsightsModal');
        if (modal) {
            modal.style.display = 'block';
            this.updateUI();
        }
    }

    hide() {
        const modal = document.getElementById('cognitionInsightsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    toggle() {
        const modal = document.getElementById('cognitionInsightsModal');
        if (modal) {
            if (modal.style.display === 'none' || !modal.style.display) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    updateUI() {
        // Update metrics display
        this.updateMetricsDisplay();
        
        // Update analysis display
        this.updateAnalysisDisplay();
        
        // Update charts
        this.updateCharts();
        
        // Update logs
        this.updateLogsDisplay();
    }

    updateMetricsDisplay() {
        const elements = {
            'cognition-tactics-applied': this.metrics.tacticsApplied,
            'cognition-knowledge-searches': this.metrics.knowledgeSearches,
            'cognition-formations-used': this.metrics.formationsUsed,
            'cognition-team-learning': this.metrics.teamLearningEvents,
            'cognition-tactical-improvements': this.metrics.tacticalImprovements.toFixed(2),
            'cognition-adaptations': this.metrics.cognitiveAdaptations
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateAnalysisDisplay() {
        const elements = {
            'cognition-red-strategy': this.analyzeTeamStrategy('red'),
            'cognition-blue-strategy': this.analyzeTeamStrategy('blue'),
            'cognition-dominant-formation': this.analyzeDominantFormation(),
            'cognition-learning-rate': this.calculateLearningRate(),
            'cognition-adaptation-efficiency': this.calculateAdaptationEfficiency()
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateCharts() {
        // Update tactics chart
        if (this.tacticsChart && this.tacticsChart.data) {
            const redTactics = this.learningHistory.red_tactics;
            const blueTactics = this.learningHistory.blue_tactics;
            
            // Create a timeline of all tactic applications
            const allTactics = [...redTactics, ...blueTactics].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            if (allTactics.length > 0) {
                // Create meaningful labels for tactical applications
                const labels = allTactics.map((tactic) => {
                    const time = new Date(tactic.timestamp);
                    const minutes = time.getMinutes().toString().padStart(2, '0');
                    const seconds = time.getSeconds().toString().padStart(2, '0');
                    return `${tactic.team.charAt(0).toUpperCase()}:${minutes}:${seconds}`;
                });
                
                // Calculate cumulative counts for each team
                let redCount = 0;
                let blueCount = 0;
                const redData = [];
                const blueData = [];
                
                allTactics.forEach(tactic => {
                    if (tactic.team === 'red') {
                        redCount++;
                    } else if (tactic.team === 'blue') {
                        blueCount++;
                    }
                    redData.push(redCount);
                    blueData.push(blueCount);
                });
                
                this.tacticsChart.data.labels = labels;
                this.tacticsChart.data.datasets[0].data = redData;
                this.tacticsChart.data.datasets[1].data = blueData;
            } else {
                // No data yet
                this.tacticsChart.data.labels = [];
                this.tacticsChart.data.datasets[0].data = [];
                this.tacticsChart.data.datasets[1].data = [];
            }
            
            this.tacticsChart.update();
        }
        
        // Update learning chart
        if (this.learningChart && this.learningChart.data) {
            this.learningChart.data.datasets[0].data = [
                this.metrics.knowledgeSearches,
                this.metrics.teamLearningEvents,
                this.metrics.cognitiveAdaptations
            ];
            this.learningChart.update();
        }
        
        // Update formation chart
        if (this.formationChart && this.formationChart.data) {
            const formations = this.learningHistory.formations_applied;
            const counts = { phalanx: 0, pincer: 0, blitzkrieg: 0, guerrilla: 0 };
            
            formations.forEach(f => {
                if (counts.hasOwnProperty(f.tactic)) {
                    counts[f.tactic]++;
                }
            });
            
            this.formationChart.data.datasets[0].data = [
                counts.phalanx, counts.pincer, counts.blitzkrieg, counts.guerrilla
            ];
            this.formationChart.update();
        }
    }

    updateLogsDisplay() {
        const container = document.getElementById('cognitionLogContainer');
        if (container) {
            const recentLogs = this.logs.slice(-50); // Show last 50 logs
            container.innerHTML = recentLogs.map(log => 
                `<div style="color: #00ff88; margin: 2px 0;">[${log.timestamp}] ${log.message}</div>`
            ).join('');
            container.scrollTop = container.scrollHeight;
        }
    }

    // === Utility Methods ===

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({ timestamp, message });
        
        // Limit log size
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    }

    reset() {
        // Reset all data
        this.logs = [];
        this.metrics = {
            tacticsApplied: 0,
            knowledgeSearches: 0,
            formationsUsed: 0,
            teamLearningEvents: 0,
            tacticalImprovements: 0,
            cognitiveAdaptations: 0
        };
        
        this.learningHistory = {
            red_tactics: [],
            blue_tactics: [],
            knowledge_searches: [],
            formations_applied: [],
            learning_events: []
        };
        
        this.log('Cognition insights data reset');
        this.updateCharts();
        this.updateUI();
    }

    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            learningHistory: this.learningHistory,
            logs: this.logs
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cognition-insights-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('Data exported successfully');
    }
}

// Create global instance
window.cognitionInsights = new CognitionInsights();

// Export for module use
window.CognitionInsights = CognitionInsights;
