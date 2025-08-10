/**
 * Engineer Insights Module
 * Provides detailed logging, analytics, and visualization for understanding
 * how the TankEngineer module functions in the ASI-ARCH system.
 */

// eslint-disable-next-line no-unused-vars
class EngineerInsights {
    constructor() {
        this.logs = [];
        this.metrics = {
            battlesRun: 0,
            battleSetups: 0,
            genomeEvaluations: 0,
            performanceAnalyses: 0,
            synergyCalculations: 0,
            adaptabilityAssessments: 0
        };
        
        this.battleData = [];
        this.performanceHistory = {
            red: { genomes: [], performance: [], battles: [] },
            blue: { genomes: [], performance: [], battles: [] }
        };
        
        // Chart.js instances
        this.performanceChart = null;
        this.synergyChart = null;
        this.adaptabilityChart = null;
        
        this.setupInsightsDashboard();
    }

    setupInsightsDashboard() {
        // Ensure DOM is ready before creating dashboard
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInsightsDashboard());
            return;
        }
        
        // Remove any existing dashboard first
        const existingDashboard = document.getElementById('engineer-insights-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Create insights dashboard in DOM
        const dashboard = document.createElement('div');
        dashboard.id = 'engineer-insights-dashboard';
        dashboard.innerHTML = `
            <div class="insights-header">
                <h2>⚙️ Engineer Module Insights</h2>
                <div style="float: right;">
                    <button onclick="window.open('engineer-insights-demo.html', '_blank')" style="
                        background: #ff6600; 
                        color: white; 
                        border: none; 
                        border-radius: 3px; 
                        padding: 4px 8px; 
                        cursor: pointer;
                        font-size: 12px;
                        margin-right: 5px;
                    ">📊 Demo</button>
                    <button onclick="window.engineerInsights.toggle()" style="
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
                <div id="llm-engineer-status" style="
                    margin-bottom: 15px; 
                    padding: 12px; 
                    background: rgba(255, 102, 0, 0.1); 
                    border-radius: 8px; 
                    border: 2px solid #ff6600;
                    font-size: 13px;
                ">
                    <div style="color: #ff6600; font-weight: bold; margin-bottom: 8px;">🤖 LLM Integration Status</div>
                    <div>Loading LLM status...</div>
                </div>
                <div class="metrics-panel">
                    <h3>⚡ Real-time Engineering Metrics</h3>
                    <div id="live-engineer-metrics"></div>
                </div>
                <div class="performance-panel">
                    <h3>🎯 Battle Performance Tracking</h3>
                    <div id="performance-charts"></div>
                </div>
                <div class="battle-analysis-panel">
                    <h3>⚔️ Battle Analysis</h3>
                    <div id="battle-analysis-charts"></div>
                </div>
                <div class="logs-panel">
                    <h3>📝 Engineering Logs</h3>
                    <div id="engineer-logs" style="height: 300px; overflow-y: scroll;"></div>
                </div>
            </div>
        `;
        
        dashboard.style.cssText = `
            position: fixed; top: 10px; left: 10px; width: 500px; 
            background: rgba(0,0,0,0.9); color: white; padding: 15px;
            border-radius: 10px; font-family: monospace; z-index: 999;
            font-size: 12px; max-height: 80vh; overflow-y: auto;
            border: 2px solid #ff6600;
        `;
        
        // Add custom styles for charts
        const style = document.createElement('style');
        style.textContent = `
            #engineer-insights-dashboard .chart {
                margin: 10px 0;
                padding: 10px;
                background: rgba(255,102,0,0.05);
                border-radius: 5px;
                border: 1px solid rgba(255,102,0,0.1);
            }
            #engineer-insights-dashboard .chart h4 {
                margin: 0 0 10px 0;
                color: #ff6600;
                text-align: center;
            }
            #engineer-insights-dashboard canvas {
                max-width: 100%;
                height: auto !important;
            }
            #engineer-insights-dashboard .performance-panel,
            #engineer-insights-dashboard .battle-analysis-panel {
                margin: 15px 0;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        
        // Start with entire dashboard hidden
        dashboard.style.display = 'none';
        
        this.updateMetricsDisplay();
        this.updateLLMStatus();
    }
    
    updateLLMStatus() {
        const statusDiv = document.getElementById('llm-engineer-status');
        if (!statusDiv) {
            return;
        }
        
        const hasLLM = window.asiArch && window.asiArch.isEnabled;
        const hasApiKey = window.CONFIG?.deepseek?.apiKey && window.CONFIG.deepseek.apiKey.length > 0;
        const isMockMode = window.CONFIG?.development?.enableMockMode;
        
        let statusColor = '#ff4444';
        let statusText = 'Disabled';
        let capabilities = [];
        
        if (hasLLM) {
            if (hasApiKey && !isMockMode) {
                statusColor = '#00ff88';
                statusText = 'Active (Real LLM)';
                capabilities = [
                    '✅ Genome engineering with DeepSeek',
                    '✅ Performance optimization strategies',
                    '✅ Synergy analysis and recommendations',
                    '✅ Adaptive architecture tuning'
                ];
            } else if (isMockMode) {
                statusColor = '#ffaa00';
                statusText = 'Active (Mock Mode)';
                capabilities = [
                    '🟡 Simulated LLM responses',
                    '🟡 Development/testing mode',
                    '✅ Full interface functionality',
                    '⚠️ No real AI optimization'
                ];
            } else {
                statusColor = '#ffaa00';
                statusText = 'Configured (No API Key)';
                capabilities = [
                    '⚠️ API key not configured',
                    '✅ Ready for LLM integration',
                    '🔧 Add key to config.js to activate'
                ];
            }
        } else {
            capabilities = [
                '❌ LLM integration disabled',
                '⚙️ Traditional rule-based engineering',
                '🔧 Enable with: window.asiArch.enableLLMFeatures()'
            ];
        }
        
        statusDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: ${statusColor}; font-weight: bold;">● ${statusText}</span>
                <span style="color: #888; font-size: 11px;">ASI-ARCH Engineer</span>
            </div>
            <div style="font-size: 12px; line-height: 1.4;">
                ${capabilities.map(cap => `<div style="margin: 2px 0;">${cap}</div>`).join('')}
            </div>
            ${hasLLM && hasApiKey && !isMockMode ? `
                <div style="margin-top: 8px; padding: 6px; background: rgba(0,255,136,0.1); border-radius: 3px; font-size: 11px;">
                    <strong>🚀 Enhanced Engineering Active:</strong><br>
                    • Intelligent genome parameter tuning<br>
                    • Multi-dimensional performance analysis<br>
                    • Emergent synergy detection
                </div>
            ` : ''}
        `;
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

    trackBattleSetup(redGenomes, blueGenomes) {
        this.metrics.battleSetups++;
        
        const redAnalysis = this.analyzeTeamGenomes(redGenomes);
        const blueAnalysis = this.analyzeTeamGenomes(blueGenomes);
        
        this.log('BATTLE_SETUP', `Battle environment prepared`, {
            redTeamSize: redGenomes.length,
            blueTeamSize: blueGenomes.length,
            redTeamProfile: redAnalysis,
            blueTeamProfile: blueAnalysis,
            expectedStrategy: this.predictBattleOutcome(redAnalysis, blueAnalysis)
        });
        
        this.updateMetricsDisplay();
    }

    trackBattleExecution(battleResult, redGenomes, blueGenomes) {
        this.metrics.battlesRun++;
        
        const battleData = {
            timestamp: Date.now(),
            result: battleResult,
            redGenomes: redGenomes,
            blueGenomes: blueGenomes,
            duration: battleResult.duration,
            winner: battleResult.winner,
            effectiveness: this.calculateBattleEffectiveness(battleResult),
            engagement: this.calculateEngagementLevel(battleResult)
        };
        
        this.battleData.push(battleData);
        
        // Keep only last 50 battles
        if (this.battleData.length > 50) {
            this.battleData.shift();
        }
        
        this.log('BATTLE_EXECUTION', `Battle completed: ${battleResult.winner} victory`, {
            duration: battleResult.duration.toFixed(2),
            winner: battleResult.winner,
            redSurvivors: battleResult.redSurvivors || 0,
            blueSurvivors: battleResult.blueSurvivors || 0,
            totalShots: (battleResult.redTeamStats?.shotsFired || 0) + (battleResult.blueTeamStats?.shotsFired || 0),
            totalHits: (battleResult.redTeamStats?.shotsHit || 0) + (battleResult.blueTeamStats?.shotsHit || 0),
            effectiveness: battleData.effectiveness,
            engagement: battleData.engagement
        });
        
        this.updatePerformanceCharts();
        this.updateMetricsDisplay();
    }

    trackGenomeEvaluation(genome, team, performance) {
        this.metrics.genomeEvaluations++;
        
        const evaluation = {
            genome: genome,
            team: team,
            performance: performance,
            timestamp: Date.now(),
            traits: this.analyzeGenomeEngineering(genome)
        };
        
        if (this.performanceHistory[team]) {
            this.performanceHistory[team].genomes.push(genome);
            this.performanceHistory[team].performance.push(performance);
        }
        
        this.log('GENOME_EVALUATION', `${team} genome performance evaluated`, {
            team: team,
            survival: performance.survival?.toFixed(2),
            combatEffectiveness: performance.combat_effectiveness?.toFixed(3),
            accuracy: performance.accuracy?.toFixed(3),
            teamSynergy: performance.team_synergy?.toFixed(3),
            adaptability: performance.adaptability?.toFixed(3),
            engineeringTraits: evaluation.traits
        });
        
        this.updateMetricsDisplay();
    }

    trackTeamSynergyCalculation(genome, stats, synergyScore) {
        this.metrics.synergyCalculations++;
        
        this.log('TEAM_SYNERGY', `Team synergy calculated`, {
            teamwork: genome[4]?.toFixed(3) || 'N/A',
            adaptability: genome[5]?.toFixed(3) || 'N/A',
            accuracy: stats.accuracy?.toFixed(3) || 'N/A',
            survivalTime: stats.averageSurvivalTime?.toFixed(1) || 'N/A',
            synergyScore: synergyScore.toFixed(3),
            synergyCategory: this.categorizeSynergy(synergyScore)
        });
        
        this.updateMetricsDisplay();
    }

    trackAdaptabilityAssessment(genome, battleResult, adaptabilityScore) {
        this.metrics.adaptabilityAssessments++;
        
        this.log('ADAPTABILITY', `Genome adaptability assessed`, {
            survived: battleResult.duration > 30,
            effectiveCombat: this.isEffectiveCombat(battleResult),
            adaptabilityScore: adaptabilityScore.toFixed(3),
            adaptabilityCategory: this.categorizeAdaptability(adaptabilityScore),
            battleDuration: battleResult.duration.toFixed(2)
        });
        
        this.updateMetricsDisplay();
    }

    trackPerformanceAnalysis(analysisResults) {
        this.metrics.performanceAnalyses++;
        
        this.log('PERFORMANCE_ANALYSIS', `Comprehensive performance analysis completed`, {
            totalGenomesAnalyzed: analysisResults.totalGenomes || 0,
            averagePerformance: analysisResults.averagePerformance?.toFixed(3) || 'N/A',
            topPerformer: analysisResults.topPerformer || 'Unknown',
            improvementTrends: analysisResults.trends || 'Stable',
            engineeringInsights: analysisResults.insights || []
        });
        
        this.updateMetricsDisplay();
    }

    // Analysis Helper Methods
    analyzeTeamGenomes(genomes) {
        if (!genomes || genomes.length === 0) {
            return {};
        }
        
        const avgTraits = genomes.reduce((acc, genome) => {
            if (Array.isArray(genome)) {
                for (let i = 0; i < genome.length; i++) {
                    acc[i] = (acc[i] || 0) + genome[i];
                }
            }
            return acc;
        }, {});
        
        // Normalize by team size
        Object.keys(avgTraits).forEach(key => {
            avgTraits[key] /= genomes.length;
        });
        
        return {
            averageAggression: avgTraits[0]?.toFixed(3) || '0.000',
            averageSpeed: avgTraits[1]?.toFixed(3) || '0.000',
            averageAccuracy: avgTraits[2]?.toFixed(3) || '0.000',
            averageDefense: avgTraits[3]?.toFixed(3) || '0.000',
            averageTeamwork: avgTraits[4]?.toFixed(3) || '0.000',
            teamSize: genomes.length,
            predictedStrategy: this.predictTeamStrategy(avgTraits)
        };
    }

    analyzeGenomeEngineering(genome) {
        if (!Array.isArray(genome)) {
            return {};
        }
        
        return {
            aggressionLevel: this.categorizeLevel(genome[0]),
            speedCategory: this.categorizeLevel(genome[1]),
            accuracyRating: this.categorizeLevel(genome[2]),
            defensivePosture: this.categorizeLevel(genome[3]),
            teamworkOrientation: this.categorizeLevel(genome[4]),
            adaptabilityPotential: this.categorizeLevel(genome[5]),
            engineeringBalance: this.calculateEngineeringBalance(genome)
        };
    }

    calculateBattleEffectiveness(battleResult) {
        if (!battleResult) {
            return 0;
        }
        
        const redStats = battleResult.redTeamStats || {};
        const blueStats = battleResult.blueTeamStats || {};
        
        const totalDamage = (redStats.totalDamageDealt || 0) + (blueStats.totalDamageDealt || 0);
        const totalShots = (redStats.shotsFired || 0) + (blueStats.shotsFired || 0);
        const avgAccuracy = totalShots > 0 ? 
            ((redStats.shotsHit || 0) + (blueStats.shotsHit || 0)) / totalShots : 0;
        
        // Effectiveness based on damage output, accuracy, and battle resolution
        const damageScore = Math.min(totalDamage / 500, 1); // Lowered from 1000 to 500 for more realistic scale
        const accuracyScore = avgAccuracy;
        const resolutionScore = battleResult.winner !== 'timeout' ? 0.5 : 0; // Bonus for decisive battles
        
        return (damageScore + accuracyScore + resolutionScore) / 2.0; // Changed from 2.5 to 2.0 for proper normalization
    }

    calculateEngagementLevel(battleResult) {
        if (!battleResult) {
            return 0;
        }
        
        const duration = battleResult.duration || 0;
        const totalShots = (battleResult.redTeamStats?.shotsFired || 0) + 
                          (battleResult.blueTeamStats?.shotsFired || 0);
        
        // Higher engagement = more shots per second
        const shotsPerSecond = duration > 0 ? totalShots / duration : 0;
        
        // Normalize to 0-1 scale (assuming max ~2 shots per second is high engagement)
        return Math.min(shotsPerSecond / 2, 1);
    }

    predictBattleOutcome(redAnalysis, blueAnalysis) {
        const redAggression = parseFloat(redAnalysis.averageAggression || 0);
        const blueAggression = parseFloat(blueAnalysis.averageAggression || 0);
        const redDefense = parseFloat(redAnalysis.averageDefense || 0);
        const blueDefense = parseFloat(blueAnalysis.averageDefense || 0);
        
        if (redAggression > blueDefense && redAggression > blueAggression) {
            return 'Red aggressive advantage';
        } else if (blueAggression > redDefense && blueAggression > redAggression) {
            return 'Blue aggressive advantage';
        } else if (redDefense > blueAggression && blueDefense > redAggression) {
            return 'Defensive stalemate likely';
        } else {
            return 'Balanced engagement expected';
        }
    }

    predictTeamStrategy(avgTraits) {
        const aggression = avgTraits[0] || 0;
        const defense = avgTraits[3] || 0;
        const teamwork = avgTraits[4] || 0;
        
        if (aggression > 0.7) {
            return 'Aggressive Rush';
        }
        if (defense > 0.7) {
            return 'Defensive Formation';
        }
        if (teamwork > 0.7) {
            return 'Coordinated Tactics';
        }
        if (aggression > 0.5 && teamwork > 0.5) {
            return 'Tactical Assault';
        }
        return 'Balanced Approach';
    }

    categorizeLevel(value) {
        if (value >= 0.8) {
            return 'Very High';
        }
        if (value >= 0.6) {
            return 'High';
        }
        if (value >= 0.4) {
            return 'Medium';
        }
        if (value >= 0.2) {
            return 'Low';
        }
        return 'Very Low';
    }

    categorizeSynergy(score) {
        if (score >= 0.8) {
            return 'Excellent';
        }
        if (score >= 0.6) {
            return 'Good';
        }
        if (score >= 0.4) {
            return 'Average';
        }
        if (score >= 0.2) {
            return 'Poor';
        }
        return 'Very Poor';
    }

    categorizeAdaptability(score) {
        if (score >= 0.8) {
            return 'Highly Adaptable';
        }
        if (score >= 0.6) {
            return 'Adaptable';
        }
        if (score >= 0.4) {
            return 'Moderately Adaptable';
        }
        if (score >= 0.2) {
            return 'Rigid';
        }
        return 'Very Rigid';
    }

    calculateEngineeringBalance(genome) {
        if (!Array.isArray(genome)) {
            return 0;
        }
        
        // Calculate how balanced the genome is (avoid extreme values)
        const variance = genome.reduce((acc, trait) => {
            return acc + Math.pow(trait - 0.5, 2);
        }, 0) / genome.length;
        
        // Lower variance = better balance
        return Math.max(0, 1 - variance * 4); // Scale to 0-1
    }

    isEffectiveCombat(battleResult) {
        const redAccuracy = battleResult.redTeamStats?.accuracy || 0;
        const blueAccuracy = battleResult.blueTeamStats?.accuracy || 0;
        return redAccuracy > 0.4 || blueAccuracy > 0.4;
    }

    // UI Update Methods
    updateMetricsDisplay() {
        const metricsDiv = document.getElementById('live-engineer-metrics');
        if (!metricsDiv) {
            return;
        }
        
        const recentBattles = this.battleData.slice(-10);
        const avgDuration = recentBattles.length > 0 ? 
            recentBattles.reduce((sum, b) => sum + b.duration, 0) / recentBattles.length : 0;
        const avgEffectiveness = recentBattles.length > 0 ?
            recentBattles.reduce((sum, b) => sum + b.effectiveness, 0) / recentBattles.length : 0;
        
        metricsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                <div>
                    <strong>Battles Run:</strong> ${this.metrics.battlesRun}<br>
                    <strong>Battle Setups:</strong> ${this.metrics.battleSetups}<br>
                    <strong>Genome Evaluations:</strong> ${this.metrics.genomeEvaluations}
                </div>
                <div>
                    <strong>Performance Analyses:</strong> ${this.metrics.performanceAnalyses}<br>
                    <strong>Synergy Calculations:</strong> ${this.metrics.synergyCalculations}<br>
                    <strong>Adaptability Assessments:</strong> ${this.metrics.adaptabilityAssessments}
                </div>
                <div style="grid-column: 1 / -1; border-top: 1px solid #ff6600; padding-top: 5px; margin-top: 5px;">
                    <strong>Recent Performance:</strong><br>
                    Average Battle Duration: ${avgDuration.toFixed(1)}s<br>
                    Average Effectiveness: ${(avgEffectiveness * 100).toFixed(1)}%<br>
                    Total Battles Analyzed: ${this.battleData.length}
                </div>
            </div>
        `;
    }

    updateLogsDisplay() {
        const logsDiv = document.getElementById('engineer-logs');
        if (!logsDiv) {
            return;
        }
        
        const recentLogs = this.logs.slice(-20).reverse();
        logsDiv.innerHTML = recentLogs.map(log => {
            const colorMap = {
                'BATTLE_SETUP': '#00ff88',
                'BATTLE_EXECUTION': '#ff6600',
                'GENOME_EVALUATION': '#ffff00',
                'TEAM_SYNERGY': '#00ffff',
                'ADAPTABILITY': '#ff00ff',
                'PERFORMANCE_ANALYSIS': '#ffffff'
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

    updatePerformanceCharts() {
        this.updateEffectivenessChart();
        this.updateEngagementChart();
        this.updateDurationChart();
    }

    updateEffectivenessChart() {
        const chartContainer = document.getElementById('performance-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing effectiveness chart
        const existingChart = document.getElementById('effectiveness-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'effectiveness-chart';
        chartDiv.className = 'chart';
        
        const recentBattles = this.battleData.slice(-20);
        if (recentBattles.length === 0) {
            return;
        }
        
        const labels = recentBattles.map((_, i) => `Battle ${i + 1}`);
        const effectiveness = recentBattles.map(b => (b.effectiveness * 100).toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>🎯 Battle Effectiveness Trend</h4>
            <canvas id="effectiveness-canvas" width="400" height="150"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        // Simple canvas chart
        const canvas = document.getElementById('effectiveness-canvas');
        const ctx = canvas.getContext('2d');
        
        this.drawLineChart(ctx, labels, effectiveness, '#ff6600', 'Effectiveness %');
    }

    updateEngagementChart() {
        const chartContainer = document.getElementById('battle-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing engagement chart
        const existingChart = document.getElementById('engagement-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'engagement-chart';
        chartDiv.className = 'chart';
        
        const recentBattles = this.battleData.slice(-15);
        if (recentBattles.length === 0) {
            return;
        }
        
        const labels = recentBattles.map((_, i) => `B${i + 1}`);
        const engagement = recentBattles.map(b => (b.engagement * 100).toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>⚔️ Battle Engagement Level</h4>
            <canvas id="engagement-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('engagement-canvas');
        const ctx = canvas.getContext('2d');
        
        this.drawLineChart(ctx, labels, engagement, '#00ff88', 'Engagement %');
    }

    updateDurationChart() {
        const chartContainer = document.getElementById('battle-analysis-charts');
        if (!chartContainer) {
            return;
        }
        
        // Remove existing duration chart
        const existingChart = document.getElementById('duration-chart');
        if (existingChart) {
            existingChart.remove();
        }
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'duration-chart';
        chartDiv.className = 'chart';
        
        const recentBattles = this.battleData.slice(-15);
        if (recentBattles.length === 0) {
            return;
        }
        
        const labels = recentBattles.map((_, i) => `B${i + 1}`);
        const durations = recentBattles.map(b => b.duration.toFixed(1));
        
        chartDiv.innerHTML = `
            <h4>⏱️ Battle Duration Trend</h4>
            <canvas id="duration-canvas" width="400" height="120"></canvas>
        `;
        
        chartContainer.appendChild(chartDiv);
        
        const canvas = document.getElementById('duration-canvas');
        const ctx = canvas.getContext('2d');
        
        this.drawLineChart(ctx, labels, durations, '#ffff00', 'Duration (s)');
    }

    drawLineChart(ctx, labels, data, color, yLabel) {
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
            this.updateLLMStatus(); // Refresh LLM status when dialog is shown
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
            battlesRun: 0,
            battleSetups: 0,
            genomeEvaluations: 0,
            performanceAnalyses: 0,
            synergyCalculations: 0,
            adaptabilityAssessments: 0
        };
        this.battleData = [];
        this.performanceHistory = {
            red: { genomes: [], performance: [], battles: [] },
            blue: { genomes: [], performance: [], battles: [] }
        };
        
        this.updateMetricsDisplay();
        this.updateLogsDisplay();
        this.updatePerformanceCharts();
        
        this.log('SYSTEM', 'Engineer Insights dashboard reset');
    }

    // Export data for analysis
    exportData() {
        return {
            metrics: this.metrics,
            logs: this.logs,
            battleData: this.battleData,
            performanceHistory: this.performanceHistory,
            timestamp: Date.now()
        };
    }
}

// Export to global scope
window.EngineerInsights = EngineerInsights;

// Auto-initialize if we're in a browser environment
if (typeof window !== 'undefined' && window.document) {
    window.engineerInsights = new EngineerInsights();
}
