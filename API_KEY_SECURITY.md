# API Key Security Implementation

## Overview

The AlphaTanks project now includes a secure API key management system that allows users to provide their own DeepSeek API keys for LLM-powered features without hardcoding sensitive credentials in the source code.

## Security Features

### ✅ What We Fixed
- **Removed hardcoded API key** from `config.js` and all source files
- **User-provided keys only** - users must enter their own API keys
- **Input validation** - validates DeepSeek API key format
- **Visual feedback** - clear status indicators for API key state
- **Dynamic configuration** - API keys are loaded and updated at runtime

### 🔒 Security Measures
- API keys are stored in browser `localStorage` (user's device only)
- Keys are never transmitted to our servers
- Password-type input field hides key from shoulder surfing
- Clear warnings about API key security in the UI
- Automatic mock mode fallback when no valid key is provided

## User Interface

### API Key Input Section
Located in the main evolution control bar:
- **Label**: "🔑 DeepSeek API Key (for LLM features)"
- **Input**: Password-type field with placeholder
- **Status**: Real-time validation and connection status
- **Validation**: Checks for proper DeepSeek API key format (`sk-` prefix, correct length)

### Status Indicators
- `No API key configured` (gray) - No key entered
- `Invalid API key format` (red) - Key doesn't match expected format
- `API key entered (click elsewhere to save)` (yellow) - Valid format, pending save
- `API key configured ✓` (green) - Valid key saved and active

## Technical Implementation

### Components
1. **ApiKeyManager** (`api-key-manager.js`)
   - Handles UI interactions and validation
   - Manages localStorage operations
   - Updates global configuration

2. **DeepSeekClient Updates** (`deepseek-client.js`)
   - Added `updateApiKey()` method for runtime updates
   - Dynamic mock mode switching based on key availability

3. **Configuration** (`config.js`)
   - Loads API key from localStorage on startup
   - No hardcoded credentials

### API Key Validation
```javascript
// DeepSeek API keys follow this pattern:
/^sk-[a-zA-Z0-9]{40,60}$/

// Examples:
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  // Valid
sk-short                              // Invalid (too short)
invalid-key                           // Invalid (wrong format)
```

### Storage Strategy
- **Primary**: Browser localStorage (`deepseek_api_key`)
- **Fallback**: Environment variable (`DEEPSEEK_API_KEY`) for Node.js
- **Default**: Empty string (triggers mock mode)

## Usage Instructions

### For Users Who DON'T Want to Use an API Key

**Option 1: Enable Mock Mode**
1. Check the "🎭 Use Mock Mode" checkbox in the control bar
2. The system will use simulated AI responses instead of real API calls
3. All features work normally with realistic but fake AI insights
4. Perfect for testing, demonstrations, or learning how the system works

**Option 2: Just Don't Enter an API Key**
1. Leave the API key field empty
2. The system automatically falls back to mock mode
3. You'll see simulated responses for all LLM features

### For Users Who Want Real AI Features
1. **Get a DeepSeek API Key**
   - Visit [DeepSeek Platform](https://platform.deepseek.com/)
   - Create an account and generate an API key
   - Copy the key (starts with `sk-`)

2. **Configure in AlphaTanks**
   - Open AlphaTanks in your browser
   - Find the "🔑 DeepSeek API Key" field in the control bar
   - Paste your API key and click elsewhere to save
   - Status should show "API key configured ✓"

3. **Security Best Practices**
   - Only use AlphaTanks on trusted devices
   - Clear your API key when finished (empty the field)
   - Don't share your API key with others
   - Monitor your DeepSeek usage dashboard

### For Developers
1. **Testing Without API Key**
   - The system automatically enables mock mode
   - LLM features will return simulated responses
   - No real API calls are made

2. **Testing With API Key**
   - Enter a valid API key in the UI
   - Mock mode is automatically disabled
   - Real API calls are made to DeepSeek

3. **Environment Variables** (Node.js only)
   ```bash
   export DEEPSEEK_API_KEY=sk-your-key-here
   ```

## Files Modified

### Core Implementation
- `api-key-manager.js` - New API key management system
- `config.js` - Removed hardcoded key, added localStorage loading
- `deepseek-client.js` - Added runtime API key updates
- `index.html` - Added UI components and script inclusion

### Security Cleanup
- `tests/config-validation.test.js` - Replaced real key with test key
- `tests/deepseek-client.test.js` - Replaced real key with test key
- `tests/test-helpers.js` - Replaced real key with test key

### Testing
- `test-api-key-manager.html` - Standalone test page for API key functionality

## Security Warnings

⚠️ **Important Security Notes:**
- API keys are stored in browser localStorage
- localStorage is accessible to JavaScript on the same domain
- Only use on devices you trust
- Clear your API key when done using the application
- Never commit API keys to version control
- Monitor your DeepSeek API usage regularly

## Mock Mode Behavior

When no valid API key is configured or mock mode is explicitly enabled:

### ✅ **What Works in Mock Mode:**
- All LLM features provide simulated responses
- Researcher insights with fake tactical analysis
- Analyst insights with mock pattern recognition
- Engineer insights with simulated optimization suggestions
- Cognition insights with artificial knowledge extraction
- Full functionality maintained for demonstration purposes

### 🎭 **Mock Response Examples:**
- "Mock mode: The AI would analyze this prompt and provide insights about tank evolution"
- "Simulated response: Tank behavior optimization suggestions would appear with a real API key"
- "Development mode: Real LLM integration would provide detailed tactical analysis here"

### 🔧 **How to Enable Mock Mode:**
1. **Automatic**: Just don't enter an API key - mock mode activates automatically
2. **Explicit**: Check the "🎭 Use Mock Mode" checkbox to force mock responses
3. **Persistent**: Your mock mode preference is saved in localStorage

### 💡 **Why Use Mock Mode:**
- **No cost** - No API usage charges
- **Privacy** - No data sent to external services
- **Testing** - Try all features without setup
- **Demonstration** - Show the system to others safely
- **Learning** - Understand how ASI-ARCH works conceptually

This ensures the application works out-of-the-box while encouraging users to provide their own API keys for real LLM capabilities when desired.
