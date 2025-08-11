#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files to process (comprehensive list based on grep search results)
const files = [
    'tank-ai.js',
    'asi-arch-modules.js',
    'test-setup.js',
    'verify-genome-display.js',
    'test-genome-update.js',
    'test-genome-fix-simple.js',
    'test-early-termination.js',
    'test-deepseek-integration.js',
    'simple-blue-debug.js',
    'researcher-insights.js',
    'test-config.html',
    'tests/genome-display.test.js',
    'tests/blue-team-fix.test.js',
    'main.js',
    'evolution-engine.js',
    'game-engine.js',
    'asi-arch-visualizer.js',
    'debug.js',
    'asi-arch-test-suite.js',
    'asi-arch-integration.js',
    'analyst-insights.js',
    'debug-genome-issue.js',
    'debug-genome-console.js',
    'cognition-insights.js',
    'engineer-insights.js',
    'enhanced-tank-ai.js',
    'enhanced-obstacle-system.js',
    'hill-control.js',
    'deepseek-client.js',
    'llm-enhanced-asi-arch.js',
    'enhanced-asi-arch.js',
    'final-test.js',
    'diagnose-team-selection.js',
    'core/dashboard-ui.js',
    'core/utils.js',
    'core/data-collector.js',
    'enhanced-obstacle-demo.html',
    'king-of-hill-demo.html',
    'researcher-insights-demo.html',
    'analyst-insights-demo.html',
    'engineer-insights-demo.html'
];

function removeDebugLogs(filePath) {
    console.log(`Processing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;
        
        // Remove all console debug statements (log, warn, error, info, debug)
        // Pattern 1: Simple single-line console statements
        content = content.replace(/^\s*console\.(log|warn|error|info|debug)\s*\([^)]*\)\s*;?\s*$/gm, '');
        
        // Pattern 2: Console statements with complex string literals (template literals, etc.)
        content = content.replace(/^\s*console\.(log|warn|error|info|debug)\s*\(\s*`[^`]*`[^)]*\)\s*;?\s*$/gm, '');
        content = content.replace(/^\s*console\.(log|warn|error|info|debug)\s*\(\s*'[^']*'[^)]*\)\s*;?\s*$/gm, '');
        content = content.replace(/^\s*console\.(log|warn|error|info|debug)\s*\(\s*"[^"]*"[^)]*\)\s*;?\s*$/gm, '');
        
        // Pattern 3: Console statements in conditional blocks
        content = content.replace(/(\s*)console\.(log|warn|error|info|debug)\s*\([^)]*\)\s*;?\s*/g, '');
        
        // Pattern 4: Handle multiline console statements
        content = content.replace(/console\.(log|warn|error|info|debug)\s*\(\s*[\s\S]*?\)\s*;?/g, (match) => {
            // Only remove if it's a simple debug statement, preserve test mock assignments
            if (match.includes('jest.fn') || match.includes('originalConsole')) {
                return match;
            }
            return '';
        });
        
        // Clean up empty lines and excessive whitespace
        content = content.replace(/^\s*\n/gm, '');
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        content = content.replace(/\n{3,}/g, '\n\n');
        
        const newLength = content.length;
        const removed = originalLength - newLength;
        
        if (removed > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Removed ${removed} characters from ${filePath}`);
        } else {
            console.log(`  ℹ️ No debug logs found in ${filePath}`);
        }
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
}

// Process each file
console.log('🧹 Starting comprehensive console log removal...\n');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        removeDebugLogs(filePath);
    } else {
        console.log(`⚠️ File not found: ${filePath}`);
    }
});

console.log('\n✅ Debug log removal complete!');
console.log('📝 Note: Please review the changes and test your application to ensure functionality is preserved.');
