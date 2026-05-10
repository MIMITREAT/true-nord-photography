# deploy-staging.ps1 — Deploy local files directly to staging.true-nord-photography.pages.dev
# Usage: .\deploy-staging.ps1
# Run from C:\Users\tjn92\truenord after verifying changes on localhost:3456

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$STAGING_URL   = "https://staging.true-nord-photography.pages.dev"
$LOCAL_URL     = "http://localhost:3456"
$PROJECT_NAME  = "true-nord-photography"

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
    Write-Host "ERROR: Uncommitted changes detected. Commit before deploying to staging." -ForegroundColor Red
    git status --short
    exit 1
}

# 3. Push git history to origin/staging (version control record)
Write-Host "`n[1/3] Pushing git history to origin/staging..." -ForegroundColor Yellow
git push origin staging
Write-Host "[1/3] Done." -ForegroundColor Green

# 4. Deploy local files directly to Cloudflare Pages staging branch
#    This is what actually updates staging.true-nord-photography.pages.dev immediately
Write-Host "`n[2/3] Deploying to Cloudflare Pages (staging branch)..." -ForegroundColor Yellow
npx wrangler pages deploy . --project-name $PROJECT_NAME --branch staging --commit-dirty=true
Write-Host "[2/3] Deployed — staging URL is live." -ForegroundColor Green

# 5. Print verification instructions
Write-Host "`n[3/3] Verify staging matches local:" -ForegroundColor Yellow
Write-Host "  Local:    $LOCAL_URL" -ForegroundColor White
Write-Host "  Staging:  $STAGING_URL" -ForegroundColor White
Write-Host "`n  Use Ctrl+Shift+R on staging to bypass cache." -ForegroundColor DarkGray
Write-Host "  When verified, run .\deploy-and-purge.ps1 to promote to production once live domain is ready.`n" -ForegroundColor DarkGray
