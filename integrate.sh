#!/bin/bash
# Integration Helper Script for AlphaTanks Refactoring
# Run this script to help with the integration process

echo "🔧 AlphaTanks Integration Helper"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from the AlphaTanks root directory"
    exit 1
fi

# Function to show menu
show_menu() {
    echo "Choose an option:"
    echo "1. Test refactored components (open test page)"
    echo "2. Test full integration (open integration page)"  
    echo "3. Backup current files"
    echo "4. Switch to refactored version (integrate)"
    echo "5. Rollback to original version"
    echo "6. Commit refactored work to git"
    echo "7. Show integration status"
    echo "8. Exit"
    echo ""
}

# Function to test refactored components
test_refactored_components() {
    echo "🧪 Opening refactored component test page..."
    if command -v xdg-open > /dev/null; then
        xdg-open "file://$(pwd)/refactored/test-refactored.html"
    elif command -v open > /dev/null; then
        open "file://$(pwd)/refactored/test-refactored.html"
    else
        echo "📁 Open this file manually: $(pwd)/refactored/test-refactored.html"
    fi
}

# Function to test full integration
test_full_integration() {
    echo "🎮 Opening full integration test page..."
    if command -v xdg-open > /dev/null; then
        xdg-open "file://$(pwd)/index-refactored.html"
    elif command -v open > /dev/null; then
        open "file://$(pwd)/index-refactored.html"
    else
        echo "📁 Open this file manually: $(pwd)/index-refactored.html"
    fi
}

# Function to backup current files
backup_current_files() {
    echo "💾 Creating backup of current files..."
    
    backup_dir="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    files_to_backup=(
        "index.html"
        "game-engine.js"
        "tank-ai.js"
        "hill-control.js"
        "main.js"
    )
    
    for file in "${files_to_backup[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$backup_dir/"
            echo "✅ Backed up: $file"
        fi
    done
    
    echo "📁 Backup created in: $backup_dir"
}

# Function to switch to refactored version
switch_to_refactored() {
    echo "🔄 Switching to refactored version..."
    
    # First create backup
    backup_current_files
    
    # Note: This is a simplified version - manual editing may be required
    echo "⚠️  Manual update required:"
    echo "   1. Open index.html"
    echo "   2. Replace the game engine script section with refactored components"
    echo "   3. See INTEGRATION_GUIDE.md for detailed instructions"
    echo ""
    echo "🎯 Or use the PowerShell version (integrate.ps1) for automatic updates"
}

# Function to rollback to original
rollback_to_original() {
    echo "↩️ Rolling back to original version..."
    
    # Find most recent backup
    latest_backup=$(ls -d backup-* 2>/dev/null | sort -r | head -n1)
    
    if [ -z "$latest_backup" ]; then
        echo "❌ No backup directories found"
        return
    fi
    
    echo "📁 Using backup: $latest_backup"
    
    for file in "$latest_backup"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            cp "$file" "$filename"
            echo "✅ Restored: $filename"
        fi
    done
    
    echo "↩️ Rollback complete!"
}

# Function to commit refactored work
commit_refactored_work() {
    echo "📝 Committing refactored work to git..."
    
    # Check if git is available
    if ! command -v git > /dev/null; then
        echo "❌ Git not found. Please install Git or use Git manually."
        return
    fi
    
    # Add refactored files
    git add refactored/
    git add INTEGRATION_GUIDE.md
    git add REFACTORING_SUMMARY.md
    
    # Create commit message
    commit_message="Refactor: Complete architectural overhaul

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
- Documentation: REFACTORING_SUMMARY.md, INTEGRATION_GUIDE.md"
    
    git commit -m "$commit_message"
    
    if [ $? -eq 0 ]; then
        echo "✅ Refactored work committed to git!"
        echo "📊 View changes: git log --oneline -1"
    else
        echo "❌ Git commit failed. Please check git status."
    fi
}

# Function to show integration status
show_integration_status() {
    echo "📊 Integration Status"
    echo "===================="
    echo ""
    
    # Check if refactored files exist
    refactored_files=(
        "refactored/common/constants.js"
        "refactored/common/utils.js"
        "refactored/ai/tank.js"
        "refactored/game/game-engine.js"
        "refactored/integration-test.js"
    )
    
    echo "📦 Refactored Components:"
    for file in "${refactored_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file"
        fi
    done
    
    echo ""
    echo "🔧 Integration Files:"
    
    integration_files=(
        "index-refactored.html"
        "refactored/test-refactored.html"
        "INTEGRATION_GUIDE.md"
        "refactored/validation.js"
    )
    
    for file in "${integration_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file"
        fi
    done
    
    echo ""
    echo "📁 Backup Directories:"
    backups=($(ls -d backup-* 2>/dev/null))
    if [ ${#backups[@]} -gt 0 ]; then
        for backup in "${backups[@]}"; do
            echo "  📁 $backup"
        done
    else
        echo "  (No backups found)"
    fi
    
    echo ""
    echo "🔍 Recommended Next Steps:"
    echo "  1. Test refactored components (option 1)"
    echo "  2. Test full integration (option 2)"
    echo "  3. If tests pass, switch to refactored version (option 4)"
    echo "  4. Commit your work (option 6)"
}

# Main script loop
while true; do
    echo ""
    show_menu
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1) test_refactored_components ;;
        2) test_full_integration ;;
        3) backup_current_files ;;
        4) switch_to_refactored ;;
        5) rollback_to_original ;;
        6) commit_refactored_work ;;
        7) show_integration_status ;;
        8) 
            echo "👋 Goodbye!"
            exit 0
            ;;
        *) 
            echo "❌ Invalid choice. Please enter 1-8."
            ;;
    esac
    
    echo ""
    echo "Press any key to continue..."
    read -n 1 -s
done
