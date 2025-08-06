/**
 * Comprehensive Unit Tests for ASI-ARCH AnalystInsights Module
 * Tests all core functionality of the Analyst Insights including:
 * - Analysis tracking and logging
 * - Performance trend analysis
 * - Emergent behavior detection
 * - Strategic insight generation
 * - Significant discovery tracking
 * - Dashboard functionality
 */

const fs = require('fs');
const path = require('path');

// Load source files
const analystInsightsSource = fs.readFileSync(path.join(__dirname, '../analyst-insights.js'), 'utf8');

// Create test environment
function createTestEnvironment() {
  // Set up minimal DOM elements
  document.body.innerHTML = `
    <div id="analyst-insights-dashboard"></div>
    <div id="live-analyst-metrics"></div>
    <div id="trend-analysis-charts"></div>
    <div id="behavior-analysis-charts"></div>
    <div id="discovery-analysis-charts"></div>
    <div id="analyst-logs"></div>
  `;

  // Mock window object
  global.window = global.window || {};
  global.window.document = document;
  global.document = document;
  
  // Mock Chart.js if needed
  global.Chart = jest.fn();
  
  // Mock canvas getContext to prevent errors in tests
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    font: '',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    canvas: { width: 400, height: 150 }
  });
  
  // Mock local storage
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  // Add missing elements that other modules might look for
  // This prevents warnings from dashboard-ui.js and other modules
  const chartsDiv = document.createElement('div');
  chartsDiv.id = 'evolution-charts';
  chartsDiv.innerHTML = `
    <canvas id="fitness-chart-canvas" width="400" height="200"></canvas>
    <canvas id="pressure-chart-canvas" width="400" height="200"></canvas>
  `;
  document.body.appendChild(chartsDiv);

  // Execute the source code in our test environment
  eval(analystInsightsSource);

  return {
    AnalystInsights: global.AnalystInsights
  };
}

describe('AnalystInsights Module - Comprehensive Tests', () => {
  let testEnv;
  let analystInsights;

  beforeEach(() => {
    // Reset DOM and create fresh test environment
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    testEnv = createTestEnvironment();
    analystInsights = new testEnv.AnalystInsights();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(analystInsights.logs).toEqual([]);
      expect(analystInsights.metrics.analysesPerformed).toBe(0);
      expect(analystInsights.metrics.trendAnalyses).toBe(0);
      expect(analystInsights.metrics.behaviorIdentifications).toBe(0);
      expect(analystInsights.metrics.strategicInsights).toBe(0);
      expect(analystInsights.metrics.fitnessProgressions).toBe(0);
      expect(analystInsights.metrics.significantDiscoveries).toBe(0);
    });

    test('should initialize data arrays correctly', () => {
      expect(analystInsights.analysisData).toEqual([]);
      expect(analystInsights.insightHistory.performance_trends).toEqual([]);
      expect(analystInsights.insightHistory.emergent_behaviors).toEqual([]);
      expect(analystInsights.insightHistory.strategic_insights).toEqual([]);
      expect(analystInsights.insightHistory.fitness_progressions).toEqual([]);
      expect(analystInsights.insightHistory.discoveries).toEqual([]);
    });

    test('should initialize chart instances as null', () => {
      expect(analystInsights.trendChart).toBeNull();
      expect(analystInsights.fitnessChart).toBeNull();
      expect(analystInsights.discoveryChart).toBeNull();
    });
  });

  describe('Logging Functionality', () => {
    test('should log messages correctly', () => {
      const testData = { testKey: 'testValue' };
      analystInsights.log('TEST_CATEGORY', 'Test message', testData);

      expect(analystInsights.logs).toHaveLength(1);
      expect(analystInsights.logs[0].category).toBe('TEST_CATEGORY');
      expect(analystInsights.logs[0].message).toBe('Test message');
      expect(analystInsights.logs[0].data).toEqual(testData);
      expect(analystInsights.logs[0].timestamp).toBeDefined();
    });

    test('should limit logs to 100 entries', () => {
      // Add 105 logs
      for (let i = 0; i < 105; i++) {
        analystInsights.log('TEST', `Message ${i}`, {});
      }

      expect(analystInsights.logs).toHaveLength(100);
      expect(analystInsights.logs[0].message).toBe('Message 5'); // First 5 should be removed
      expect(analystInsights.logs[99].message).toBe('Message 104');
    });
  });

  describe('Analysis Tracking', () => {
    test('should track analysis start correctly', () => {
      const battleResult = {
        duration: 45.5,
        winner: 'red',
        redSurvivors: 3,
        blueSurvivors: 1
      };

      analystInsights.trackAnalysisStart(battleResult, 10);

      expect(analystInsights.metrics.analysesPerformed).toBe(1);
      expect(analystInsights.logs).toHaveLength(1);
      expect(analystInsights.logs[0].category).toBe('ANALYSIS_START');
      expect(analystInsights.logs[0].data.battleDuration).toBe('45.50');
      expect(analystInsights.logs[0].data.winner).toBe('red');
      expect(analystInsights.logs[0].data.historySize).toBe(10);
    });

    test('should track performance trends', () => {
      const trendsData = {
        average_fitness: 0.75,
        improvement_rate: 0.03,
        battle_duration_trend: {
          average: 42.5,
          trend: 0.01
        }
      };

      analystInsights.trackPerformanceTrends(trendsData);

      expect(analystInsights.metrics.trendAnalyses).toBe(1);
      expect(analystInsights.insightHistory.performance_trends).toHaveLength(1);
      expect(analystInsights.insightHistory.performance_trends[0].averageFitness).toBe(0.75);
      expect(analystInsights.logs[0].category).toBe('TREND_ANALYSIS');
    });

    test('should track emergent behaviors', () => {
      const behaviors = ['Extended tactical engagement', 'High-precision targeting'];
      const battleResult = {
        duration: 67.2,
        redTeamStats: { accuracy: 0.8 },
        blueTeamStats: { accuracy: 0.6 }
      };

      analystInsights.trackEmergentBehaviors(behaviors, battleResult);

      expect(analystInsights.metrics.behaviorIdentifications).toBe(1);
      expect(analystInsights.insightHistory.emergent_behaviors).toHaveLength(1);
      expect(analystInsights.insightHistory.emergent_behaviors[0].behaviors).toEqual(behaviors);
      expect(analystInsights.logs[0].category).toBe('BEHAVIOR_DETECTION');
    });

    test('should track strategic insights', () => {
      const insights = ['Accuracy-focused strategy showed effectiveness', 'Defensive positioning improved survivability'];
      const battleResult = {
        winner: 'blue',
        duration: 38.7
      };

      analystInsights.trackStrategicInsights(insights, battleResult);

      expect(analystInsights.metrics.strategicInsights).toBe(1);
      expect(analystInsights.insightHistory.strategic_insights).toHaveLength(1);
      expect(analystInsights.insightHistory.strategic_insights[0].insights).toEqual(insights);
      expect(analystInsights.logs[0].category).toBe('STRATEGIC_ANALYSIS');
    });

    test('should track fitness progression', () => {
      const progression = {
        current_fitness: 0.82,
        fitness_trend: 0.025,
        best_fitness: 0.89,
        improvement_consistency: 0.74
      };

      analystInsights.trackFitnessProgression(progression);

      expect(analystInsights.metrics.fitnessProgressions).toBe(1);
      expect(analystInsights.insightHistory.fitness_progressions).toHaveLength(1);
      expect(analystInsights.insightHistory.fitness_progressions[0].currentFitness).toBe(0.82);
      expect(analystInsights.logs[0].category).toBe('FITNESS_PROGRESSION');
    });

    test('should track significant discoveries', () => {
      const discoveryReport = 'Significant improvement detected: +32.1% performance gain. Emergent behaviors: Extended tactical engagement';
      const improvement = 0.321;

      analystInsights.trackSignificantDiscovery(discoveryReport, improvement);

      expect(analystInsights.metrics.significantDiscoveries).toBe(1);
      expect(analystInsights.insightHistory.discoveries).toHaveLength(1);
      expect(analystInsights.insightHistory.discoveries[0].report).toBe(discoveryReport);
      expect(analystInsights.insightHistory.discoveries[0].improvement).toBe(improvement);
      expect(analystInsights.logs[0].category).toBe('SIGNIFICANT_DISCOVERY');
    });
  });

  describe('Analysis Helper Methods', () => {
    test('should calculate average accuracy correctly', () => {
      const battleResult = {
        redTeamStats: { accuracy: 0.7 },
        blueTeamStats: { accuracy: 0.5 }
      };

      const avgAccuracy = analystInsights.calculateAverageAccuracy(battleResult);
      expect(avgAccuracy).toBe(0.6);
    });

    test('should handle missing battle result for accuracy calculation', () => {
      const avgAccuracy = analystInsights.calculateAverageAccuracy(null);
      expect(avgAccuracy).toBe(0);
    });

    test('should calculate damage ratio correctly', () => {
      const battleResult = {
        redTeamStats: { totalDamageDealt: 200, totalDamageTaken: 100 },
        blueTeamStats: { totalDamageDealt: 150, totalDamageTaken: 75 }
      };

      const damageRatio = analystInsights.calculateDamageRatio(battleResult);
      expect(damageRatio).toBe(2); // (200/100 + 150/75) / 2 = (2 + 2) / 2 = 2
    });

    test('should calculate strategic effectiveness', () => {
      const insights = ['insight1', 'insight2', 'insight3'];
      const battleResult = {
        winner: 'red',
        duration: 50
      };

      const effectiveness = analystInsights.calculateStrategicEffectiveness(insights, battleResult);
      expect(effectiveness).toBe(1); // 3*0.2 + 0.3 + 0.2 = 1.1, capped at 1
    });

    test('should categorize trends correctly', () => {
      expect(analystInsights.categorizeTrend(0.06)).toBe('Rapidly Improving');
      expect(analystInsights.categorizeTrend(0.03)).toBe('Improving');
      expect(analystInsights.categorizeTrend(0.01)).toBe('Stable');
      expect(analystInsights.categorizeTrend(-0.03)).toBe('Declining');
      expect(analystInsights.categorizeTrend(-0.06)).toBe('Rapidly Declining');
    });

    test('should categorize battle complexity', () => {
      const simpleResult = { duration: 10, redTeamStats: { shotsFired: 5 }, blueTeamStats: { shotsFired: 5 } };
      const complexResult = { duration: 45, redTeamStats: { shotsFired: 30 }, blueTeamStats: { shotsFired: 25 } };
      const highlyComplexResult = { duration: 70, redTeamStats: { shotsFired: 60 }, blueTeamStats: { shotsFired: 50 } };

      expect(analystInsights.categorizeBattleComplexity(simpleResult)).toBe('Simple');
      expect(analystInsights.categorizeBattleComplexity(complexResult)).toBe('Complex');
      expect(analystInsights.categorizeBattleComplexity(highlyComplexResult)).toBe('Highly Complex');
    });

    test('should assess tactical sophistication', () => {
      const basicBehaviors = ['simple movement'];
      const sophisticatedBehaviors = ['Extended tactical engagement', 'High-precision targeting'];

      expect(analystInsights.assessTacticalSophistication(basicBehaviors)).toBe('Basic');
      expect(analystInsights.assessTacticalSophistication(sophisticatedBehaviors)).toBe('Highly Sophisticated');
    });

    test('should categorize evolution status', () => {
      const stableEvolution = { fitness_trend: 0.02, improvement_consistency: 0.8 };
      const rapidEvolution = { fitness_trend: 0.03, improvement_consistency: 0.5 };
      const regression = { fitness_trend: -0.02, improvement_consistency: 0.6 };

      expect(analystInsights.categorizeEvolution(stableEvolution)).toBe('Stable Evolution');
      expect(analystInsights.categorizeEvolution(rapidEvolution)).toBe('Rapid Evolution');
      expect(analystInsights.categorizeEvolution(regression)).toBe('Regression');
    });

    test('should assess discovery significance', () => {
      expect(analystInsights.assessDiscoverySignificance(0.4)).toBe('Revolutionary');
      expect(analystInsights.assessDiscoverySignificance(0.25)).toBe('Major');
      expect(analystInsights.assessDiscoverySignificance(0.15)).toBe('Significant');
      expect(analystInsights.assessDiscoverySignificance(0.05)).toBe('Minor');
    });
  });

  describe('Data Management', () => {
    test('should limit analysis data to 100 entries', () => {
      // Add 105 analysis completion records
      for (let i = 0; i < 105; i++) {
        analystInsights.trackAnalysisCompletion({
          hasPerformanceTrends: true,
          emergentBehaviorCount: 2,
          strategicInsightCount: 3,
          hasFitnessProgression: true,
          hasSignificantDiscovery: false
        });
      }

      expect(analystInsights.analysisData).toHaveLength(100);
    });

    test('should limit performance trends to 50 entries', () => {
      // Add 55 trend analyses
      for (let i = 0; i < 55; i++) {
        analystInsights.trackPerformanceTrends({
          average_fitness: 0.5 + i * 0.01,
          improvement_rate: 0.02,
          battle_duration_trend: { average: 30, trend: 0.01 }
        });
      }

      expect(analystInsights.insightHistory.performance_trends).toHaveLength(50);
    });

    test('should limit discoveries to 20 entries', () => {
      // Add 25 discoveries
      for (let i = 0; i < 25; i++) {
        analystInsights.trackSignificantDiscovery(`Discovery ${i}`, 0.2);
      }

      expect(analystInsights.insightHistory.discoveries).toHaveLength(20);
    });
  });

  describe('Dashboard Control', () => {
    test('should have toggle functionality', () => {
      expect(typeof analystInsights.toggle).toBe('function');
    });

    test('should have show functionality', () => {
      expect(typeof analystInsights.show).toBe('function');
    });

    test('should have hide functionality', () => {
      expect(typeof analystInsights.hide).toBe('function');
    });

    test('should have reset functionality', () => {
      // Add some data first
      analystInsights.trackAnalysisStart({ duration: 30, winner: 'red' }, 5);
      analystInsights.trackPerformanceTrends({ average_fitness: 0.7, improvement_rate: 0.02 });

      // Reset
      analystInsights.reset();

      // Check that data is cleared
      expect(analystInsights.logs).toHaveLength(1); // Only the reset log
      expect(analystInsights.logs[0].category).toBe('SYSTEM');
      expect(analystInsights.metrics.analysesPerformed).toBe(0);
      expect(analystInsights.metrics.trendAnalyses).toBe(0);
      expect(analystInsights.analysisData).toHaveLength(0);
      expect(analystInsights.insightHistory.performance_trends).toHaveLength(0);
    });
  });

  describe('Data Export', () => {
    test('should export data correctly', () => {
      // Add some test data
      analystInsights.trackAnalysisStart({ duration: 30, winner: 'red' }, 5);
      analystInsights.trackPerformanceTrends({ average_fitness: 0.7, improvement_rate: 0.02 });

      const exportedData = analystInsights.exportData();

      expect(exportedData.metrics).toBeDefined();
      expect(exportedData.logs).toBeDefined();
      expect(exportedData.analysisData).toBeDefined();
      expect(exportedData.insightHistory).toBeDefined();
      expect(exportedData.timestamp).toBeDefined();
      expect(typeof exportedData.timestamp).toBe('number');
    });
  });

  describe('UI Update Methods', () => {
    beforeEach(() => {
      // Set up DOM elements for UI tests
      document.body.innerHTML = `
        <div id="live-analyst-metrics"></div>
        <div id="analyst-logs"></div>
        <div id="trend-analysis-charts"></div>
        <div id="behavior-analysis-charts"></div>
        <div id="discovery-analysis-charts"></div>
      `;
    });

    test('should update metrics display', () => {
      analystInsights.updateMetricsDisplay();
      const metricsDiv = document.getElementById('live-analyst-metrics');
      expect(metricsDiv.innerHTML).toContain('Analyses Performed:');
      expect(metricsDiv.innerHTML).toContain('Trend Analyses:');
      expect(metricsDiv.innerHTML).toContain('Behavior Detections:');
    });

    test('should update logs display', () => {
      analystInsights.log('TEST', 'Test message', { key: 'value' });
      analystInsights.updateLogsDisplay();
      
      const logsDiv = document.getElementById('analyst-logs');
      expect(logsDiv.innerHTML).toContain('TEST');
      expect(logsDiv.innerHTML).toContain('Test message');
    });

    test('should handle missing DOM elements gracefully', () => {
      // Remove DOM elements
      document.body.innerHTML = '';
      
      // These should not throw errors
      expect(() => analystInsights.updateMetricsDisplay()).not.toThrow();
      expect(() => analystInsights.updateLogsDisplay()).not.toThrow();
      expect(() => analystInsights.updateTrendCharts()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should handle complex analysis workflow', () => {
      const battleResult = {
        duration: 56.3,
        winner: 'red',
        redSurvivors: 2,
        blueSurvivors: 1,
        redTeamStats: {
          accuracy: 0.75,
          totalDamageDealt: 300,
          totalDamageTaken: 150,
          shotsFired: 40,
          shotsHit: 30
        },
        blueTeamStats: {
          accuracy: 0.65,
          totalDamageDealt: 250,
          totalDamageTaken: 200,
          shotsFired: 35,
          shotsHit: 23
        }
      };

      // Simulate complete analysis workflow
      analystInsights.trackAnalysisStart(battleResult, 15);
      
      analystInsights.trackPerformanceTrends({
        average_fitness: 0.78,
        improvement_rate: 0.035,
        battle_duration_trend: { average: 45.2, trend: 0.015 }
      });

      analystInsights.trackEmergentBehaviors(
        ['Extended tactical engagement', 'High-precision targeting'], 
        battleResult
      );

      analystInsights.trackStrategicInsights(
        ['Accuracy-focused strategy showed effectiveness', 'Defensive positioning improved survivability'],
        battleResult
      );

      analystInsights.trackFitnessProgression({
        current_fitness: 0.78,
        fitness_trend: 0.035,
        best_fitness: 0.85,
        improvement_consistency: 0.82
      });

      analystInsights.trackSignificantDiscovery(
        'Significant improvement detected: +27.3% performance gain. Emergent behaviors: Extended tactical engagement, High-precision targeting',
        0.273
      );

      analystInsights.trackAnalysisCompletion({
        hasPerformanceTrends: true,
        emergentBehaviorCount: 2,
        strategicInsightCount: 2,
        hasFitnessProgression: true,
        hasSignificantDiscovery: true
      });

      // Verify all tracking occurred
      expect(analystInsights.metrics.analysesPerformed).toBe(1);
      expect(analystInsights.metrics.trendAnalyses).toBe(1);
      expect(analystInsights.metrics.behaviorIdentifications).toBe(1);
      expect(analystInsights.metrics.strategicInsights).toBe(1);
      expect(analystInsights.metrics.fitnessProgressions).toBe(1);
      expect(analystInsights.metrics.significantDiscoveries).toBe(1);

      // Verify data storage
      expect(analystInsights.analysisData).toHaveLength(1);
      expect(analystInsights.insightHistory.performance_trends).toHaveLength(1);
      expect(analystInsights.insightHistory.emergent_behaviors).toHaveLength(1);
      expect(analystInsights.insightHistory.strategic_insights).toHaveLength(1);
      expect(analystInsights.insightHistory.fitness_progressions).toHaveLength(1);
      expect(analystInsights.insightHistory.discoveries).toHaveLength(1);

      // Verify logs
      expect(analystInsights.logs.length).toBeGreaterThan(5);
    });
  });
});

module.exports = { createTestEnvironment };
