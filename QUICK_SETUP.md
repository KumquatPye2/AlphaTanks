# 🚀 DeepSeek LLM Integration - Quick Setup

## ⚡ 5-Minute Setup

### 1. Get DeepSeek API Key
- Visit [https://platform.deepseek.com/](https://platform.deepseek.com/)
- Sign up and get your API key
- Cost: ~$0.10-0.30 per full experiment session

### 2. Configure API Key
**Option A: Direct Configuration (Easiest for Browser)**
Open `config.js` and add your API key:
```javascript
deepseek: {
    apiKey: 'sk-your-actual-api-key-here', // Replace with your key
```

**Option B: Environment Variable (Node.js)**
```bash
cp .env.example .env
# Edit .env and add: DEEPSEEK_API_KEY=your_key_here
```

### 3. Enable LLM Features
Open browser console and run:
```javascript
window.asiArch.enableLLMFeatures();
```

### 4. Test Integration
```javascript
window.testDeepSeekIntegration();
```

## 🎯 What You'll See

With LLM integration enabled:

1. **Enhanced Analysis**: Rich tactical insights beyond basic metrics
2. **Novel Proposals**: AI-generated strategy innovations
3. **Qualitative Scoring**: Sophisticated evaluation of tactical merit
4. **Real-time Status**: LLM activity displayed in top-right panel

## 💡 Development Mode

Test without API costs:
```javascript
window.CONFIG.development.enableMockMode = true;
window.asiArch.enableMockMode();
```

Mock mode provides realistic simulated responses for development.

## 🔍 Verify Setup

Check the status panel (top-right corner):
- **Mode**: Should show "LLM-Enhanced" when enabled
- **Experiments**: Increments with each battle
- **Candidates**: Shows discovered high-performing strategies

## 📊 Expected Results

The ASI-ARCH methodology with LLM integration should demonstrate:
- **Scaling Law**: Linear relationship between computation and discoveries
- **Emergent Strategies**: Novel tactical combinations
- **Performance Improvement**: Fitness gains over time
- **Pattern Recognition**: Identification of successful approaches

## 🛠️ Troubleshooting

### Common Issues:
1. **API Key Error**: Check console for authentication errors
2. **Rate Limits**: System automatically handles rate limiting
3. **Network Issues**: Automatic fallback to rule-based analysis

### Debug Commands:
```javascript
// Check integration status
window.asiArch.getDebugInfo();

// View experiment data
window.asiArch.exportExperimentData();

// Toggle mock mode
window.asiArch.enableMockMode();
window.asiArch.disableMockMode();
```

## 🎮 Ready to Go!

Start a battle and watch the enhanced ASI-ARCH system in action. The LLM will:
- Analyze battle results for tactical insights
- Propose novel strategy modifications
- Evaluate architectural merit qualitatively
- Track scaling law demonstration

The integration enhances your existing system while maintaining full backwards compatibility.
