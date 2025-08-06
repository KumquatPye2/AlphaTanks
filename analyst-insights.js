/**
 * Analyst Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankAnalyst module functions in the ASI-ARCH system.
 */

class AnalystInsights {
    constructor() {
        this.logs = [];
        this.metrics = {
            analysesPerformed: 0,
            trendAnalyses: 0,
            behaviorIdentifications: 0,
            strategicInsights: 0,
            fitnessProgressions: 0,
            significantDiscoveries: 0
        };
        
        this.analysisData = [];
        this.insightHistory = {
            performance_trends: [],
            emergent_behaviors: [],
            strategic_insights: [],
            fitness_progressions: [],
            discoveries: []
        };
        
        // Chart.js instances
        this.trendChart = null;
        this.fitnessChart = null;
        this.discoveryChart = null;
        
        this.setupInsightsDashboard();
    }

    setupInsightsDashboard() {
        // Ensure DOM is ready before creating dashboard
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInsightsDashboard());
            return;
        }
        
        // Remove any existing dashboard first
        const existingDashboard = document.getElementById('analyst-insights-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Create insights dashboard in DOM
        const dashboard = document.createElement('div');
        dashboard.id = 'analyst-insights-dashboard';
        dashboard.innerHTML = `
            <div class="insights-header">
                <h2>📊 Analyst Module Insights</h2>
                <div style="float: right;">
                    <button onclick="window.open('analyst-insights-demo.html', '_blank')" style="
                        background: #00aaff; 
                        color: white; 
                        border: none; 
                        border-radius: 3px; 
                        padding: 4px 8px; 
                        cursor: pointer;
                        font-size: 12px;
                        margin-right: 5px;
                    ">📈 Demo</button>
                    <button onclick="window.analystInsights.toggle()" style="
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
                    <h3>📈 Real-time Analysis Metrics</h3>
                    <div id="live-analyst-metrics"></div>
                </div>
                <div class="trends-panel">
                    <h3>📉 Performance Trend Analysis</h3>
                    <div id="trend-analysis-charts"></div>
                </div>
                <div class="behavior-panel">
                    <h3>🧠 Emergent Behavior Detection</h3>
                    <div id="behavior-analysis-charts"></div>
                </div>
                <div class="discovery-panel">
                    <h3>🔍 Significant Discoveries</h3>
                    <div id="discovery-analysis-charts"></div>
                </div>
                <div class="logs-panel">
                    <h3>📝 Analysis Logs</h3>
                    <div id="analyst-logs" style="height: 300px; overflow-y: scroll;"></div>
                </div>
            </div>
        `;
        
        dashboard.style.cssText = `
            position: fixed; top: 10px; right: 10px; width: 500px; 
            background: rgba(0,0,0,0.9); color: white; padding: 15px;
            border-radius: 10px; font-family: monospace; z-index: 998;
            font-size: 12px; max-height: 80vh; overflow-y: auto;
            border: 2px solid #00aaff;
        `;
        
        // Add custom styles for charts
        const style = document.createElement('style');
        style.textContent = `
            #analyst-insights-dashboard .chart {
                margin: 10px 0;
                padding: 10px;
                background: rgba(0,170,255,0.05);
                border-radius: 5px;
                border: 1px solid rgba(0,170,255,0.1);
            }
            #analyst-insights-dashboard .chart h4 {
                margin: 0 0 10px 0;
                color: #00aaff;
                text-align: center;
            }
            #analyst-insights-dashboard canvas {
                max-width: 100%;
                height: auto !important;
            }
            #analyst-insights-dashboard .trends-panel,
            #analyst-insights-dashboard .behavior-panel,
            #analyst-insights-dashboard .discovery-panel {
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

    trackAnalysisStart(battleResult, historySize) {
        this.metrics.analysesPerformed++;
        
        this.log('ANALYSIS_START', `Starting comprehensive battle analysis`, {
            battleDuration: battleResult.duration?.toFixed(2) || 'N/A',
            winner: battleResult.winner || 'Unknown',
            historySize: historySize || 0,
            redSurvivors: battleResult.redSurvivors || 0,
            blueSurvivors: battleResult.blueSurvivors || 0
        });
        
        this.updateMetricsDisplay();
    }

    trackPerformanceTrends(trendsData) {
        this.metrics.trendAnalyses++;
        
        if (trendsData) {
            this.insightHistory.performance_trends.push({
                timestamp: Date.now(),
                averageFitness: trendsData.average_fitness,
                improvementRate: trendsData.improvement_rate,
                durationTrend: trendsData.battle_duration_trend
            });
            
            // Keep only last 50 trend analyses
            if (this.insightHistory.performance_trends.length > 50) {
                this.insightHistory.performance_trends.shift();
            }
        }
        
        this.log('TREND_ANALYSIS', `Performance trends analyzed`, {
            averageFitness: trendsData?.average_fitness?.toFixed(3) || 'N/A',
            improvementRate: trendsData?.improvement_rate?.toFixed(4) || 'N/A',
            averageDuration: trendsData?.battle_duration_trend?.average?.toFixed(1) || 'N/A',
            durationTrend: trendsData?.battle_duration_trend?.trend?.toFixed(4) || 'N/A',
            trendDirection: this.categorizeTrend(trendsData?.improvement_rate)
        });
        
        this.updateTrendCharts();
        this.updateMetricsDisplay();
    }

    trackEmergentBehaviors(behaviors, battleResult) {
        this.metrics.behaviorIdentifications++;
        
        const behaviorData = {
            timestamp: Date.now(),
            behaviors: behaviors || [],
            battleDuration: battleResult?.duration || 0,
            accuracy: this.calculateAverageAccuracy(battleResult),
            damageRatio: this.calculateDamageRatio(battleResult)
        };
        
        this.insightHistory.emergent_behaviors.push(behaviorData);
        
        // Keep only last 30 behavior analyses
        if (this.insightHistory.emergent_behaviors.length > 30) {
            this.insightHistory.emergent_behaviors.shift();
        }
        
        this.log('BEHAVIOR_DETECTION', `Emergent behaviors identified`, {
            behaviorsFound: behaviors?.length || 0,
            behaviors: behaviors?.join(', ') || 'None detected',
            battleComplexity: this.categorizeBattleComplexity(battleResult),
            tacticalSophistication: this.assessTacticalSophistication(behaviors, battleResult)
        });
        
        this.updateBehaviorCharts();
        this.updateMetricsDisplay();
    }

    trackStrategicInsights(insights, battleResult) {
        this.metrics.strategicInsights++;
        
        const insightData = {
            timestamp: Date.now(),
            insights: insights || [],
            winner: battleResult?.winner || 'timeout',
            duration: battleResult?.duration || 0,
            strategicEffectiveness: this.calculateStrategicEffectiveness(insights, battleResult)
        };
        
        this.insightHistory.strategic_insights.push(insightData);
        
        // Keep only last 40 strategic analyses
        if (this.insightHistory.strategic_insights.length > 40) {
            this.insightHistory.strategic_insights.shift();
        }
        
        this.log('STRATEGIC_ANALYSIS', `Strategic insights generated`, {
            insightsCount: insights?.length || 0,
            insights: insights?.join('; ') || 'No strategic patterns detected',
            winner: battleResult?.winner || 'timeout',
            strategicCategory: this.categorizeStrategy(insights, battleResult),
            effectiveness: insightData.strategicEffectiveness.toFixed(3)
        });
        
        this.updateMetricsDisplay();
    }

    trackFitnessProgression(progression) {
        this.metrics.fitnessProgressions++;
        
        if (progression) {
            this.insightHistory.fitness_progressions.push({
                timestamp: Date.now(),
                currentFitness: progression.current_fitness,
                fitnessTrend: progression.fitness_trend,
                bestFitness: progression.best_fitness,
                consistency: progression.improvement_consistency
            });
            
            // Keep only last 50 fitness analyses
            if (this.insightHistory.fitness_progressions.length > 50) {
                this.insightHistory.fitness_progressions.shift();
            }
        }
        
        this.log('FITNESS_PROGRESSION', `Fitness progression analyzed`, {
            currentFitness: progression?.current_fitness?.toFixed(3) || 'N/A',
            trend: progression?.fitness_trend?.toFixed(4) || 'N/A',
            bestFitness: progression?.best_fitness?.toFixed(3) || 'N/A',
            consistency: progression?.improvement_consistency?.toFixed(3) || 'N/A',
            evolutionStatus: this.categorizeEvolution(progression)
        });
        
        this.updateFitnessCharts();
        this.updateMetricsDisplay();
    }

    trackSignificantDiscovery(discoveryReport, improvement) {
        this.metrics.significantDiscoveries++;
        
        const discoveryData = {
            timestamp: Date.now(),
            report: discoveryReport,
            improvement: improvement,
            significance: this.assessDiscoverySignificance(improvement)
        };
        
        this.insightHistory.discoveries.push(discoveryData);
        
        // Keep only last 20 discoveries
        if (this.insightHistory.discoveries.length > 20) {
            this.insightHistory.discoveries.shift();
        }
        
        this.log('SIGNIFICANT_DISCOVERY', `Major breakthrough detected!`, {
            discoveryReport: discoveryReport,
            improvementPercent: (improvement * 100).toFixed(1) + '%',
            significance: discoveryData.significance,
            breakthroughType: this.categorizeBreakthrough(improvement),
            discoveryCount: this.insightHistory.discoveries.length
        });
        
        this.updateDiscoveryCharts();
        this.updateMetricsDisplay();
    }

    trackAnalysisCompletion(analysisResults) {
        const completionData = {
            timestamp: Date.now(),
            hasPerformanceTrends: !!analysisResults.performance_trends,
            emergentBehaviorCount: analysisResults.emergent_behaviors?.length || 0,
            strategicInsightCount: analysisResults.strategic_insights?.length || 0,
            hasFitnessProgression: !!analysisResults.fitness_progression,
            hasSignificantDiscovery: !!analysisResults.significantDiscovery
        };
        
        this.analysisData.push(completionData);
        
        // Keep only last 100 analyses
        if (this.analysisData.length > 100) {
            this.analysisData.shift();
        }
        
        this.log('ANALYSIS_COMPLETE', `Comprehensive analysis completed`, {
            componentsAnalyzed: this.countAnalysisComponents(completionData),
            totalInsights: completionData.emergentBehaviorCount + completionData.strategicInsightCount,
            discoveryMade: completionData.hasSignificantDiscovery,
            analysisQuality: this.assessAnalysisQuality(completionData)
        });
        
        this.updateMetricsDisplay();
    }

    // Analysis Helper Methods
    calculateAverageAccuracy(battleResult) {
        if (!battleResult) {
            return 0;
        }
        
        const redAcc = battleResult.redTeamStats?.accuracy || 0;
        const blueAcc = battleResult.blueTeamStats?.accuracy || 0;
        return (redAcc + blueAcc) / 2;
    }

    calculateDamageRatio(battleResult) {
        if (!battleResult) {
            return 1;
        }
        
        const redDamage = battleResult.redTeamStats?.totalDamageDealt || 0;
        const blueDamage = battleResult.blueTeamStats?.totalDamageDealt || 0;
        const redTaken = battleResult.redTeamStats?.totalDamageTaken || 1;
        const blueTaken = battleResult.blueTeamStats?.totalDamageTaken || 1;
        
        return ((redDamage / redTaken) + (blueDamage / blueTaken)) / 2;
    }

    calculateStrategicEffectiveness(insights, battleResult) {
        if (!insights || insights.length === 0) {
            return 0;
        }
        
        let effectiveness = insights.length * 0.2; // Base score for insights
        
        if (battleResult?.winner !== 'timeout') {
            effectiveness += 0.3; // Bonus for decisive battles
        }
        
        if (battleResult?.duration > 45) {
            effectiveness += 0.2; // Bonus for complex battles
        }
        
        return Math.min(effectiveness, 1);
    }

    categorizeTrend(improvementRate) {
        if (!improvementRate) {
            return 'Stable';
        }
        
        if (improvementRate > 0.05) {
            return 'Rapidly Improving';
        }
        if (improvementRate > 0.02) {
            return 'Improving';
        }
        if (improvementRate > -0.02) {
            return 'Stable';
        }
        if (improvementRate > -0.05) {
            return 'Declining';
        }
        return 'Rapidly Declining';
    }

    categorizeBattleComplexity(battleResult) {
        if (!battleResult) {
            return 'Unknown';
        }
        
        const duration = battleResult.duration || 0;
        const totalShots = (battleResult.redTeamStats?.shotsFired || 0) + 
                          (battleResult.blueTeamStats?.shotsFired || 0);
        
        if (duration > 60 && totalShots > 100) {
            return 'Highly Complex';
        }
        if (duration > 30 && totalShots > 50) {
            return 'Complex';
        }
        if (duration > 15) {
            return 'Moderate';
        }
        return 'Simple';
    }

    assessTacticalSophistication(behaviors, _battleResult) {
        if (!behaviors || behaviors.length === 0) {
            return 'Basic';
        }
        
        const sophisticationKeywords = [
            'tactical', 'positioning', 'precision', 'extended', 'sophisticated'
        ];
        
        const score = behaviors.reduce((acc, behavior) => {
            return acc + sophisticationKeywords.filter(keyword => 
                behavior.toLowerCase().includes(keyword)
            ).length;
        }, 0);
        
        if (score >= 3) {
            return 'Highly Sophisticated';
        }
        if (score >= 2) {
            return 'Sophisticated';
        }
        if (score >= 1) {
            return 'Moderate';
        }
        return 'Basic';
    }

    categorizeStrategy(insights, _battleResult) {
        if (!insights || insights.length === 0) {
            return 'Standard';
        }
        
        const strategyTypes = {
            'accuracy': ['accuracy', 'precision', 'targeting'],
            'defensive': ['defensive', 'positioning', 'survivability'],
            'aggressive': ['aggressive', 'early', 'quick']
        };
        
        for (const [type, keywords] of Object.entries(strategyTypes)) {
            if (keywords.some(keyword => 
                insights.some(insight => insight.toLowerCase().includes(keyword))
            )) {
                return type.charAt(0).toUpperCase() + type.slice(1);
            }
        }
        
        return 'Mixed Strategy';
    }

    categorizeEvolution(progression) {
        if (!progression) {
            return 'Unknown';
        }
        
        const trend = progression.fitness_trend || 0;
        const consistency = progression.improvement_consistency || 0;
        
        if (trend > 0.01 && consistency > 0.7) {
            return 'Stable Evolution';
        }
        if (trend > 0.01) {
            return 'Rapid Evolution';
        }
        if (trend < -0.01) {
            return 'Regression';
        }
        if (consistency > 0.8) {
            return 'Stable State';
        }
        return 'Chaotic Evolution';
    }

    assessDiscoverySignificance(improvement) {
        if (improvement > 0.3) {
            return 'Revolutionary';
        }
        if (improvement > 0.2) {
            return 'Major';
        }
        if (improvement > 0.1) {
            return 'Significant';
        }
        return 'Minor';
    }

    categorizeBreakthrough(improvement) {
        if (improvement > 0.5) {
            return 'Paradigm Shift';
        }
        if (improvement > 0.3) {
            return 'Major Breakthrough';
        }
        if (improvement > 0.15) {
            return 'Tactical Innovation';
        }
        return 'Incremental Improvement';
    }

    countAnalysisComponents(data) {
        let count = 0;
        if (data.hasPerformanceTrends) {
            count++;
        }
        if (data.emergentBehaviorCount > 0) {
            count++;
        }
        if (data.strategicInsightCount > 0) {
            count++;
        }
        if (data.hasFitnessProgression) {
            count++;
        }
        if (data.hasSignificantDiscovery) {
            count++;
        }
        return count;
    }

    assessAnalysisQuality(data) {
        const score = this.countAnalysisComponents(data) / 5;
        
        if (score >= 0.8) {
            return 'Excellent';
        }
        if (score >= 0.6) {
            return 'Good';
        }
        if (score >= 0.4) {
            return 'Fair';
        }
        return 'Basic';
    }

    // UI Update Methods
    updateMetricsDisplay() {
        const metricsDiv = document.getElementById('live-analyst-metrics');
        if (!metricsDiv) {
            return;
        }
        
        const recentAnalyses = this.analysisData.slice(-10);
        const avgDiscoveries = this.insightHistory.discoveries.length;
        const avgBehaviors = recentAnalyses.length > 0 ?
            recentAnalyses.reduce((sum, a) => sum + a.emergentBehaviorCount, 0) / recentAnalyses.length : 0;
        
        metricsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                <div>
                    <strong>Analyses Performed:</strong> ${this.metrics.analysesPerformed}<br>
                    <strong>Trend Analyses:</strong> ${this.metrics.trendAnalyses}<br>
                    <strong>Behavior Detections:</strong> ${this.metrics.behaviorIdentifications}
                </div>
                <div>
                    <strong>Strategic Insights:</strong> ${this.metrics.strategicInsights}<br>
                    <strong>Fitness Progressions:</strong> ${this.metrics.fitnessProgressions}<br>
                    <strong>Discoveries:</strong> ${this.metrics.significantDiscoveries}
                </div>
                <div style="grid-column: 1 / -1; border-top: 1px solid #00aaff; padding-top: 5px; margin-top: 5px;">
                    <strong>Recent Insights:</strong><br>
                    Total Discoveries: ${avgDiscoveries}<br>
                    Avg Behaviors/Analysis: ${avgBehaviors.toFixed(1)}<br>
                    Analyses Tracked: ${this.analysisData.length}
                </div>
            </div>
        `;
    }

    updateLogsDisplay() {
        const logsDiv = document.getElementById('analyst-logs');
        if (!logsDiv) {
            return;
        }
        
        const recentLogs = this.logs.slice(-20).reverse();
        logsDiv.innerHTML = recentLogs.map(log => {
            const colorMap = {
                'ANALYSIS_START': '#00ff88',
                'TREND_ANALYSIS': '#00aaff',
                'BEHAVIOR_DETECTION': '#ffaa00',
                'STRATEGIC_ANALYSIS': '#ff6600',
                'FITNESS_PROGRESSION': '#aa00ff',
                'SIGNIFICANT_DISCOVERY': '#ff0088',
                'ANALYSIS_COMPLETE': '#ffffff'
            };
            
            const color = colorMap[log.category] || '#cccccc';
            
            return `<div style="margin: 2px 0; padding: 2px; border-left: 3px solid ${color};">
                <span style="color: ${color}; font-weight: bold;">[${log.timestamp}] ${log.category}:</span>
                <span style="color: #ffffff;"> ${log.message}</span>
                ${Object.keys(log.data).length > 0 ? 
                    `<div style="font-size: 10px; color: #aaaaaa; margin-left: 10px;">
                        ${Object.entries(log.data).slice(0, 3).map(([k, v]) => 
                            `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 50) : v}`
                        ).join(', ')}
                    </div>` : ''}
            </div>`;
        }).join('');
        
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }

    updateTrendCharts() {
        this.updateFitnessChart();
        this.updateImprovementChart();
    }

    updateFitnessChart() {
        const chartContainer = document.getElementById('trend-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing fitness chart
        const existingChart = document.getElementById('fitness-trend-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'fitness-trend-chart';
        chartDiv.className = 'chart';
        
        const recentTrends = this.insightHistory.performance_trends.slice(-20);
        if (recentTrends.length === 0) {
            return;
        }
        
        const labels = recentTrends.map((_, i) => `T${i + 1}`);
        const fitness = recentTrends.map(t => (t.averageFitness * 100).toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>📈 Average Fitness Trend</h4>
            <canvas id="fitness-trend-canvas" width="400" height="150"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('fitness-trend-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        
        if (ctx) {
            this.drawLineChart(ctx, labels, fitness, '#00aaff', 'Fitness %');
        }
    }

    updateImprovementChart() {
        const chartContainer = document.getElementById('trend-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing improvement chart
        const existingChart = document.getElementById('improvement-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'improvement-chart';
        chartDiv.className = 'chart';
        
        const recentTrends = this.insightHistory.performance_trends.slice(-15);
        if (recentTrends.length === 0) {
            return;
        }
        
        const labels = recentTrends.map((_, i) => `T${i + 1}`);
        const improvements = recentTrends.map(t => (t.improvementRate * 1000).toFixed(2));
        
        chartDiv.innerHTML = `
            <h4>📊 Improvement Rate Trend</h4>
            <canvas id="improvement-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('improvement-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        
        if (ctx) {
            this.drawLineChart(ctx, labels, improvements, '#00ff88', 'Rate (×1000)');
        }
    }

    updateBehaviorCharts() {
        this.updateBehaviorFrequencyChart();
    }

    updateBehaviorFrequencyChart() {
        const chartContainer = document.getElementById('behavior-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing behavior chart
        const existingChart = document.getElementById('behavior-frequency-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'behavior-frequency-chart';
        chartDiv.className = 'chart';
        
        const recentBehaviors = this.insightHistory.emergent_behaviors.slice(-15);
        if (recentBehaviors.length === 0) {
            return;
        }
        
        const labels = recentBehaviors.map((_, i) => `B${i + 1}`);
        const behaviorCounts = recentBehaviors.map(b => b.behaviors.length);
        
        chartDiv.innerHTML = `
            <h4>🧠 Emergent Behaviors Detected</h4>
            <canvas id="behavior-frequency-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('behavior-frequency-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        
        if (ctx) {
            this.drawLineChart(ctx, labels, behaviorCounts, '#ffaa00', 'Behavior Count');
        }
    }

    updateFitnessCharts() {
        this.updateEvolutionChart();
    }

    updateEvolutionChart() {
        const chartContainer = document.getElementById('trend-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing evolution chart
        const existingChart = document.getElementById('evolution-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'evolution-chart';
        chartDiv.className = 'chart';
        
        const recentEvolution = this.insightHistory.fitness_progressions.slice(-15);
        if (recentEvolution.length === 0) {
            return;
        }
        
        const labels = recentEvolution.map((_, i) => `E${i + 1}`);
        const consistency = recentEvolution.map(e => (e.consistency * 100).toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>🔄 Evolution Consistency</h4>
            <canvas id="evolution-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('evolution-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        
        if (ctx) {
            this.drawLineChart(ctx, labels, consistency, '#aa00ff', 'Consistency %');
        }
    }

    updateDiscoveryCharts() {
        this.updateDiscoveryTimelineChart();
    }

    updateDiscoveryTimelineChart() {
        const chartContainer = document.getElementById('discovery-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing discovery chart
        const existingChart = document.getElementById('discovery-timeline-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'discovery-timeline-chart';
        chartDiv.className = 'chart';
        
        const discoveries = this.insightHistory.discoveries.slice(-10);
        if (discoveries.length === 0) {
            chartDiv.innerHTML = `
                <h4>🔍 Discovery Timeline</h4>
                <p style="text-align: center; color: #888;">No significant discoveries yet</p>
            `;
            chartContainer.appendChild(chartDiv);
            return;
        }
        
        const labels = discoveries.map((_, i) => `D${i + 1}`);
        const improvements = discoveries.map(d => (d.improvement * 100).toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>🔍 Discovery Timeline</h4>
            <canvas id="discovery-timeline-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('discovery-timeline-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        
        if (ctx) {
            this.drawLineChart(ctx, labels, improvements, '#ff0088', 'Improvement %');
        }
    }

    drawLineChart(ctx, labels, data, color, yLabel) {
        if (!ctx || !ctx.canvas) {
            // Gracefully handle missing context (e.g., in test environments)
            return;
        }
        
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set up drawing context
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.font = '10px monospace';
        
        if (data.length === 0) {
            return;
        }
        
        // Calculate scales
        const maxValue = Math.max(...data.map(d => parseFloat(d)));
        const minValue = Math.min(...data.map(d => parseFloat(d)));
        const range = maxValue - minValue || 1;
        
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Draw axes
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw data line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((parseFloat(value) - minValue) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((parseFloat(value) - minValue) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#cccccc';
        ctx.fillText(yLabel, 5, 15);
        ctx.fillText(`Max: ${maxValue.toFixed(1)}`, width - 80, 15);
        ctx.fillText(`Min: ${minValue.toFixed(1)}`, width - 80, height - 5);
    }

    // Public control methods
    toggle() {
        if (this.dashboard) {
            this.dashboard.style.display = 
                this.dashboard.style.display === 'none' ? 'block' : 'none';
        }
    }

    show() {
        if (this.dashboard) {
            this.dashboard.style.display = 'block';
        }
    }

    hide() {
        if (this.dashboard) {
            this.dashboard.style.display = 'none';
        }
    }

    reset() {
        this.logs = [];
        this.metrics = {
            analysesPerformed: 0,
            trendAnalyses: 0,
            behaviorIdentifications: 0,
            strategicInsights: 0,
            fitnessProgressions: 0,
            significantDiscoveries: 0
        };
        this.analysisData = [];
        this.insightHistory = {
            performance_trends: [],
            emergent_behaviors: [],
            strategic_insights: [],
            fitness_progressions: [],
            discoveries: []
        };
        
        this.updateMetricsDisplay();
        this.updateLogsDisplay();
        this.updateTrendCharts();
        this.updateBehaviorCharts();
        this.updateFitnessCharts();
        this.updateDiscoveryCharts();
        
        this.log('SYSTEM', 'Analyst Insights dashboard reset');
    }

    // Export data for analysis
    exportData() {
        return {
            metrics: this.metrics,
            logs: this.logs,
            analysisData: this.analysisData,
            insightHistory: this.insightHistory,
            timestamp: Date.now()
        };
    }
}

// Export to global scope
window.AnalystInsights = AnalystInsights;

// Auto-initialize if we're in a browser environment
if (typeof window !== 'undefined' && window.document) {
    window.analystInsights = new AnalystInsights();
}
