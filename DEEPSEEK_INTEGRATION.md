# DeepSeek LLM Integration Guide

## 🚀 Quick Start

### 1. API Key Setup
1. Get a DeepSeek API key from [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Copy `.env.example` to `.env` and add your key:
   ```bash
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

### 2. Enable LLM Features
In your browser console or by modifying `config.js`:

```javascript
// Enable all LLM features
window.CONFIG.asiArch.enableComponents.llmJudge = true;
window.CONFIG.asiArch.enableComponents.proposalGeneration = true;
window.CONFIG.asiArch.enableComponents.resultAnalysis = true;

// Or use the integration interface
window.asiArch.enableLLMFeatures();
```

### 3. Development Mode
For testing without API costs:
```javascript
window.CONFIG.development.enableMockMode = true;
window.asiArch.enableMockMode();
```

## 🧠 ASI-ARCH Implementation

### Core Components

#### 1. **Researcher Module** 🔬
- **Purpose**: Generates novel tank tactical proposals
- **LLM Role**: Creates innovative strategies based on battle history
- **Implementation**: `generateTacticalProposal()` in DeepSeekClient

#### 2. **Analyst Module** 📊  
- **Purpose**: Analyzes battle results for insights
- **LLM Role**: Extracts patterns and strategic recommendations
- **Implementation**: `analyzeBattleResults()` in DeepSeekClient

#### 3. **LLM Judge** ⚖️
- **Purpose**: Qualitative evaluation of strategies (ASI-ARCH Equation 2)
- **LLM Role**: Scores tactical merit, innovation, and effectiveness
- **Implementation**: `llmJudgeScore()` in DeepSeekClient

#### 4. **Composite Fitness** 🎯
Following ASI-ARCH paper Equation 2:
```
Fitness = (Quantitative + LLM_Judge + Innovation) / 3
```

### Integration Points

#### Main Game Loop Integration
```javascript
// In main.js or your battle system
async function processBattleResult(redTeam, blueTeam, result) {
    const asiArchResult = await window.asiArch.processBattleResult(
        redTeam, blueTeam, result
    );
    
    // Use insights for evolution
    const insights = asiArchResult.insights;
    const proposals = asiArchResult.proposals;
    const evaluations = asiArchResult.evaluations;
}
```

#### Accessing Evolved Strategies
```javascript
// Get best candidates for next generation
const bestCandidates = window.asiArch.getBestCandidates(5);

// Get recent insights
const insights = window.asiArch.getRecentInsights(10);

// Get performance metrics
const metrics = window.asiArch.getPerformanceMetrics();
```

## 📊 API Usage and Costs

### DeepSeek Pricing (as of 2025)
- **Input**: ~$0.14 per 1M tokens
- **Output**: ~$0.28 per 1M tokens

### Expected Usage
For typical AlphaTanks session (25 experiments):
- **Tokens per analysis**: ~500-1000
- **Total session cost**: ~$0.10-0.30
- **Per experiment**: ~$0.01-0.02

### Rate Limiting
- **Default**: 60 requests/minute, 200K tokens/minute
- **Configurable** in `config.js`

## 🛠️ Configuration Options

### Temperature Settings
```javascript
window.CONFIG.deepseek.temperatures = {
    researcher: 0.8,    // Higher creativity for proposals
    analyst: 0.3,       // Lower for factual analysis  
    judge: 0.5,         // Balanced for evaluation
    cognition: 0.2      // Precise for knowledge extraction
};
```

### Fitness Function Weights
```javascript
window.CONFIG.asiArch.fitnessWeights = {
    quantitative: 0.33,  // Battle performance metrics
    qualitative: 0.33,   // LLM judge assessment  
    innovation: 0.34     // Tactical novelty score
};
```

### Component Control
```javascript
window.CONFIG.asiArch.enableComponents = {
    llmJudge: true,              // Enable LLM scoring
    cognitionExtraction: true,   // Extract tactical knowledge
    proposalGeneration: true,    // Generate new strategies
    resultAnalysis: true         // Analyze battle outcomes
};
```

## 🔍 Monitoring and Debugging

### Real-time Status
The UI shows:
- **ASI-ARCH Status Panel**: Top-right corner
- **Experiment Count**: Number of LLM-enhanced experiments
- **Candidate Pool**: Discovered high-performing strategies
- **Average Fitness**: Composite fitness trend

### Browser Console Debugging
```javascript
// Get debug information
console.log(window.asiArch.getDebugInfo());

// Export experiment data
const data = window.asiArch.exportExperimentData();
console.log(JSON.stringify(data, null, 2));

// Check LLM client status
console.log(window.asiArch.llmASIArch.deepSeekClient);
```

### Performance Metrics
```javascript
// View scaling law demonstration
const metrics = window.asiArch.getPerformanceMetrics();
console.log(`Discovery rate: ${metrics.discoveryRate}`);
console.log(`Fitness improvement: ${metrics.fitnessImprovement}`);
```

## 🚨 Error Handling

### Fallback Behavior
- **API Failures**: Automatic fallback to rule-based analysis
- **Rate Limits**: Queue requests and retry with backoff
- **Parsing Errors**: Graceful degradation with default values

### Mock Mode for Development
```javascript
// Test without API calls
window.asiArch.enableMockMode();

// Mock responses provide realistic but simulated data
// Perfect for development and testing
```

## 📈 Expected Results

### With LLM Integration Enabled:
- **Richer Analysis**: Detailed tactical insights beyond basic metrics
- **Novel Strategies**: AI-proposed innovations you wouldn't think of
- **Qualitative Assessment**: Sophisticated evaluation of strategic merit
- **Emergent Patterns**: Discovery of unexpected tactical combinations

### Scaling Law Demonstration:
Following ASI-ARCH methodology, you should observe:
- **Linear Discovery Rate**: More computation → More novel strategies
- **Fitness Improvement**: Consistent improvement over time
- **Pattern Recognition**: Identification of successful tactical themes

## 🔗 Integration with Existing System

The LLM integration is designed to enhance, not replace, your existing ASI-ARCH implementation:

- **Backwards Compatible**: Works with existing rule-based system
- **Gradual Enhancement**: Enable features incrementally
- **Fallback Support**: Graceful degradation when LLM unavailable
- **Performance Metrics**: Compare LLM vs rule-based results

## 🎯 Next Steps

1. **Set up API key** and test basic integration
2. **Run experiments** with LLM features enabled
3. **Compare results** between LLM and rule-based modes
4. **Analyze insights** generated by the enhanced system
5. **Iterate on prompts** to improve analysis quality

The integration provides a foundation for exploring how LLMs can enhance autonomous research systems, following the principles outlined in the ASI-ARCH paper.
