# deploy-staging.ps1 — Push current work to staging for verification
# Usage: .\deploy-staging.ps1
# Run from C:\Users\tjn92\truenord after verifying changes on localhost:3456

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$STAGING_URL = "https://staging.true-nord-photography.pages.dev"
$LOCAL_URL   = "http://localhost:3456"

Write-Host "`n=== True Nord — Deploy to Staging ===" -ForegroundColor Cyan

# 1. Must be on staging branch
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "staging") {
    Write-Host "ERROR: Must be on staging branch (currently on '$branch'). Aborting." -ForegroundColor Red
    exit 1
}

# 2. Must have no uncommitted changes
$dirty = git status --porcelain
if ($dirty) {
    Write-Host "ERROR: Uncommitted changes detected. Commit before pushing to staging." -ForegroundColor Red
    git status --short
    exit 1
}

# 3. Push to origin/staging
Write-Host "`n[1/2] Pushing to origin/staging..." -ForegroundColor Yellow
git push origin staging
Write-Host "[1/2] Done — Cloudflare Pages is building the staging preview." -ForegroundColor Green

# 4. Print verification instructions
Write-Host "`n[2/2] Verify staging matches local before promoting to production:" -ForegroundColor Yellow
Write-Host "  Local:    $LOCAL_URL" -ForegroundColor White
Write-Host "  Staging:  $STAGING_URL" -ForegroundColor White
Write-Host "`n  Cloudflare build takes ~30-60 seconds. Use Ctrl+Shift+R to bypass cache." -ForegroundColor DarkGray
Write-Host "  When staging looks correct, run .\deploy-and-purge.ps1 to promote to production.`n" -ForegroundColor DarkGray
