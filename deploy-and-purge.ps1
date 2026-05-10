# deploy-and-purge.ps1 — Promote staging → master and deploy to production
# Usage: .\deploy-and-purge.ps1
# Run from C:\Users\tjn92\truenord

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ZONE_ID = $env:CF_ZONE_ID         # Set in environment or .env when custom domain is live
$CF_TOKEN = $env:CF_API_TOKEN       # Cloudflare API token with Cache Purge permission

Write-Host "`n=== True Nord — Deploy to Production ===" -ForegroundColor Cyan

# 1. Confirm we're on staging
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "staging") {
    Write-Host "ERROR: Must be on staging branch (currently on '$branch'). Aborting." -ForegroundColor Red
    exit 1
}

# 2. Confirm working tree is clean
$dirty = git status --porcelain
if ($dirty) {
    Write-Host "ERROR: Uncommitted changes detected. Commit or stash before deploying." -ForegroundColor Red
    git status --short
    exit 1
}

# 3. Confirm local staging is in sync with origin/staging (staging must have been pushed first)
git fetch origin staging --quiet
$localSha  = git rev-parse staging
$remoteSha = git rev-parse origin/staging
if ($localSha -ne $remoteSha) {
    Write-Host "ERROR: Local staging is ahead of origin/staging." -ForegroundColor Red
    Write-Host "       Run .\deploy-staging.ps1 and verify the staging URL before promoting to production." -ForegroundColor Red
    exit 1
}

Write-Host "  Staging verified: origin/staging matches local ($($localSha.Substring(0,7)))" -ForegroundColor DarkGray

# 5. Merge staging into master
Write-Host "`n[1/3] Merging staging -> master..." -ForegroundColor Yellow
git checkout master
git merge staging --ff-only
git push origin master
git checkout staging

Write-Host "[1/3] Done — Cloudflare Pages will deploy in ~60 seconds." -ForegroundColor Green

# 4. Optional cache purge (requires ZONE_ID + CF_TOKEN)
if ($ZONE_ID -and $CF_TOKEN) {
    Write-Host "`n[2/3] Purging Cloudflare CDN cache..." -ForegroundColor Yellow
    $body = '{"purge_everything":true}'
    $response = Invoke-RestMethod `
        -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $CF_TOKEN"; "Content-Type" = "application/json" } `
        -Body $body
    if ($response.success) {
        Write-Host "[2/3] Cache purged successfully." -ForegroundColor Green
    } else {
        Write-Host "[2/3] Cache purge failed (non-blocking): $($response.errors | ConvertTo-Json)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[2/3] Skipping cache purge — CF_ZONE_ID or CF_API_TOKEN not set." -ForegroundColor DarkGray
    Write-Host "      CDN will refresh naturally within a few minutes." -ForegroundColor DarkGray
}

Write-Host "`n[3/3] Verify at: https://true-nord-photography.pages.dev" -ForegroundColor Cyan
Write-Host "      (Use Ctrl+Shift+R or incognito if you see a stale version)`n" -ForegroundColor DarkGray
