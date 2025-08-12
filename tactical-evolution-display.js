/**
 * Tactical Evolution Display
 * Enhanced visualization for the improved evolution system that rewards tactical diversity
 */
class TacticalEvolutionDisplay {
    constructor() {
        this.strategyCounts = {
            red: new Map(),
            blue: new Map()
        };
        this.fitnessBreakdown = {
            red: { tactical: 0, performance: 0, diversity: 0, innovation: 0 },
            blue: { tactical: 0, performance: 0, diversity: 0, innovation: 0 }
        };
        this.isReady = false;
        this.setupDisplay();
    }

    setupDisplay() {
        // The display is now integrated into the sidebar - no need to create floating panel
        // Just ensure we have the required elements
        const requiredElements = [
            'red-strategy-list',
            'blue-strategy-list',
            'red-diversity',
            'blue-diversity',
            'red-champions',
            'blue-champions',
            'current-generation',
            'total-experiments',
            'red-innovation',
            'blue-innovation',
            'last-battle-duration',
            'tactical-complexity',
            'hill-changes'
        ];
        
        // Check if elements exist - if not, the HTML hasn't loaded yet
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.log('Tactical Evolution Display: Missing elements:', missingElements);
            // Try again in 100ms
            setTimeout(() => this.setupDisplay(), 100);
            return;
        }
        
        console.log('Tactical Evolution Display: All sidebar elements found, ready for updates');
        this.isReady = true;
    }

    updateDisplay(evolutionEngine, battleResult = null) {
        // Only update if the sidebar elements are ready
        if (!this.isReady) {
            console.log('Tactical Evolution Display: Not ready yet, skipping update');
            this.setupDisplay(); // Try to initialize again
            return;
        }
        
        this.updateStrategyDiversity(evolutionEngine);
        this.updateFitnessBreakdown(evolutionEngine);
        this.updateInnovationMetrics(evolutionEngine);
        if (battleResult) {
            this.updateBattleComplexity(battleResult);
        }
    }

    updateStrategyDiversity(evolutionEngine) {
        // Update sidebar elements instead of floating panel
        const redStrategyList = document.getElementById('red-strategy-list');
        const blueStrategyList = document.getElementById('blue-strategy-list');
        const redDiversity = document.getElementById('red-diversity');
        const blueDiversity = document.getElementById('blue-diversity');
        
        if (!redStrategyList || !blueStrategyList || !redDiversity || !blueDiversity) {
            return;
        }

        // Count strategies in candidate pool
        this.strategyCounts.red.clear();
        this.strategyCounts.blue.clear();

        evolutionEngine.candidatePool.forEach(candidate => {
            if (candidate.team && candidate.genome) {
                const strategy = this.classifyAdvancedStrategy(candidate.genome);
                const teamCounts = this.strategyCounts[candidate.team];
                if (teamCounts) {
                    teamCounts.set(strategy, (teamCounts.get(strategy) || 0) + 1);
                }
            }
        });

        // Update Red team
        const redCounts = this.strategyCounts.red;
        const redTotal = Array.from(redCounts.values()).reduce((sum, count) => sum + count, 0);
        
        if (redTotal === 0) {
            redStrategyList.innerHTML = 'No candidates';
            redDiversity.textContent = '0%';
        } else {
            const redDiversityScore = redCounts.size / Math.max(redTotal, 1);
            redDiversity.textContent = `${(redDiversityScore * 100).toFixed(0)}%`;
            
            const redSorted = Array.from(redCounts.entries()).sort((a, b) => b[1] - a[1]);
            let redHtml = '';
            redSorted.forEach(([strategy, count]) => {
                const percentage = (count / redTotal * 100).toFixed(0);
                const emoji = this.getStrategyEmoji(strategy);
                redHtml += `<div>${emoji} ${strategy}: ${count} (${percentage}%)</div>`;
            });
            redStrategyList.innerHTML = redHtml;
        }

        // Update Blue team
        const blueCounts = this.strategyCounts.blue;
        const blueTotal = Array.from(blueCounts.values()).reduce((sum, count) => sum + count, 0);
        
        if (blueTotal === 0) {
            blueStrategyList.innerHTML = 'No candidates';
            blueDiversity.textContent = '0%';
        } else {
            const blueDiversityScore = blueCounts.size / Math.max(blueTotal, 1);
            blueDiversity.textContent = `${(blueDiversityScore * 100).toFixed(0)}%`;
            
            const blueSorted = Array.from(blueCounts.entries()).sort((a, b) => b[1] - a[1]);
            let blueHtml = '';
            blueSorted.forEach(([strategy, count]) => {
                const percentage = (count / blueTotal * 100).toFixed(0);
                const emoji = this.getStrategyEmoji(strategy);
                blueHtml += `<div>${emoji} ${strategy}: ${count} (${percentage}%)</div>`;
            });
            blueStrategyList.innerHTML = blueHtml;
        }
    }

    updateFitnessBreakdown(evolutionEngine) {
        const redChampions = document.getElementById('red-champions');
        const blueChampions = document.getElementById('blue-champions');
        
        if (!redChampions || !blueChampions) {
            return;
        }

        // Get top candidates from each team for analysis
        const redCandidates = evolutionEngine.candidatePool
            .filter(c => c.team === 'red')
            .sort((a, b) => b.fitness - a.fitness)
            .slice(0, 3);

        const blueCandidates = evolutionEngine.candidatePool
            .filter(c => c.team === 'blue')
            .sort((a, b) => b.fitness - a.fitness)
            .slice(0, 3);

        // Update Red champions
        if (redCandidates.length === 0) {
            redChampions.innerHTML = 'No data';
        } else {
            const avgFitness = redCandidates.reduce((sum, c) => sum + c.fitness, 0) / redCandidates.length;
            let redHtml = `<div>Avg: ${avgFitness.toFixed(3)}</div>`;
            
            redCandidates.forEach((candidate, i) => {
                const strategy = this.classifyAdvancedStrategy(candidate.genome);
                const emoji = this.getStrategyEmoji(strategy);
                redHtml += `<div>${i + 1}. ${emoji} ${candidate.fitness.toFixed(3)}</div>`;
            });
            redChampions.innerHTML = redHtml;
        }

        // Update Blue champions
        if (blueCandidates.length === 0) {
            blueChampions.innerHTML = 'No data';
        } else {
            const avgFitness = blueCandidates.reduce((sum, c) => sum + c.fitness, 0) / blueCandidates.length;
            let blueHtml = `<div>Avg: ${avgFitness.toFixed(3)}</div>`;
            
            blueCandidates.forEach((candidate, i) => {
                const strategy = this.classifyAdvancedStrategy(candidate.genome);
                const emoji = this.getStrategyEmoji(strategy);
                blueHtml += `<div>${i + 1}. ${emoji} ${candidate.fitness.toFixed(3)}</div>`;
            });
            blueChampions.innerHTML = blueHtml;
        }
    }

    updateInnovationMetrics(evolutionEngine) {
        const currentGeneration = document.getElementById('current-generation');
        const totalExperiments = document.getElementById('total-experiments');
        const redInnovation = document.getElementById('red-innovation');
        const blueInnovation = document.getElementById('blue-innovation');
        
        if (!currentGeneration || !totalExperiments || !redInnovation || !blueInnovation) {
            return;
        }

        // Update basic metrics
        currentGeneration.textContent = evolutionEngine.currentGeneration;
        totalExperiments.textContent = evolutionEngine.totalExperiments;

        // Count unconventional strategies
        const unconventionalCount = {
            red: 0,
            blue: 0
        };

        evolutionEngine.candidatePool.forEach(candidate => {
            if (candidate.team && candidate.genome) {
                if (this.isUnconventionalStrategy(candidate.genome)) {
                    unconventionalCount[candidate.team]++;
                }
            }
        });

        // Update innovation percentages
        const redCandidates = evolutionEngine.candidatePool.filter(c => c.team === 'red');
        const blueCandidates = evolutionEngine.candidatePool.filter(c => c.team === 'blue');
        
        const redInnovationRate = redCandidates.length > 0 ? (unconventionalCount.red / redCandidates.length * 100) : 0;
        const blueInnovationRate = blueCandidates.length > 0 ? (unconventionalCount.blue / blueCandidates.length * 100) : 0;
        
        redInnovation.textContent = `${redInnovationRate.toFixed(0)}%`;
        blueInnovation.textContent = `${blueInnovationRate.toFixed(0)}%`;
    }

    updateBattleComplexity(battleResult) {
        const lastBattleDuration = document.getElementById('last-battle-duration');
        const tacticalComplexity = document.getElementById('tactical-complexity');
        const hillChanges = document.getElementById('hill-changes');
        
        if (!lastBattleDuration || !tacticalComplexity || !hillChanges) {
            return;
        }

        // Update battle duration
        lastBattleDuration.textContent = `${battleResult.duration.toFixed(1)}s`;

        // Update tactical complexity
        if (battleResult.tacticalMetrics) {
            const complexity = battleResult.tacticalMetrics.battleComplexity;
            tacticalComplexity.textContent = `${(complexity * 100).toFixed(0)}%`;
        } else {
            // Fallback calculation if tactical metrics not available
            let complexityScore = 0;
            if (battleResult.duration > 60) complexityScore += 30;
            else if (battleResult.duration > 30) complexityScore += 20;
            else complexityScore += 10;
            
            if (battleResult.totalCasualties && battleResult.totalCasualties > 2) {
                complexityScore += 20;
            }
            
            tacticalComplexity.textContent = `${Math.min(complexityScore, 100)}%`;
        }

        // Update hill changes
        if (battleResult.hillControlData) {
            hillChanges.textContent = battleResult.hillControlData.controlChanges || 0;
        } else {
            hillChanges.textContent = '0';
        }
    }

    classifyAdvancedStrategy(genome) {
        // Same classification as in evolution-engine.js
        const aggression = genome[0] || 0;
        const speed = genome[1] || 0;
        const accuracy = genome[2] || 0;
        const defense = genome[3] || 0;
        const teamwork = genome[4] || 0;
        const adaptability = genome[5] || 0;
        const learning = genome[6] || 0;
        const riskTaking = genome[7] || 0;
        const evasion = genome[8] || 0;
        
        if (accuracy > 0.7 && defense > 0.6 && aggression < 0.4) {
            return 'Sniper';
        }
        if (aggression > 0.7 && speed > 0.6 && riskTaking > 0.6) {
            return 'Berserker';
        }
        if (teamwork > 0.7 && adaptability > 0.6) {
            return 'Support';
        }
        if (evasion > 0.7 && speed > 0.6) {
            return 'Assassin';
        }
        if (learning > 0.7 && adaptability > 0.7) {
            return 'Adaptive';
        }
        if (defense > 0.8 && evasion > 0.6 && aggression < 0.4) {
            return 'Fortress';
        }
        if (speed > 0.8 && riskTaking > 0.7 && accuracy < 0.5) {
            return 'Scout';
        }
        if (accuracy > 0.8 && defense < 0.3) {
            return 'GlassCannon';
        }
        if (teamwork > 0.8 && aggression < 0.5) {
            return 'Coordinator';
        }
        if (aggression > 0.8 && defense < 0.3) {
            return 'Kamikaze';
        }
        if (learning > 0.6 && adaptability > 0.6) {
            return 'Generalist';
        }
        
        return 'Balanced';
    }

    isUnconventionalStrategy(genome) {
        // Same as in evolution-engine.js
        const aggression = genome[0] || 0;
        const defense = genome[3] || 0;
        const teamwork = genome[4] || 0;
        const learning = genome[6] || 0;
        const evasion = genome[8] || 0;
        
        // Unconventional combinations
        if (aggression < 0.3 && defense > 0.7 && evasion > 0.6) return true; // Pacifist
        if (aggression > 0.8 && defense < 0.2) return true; // Kamikaze
        if (learning > 0.8) return true; // Learner
        if (teamwork > 0.8 && aggression < 0.6) return true; // Team coordinator
        
        return false;
    }

    getStrategyEmoji(strategy) {
        const emojis = {
            'Sniper': '🎯',
            'Berserker': '⚔️',
            'Support': '🛡️',
            'Assassin': '🗡️',
            'Adaptive': '🧠',
            'Fortress': '🏰',
            'Scout': '👁️',
            'GlassCannon': '💥',
            'Coordinator': '📋',
            'Kamikaze': '💣',
            'Generalist': '⚖️',
            'Aggressive': '👊',
            'Defensive': '🛡️',
            'Cooperative': '🤝',
            'Balanced': '⚖️'
        };
        return emojis[strategy] || '❓';
    }
}

// Initialize tactical evolution display when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all elements to be loaded
    setTimeout(() => {
        window.tacticalDisplay = new TacticalEvolutionDisplay();
    }, 500);
});

// Also try to reinitialize if it doesn't exist when evolution starts
window.addEventListener('evolutionStarted', function() {
    if (!window.tacticalDisplay || !window.tacticalDisplay.isReady) {
        console.log('Reinitializing tactical display for evolution...');
        window.tacticalDisplay = new TacticalEvolutionDisplay();
    }
});

// Export for global access
window.TacticalEvolutionDisplay = TacticalEvolutionDisplay;
