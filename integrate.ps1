#!/usr/bin/env pwsh
# Integration Helper Script for AlphaTanks Refactoring
# Run this script to help with the integration process

Write-Host "🔧 AlphaTanks Integration Helper" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "index.html")) {
    Write-Host "❌ Please run this script from the AlphaTanks root directory" -ForegroundColor Red
    exit 1
}

# Menu options
$options = @(
    "1. Test refactored components (open test page)"
    "2. Test full integration (open integration page)"
    "3. Backup current files"
    "4. Switch to refactored version (integrate)"
    "5. Rollback to original version"
    "6. Commit refactored work to git"
    "7. Show integration status"
    "8. Exit"
)

function Show-Menu {
    Write-Host "Choose an option:" -ForegroundColor Yellow
    foreach ($option in $options) {
        Write-Host $option -ForegroundColor Cyan
    }
    Write-Host ""
}

function Test-RefactoredComponents {
    Write-Host "🧪 Opening refactored component test page..." -ForegroundColor Blue
    $testPath = (Get-Location).Path + "\refactored\test-refactored.html"
    Start-Process "file:///$($testPath.Replace('\', '/'))"
}

function Test-FullIntegration {
    Write-Host "🎮 Opening full integration test page..." -ForegroundColor Blue
    $integrationPath = (Get-Location).Path + "\index-refactored.html"
    Start-Process "file:///$($integrationPath.Replace('\', '/'))"
}

function Backup-CurrentFiles {
    Write-Host "💾 Creating backup of current files..." -ForegroundColor Blue
    
    $backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    $filesToBackup = @(
        "index.html",
        "game-engine.js",
        "tank-ai.js",
        "hill-control.js",
        "main.js"
    )
    
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            Copy-Item $file "$backupDir\$file"
            Write-Host "✅ Backed up: $file" -ForegroundColor Green
        }
    }
    
    Write-Host "📁 Backup created in: $backupDir" -ForegroundColor Green
}

function Switch-ToRefactored {
    Write-Host "🔄 Switching to refactored version..." -ForegroundColor Blue
    
    # First create backup
    Backup-CurrentFiles
    
    # Update index.html to use refactored components
    $indexContent = Get-Content "index.html" -Raw
    
    # Replace the script loading section
    $oldScripts = @'
    <!-- Game engine modules -->
    <script src="hill-control.js"></script>
    <script src="game-engine.js?v=1754541008"></script>
    <script src="tank-ai.js?v=1754541009"></script>
    <script src="evolution-engine.js?v=1754541003"></script>
'@
    
    $newScripts = @'
    <!-- Refactored Game Engine Components -->
    <script src="refactored/common/constants.js"></script>
    <script src="refactored/common/utils.js"></script>
    <script src="refactored/ai/tank-entity.js"></script>
    <script src="refactored/ai/tank-ai.js"></script>
    <script src="refactored/ai/tank-combat.js"></script>
    <script src="refactored/ai/tank.js"></script>
    <script src="refactored/game/hill-control.js"></script>
    <script src="refactored/game/battle-managers.js"></script>
    <script src="refactored/game/game-engine.js"></script>
    <script src="refactored/validation.js"></script>
    
    <!-- Keep existing evolution engine for now -->
    <script src="evolution-engine.js?v=1754541003"></script>
'@
    
    $updatedContent = $indexContent -replace [regex]::Escape($oldScripts), $newScripts
    
    if ($updatedContent -ne $indexContent) {
        Set-Content "index.html" $updatedContent
        Write-Host "✅ Updated index.html to use refactored components" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Could not automatically update index.html - manual update required" -ForegroundColor Yellow
    }
    
    Write-Host "🎯 Integration complete! Open index.html to test." -ForegroundColor Green
}

function Rollback-ToOriginal {
    Write-Host "↩️ Rolling back to original version..." -ForegroundColor Blue
    
    # Find most recent backup
    $backupDirs = Get-ChildItem -Directory -Name "backup-*" | Sort-Object -Descending
    
    if ($backupDirs.Count -eq 0) {
        Write-Host "❌ No backup directories found" -ForegroundColor Red
        return
    }
    
    $latestBackup = $backupDirs[0]
    Write-Host "📁 Using backup: $latestBackup" -ForegroundColor Blue
    
    $filesToRestore = Get-ChildItem "$latestBackup\*.*"
    
    foreach ($file in $filesToRestore) {
        Copy-Item $file.FullName $file.Name -Force
        Write-Host "✅ Restored: $($file.Name)" -ForegroundColor Green
    }
    
    Write-Host "↩️ Rollback complete!" -ForegroundColor Green
}

function Commit-RefactoredWork {
    Write-Host "📝 Committing refactored work to git..." -ForegroundColor Blue
    
    # Check if git is available
    try {
        git --version | Out-Null
    } catch {
        Write-Host "❌ Git not found. Please install Git or use Git manually." -ForegroundColor Red
        return
    }
    
    # Add refactored files
    git add refactored/
    git add INTEGRATION_GUIDE.md
    git add REFACTORING_SUMMARY.md
    
    # Create commit message
    $commitMessage = @"
Refactor: Complete architectural overhaul

- Split monolithic Tank class (1402→316 lines) into focused components
- Reduced GameEngine complexity (686→320 lines) using composition pattern  
- Centralized configuration and utilities eliminating code duplication
- Maintained full backward compatibility through composition
- Added comprehensive test suite and documentation

Components:
- refactored/common/: constants.js, utils.js
- refactored/ai/: tank-entity.js, tank-ai.js, tank-combat.js, tank.js
- refactored/game/: hill-control.js, battle-managers.js, game-engine.js
- Tests: integration-test.js, test-refactored.html, validation.js
- Documentation: REFACTORING_SUMMARY.md, INTEGRATION_GUIDE.md
"@
    
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Refactored work committed to git!" -ForegroundColor Green
        Write-Host "📊 View changes: git log --oneline -1" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Git commit failed. Please check git status." -ForegroundColor Red
    }
}

function Show-IntegrationStatus {
    Write-Host "📊 Integration Status" -ForegroundColor Blue
    Write-Host "====================" -ForegroundColor Blue
    Write-Host ""
    
    # Check if refactored files exist
    $refactoredFiles = @(
        "refactored/common/constants.js",
        "refactored/common/utils.js",
        "refactored/ai/tank.js",
        "refactored/game/game-engine.js",
        "refactored/integration-test.js"
    )
    
    Write-Host "📦 Refactored Components:" -ForegroundColor Yellow
    foreach ($file in $refactoredFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Integration Files:" -ForegroundColor Yellow
    
    $integrationFiles = @(
        "index-refactored.html",
        "refactored/test-refactored.html",
        "INTEGRATION_GUIDE.md",
        "refactored/validation.js"
    )
    
    foreach ($file in $integrationFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📁 Backup Directories:" -ForegroundColor Yellow
    $backups = Get-ChildItem -Directory -Name "backup-*" 2>$null
    if ($backups.Count -gt 0) {
        foreach ($backup in $backups) {
            Write-Host "  📁 $backup" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  (No backups found)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🔍 Recommended Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test refactored components (option 1)" -ForegroundColor Cyan
    Write-Host "  2. Test full integration (option 2)" -ForegroundColor Cyan
    Write-Host "  3. If tests pass, switch to refactored version (option 4)" -ForegroundColor Cyan
    Write-Host "  4. Commit your work (option 6)" -ForegroundColor Cyan
}

# Main script loop
while ($true) {
    Write-Host ""
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    
    switch ($choice) {
        "1" { Test-RefactoredComponents }
        "2" { Test-FullIntegration }
        "3" { Backup-CurrentFiles }
        "4" { Switch-ToRefactored }
        "5" { Rollback-ToOriginal }
        "6" { Commit-RefactoredWork }
        "7" { Show-IntegrationStatus }
        "8" { 
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            exit 0 
        }
        default { 
            Write-Host "❌ Invalid choice. Please enter 1-8." -ForegroundColor Red 
        }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
