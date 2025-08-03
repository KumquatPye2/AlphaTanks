@echo off
:: AlphaTanks Development Setup Script for Windows

echo 🚀 Setting up AlphaTanks development environment...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Run tests
echo 🧪 Running test suite...
call npm test

if %errorlevel% neq 0 (
    echo ❌ Some tests failed. Please check the output above.
    pause
    exit /b 1
)

echo ✅ All tests passed!

:: Check code quality
echo 🔍 Running code quality checks...
call npm run lint

if %errorlevel% neq 0 (
    echo ❌ Code quality issues found. Please fix them.
    pause
    exit /b 1
)

echo ✅ Code quality checks passed!

echo.
echo 🎉 Setup complete! You can now:
echo    • Open index.html in your browser
echo    • Run 'npm start' to start development server  
echo    • Run 'npm test' to run tests
echo    • Run 'npm run lint' for code quality checks
echo.
echo 📚 Documentation:
echo    • README.md - Main documentation
echo    • CONTRIBUTING.md - Development guidelines
echo    • Architecture_Document.md - Technical details
echo.
echo 🚀 Ready to witness AI evolution in action!

pause
