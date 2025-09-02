# Complete GitHub Pages Cleanup Script

# This script completely removes GitHub Pages deployment
# WARNING: This will make your site inaccessible

Write-Host "GitHub Pages Cleanup Options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. DISABLE PAGES (Recommended)" -ForegroundColor Green
Write-Host "   - Go to: https://github.com/KumquatPye2/AlphaTanks/settings/pages"
Write-Host "   - Source: None"
Write-Host "   - Click Save"
Write-Host ""
Write-Host "2. DELETE CNAME (if custom domain)" -ForegroundColor Yellow
if (Test-Path "CNAME") {
    Write-Host "   - CNAME file found - deleting..."
    Remove-Item "CNAME" -Force
    Write-Host "   - CNAME deleted" -ForegroundColor Green
} else {
    Write-Host "   - No CNAME file found" -ForegroundColor Gray
}
Write-Host ""
Write-Host "3. COMMIT CHANGES (if CNAME was deleted)" -ForegroundColor Blue
if (-not (Test-Path "CNAME")) {
    Write-Host "   - No changes to commit" -ForegroundColor Gray
} else {
    Write-Host "   - Run: git add -A && git commit -m 'Remove CNAME' && git push"
}
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "- Method 1 (disable in settings) is usually enough"
Write-Host "- Your repository will remain public"
Write-Host "- You can re-enable Pages anytime"
Write-Host "- Site URL will become inaccessible within minutes"
