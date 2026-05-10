# deploy-staging.ps1
# Deploys local files to staging.true-nord-photography.pages.dev via Wrangler
# Usage: .\deploy-staging.ps1  (must be on staging branch, clean working tree)

$STAGING_URL  = "https://staging.true-nord-photography.pages.dev"
$LOCAL_URL    = "http://localhost:3456"
$PROJECT_NAME = "true-nord-photography"

Write-Host ""
Write-Host "=== True Nord -- Deploy to Staging ===" -ForegroundColor Cyan

$branch = & git rev-parse --abbrev-ref HEAD
if ($branch -ne "staging") {
    Write-Host "ERROR: Must be on staging branch. Currently on: $branch" -ForegroundColor Red
    exit 1
}

$dirty = & git status --porcelain
if ($dirty) {
    Write-Host "ERROR: Uncommitted changes. Commit before deploying." -ForegroundColor Red
    & git status --short
    exit 1
}

Write-Host ""
Write-Host "[1/3] Pushing git history to origin/staging..." -ForegroundColor Yellow
& git push origin staging
Write-Host "[1/3] Done." -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Deploying to Cloudflare Pages staging branch via Wrangler..." -ForegroundColor Yellow
& npx wrangler pages deploy . --project-name $PROJECT_NAME --branch staging --commit-dirty=true
Write-Host "[2/3] Staging URL is live." -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Verify staging matches local:" -ForegroundColor Yellow
Write-Host "  Local:   $LOCAL_URL" -ForegroundColor White
Write-Host "  Staging: $STAGING_URL" -ForegroundColor White
Write-Host ""
Write-Host "  Use Ctrl+Shift+R on staging to bypass cache." -ForegroundColor DarkGray
Write-Host "  Once verified, run deploy-and-purge.ps1 when live domain is ready." -ForegroundColor DarkGray
Write-Host ""
