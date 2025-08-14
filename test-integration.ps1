#!/usr/bin/env pwsh
# Quick Integration Test Script

Write-Host "🧪 Running Quick Integration Test..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if files exist
$requiredFiles = @(
    "refactored/common/constants.js",
    "refactored/common/utils.js", 
    "refactored/ai/tank.js",
    "refactored/game/game-engine.js",
    "refactored/game/hill-control.js",
    "index-refactored.html"
)

Write-Host "📦 Checking required files..." -ForegroundColor Blue
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some required files are missing. Integration cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Opening integration test page..." -ForegroundColor Blue

# Get the full path and open in browser
$indexPath = (Get-Location).Path + "\index-refactored.html"
$fileUrl = "file:///$($indexPath.Replace('\', '/'))"

try {
    Start-Process $fileUrl
    Write-Host "✅ Integration test page opened!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Check the browser console for any errors" -ForegroundColor Cyan
    Write-Host "  2. Look for the integration status popup in the top-right" -ForegroundColor Cyan
    Write-Host "  3. Click 'Start Evolution' to test the game functionality" -ForegroundColor Cyan
    Write-Host "  4. If all tests pass, you can safely integrate!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Expected results:" -ForegroundColor Yellow
    Write-Host "  ✅ Integration Status: PASS" -ForegroundColor Green
    Write-Host "  ✅ All components working" -ForegroundColor Green
    Write-Host "  ✅ No console errors" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to open browser. Please manually open: $indexPath" -ForegroundColor Red
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
