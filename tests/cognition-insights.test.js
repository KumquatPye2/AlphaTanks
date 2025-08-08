/**
 * Unit Tests for Cognition Insights Module
 * Tests the cognition-specific analytics and tracking system
 */

const fs = require('fs');
const path = require('path');

// Load cognition insights source file
const cognitionInsightsSource = fs.readFileSync(path.join(__dirname, '../cognition-insights.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
    // Set up minimal DOM elements with proper canvas mocking
    document.body.innerHTML = `
        <div id="cognitionInsightsDashboard" style="display: none;">
            <canvas id="cognitionTacticsChart" width="400" height="200"></canvas>
            <canvas id="cognitionLearningChart" width="400" height="200"></canvas>
            <canvas id="cognitionFormationChart" width="400" height="200"></canvas>
            <span id="totalTacticApplications">0</span>
            <span id="totalKnowledgeSearches">0</span>
            <span id="totalTeamLearning">0</span>
            <span id="totalCognitionAdaptations">0</span>
            <span id="dominantFormation">-</span>
            <span id="learningRate">0%</span>
            <span id="adaptationEfficiency">0%</span>
        </div>
    `;

    // Mock Chart.js
    global.Chart = {
        Chart: class MockChart {
            constructor() {
                this.destroy = jest.fn();
                this.update = jest.fn();
            }
        }
    };

    // Execute the cognition insights source with mocked Chart constructor
    eval(cognitionInsightsSource.replace(/new Chart\(/g, 'new global.Chart.Chart('));
    
    return global.CognitionInsights;
}

describe('Cognition Insights Module', () => {
    let cognitionInsights;
    let CognitionInsights;

    beforeEach(() => {
        // Reset DOM for each test
        document.body.innerHTML = '';
        
        // Initialize test environment and get CognitionInsights class
        CognitionInsights = createTestEnvironment();
        
        // Create fresh instance
        cognitionInsights = new CognitionInsights();
    });

    afterEach(() => {
        // Clean up DOM
        const dashboard = document.getElementById('cognition-insights-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(cognitionInsights.logs).toEqual([]);
            expect(cognitionInsights.metrics.tacticsApplied).toBe(0);
            expect(cognitionInsights.metrics.knowledgeSearches).toBe(0);
            expect(cognitionInsights.metrics.formationsUsed).toBe(0);
            expect(cognitionInsights.metrics.teamLearningEvents).toBe(0);
            expect(cognitionInsights.metrics.tacticalImprovements).toBe(0);
            expect(cognitionInsights.metrics.cognitiveAdaptations).toBe(0);
        });

        test('should initialize data arrays correctly', () => {
            expect(cognitionInsights.tacticsData).toEqual([]);
            expect(cognitionInsights.learningHistory.red_tactics).toEqual([]);
            expect(cognitionInsights.learningHistory.blue_tactics).toEqual([]);
            expect(cognitionInsights.learningHistory.knowledge_searches).toEqual([]);
            expect(cognitionInsights.learningHistory.formations_applied).toEqual([]);
            expect(cognitionInsights.learningHistory.learning_events).toEqual([]);
        });

        test('should initialize chart instances correctly', () => {
            // Since we provide canvas elements in test setup, charts should be initialized
            expect(cognitionInsights.tacticsChart).toBeDefined();
            expect(cognitionInsights.learningChart).toBeDefined();
            expect(cognitionInsights.formationChart).toBeDefined();
            
            // Charts should be mock objects with expected methods
            expect(cognitionInsights.tacticsChart.destroy).toBeDefined();
            expect(cognitionInsights.tacticsChart.update).toBeDefined();
        });
    });

    describe('Tracking Functionality', () => {
        test('should track tactic applications correctly', () => {
            cognitionInsights.trackTacticApplication('red', 'blitzkrieg', '0.15');
            
            expect(cognitionInsights.metrics.tacticsApplied).toBe(1);
            expect(cognitionInsights.metrics.tacticalImprovements).toBe(0.15);
            expect(cognitionInsights.learningHistory.red_tactics).toHaveLength(1);
            // trackTacticApplication should NOT add to formations_applied - that's for trackFormationUsage
            expect(cognitionInsights.learningHistory.formations_applied).toHaveLength(0);
            
            const tacticData = cognitionInsights.learningHistory.red_tactics[0];
            expect(tacticData.team).toBe('red');
            expect(tacticData.tactic).toBe('blitzkrieg');
            expect(tacticData.improvement).toBe(0.15);
        });

        test('should track knowledge searches', () => {
            cognitionInsights.trackKnowledgeSearch('defensive tactics', 3);
            
            expect(cognitionInsights.metrics.knowledgeSearches).toBe(1);
            expect(cognitionInsights.learningHistory.knowledge_searches).toHaveLength(1);
            
            const searchData = cognitionInsights.learningHistory.knowledge_searches[0];
            expect(searchData.query).toBe('defensive tactics');
            expect(searchData.results).toBe(3);
        });

        test('should track formation usage', () => {
            cognitionInsights.trackFormationUsage('phalanx');
            
            expect(cognitionInsights.metrics.formationsUsed).toBe(1);
            expect(cognitionInsights.logs).toHaveLength(1);
            expect(cognitionInsights.logs[0].message).toBe('Formation applied: phalanx');
        });

        test('should track team learning events', () => {
            cognitionInsights.trackTeamLearning('blue', 'phalanx', '0.12');
            
            expect(cognitionInsights.metrics.teamLearningEvents).toBe(1);
            expect(cognitionInsights.learningHistory.learning_events).toHaveLength(1);
            
            const learningData = cognitionInsights.learningHistory.learning_events[0];
            expect(learningData.team).toBe('blue');
            expect(learningData.tactic).toBe('phalanx');
            expect(learningData.improvement).toBe(0.12);
        });

        test('should track cognitive adaptations', () => {
            cognitionInsights.trackCognitiveAdaptation();
            
            expect(cognitionInsights.metrics.cognitiveAdaptations).toBe(1);
            expect(cognitionInsights.logs).toHaveLength(1);
            expect(cognitionInsights.logs[0].message).toBe('Cognitive adaptation triggered');
        });
    });

    describe('Analysis Methods', () => {
        beforeEach(() => {
            // Add test data for analysis
            cognitionInsights.learningHistory.red_tactics = [
                { team: 'red', tactic: 'blitzkrieg', improvement: 0.1 },
                { team: 'red', tactic: 'blitzkrieg', improvement: 0.2 },
                { team: 'red', tactic: 'pincer', improvement: 0.15 }
            ];
            
            cognitionInsights.learningHistory.blue_tactics = [
                { team: 'blue', tactic: 'phalanx', improvement: 0.1 },
                { team: 'blue', tactic: 'phalanx', improvement: 0.2 }
            ];
            
            cognitionInsights.learningHistory.formations_applied = [
                { tactic: 'blitzkrieg' },
                { tactic: 'blitzkrieg' },
                { tactic: 'phalanx' },
                { tactic: 'phalanx' },
                { tactic: 'pincer' }
            ];
            
            cognitionInsights.learningHistory.learning_events = [
                { improvement: 0.1 },
                { improvement: 0.2 },
                { improvement: 0.15 }
            ];
            
            cognitionInsights.metrics.cognitiveAdaptations = 5;
            cognitionInsights.metrics.tacticalImprovements = 1.0;
        });

        test('should analyze team strategy correctly', () => {
            const redStrategy = cognitionInsights.analyzeTeamStrategy('red');
            const blueStrategy = cognitionInsights.analyzeTeamStrategy('blue');
            
            expect(redStrategy).toBe('blitzkrieg (2x)');
            expect(blueStrategy).toBe('phalanx (2x)');
        });

        test('should handle empty team strategy data', () => {
            cognitionInsights.learningHistory.red_tactics = [];
            const redStrategy = cognitionInsights.analyzeTeamStrategy('red');
            expect(redStrategy).toBe('No data');
        });

        test('should analyze dominant formation', () => {
            const dominantFormation = cognitionInsights.analyzeDominantFormation();
            expect(dominantFormation).toMatch(/blitzkrieg \(2x\)|phalanx \(2x\)/);
        });

        test('should calculate learning rate', () => {
            const learningRate = cognitionInsights.calculateLearningRate();
            expect(learningRate).toBe('15.0%'); // (0.1 + 0.2 + 0.15) / 3 * 100
        });

        test('should calculate adaptation efficiency', () => {
            const efficiency = cognitionInsights.calculateAdaptationEfficiency();
            expect(efficiency).toBe('20.0%'); // 1.0 / 5 * 100
        });

        test('should handle zero adaptations in efficiency calculation', () => {
            cognitionInsights.metrics.cognitiveAdaptations = 0;
            const efficiency = cognitionInsights.calculateAdaptationEfficiency();
            expect(efficiency).toBe('0%');
        });
    });

    describe('Data Management', () => {
        test('should limit formation applications to 50 entries', () => {
            // Add 60 entries
            for (let i = 0; i < 60; i++) {
                cognitionInsights.trackFormationUsage('blitzkrieg');
            }
            
            expect(cognitionInsights.learningHistory.formations_applied).toHaveLength(50);
        });

        test('should limit knowledge searches to 100 entries', () => {
            // Add 110 entries
            for (let i = 0; i < 110; i++) {
                cognitionInsights.trackKnowledgeSearch(`query ${i}`, 1);
            }
            
            expect(cognitionInsights.learningHistory.knowledge_searches).toHaveLength(100);
        });

        test('should limit learning events to 100 entries', () => {
            // Add 110 entries
            for (let i = 0; i < 110; i++) {
                cognitionInsights.trackTeamLearning('red', 'blitzkrieg', '0.1');
            }
            
            expect(cognitionInsights.learningHistory.learning_events).toHaveLength(100);
        });

        test('should limit logs to 100 entries', () => {
            // Add 110 log entries
            for (let i = 0; i < 110; i++) {
                cognitionInsights.log(`Test message ${i}`);
            }
            
            expect(cognitionInsights.logs).toHaveLength(100);
        });
    });

    describe('Dashboard Control', () => {
        test('should have show functionality', () => {
            const modal = document.getElementById('cognitionInsightsModal');
            cognitionInsights.show();
            expect(modal.style.display).toBe('block');
        });

        test('should have hide functionality', () => {
            const modal = document.getElementById('cognitionInsightsModal');
            cognitionInsights.hide();
            expect(modal.style.display).toBe('none');
        });

        test('should have toggle functionality', () => {
            const modal = document.getElementById('cognitionInsightsModal');
            
            // Initially hidden
            cognitionInsights.toggle();
            expect(modal.style.display).toBe('block');
            
            // Toggle to hide
            cognitionInsights.toggle();
            expect(modal.style.display).toBe('none');
        });

        test('should have reset functionality', () => {
            // Add some data
            cognitionInsights.trackTacticApplication('red', 'blitzkrieg', '0.1');
            cognitionInsights.trackKnowledgeSearch('test', 2);
            
            // Reset
            cognitionInsights.reset();
            
            expect(cognitionInsights.metrics.tacticsApplied).toBe(0);
            expect(cognitionInsights.metrics.knowledgeSearches).toBe(0);
            expect(cognitionInsights.learningHistory.red_tactics).toHaveLength(0);
            expect(cognitionInsights.learningHistory.knowledge_searches).toHaveLength(0);
        });
    });

    describe('Data Export', () => {
        test('should export data correctly', () => {
            // Mock URL.createObjectURL and related functions
            global.URL.createObjectURL = jest.fn(() => 'mock-url');
            global.URL.revokeObjectURL = jest.fn();
            
            // Mock DOM manipulation
            const mockA = {
                href: '',
                download: '',
                click: jest.fn()
            };
            
            document.createElement = jest.fn().mockReturnValue(mockA);
            document.body.appendChild = jest.fn();
            document.body.removeChild = jest.fn();
            
            // Add some test data
            cognitionInsights.trackTacticApplication('red', 'blitzkrieg', '0.1');
            
            // Export data
            cognitionInsights.exportData();
            
            expect(mockA.click).toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith('a');
        });
    });

    describe('UI Update Methods', () => {
        test('should update metrics display', () => {
            // Mock DOM elements
            const mockElements = {
                'cognition-tactics-applied': { textContent: '' },
                'cognition-knowledge-searches': { textContent: '' },
                'cognition-formations-used': { textContent: '' },
                'cognition-team-learning': { textContent: '' },
                'cognition-tactical-improvements': { textContent: '' },
                'cognition-adaptations': { textContent: '' }
            };
            
            document.getElementById = jest.fn((id) => mockElements[id] || null);
            
            // Set some metrics
            cognitionInsights.metrics.tacticsApplied = 5;
            cognitionInsights.metrics.knowledgeSearches = 3;
            
            cognitionInsights.updateMetricsDisplay();
            
            expect(mockElements['cognition-tactics-applied'].textContent).toBe(5);
            expect(mockElements['cognition-knowledge-searches'].textContent).toBe(3);
        });

        test('should handle missing DOM elements gracefully', () => {
            document.getElementById = jest.fn(() => null);
            
            // Should not throw error
            expect(() => cognitionInsights.updateMetricsDisplay()).not.toThrow();
            expect(() => cognitionInsights.updateAnalysisDisplay()).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        test('should handle complex cognition workflow', () => {
            // Simulate a complex scenario
            cognitionInsights.trackKnowledgeSearch('attack patterns', 3);
            cognitionInsights.trackFormationUsage('blitzkrieg');
            cognitionInsights.trackTacticApplication('red', 'blitzkrieg', '0.25');
            cognitionInsights.trackTeamLearning('red', 'blitzkrieg', '0.25');
            cognitionInsights.trackCognitiveAdaptation();
            
            // Verify metrics
            expect(cognitionInsights.metrics.knowledgeSearches).toBe(1);
            expect(cognitionInsights.metrics.formationsUsed).toBe(1);
            expect(cognitionInsights.metrics.tacticsApplied).toBe(1);
            expect(cognitionInsights.metrics.teamLearningEvents).toBe(1);
            expect(cognitionInsights.metrics.cognitiveAdaptations).toBe(1);
            expect(cognitionInsights.metrics.tacticalImprovements).toBe(0.25);
            
            // Verify analysis
            expect(cognitionInsights.analyzeTeamStrategy('red')).toBe('blitzkrieg (1x)');
            expect(cognitionInsights.analyzeDominantFormation()).toBe('blitzkrieg (1x)');
            expect(cognitionInsights.calculateLearningRate()).toBe('25.0%');
            expect(cognitionInsights.calculateAdaptationEfficiency()).toBe('25.0%');
        });
    });
});
