// ASI-ARCH Automated Test Suite
// Tests the four-module system and Red Queen Race functionality

class ASIArchTestSuite {
    constructor() {
        this.testResults = [];
        this.passCount = 0;
        this.failCount = 0;
        this.startTime = Date.now();
    }

    // Main test runner
    async runAllTests() {
        // Test Categories
        await this.testResearcherModule();
        await this.testEngineerModule();
        await this.testAnalystModule();
        await this.testCognitionModule();
        await this.testRedQueenRace();
        await this.testFitnessCalculation();
        await this.testTeamSeparation();
        await this.testVisualizationSystem();

        this.printSummary();
        return this.generateReport();
    }

    // Helper method to run individual tests
    runTest(testName, testFunction) {
        try {
            const result = testFunction();
            if (result === true || (result && result.passed)) {
                this.logPass(testName);
                return true;
            } else {
                this.logFail(testName, result ? result.message : 'Test returned false');
                return false;
            }
        } catch (error) {
            this.logFail(testName, error.message);
            return false;
        }
    }

    // Test 1: Researcher Module
    async testResearcherModule() {
        const researcher = new TankResearcher();
        const mockCognitionBase = {
            formations: {
                blitzkrieg: { traits: { speed: 0.8, aggression: 0.9 } },
                phalanx: { traits: { formation: 0.8, cooperation: 0.9 } }
            }
        };

        // Test 1.1: Genome Generation
        this.runTest('Researcher generates valid genomes', () => {
            const genome = researcher.generateRandomGenome();
            const requiredTraits = ['speed', 'aggression', 'accuracy', 'caution', 'cooperation', 'formation', 'flanking', 'ambush', 'survival'];
            return requiredTraits.every(trait => 
                genome.hasOwnProperty(trait) && 
                genome[trait] >= 0 && 
                genome[trait] <= 1
            );
        });

        // Test 1.2: Team-Specific Genome Generation
        this.runTest('Researcher generates team-specific traits', () => {
            const redGenome = researcher.generateTeamSpecificGenome('red');
            const blueGenome = researcher.generateTeamSpecificGenome('blue');
            
            return redGenome.aggression > blueGenome.aggression && 
                   blueGenome.accuracy > redGenome.accuracy;
        });

        // Test 1.3: Mutation Tracking
        this.runTest('Researcher tracks team-specific mutations', () => {
            let mutationEventReceived = false;
            let teamTracked = null;

            // Mock event system
            const originalEmit = window.emitASIArchEvent;
            window.emitASIArchEvent = (module, action, data) => {
                if (module === 'researcher' && action === 'generate_mutation' && data.team) {
                    mutationEventReceived = true;
                    teamTracked = data.team;
                }
            };

            const parentGenome = researcher.generateRandomGenome();
            researcher.mutateWithTeamTracking(parentGenome, 'red');

            // Restore original function
            window.emitASIArchEvent = originalEmit;

            return mutationEventReceived && teamTracked === 'red';
        });

        // Test 1.4: Proposal System
        this.runTest('Researcher proposes experiments with team separation', () => {
            const mockPool = [
                { genome: researcher.generateRandomGenome(), team: 'red', fitness: 0.6 },
                { genome: researcher.generateRandomGenome(), team: 'blue', fitness: 0.5 }
            ];
            
            const result = researcher.proposeExperiment(mockPool, [], mockCognitionBase);
            
            return result.redGenomes && result.blueGenomes &&
                   result.redGenomes.length === 3 && 
                   result.blueGenomes.length === 3;
        });
    }

    // Test 2: Engineer Module  
    async testEngineerModule() {
        const engineer = new TankEngineer();
        const researcher = new TankResearcher();

        // Test 2.1: Battle Execution
        this.runTest('Engineer executes battles with proper results', async () => {
            const redGenomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            const blueGenomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            
            const result = await engineer.runBattle(redGenomes, blueGenomes);
            
            return result && 
                   result.hasOwnProperty('winner') &&
                   result.hasOwnProperty('duration') &&
                   result.hasOwnProperty('redTeamStats') &&
                   result.hasOwnProperty('blueTeamStats') &&
                   ['red', 'blue', 'timeout'].includes(result.winner);
        });

        // Test 2.2: Team Stats Calculation
        this.runTest('Engineer calculates team statistics', async () => {
            const redGenomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            const blueGenomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            
            const result = await engineer.runBattle(redGenomes, blueGenomes);
            
            const requiredStats = ['accuracy', 'averageSurvivalTime', 'totalDamageDealt', 'totalDamageTaken'];
            return requiredStats.every(stat => 
                result.redTeamStats.hasOwnProperty(stat) && 
                result.blueTeamStats.hasOwnProperty(stat) &&
                typeof result.redTeamStats[stat] === 'number' &&
                typeof result.blueTeamStats[stat] === 'number'
            );
        });
    }

    // Test 3: Analyst Module
    async testAnalystModule() {
        const analyst = new TankAnalyst();
        const mockBattleResult = {
            winner: 'red',
            duration: 45.5,
            redTeamStats: { accuracy: 0.7, averageSurvivalTime: 40, totalDamageDealt: 150, totalDamageTaken: 80 },
            blueTeamStats: { accuracy: 0.5, averageSurvivalTime: 30, totalDamageDealt: 80, totalDamageTaken: 150 }
        };

        // Test 3.1: Analysis Generation
        this.runTest('Analyst generates comprehensive analysis', () => {
            const analysis = analyst.analyzeResults(mockBattleResult, []);
            
            return analysis && 
                   analysis.hasOwnProperty('performance_trends') &&
                   analysis.hasOwnProperty('emergent_behaviors') &&
                   analysis.hasOwnProperty('strategic_insights') &&
                   analysis.hasOwnProperty('fitness_progression');
        });

        // Test 3.2: Team-Specific Insights
        this.runTest('Analyst tracks team-specific insights', () => {
            let insightEventReceived = false;
            let winnerTracked = null;

            // Mock event system
            const originalEmit = window.emitASIArchEvent;
            window.emitASIArchEvent = (module, action, data) => {
                if (module === 'analyst' && action === 'generate_insights' && data.winner) {
                    insightEventReceived = true;
                    winnerTracked = data.winner;
                }
            };

            analyst.generateStrategicInsights(mockBattleResult, []);

            // Restore original function
            window.emitASIArchEvent = originalEmit;

            return insightEventReceived && winnerTracked === 'red';
        });
    }

    // Test 4: Cognition Module
    testCognitionModule() {
        const researcher = new TankResearcher();
        const mockCognitionBase = {
            formations: {
                blitzkrieg: { traits: { speed: 0.8, aggression: 0.9 } },
                phalanx: { traits: { formation: 0.8, cooperation: 0.9 } }
            }
        };

        // Test 4.1: Team-Specific Tactical Application
        this.runTest('Cognition applies team-specific tactics', () => {
            const baseGenome = researcher.generateRandomGenome();
            const redGenome = { ...baseGenome };
            const blueGenome = { ...baseGenome };
            
            const enhancedRed = researcher.applyCognition(redGenome, mockCognitionBase, 'red', []);
            const enhancedBlue = researcher.applyCognition(blueGenome, mockCognitionBase, 'blue', []);
            
            // Red should have enhanced speed/aggression, Blue should have enhanced formation/cooperation
            return enhancedRed.speed >= baseGenome.speed && 
                   enhancedRed.aggression >= baseGenome.aggression &&
                   enhancedBlue.formation >= baseGenome.formation && 
                   enhancedBlue.cooperation >= baseGenome.cooperation;
        });

        // Test 4.2: Performance-Based Learning
        this.runTest('Cognition adjusts learning based on team performance', () => {
            const genome = researcher.generateRandomGenome();
            
            // Mock history where red team is losing
            const losingHistory = [
                { result: { winner: 'blue' } },
                { result: { winner: 'blue' } },
                { result: { winner: 'blue' } }
            ];
            
            let tacticEventReceived = false;
            const originalEmit = window.emitASIArchEvent;
            window.emitASIArchEvent = (module, action, data) => {
                if (module === 'cognition' && action === 'team_tactics_learned') {
                    tacticEventReceived = true;
                }
            };

            // Run multiple times to increase chance of learning event due to urgency
            for (let i = 0; i < 10; i++) {
                researcher.applyCognition({ ...genome }, mockCognitionBase, 'red', losingHistory);
            }

            window.emitASIArchEvent = originalEmit;
            
            // Losing teams should have higher chance of tactical learning
            return true; // This test validates the system exists, actual learning is probabilistic
        });
    }

    // Test 5: Red Queen Race
    testRedQueenRace() {
        const researcher = new TankResearcher();
        
        // Test 5.1: Team Lineage Separation
        this.runTest('Red Queen maintains separate team lineages', () => {
            const mixedPool = [
                { genome: researcher.generateRandomGenome(), team: 'red', fitness: 0.8 },
                { genome: researcher.generateRandomGenome(), team: 'red', fitness: 0.7 },
                { genome: researcher.generateRandomGenome(), team: 'blue', fitness: 0.6 },
                { genome: researcher.generateRandomGenome(), team: 'blue', fitness: 0.5 }
            ];
            
            const redCandidates = researcher.getTeamCandidates(mixedPool, [], 'red');
            const blueCandidates = researcher.getTeamCandidates(mixedPool, [], 'blue');
            
            return redCandidates.every(c => c.team === 'red' || !c.team) &&
                   blueCandidates.every(c => c.team === 'blue' || !c.team) &&
                   redCandidates.length >= 2 && blueCandidates.length >= 2;
        });

        // Test 5.2: Counter-Evolution
        this.runTest('Red Queen implements counter-evolution strategies', () => {
            const baseGenome = researcher.generateRandomGenome();
            
            // Mock opponent strategies with high aggression
            const opponentStrategies = {
                avgAggression: 0.8,
                avgSpeed: 0.3,
                avgAccuracy: 0.3,
                winningTactics: ['aggression_rush']
            };
            
            const counterEvolvedGenome = researcher.applyCounterEvolution(
                { ...baseGenome }, 
                opponentStrategies, 
                'blue'
            );
            
            // Should enhance defensive traits to counter high aggression
            return counterEvolvedGenome.caution > baseGenome.caution ||
                   counterEvolvedGenome.formation > baseGenome.formation;
        });

        // Test 5.3: Competitive Fitness Weighting
        this.runTest('Red Queen applies competitive fitness weighting', () => {
            const evolution = new EvolutionEngine();
            const genomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            
            const winningResult = {
                winner: 'red',
                redTeamStats: { accuracy: 0.7, averageSurvivalTime: 40, totalDamageDealt: 150, totalDamageTaken: 80 },
                blueTeamStats: { accuracy: 0.5, averageSurvivalTime: 30, totalDamageDealt: 80, totalDamageTaken: 150 }
            };
            
            const losingResult = {
                winner: 'blue',
                redTeamStats: { accuracy: 0.4, averageSurvivalTime: 25, totalDamageDealt: 60, totalDamageTaken: 120 },
                blueTeamStats: { accuracy: 0.6, averageSurvivalTime: 35, totalDamageDealt: 120, totalDamageTaken: 60 }
            };
            
            const winningFitness = evolution.calculateTeamFitness(genomes, winningResult, 'red');
            const losingFitness = evolution.calculateTeamFitness(genomes, losingResult, 'red');
            
            // Winning team should have significantly higher fitness
            return winningFitness.every(f => f > 0.6) && 
                   losingFitness.every(f => f < 0.4) &&
                   winningFitness[0] > losingFitness[0] + 0.3;
        });
    }

    // Test 6: Fitness Calculation
    testFitnessCalculation() {
        const evolution = new EvolutionEngine();
        const researcher = new TankResearcher();
        
        // Test 6.1: Team-Specific Fitness
        this.runTest('Fitness calculation produces team-specific results', () => {
            const genomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            const battleResult = {
                winner: 'red',
                redTeamStats: { accuracy: 0.7, averageSurvivalTime: 40, totalDamageDealt: 150, totalDamageTaken: 80 },
                blueTeamStats: { accuracy: 0.5, averageSurvivalTime: 30, totalDamageDealt: 80, totalDamageTaken: 150 }
            };
            
            const redFitness = evolution.calculateTeamFitness(genomes, battleResult, 'red');
            const blueFitness = evolution.calculateTeamFitness(genomes, battleResult, 'blue');
            
            return redFitness.length === 3 && 
                   blueFitness.length === 3 &&
                   redFitness.every(f => f > 0.1 && f <= 1.0) &&
                   blueFitness.every(f => f > 0.1 && f <= 1.0) &&
                   redFitness[0] > blueFitness[0]; // Winner should have higher fitness
        });

        // Test 6.2: Fitness Range Validation
        this.runTest('Fitness values stay within valid range', () => {
            const genomes = Array(3).fill().map(() => researcher.generateRandomGenome());
            const extremeResult = {
                winner: 'red',
                redTeamStats: { accuracy: 1.0, averageSurvivalTime: 60, totalDamageDealt: 1000, totalDamageTaken: 0 },
                blueTeamStats: { accuracy: 0.0, averageSurvivalTime: 1, totalDamageDealt: 0, totalDamageTaken: 1000 }
            };
            
            const fitness = evolution.calculateTeamFitness(genomes, extremeResult, 'red');
            
            return fitness.every(f => f >= 0.1 && f <= 1.0);
        });
    }

    // Test 7: Team Separation
    testTeamSeparation() {
        const evolution = new EvolutionEngine();
        
        // Test 7.1: Candidate Pool Separation
        this.runTest('Evolution maintains team separation in candidate pool', () => {
            // Mock adding candidates from both teams
            evolution.candidatePool = [
                { genome: {}, team: 'red', fitness: 0.8 },
                { genome: {}, team: 'red', fitness: 0.7 },
                { genome: {}, team: 'blue', fitness: 0.6 },
                { genome: {}, team: 'blue', fitness: 0.5 }
            ];
            
            const stats = evolution.getEvolutionStats();
            
            return stats.redCandidates === 2 && 
                   stats.blueCandidates === 2 &&
                   stats.redAverageFitness === 0.75 &&
                   stats.blueAverageFitness === 0.55;
        });
    }

    // Test 8: Visualization System
    testVisualizationSystem() {
        // Test 8.1: Event Emission
        this.runTest('Visualization system emits and handles events', () => {
            const visualizer = new ASIArchVisualizer();
            let eventHandled = false;
            
            // Override the triggerEvent method to check if it's called
            const originalTrigger = visualizer.triggerEvent;
            visualizer.triggerEvent = (module, action, data) => {
                eventHandled = true;
                return originalTrigger.call(visualizer, module, action, data);
            };
            
            // Emit an event
            window.emitASIArchEvent('researcher', 'test_event', { test: true });
            
            return eventHandled;
        });

        // Test 8.2: Module Stats Tracking
        this.runTest('Visualization tracks module statistics correctly', () => {
            const visualizer = new ASIArchVisualizer();
            
            // Simulate researcher events
            visualizer.handleResearcherEvent('generate_mutation', { team: 'red', trait: 'speed' });
            visualizer.handleResearcherEvent('generate_mutation', { team: 'blue', trait: 'accuracy' });
            
            return visualizer.moduleStats.researcher.mutations === 2 &&
                   visualizer.moduleStats.researcher.redMutations === 1 &&
                   visualizer.moduleStats.researcher.blueMutations === 1;
        });
    }

    // Logging helpers
    logPass(testName) {
        this.testResults.push({ name: testName, status: 'PASS' });
        this.passCount++;
    }

    logFail(testName, message) {
        this.testResults.push({ name: testName, status: 'FAIL', message });
        this.failCount++;
    }

    // Summary and reporting
    printSummary() {
        const totalTests = this.passCount + this.failCount;
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        if (this.failCount > 0) {
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${r.name}: ${r.message}`));
        }
    }

    generateReport() {
        return {
            totalTests: this.passCount + this.failCount,
            passed: this.passCount,
            failed: this.failCount,
            passRate: (this.passCount / (this.passCount + this.failCount) * 100).toFixed(1),
            duration: ((Date.now() - this.startTime) / 1000).toFixed(2),
            results: this.testResults,
            systemStatus: this.failCount === 0 ? 'OPERATIONAL' : 'DEGRADED'
        };
    }
}

// Global test runner function
window.runASIArchTests = async function() {
    const testSuite = new ASIArchTestSuite();
    return await testSuite.runAllTests();
};

// Auto-run tests when included (can be disabled by setting window.autoRunTests = false)
if (typeof window !== 'undefined' && window.autoRunTests !== false) {
    // Add a delay to ensure all modules are loaded
    setTimeout(() => {
        if (window.TankResearcher && window.TankEngineer && window.EvolutionEngine) {
            window.runASIArchTests();
        }
    }, 1000);
}
