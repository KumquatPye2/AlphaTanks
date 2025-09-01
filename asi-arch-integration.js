// ASI-ARCH Integration Interface
// Provides a clean interface for integrating LLM-enhanced ASI-ARCH with the existing game
class ASIArchIntegration {
    constructor() {
        this.llmASIArch = new LLMEnhancedASIArch();
        this.isEnabled = window.CONFIG?.asiArch?.enableComponents?.llmJudge || false;
        this.insights = [];
        this.experimentResults = [];
        // Initialize UI feedback
        this.initializeUI();
    }
    getDisplayMode() {
        console.log('ASI-ARCH: Checking display mode...');
        console.log('- isEnabled:', this.isEnabled);
        console.log('- CONFIG.development.enableMockMode:', window.CONFIG?.development?.enableMockMode);
        console.log('- apiKeyManager.hasValidApiKey():', window.apiKeyManager?.hasValidApiKey());
        console.log('- CONFIG.deepseek.apiKey length:', window.CONFIG?.deepseek?.apiKey?.length || 0);
        
        if (!this.isEnabled) {
            console.log('ASI-ARCH: Returning Rule-Based (not enabled)');
            return 'Rule-Based';
        }
        
        // Check if mock mode is enabled
        if (window.CONFIG?.development?.enableMockMode === true) {
            console.log('ASI-ARCH: Returning Mock Mode (explicitly enabled)');
            return 'Mock Mode';
        }
        
        // Check if we have a valid API key
        const hasApiKey = window.apiKeyManager?.hasValidApiKey() || 
                         (window.CONFIG?.deepseek?.apiKey && window.CONFIG.deepseek.apiKey.length > 0);
        
        const result = hasApiKey ? 'AI-Enhanced' : 'Mock Mode';
        console.log('ASI-ARCH: Returning', result, '(hasApiKey:', hasApiKey, ')');
        return result;
    }

    initializeUI() {
        // Add ASI-ARCH status indicator to UI
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'asi-arch-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 11px;
            z-index: 999;
            max-width: 250px;
            pointer-events: none;
        `;
        statusIndicator.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>ASI-ARCH</strong>
                <span id="asi-arch-toggle" style="cursor: pointer; padding: 2px 6px; background: rgba(255,255,255,0.2); border-radius: 3px; font-size: 10px; pointer-events: auto;">−</span>
            </div>
            <div id="asi-arch-details">
                <div id="asi-arch-mode">Mode: ${this.getDisplayMode()}</div>
                <div id="asi-arch-experiments">Experiments: 0</div>
                <div id="asi-arch-discoveries">Candidates: 0</div>
                <div id="asi-arch-fitness">Avg Fitness: 0.50</div>
            </div>
        `;
        document.body.appendChild(statusIndicator);
        // Add toggle functionality
        const toggleButton = document.getElementById('asi-arch-toggle');
        const detailsDiv = document.getElementById('asi-arch-details');
        let isMinimized = false;
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                isMinimized = !isMinimized;
                if (isMinimized) {
                    detailsDiv.style.display = 'none';
                    toggleButton.textContent = '+';
                    statusIndicator.style.maxWidth = '120px';
                } else {
                    detailsDiv.style.display = 'block';
                    toggleButton.textContent = '−';
                    statusIndicator.style.maxWidth = '250px';
                }
            });
        }
    }
    updateUI(metrics) {
        const experimentsEl = document.getElementById('asi-arch-experiments');
        const discoveriesEl = document.getElementById('asi-arch-discoveries');
        const fitnessEl = document.getElementById('asi-arch-fitness');
        if (experimentsEl) {
            experimentsEl.textContent = `Experiments: ${metrics.experimentsCompleted}`;
        }
        if (discoveriesEl) {
            discoveriesEl.textContent = `Candidates: ${metrics.candidatesDiscovered}`;
        }
        if (fitnessEl) {
            fitnessEl.textContent = `Avg Fitness: ${metrics.avgFitness.toFixed(3)}`;
        }
    }
    // Main integration method - called after each battle
    async processBattleResult(redTeam, blueTeam, battleResult) {
        if (!this.isEnabled) {
            return this.processBasicResult(redTeam, blueTeam, battleResult);
        }
        try {
            // Run full ASI-ARCH pipeline
            const result = await this.llmASIArch.runExperimentCycle(redTeam, blueTeam, battleResult);
            // Store results
            this.experimentResults.push({
                timestamp: Date.now(),
                battleResult,
                asiArchResult: result
            });
            // Update UI
            this.updateUI(result.scalingMetrics);
            // Generate insights for display
            this.generateDisplayInsights(result);
            // Return enhanced analysis
            return {
                type: 'llm_enhanced',
                analysis: result.analysis,
                proposals: result.proposals,
                evaluations: result.evaluations,
                scalingMetrics: result.scalingMetrics,
                insights: this.insights.slice(-5) // Last 5 insights
            };
        } catch (error) {
            return this.processBasicResult(redTeam, blueTeam, battleResult);
        }
    }
    processBasicResult(redTeam, blueTeam, battleResult) {
        // Fallback to basic analysis
        return {
            type: 'basic',
            analysis: {
                quantitative: {
                    winRate: battleResult.winner !== 'timeout' ? 1 : 0,
                    efficiency: Math.max(0, (60 - battleResult.duration) / 60),
                    decisiveness: battleResult.winner !== 'timeout' ? 0.8 : 0.3
                },
                qualitative: {
                    insights: ['Basic analysis - LLM features disabled'],
                    confidence: 0.5
                }
            },
            insights: ['Standard rule-based analysis']
        };
    }
    generateDisplayInsights(result) {
        const insights = [];
        // Analysis insights
        if (result.analysis.qualitative.insights) {
            insights.push(...result.analysis.qualitative.insights.map(insight => ({
                type: 'analysis',
                content: insight,
                timestamp: Date.now(),
                confidence: result.analysis.qualitative.confidence || 0.7
            })));
        }
        // Proposal insights
        if (result.proposals.length > 0) {
            const bestProposal = result.evaluations[0];
            if (bestProposal) {
                insights.push({
                    type: 'proposal',
                    content: `New strategy proposed: ${bestProposal.reasoning || 'Enhanced tactical approach'}`,
                    timestamp: Date.now(),
                    confidence: bestProposal.confidence || 0.7,
                    fitness: bestProposal.compositeFitness
                });
            }
        }
        // Scaling insights
        const scalingMetrics = result.scalingMetrics;
        if (scalingMetrics.fitnessImprovement > 0.05) {
            insights.push({
                type: 'scaling',
                content: `Significant improvement detected: +${(scalingMetrics.fitnessImprovement * 100).toFixed(1)}% fitness gain`,
                timestamp: Date.now(),
                confidence: 0.9
            });
        }
        // Emergent pattern insights
        if (result.analysis.emergentPatterns.length > 0) {
            insights.push({
                type: 'pattern',
                content: `Emergent patterns: ${result.analysis.emergentPatterns.join(', ')}`,
                timestamp: Date.now(),
                confidence: 0.8
            });
        }
        // Add to insights history
        this.insights.push(...insights);
        // Keep last 20 insights
        if (this.insights.length > 20) {
            this.insights = this.insights.slice(-20);
        }
    }
    // Interface for getting candidate genomes for evolution
    getBestCandidates(count = 5) {
        if (!this.isEnabled || this.llmASIArch.candidatePool.length === 0) {
            return [];
        }
        return this.llmASIArch.candidatePool
            .slice(0, count)
            .map(candidate => ({
                genome: candidate.data[0],
                performance: candidate.performance,
                source: 'asi_arch_candidate'
            }));
    }
    // Get recent insights for display
    getRecentInsights(count = 5) {
        return this.insights.slice(-count);
    }
    // Get performance metrics
    getPerformanceMetrics() {
        if (!this.isEnabled) {
            return {
                experimentsCompleted: 0,
                candidatesDiscovered: 0,
                avgFitness: 0.5,
                scalingLaw: 'N/A - LLM features disabled'
            };
        }
        return this.llmASIArch.calculateScalingMetrics();
    }
    // Export experiment data for analysis
    exportExperimentData() {
        return {
            configuration: window.CONFIG,
            experimentResults: this.experimentResults,
            insights: this.insights,
            candidatePool: this.llmASIArch.candidatePool,
            fitnessHistory: this.llmASIArch.fitnessHistory,
            timestamp: Date.now(),
            version: '1.0.0'
        };
    }
    // Configuration methods
    enableLLMFeatures() {
        this.isEnabled = true;
        if (window.CONFIG?.asiArch?.enableComponents) {
            window.CONFIG.asiArch.enableComponents.llmJudge = true;
        }
        this.updateModeDisplay();
        this.refreshInsightDialogStatus();
    }
    disableLLMFeatures() {
        this.isEnabled = false;
        if (window.CONFIG?.asiArch?.enableComponents) {
            window.CONFIG.asiArch.enableComponents.llmJudge = false;
        }
        this.updateModeDisplay();
        this.refreshInsightDialogStatus();
    }
    refreshInsightDialogStatus() {
        // Update all insight dialog LLM status displays
        if (window.analystInsights && typeof window.analystInsights.updateLLMStatus === 'function') {
            window.analystInsights.updateLLMStatus();
        }
        if (window.engineerInsights && typeof window.engineerInsights.updateLLMStatus === 'function') {
            window.engineerInsights.updateLLMStatus();
        }
        if (window.researcherInsights && typeof window.researcherInsights.updateLLMStatus === 'function') {
            window.researcherInsights.updateLLMStatus();
        }
        if (window.cognitionInsights && typeof window.cognitionInsights.updateLLMStatus === 'function') {
            window.cognitionInsights.updateLLMStatus();
        }
    }
    updateModeDisplay() {
        const modeEl = document.getElementById('asi-arch-mode');
        const newMode = this.getDisplayMode();
        console.log('ASI-ARCH: Updating mode display to:', newMode);
        
        if (modeEl) {
            modeEl.textContent = `Mode: ${newMode}`;
            console.log('ASI-ARCH: Mode display updated successfully');
        } else {
            console.warn('ASI-ARCH: Mode element not found');
        }
    }
    // Debug methods
    getDebugInfo() {
        return {
            enabled: this.isEnabled,
            candidatePoolSize: this.llmASIArch.candidatePool.length,
            experimentCount: this.llmASIArch.experimentCounter,
            insightsCount: this.insights.length,
            lastExperiment: this.experimentResults.slice(-1)[0] || null,
            config: window.CONFIG
        };
    }
    // Mock mode for development
    enableMockMode() {
        if (window.CONFIG?.development) {
            window.CONFIG.development.enableMockMode = true;
        }
    }
    disableMockMode() {
        if (window.CONFIG?.development) {
            window.CONFIG.development.enableMockMode = false;
        }
    }
}
// Global instance for easy access
let globalASIArchIntegration = null;
// Initialize ASI-ARCH integration
function initializeASIArch() {
    if (!globalASIArchIntegration) {
        globalASIArchIntegration = new ASIArchIntegration();
        // Expose to window for debugging
        window.asiArch = globalASIArchIntegration;
    }
    return globalASIArchIntegration;
}
// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeASIArch);
    } else {
        initializeASIArch();
    }
    window.ASIArchIntegration = ASIArchIntegration;
    window.initializeASIArch = initializeASIArch;
} else {
    module.exports = { ASIArchIntegration, initializeASIArch };
}
