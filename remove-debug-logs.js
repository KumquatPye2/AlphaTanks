#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files to process
const files = [
    'main.js',
    'evolution-engine.js',
    'asi-arch-modules.js',
    'game-engine.js',
    'asi-arch-visualizer.js',
    'debug.js',
    'asi-arch-test-suite.js'
];

function removeDebugLogs(filePath) {
    console.log(`Processing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;
        
        // Remove console.log statements but preserve console.warn and console.error
        // This regex matches console.log(...) but not console.warn or console.error
        content = content.replace(/^\s*console\.log\([^;]*\);?\s*$/gm, '');
        
        // Remove empty lines that might be left behind
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        const newLength = content.length;
        const removed = originalLength - newLength;
        
        if (removed > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  Removed ${removed} characters from ${filePath}`);
        } else {
            console.log(`  No debug logs found in ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Process each file
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        removeDebugLogs(filePath);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});

console.log('Debug log removal complete!');
