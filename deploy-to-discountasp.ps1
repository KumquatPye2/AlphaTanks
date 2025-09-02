# DiscountASP.NET Deployment Script for AlphaTanks
# This script creates a clean deployment package

Write-Host "Creating deployment package for DiscountASP.NET..." -ForegroundColor Green

# Create deployment directory
$deployDir = ".\deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy essential files for static hosting
Write-Host "Copying essential files..." -ForegroundColor Yellow

# Core HTML file
Copy-Item "index.html" $deployDir

# Core JavaScript files
$jsFiles = @(
    "main.js",
    "game-engine.js", 
    "evolution-engine.js",
    "tank-ai.js",
    "config.js",
    "api-key-manager.js",
    "multi-provider-api-key-manager.js",
    "multi-provider-llm-client.js",
    "deepseek-client.js",
    "asi-arch-integration.js",
    "asi-arch-modules.js", 
    "asi-arch-visualizer.js",
    "enhanced-asi-arch.js",
    "llm-enhanced-asi-arch.js",
    "enhanced-obstacle-system.js",
    "hill-control.js",
    "tactical-evolution-display.js"
)

foreach ($file in $jsFiles) {
    if (Test-Path $file) {
        Copy-Item $file $deployDir
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $file not found" -ForegroundColor Yellow
    }
}

# Copy core directory
if (Test-Path "core") {
    Copy-Item "core" $deployDir -Recurse
    Write-Host "  ✓ core/ directory" -ForegroundColor Green
}

# Copy refactored directory  
if (Test-Path "refactored") {
    Copy-Item "refactored" $deployDir -Recurse
    Write-Host "  ✓ refactored/ directory" -ForegroundColor Green
}

# Copy favicon
if (Test-Path "favicon.svg") {
    Copy-Item "favicon.svg" $deployDir
    Write-Host "  ✓ favicon.svg" -ForegroundColor Green
}

# Copy license and readme
Copy-Item "LICENSE" $deployDir -ErrorAction SilentlyContinue
Copy-Item "README.md" $deployDir -ErrorAction SilentlyContinue

# Create web.config for DiscountASP.NET (IIS configuration)
$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <staticContent>
            <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
            <mimeMap fileExtension=".js" mimeType="application/javascript" />
            <mimeMap fileExtension=".json" mimeType="application/json" />
        </staticContent>
        <defaultDocument>
            <files>
                <clear />
                <add value="index.html" />
            </files>
        </defaultDocument>
        <httpErrors>
            <remove statusCode="404" subStatusCode="-1" />
            <error statusCode="404" prefixLanguageFilePath="" path="/index.html" responseMode="ExecuteURL" />
        </httpErrors>
    </system.webServer>
</configuration>
"@

Set-Content -Path "$deployDir\web.config" -Value $webConfig
Write-Host "  ✓ web.config created" -ForegroundColor Green

# Create deployment info file
$deployInfo = @"
AlphaTanks Deployment Package
============================
Created: $(Get-Date)
Target: DiscountASP.NET

Files included:
- index.html (main application)
- All core JavaScript modules
- core/ directory (insights modules)
- refactored/ directory (refactored components)
- favicon.svg
- web.config (IIS configuration)

Deployment Instructions:
1. Upload all files to your DiscountASP.NET web hosting root directory
2. Ensure all files maintain their relative structure
3. The application will be accessible at your domain root
4. All API calls are configured for client-side operation

Note: This is a static web application that runs entirely in the browser.
"@

Set-Content -Path "$deployDir\DEPLOYMENT_INFO.txt" -Value $deployInfo

Write-Host "`nDeployment package created successfully!" -ForegroundColor Green
Write-Host "Location: $deployDir" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Compress the deploy folder contents to a ZIP file" -ForegroundColor White
Write-Host "2. Upload to your DiscountASP.NET hosting via File Manager or FTP" -ForegroundColor White
Write-Host "3. Extract files to the root web directory (wwwroot or public_html)" -ForegroundColor White

# Show deployment package contents
Write-Host "`nDeployment package contents:" -ForegroundColor Cyan
Get-ChildItem $deployDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Resolve-Path $deployDir).Path + "\", "")
    if ($_.PSIsContainer) {
        Write-Host "  📁 $relativePath/" -ForegroundColor Blue
    } else {
        $size = [math]::Round($_.Length / 1KB, 1)
        Write-Host "  📄 $relativePath ($size KB)" -ForegroundColor Gray
    }
}

$totalSize = (Get-ChildItem $deployDir -Recurse | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "`nTotal package size: $totalSizeMB MB" -ForegroundColor Cyan
