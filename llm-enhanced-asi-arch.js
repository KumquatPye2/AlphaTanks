// Enhanced ASI-ARCH Modules with DeepSeek LLM Integration
// Implements the full ASI-ARCH methodology from the paper
class LLMEnhancedASIArch {
    constructor(config = null, deepSeekClient = null) {
        this.config = config || window.CONFIG?.asiArch || {};
        this.deepSeekClient = deepSeekClient || new DeepSeekClient();
        this.candidatePool = [];
        this.battleHistory = [];
        this.cognitionBase = this.initializeCognitionBase();
        this.experimentCounter = 0;
        this.fitnessHistory = [];
        
        // Fitness weights configuration
        this.fitnessWeights = this.config.fitnessWeights || {
            quantitative: 0.33,
            qualitative: 0.33,
            innovation: 0.34
        };
        
        // Enhanced battle scenarios configuration
        this.scenarioConfig = this.config.battleScenarios || {};
        this.currentScenarioIndex = 0;
        this.scenarioRotationCounter = 0;
        this.scenarios = Object.keys(this.scenarioConfig.scenarios || {
            'open_field': {},
            'urban_warfare': {},
            'chokepoint_control': {},
            'fortress_assault': {}
        });
        this.multiScenarioResults = new Map(); // Track performance across scenarios
    }
    initializeCognitionBase() {
        // Initialize with tank battle tactical knowledge
        // In the full ASI-ARCH, this would be extracted from ~100 research papers
        return [
            {
                scenario: "High aggression scenarios with coordinated team movement",
                algorithm: "Aggressive positioning with defensive fallback patterns",
                context: "Effective when teams have health advantage and numerical superiority",
                effectiveness: 0.85
            },
            {
                scenario: "Defensive positioning under pressure",
                algorithm: "Dynamic retreat with covering fire patterns",
                context: "Optimal for preserving team strength while maintaining tactical options",
                effectiveness: 0.78
            },
            {
                scenario: "Precision targeting in chaotic environments",
                algorithm: "Target prioritization based on threat assessment and proximity",
                context: "Balances immediate threats with strategic value of targets",
                effectiveness: 0.82
            },
            {
                scenario: "Formation maintenance during movement",
                algorithm: "Adaptive spacing with leader-follower coordination",
                context: "Maintains tactical cohesion while allowing individual maneuvering",
                effectiveness: 0.75
            },
            {
                scenario: "Speed optimization for tactical advantage",
                algorithm: "Variable speed based on battlefield awareness and team positioning",
                context: "Optimizes positioning speed while maintaining reaction capability",
                effectiveness: 0.80
            }
        ];
    }
    // Core ASI-ARCH Pipeline Implementation with Enhanced Scenarios
    async runExperimentCycle(redTeam, blueTeam, battleResult) {
        this.experimentCounter++;
        
        // Determine current scenario (rotation-based)
        const currentScenario = this.getCurrentScenario();
        
        // Update candidate pool and history with scenario context
        this.updateCandidatePool(redTeam, blueTeam, battleResult, currentScenario);
        this.battleHistory.push({
            experiment: this.experimentCounter,
            redTeam: redTeam,
            blueTeam: blueTeam,
            result: battleResult,
            scenario: currentScenario.id,
            seed: battleResult.seed || null,
            timestamp: Date.now()
        });
        
        // Update multi-scenario results for fitness aggregation
        this.updateMultiScenarioResults(redTeam, blueTeam, battleResult, currentScenario.id);
        
        // Run ASI-ARCH pipeline
        const analysis = await this.analyzeExperiment(battleResult);
        const proposals = await this.generateProposals();
        const evaluations = await this.evaluateProposals(proposals, currentScenario);
        
        // Update fitness tracking
        this.updateFitnessHistory();
        
        // Advance scenario rotation
        this.advanceScenarioRotation();
        
        return {
            analysis,
            proposals,
            evaluations,
            candidatePoolSize: this.candidatePool.length,
            currentScenario: currentScenario.id,
            scenarioMetrics: this.getScenarioMetrics(),
            scalingMetrics: this.calculateScalingMetrics()
        };
    }
    
    getCurrentScenario() {
        if (!this.scenarioConfig.enabled) {
            return { id: 'open_field', config: this.scenarioConfig.scenarios?.open_field || {} };
        }
        
        const scenarioId = this.scenarios[this.currentScenarioIndex] || 'open_field';
        return {
            id: scenarioId,
            config: this.scenarioConfig.scenarios?.[scenarioId] || {}
        };
    }
    
    advanceScenarioRotation() {
        if (!this.scenarioConfig.enabled) return;
        
        this.scenarioRotationCounter++;
        const rotationInterval = this.scenarioConfig.rotationInterval || 5;
        
        if (this.scenarioRotationCounter >= rotationInterval) {
            this.currentScenarioIndex = (this.currentScenarioIndex + 1) % this.scenarios.length;
            this.scenarioRotationCounter = 0;
            
            // Emit scenario change event
            if (window.emitASIArchEvent) {
                window.emitASIArchEvent('scenario', 'scenario_change', {
                    newScenario: this.scenarios[this.currentScenarioIndex],
                    experimentCount: this.experimentCounter
                });
            }
        }
    }
    
    updateMultiScenarioResults(redTeam, blueTeam, battleResult, scenarioId) {
        if (!this.multiScenarioResults.has(scenarioId)) {
            this.multiScenarioResults.set(scenarioId, {
                battles: [],
                redPerformance: [],
                bluePerformance: []
            });
        }
        
        const scenarioData = this.multiScenarioResults.get(scenarioId);
        scenarioData.battles.push(battleResult);
        scenarioData.redPerformance.push(this.calculateTeamPerformance(redTeam, battleResult, 'red'));
        scenarioData.bluePerformance.push(this.calculateTeamPerformance(blueTeam, battleResult, 'blue'));
        
        // Keep last 10 results per scenario
        if (scenarioData.battles.length > 10) {
            scenarioData.battles.shift();
            scenarioData.redPerformance.shift();
            scenarioData.bluePerformance.shift();
        }
    }
    
    getScenarioMetrics() {
        const metrics = {};
        for (const [scenarioId, data] of this.multiScenarioResults) {
            if (data.battles.length > 0) {
                metrics[scenarioId] = {
                    battlesPlayed: data.battles.length,
                    avgRedPerformance: data.redPerformance.reduce((a, b) => a + b, 0) / data.redPerformance.length,
                    avgBluePerformance: data.bluePerformance.reduce((a, b) => a + b, 0) / data.bluePerformance.length,
                    avgDuration: data.battles.reduce((sum, b) => sum + b.duration, 0) / data.battles.length,
                    timeouts: data.battles.filter(b => b.winner === 'timeout').length
                };
            }
        }
        return metrics;
    }
    updateCandidatePool(redTeam, blueTeam, battleResult, currentScenario = null) {
        const teams = [
            { 
                team: 'red', 
                data: redTeam, 
                performance: this.calculateTeamPerformance(redTeam, battleResult, 'red'),
                scenario: currentScenario?.id || 'unknown'
            },
            { 
                team: 'blue', 
                data: blueTeam, 
                performance: this.calculateTeamPerformance(blueTeam, battleResult, 'blue'),
                scenario: currentScenario?.id || 'unknown'
            }
        ];
        
        // Add high-performing teams to candidate pool
        teams.forEach(teamData => {
            if (teamData.performance > 0.6) { // Threshold for candidate inclusion
                // Calculate multi-scenario fitness if enabled
                const multiScenarioFitness = this.calculateMultiScenarioFitness(teamData);
                
                this.candidatePool.push({
                    ...teamData,
                    multiScenarioFitness,
                    experiment: this.experimentCounter,
                    timestamp: Date.now()
                });
            }
        });
        
        // Maintain pool size (use config value, default to 50)
        const maxPoolSize = this.config.candidatePoolSize || 50;
        
        // Sort by multi-scenario fitness if available, otherwise use single performance
        this.candidatePool.sort((a, b) => {
            const aFitness = a.multiScenarioFitness || a.performance;
            const bFitness = b.multiScenarioFitness || b.performance;
            return bFitness - aFitness;
        });
        
        this.candidatePool = this.candidatePool.slice(0, maxPoolSize);
    }
    
    calculateMultiScenarioFitness(teamData) {
        if (!this.scenarioConfig.multiScenarioFitness?.enabled) {
            return teamData.performance; // Fall back to single-scenario fitness
        }
        
        const scenarioResults = this.multiScenarioResults.get(teamData.scenario);
        if (!scenarioResults || scenarioResults.battles.length < 2) {
            return teamData.performance; // Not enough data for multi-scenario
        }
        
        const teamPerformances = teamData.team === 'red' ? 
            scenarioResults.redPerformance : scenarioResults.bluePerformance;
        
        // Calculate adaptability (performance across different scenarios)
        let adaptabilityScore = 0;
        let consistencyScore = 0;
        let specializationPenalty = 0;
        
        if (this.multiScenarioResults.size > 1) {
            const allScenarioPerformances = [];
            for (const [scenarioId, data] of this.multiScenarioResults) {
                const performances = teamData.team === 'red' ? data.redPerformance : data.bluePerformance;
                if (performances.length > 0) {
                    const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length;
                    allScenarioPerformances.push(avgPerformance);
                }
            }
            
            if (allScenarioPerformances.length > 1) {
                // Adaptability: how well the team performs across different scenarios
                const meanPerformance = allScenarioPerformances.reduce((a, b) => a + b, 0) / allScenarioPerformances.length;
                adaptabilityScore = meanPerformance * this.scenarioConfig.multiScenarioFitness.adaptabilityWeight;
                
                // Consistency: low variance across scenarios
                const variance = allScenarioPerformances.reduce((sum, perf) => 
                    sum + Math.pow(perf - meanPerformance, 2), 0) / allScenarioPerformances.length;
                consistencyScore = (1 - variance) * this.scenarioConfig.multiScenarioFitness.consistencyWeight;
                
                // Specialization penalty: penalize teams that only work in one scenario
                const effectiveScenarios = allScenarioPerformances.filter(perf => perf > 0.6).length;
                if (effectiveScenarios <= 1) {
                    specializationPenalty = this.scenarioConfig.multiScenarioFitness.specializationPenalty;
                }
            }
        }
        
        // Combine base performance with multi-scenario metrics
        return Math.max(0, Math.min(1, 
            teamData.performance + adaptabilityScore + consistencyScore - specializationPenalty
        ));
    }
    calculateTeamPerformance(team, battleResult, teamName) {
        // Quantitative performance calculation
        const isWinner = battleResult.winner === teamName;
        const survivalBonus = team.reduce((sum, tank) => sum + (tank.health > 0 ? 1 : 0), 0) / team.length;
        const efficiencyBonus = battleResult.duration > 30 ? 0.1 : 0; // Bonus for longer battles
        let basePerformance = isWinner ? 0.8 : 0.4;
        basePerformance += survivalBonus * 0.2;
        basePerformance += efficiencyBonus;
        return Math.min(basePerformance, 1.0);
    }
    async analyzeExperiment(battleResult) {
        // Use DeepSeek for deep analysis (ASI-ARCH Analyzer module)
        try {
            const llmAnalysis = await this.deepSeekClient.analyzeBattleResults(
                battleResult,
                this.calculatePerformanceTrends(),
                { experimentCount: this.experimentCounter, poolSize: this.candidatePool.length }
            );
            return {
                quantitative: this.calculateQuantitativeMetrics(battleResult),
                qualitative: llmAnalysis,
                emergentPatterns: this.identifyEmergentPatterns(),
                recommendations: llmAnalysis.recommendations || []
            };
        } catch (error) {
            return {
                quantitative: this.calculateQuantitativeMetrics(battleResult),
                qualitative: { insights: ['Fallback analysis'], confidence: 0.5 },
                emergentPatterns: [],
                recommendations: ['Continue current approach']
            };
        }
    }
    async generateProposals() {
        if (this.candidatePool.length === 0) {
            return [this.generateFallbackProposal()];
        }
        try {
            // Get current scenario context for proposal generation
            const currentScenario = this.getCurrentScenario();
            const scenarioMetrics = this.getScenarioMetrics();
            
            // Use DeepSeek for proposal generation (ASI-ARCH Researcher module)
            const llmProposal = await this.deepSeekClient.generateTacticalProposal(
                this.candidatePool,
                this.battleHistory.slice(-10), // Recent history
                this.cognitionBase,
                {
                    scenario: currentScenario,
                    scenarioMetrics: scenarioMetrics,
                    multiScenarioEnabled: this.scenarioConfig.multiScenarioFitness?.enabled || false
                }
            );
            return [
                this.convertLLMProposalToGenome(llmProposal),
                ...this.generateVariations(llmProposal, 2) // Generate 2 variations
            ];
        } catch (error) {
            return [this.generateFallbackProposal()];
        }
    }
    convertLLMProposalToGenome(llmProposal) {
        // Convert LLM proposal to tank genome format
        const baseGenome = this.candidatePool[0]?.data[0] || this.getDefaultGenome();
        const currentScenario = this.getCurrentScenario();
        
        return {
            id: `llm_${this.experimentCounter}_${Date.now()}`,
            speed: this.adjustParameter(baseGenome.speed, llmProposal.proposal.modifications),
            aggression: this.adjustParameter(baseGenome.aggression, llmProposal.proposal.modifications),
            accuracy: this.adjustParameter(baseGenome.accuracy, llmProposal.proposal.modifications),
            health: baseGenome.health,
            team: baseGenome.team,
            fitness: 0,
            source: 'llm_proposal',
            reasoning: llmProposal.rationale,
            expectedImprovement: llmProposal.expectedImprovement || 0.1,
            targetScenario: currentScenario?.id || 'unknown',
            scenarioSpecific: llmProposal.scenarioSpecific || false
        };
    }
    adjustParameter(currentValue, modifications) {
        // Parse LLM modifications and apply them
        const modText = modifications.join(' ').toLowerCase();
        let adjustment = 0;
        if (modText.includes('increase') || modText.includes('higher') || modText.includes('more')) {
            adjustment = 0.1;
        } else if (modText.includes('decrease') || modText.includes('lower') || modText.includes('less')) {
            adjustment = -0.1;
        } else if (modText.includes('moderate') || modText.includes('balance')) {
            adjustment = (Math.random() - 0.5) * 0.1;
        }
        return Math.max(0.1, Math.min(0.9, currentValue + adjustment));
    }
    generateVariations(baseProposal, count) {
        const variations = [];
        for (let i = 0; i < count; i++) {
            const variation = this.convertLLMProposalToGenome(baseProposal);
            // Add small random mutations
            variation.speed += (Math.random() - 0.5) * 0.1;
            variation.aggression += (Math.random() - 0.5) * 0.1;
            variation.accuracy += (Math.random() - 0.5) * 0.1;
            // Clamp values
            variation.speed = Math.max(0.1, Math.min(0.9, variation.speed));
            variation.aggression = Math.max(0.1, Math.min(0.9, variation.aggression));
            variation.accuracy = Math.max(0.1, Math.min(0.9, variation.accuracy));
            variation.id = `variation_${i}_${variation.id}`;
            variation.source = 'llm_variation';
            variations.push(variation);
        }
        return variations;
    }
    async evaluateProposals(proposals) {
        const evaluations = [];
        for (const proposal of proposals) {
            try {
                // Simulate battle performance (in real implementation, would run actual battles)
                const simulatedPerformance = this.simulateProposalPerformance(proposal);
                // Get LLM evaluation (ASI-ARCH Judge module)
                const llmEvaluation = await this.deepSeekClient.llmJudgeScore(
                    proposal,
                    simulatedPerformance,
                    this.getBaselinePerformance()
                );
                // Calculate composite fitness (ASI-ARCH Equation 2)
                const compositeFitness = this.calculateCompositeFitness(
                    simulatedPerformance,
                    llmEvaluation
                );
                evaluations.push({
                    proposal,
                    quantitativeScore: simulatedPerformance.score,
                    qualitativeScore: llmEvaluation.score,
                    compositeFitness,
                    reasoning: llmEvaluation.reasoning,
                    confidence: llmEvaluation.confidence
                });
            } catch (error) {
                evaluations.push({
                    proposal,
                    quantitativeScore: 0.5,
                    qualitativeScore: 0.5,
                    compositeFitness: 0.5,
                    reasoning: 'Evaluation failed, using fallback',
                    confidence: 0.3
                });
            }
        }
        return evaluations.sort((a, b) => b.compositeFitness - a.compositeFitness);
    }
    calculateCompositeFitness(quantitativeResults, qualitativeEvaluation) {
        // Implement ASI-ARCH Equation 2: Fitness = [σ(Δ_loss) + σ(Δ_benchmark) + LLM_judge] / 3
        const sigmoidTransform = (x) => 1 / (1 + Math.exp(-10 * (x - 0.5)));
        const quantitativeScore = sigmoidTransform(quantitativeResults.score);
        const qualitativeScore = qualitativeEvaluation.score;
        const innovationScore = this.assessInnovation(quantitativeResults);
        return (
            quantitativeScore * this.fitnessWeights.quantitative +
            qualitativeScore * this.fitnessWeights.qualitative +
            innovationScore * this.fitnessWeights.innovation
        );
    }
    assessInnovation(performance) {
        // Assess tactical innovation based on novelty and effectiveness
        const noveltyScore = performance.novelPatterns || 0.5;
        const effectivenessScore = performance.score;
        return (noveltyScore + effectivenessScore) / 2;
    }
    simulateProposalPerformance(proposal) {
        // Simulate battle performance (placeholder for actual battle testing)
        const baseScore = 0.6;
        const improvementFactor = proposal.expectedImprovement || 0.1;
        const randomFactor = (Math.random() - 0.5) * 0.2;
        const score = Math.max(0.1, Math.min(1.0, baseScore + improvementFactor + randomFactor));
        return {
            score,
            novelPatterns: Math.random() * 0.3 + 0.4, // 0.4-0.7 range
            tacticalEffectiveness: score * 0.9 + 0.1,
            adaptability: Math.random() * 0.4 + 0.5
        };
    }
    // Helper methods
    calculateQuantitativeMetrics(battleResult) {
        return {
            winRate: battleResult.winner !== 'timeout' ? 1 : 0,
            efficiency: Math.max(0, (120 - battleResult.duration) / 120),
            decisiveness: battleResult.winner !== 'timeout' ? 0.8 : 0.3
        };
    }
    calculatePerformanceTrends() {
        if (this.fitnessHistory.length < 2) {
            return { trend: 0, consistency: 0.5 };
        }
        const recent = this.fitnessHistory.slice(-5);
        const trend = recent.length > 1 ? 
            (recent[recent.length - 1] - recent[0]) / recent.length : 0;
        return {
            trend,
            consistency: 1 - (this.calculateVariance(recent) || 0.5),
            averageFitness: recent.reduce((sum, f) => sum + f, 0) / recent.length
        };
    }
    calculateVariance(values) {
        if (values.length === 0) {
            return 0;
        }
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    identifyEmergentPatterns() {
        // Identify patterns in successful strategies
        const patterns = [];
        if (this.candidatePool.length > 0) {
            const avgAggression = this.candidatePool.reduce((sum, c) => sum + c.data[0]?.aggression || 0.5, 0) / this.candidatePool.length;
            const avgSpeed = this.candidatePool.reduce((sum, c) => sum + c.data[0]?.speed || 0.5, 0) / this.candidatePool.length;
            if (avgAggression > 0.7) {
                patterns.push('high_aggression_preference');
            }
            if (avgSpeed > 0.7) {
                patterns.push('speed_optimization');
            }
            if (avgAggression < 0.4) {
                patterns.push('defensive_strategies');
            }
        }
        return patterns;
    }
    getCandidatePoolStatistics() {
        if (this.candidatePool.length === 0) {
            return {};
        }
        return {
            size: this.candidatePool.length,
            avgPerformance: this.candidatePool.reduce((sum, c) => sum + c.performance, 0) / this.candidatePool.length,
            bestPerformance: Math.max(...this.candidatePool.map(c => c.performance)),
            diversity: this.calculatePoolDiversity()
        };
    }
    calculatePoolDiversity() {
        // Measure genetic diversity in candidate pool
        if (this.candidatePool.length < 2) {
            return 0;
        }
        let totalDistance = 0;
        let comparisons = 0;
        for (let i = 0; i < this.candidatePool.length; i++) {
            for (let j = i + 1; j < this.candidatePool.length; j++) {
                const tank1 = this.candidatePool[i].data[0] || {};
                const tank2 = this.candidatePool[j].data[0] || {};
                const distance = Math.sqrt(
                    Math.pow((tank1.speed || 0.5) - (tank2.speed || 0.5), 2) +
                    Math.pow((tank1.aggression || 0.5) - (tank2.aggression || 0.5), 2) +
                    Math.pow((tank1.accuracy || 0.5) - (tank2.accuracy || 0.5), 2)
                );
                totalDistance += distance;
                comparisons++;
            }
        }
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }
    updateFitnessHistory() {
        const avgFitness = this.candidatePool.length > 0 ?
            this.candidatePool.reduce((sum, c) => sum + c.performance, 0) / this.candidatePool.length :
            0.5;
        this.fitnessHistory.push(avgFitness);
        // Keep last 50 entries
        if (this.fitnessHistory.length > 50) {
            this.fitnessHistory = this.fitnessHistory.slice(-50);
        }
    }
    calculateScalingMetrics() {
        // Demonstrate scaling law: More computation = More discoveries
        return {
            experimentsCompleted: this.experimentCounter,
            candidatesDiscovered: this.candidatePool.length,
            discoveryRate: this.candidatePool.length / Math.max(1, this.experimentCounter),
            avgFitness: this.fitnessHistory.length > 0 ? 
                this.fitnessHistory.reduce((sum, f) => sum + f, 0) / this.fitnessHistory.length : 0.5,
            fitnessImprovement: this.fitnessHistory.length > 10 ?
                this.fitnessHistory.slice(-5).reduce((sum, f) => sum + f, 0) / 5 -
                this.fitnessHistory.slice(0, 5).reduce((sum, f) => sum + f, 0) / 5 : 0
        };
    }
    getDefaultGenome() {
        return {
            speed: 0.5,
            aggression: 0.5,
            accuracy: 0.5,
            health: 100,
            team: 'red',
            fitness: 0
        };
    }
    generateFallbackProposal() {
        const base = this.getDefaultGenome();
        return {
            ...base,
            id: `fallback_${this.experimentCounter}_${Date.now()}`,
            source: 'fallback',
            reasoning: 'Generated as fallback when LLM unavailable',
            expectedImprovement: 0.05
        };
    }
    getBaselinePerformance() {
        return 0.6; // Baseline performance reference
    }
}
// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.LLMEnhancedASIArch = LLMEnhancedASIArch;
} else {
    module.exports = LLMEnhancedASIArch;
}
