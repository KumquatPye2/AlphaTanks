#!/bin/bash

# AlphaTanks Development Setup Script

echo "🚀 Setting up AlphaTanks development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run tests
echo "🧪 Running test suite..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Please check the output above."
    exit 1
fi

# Check code quality
echo "🔍 Running code quality checks..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ Code quality checks passed!"
else
    echo "❌ Code quality issues found. Please fix them."
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   • Open index.html in your browser"
echo "   • Run 'npm start' to start development server"
echo "   • Run 'npm test' to run tests"
echo "   • Run 'npm run lint' for code quality checks"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Main documentation"
echo "   • CONTRIBUTING.md - Development guidelines"
echo "   • Architecture_Document.md - Technical details"
echo ""
echo "🚀 Ready to witness AI evolution in action!"
