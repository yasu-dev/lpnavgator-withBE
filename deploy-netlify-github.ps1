Write-Host ""
Write-Host "🚀 Netlify GitHub Auto-Deploy" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Repository information
$REPO_URL = "https://github.com/yasu-dev/lpnavgator-withBE"
$NETLIFY_DEPLOY_URL = "https://app.netlify.com/start/deploy?repository=$REPO_URL"

Write-Host "Repository: $REPO_URL" -ForegroundColor Cyan
Write-Host ""

# Environment variables for Netlify
$ENV_VARS = @"
VITE_API_BASE_URL=https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-northeast-1_m1LkBYqEc
VITE_USER_POOL_CLIENT_ID=7f5hft1ip7gp9kqdh58bidsc4r
VITE_REGION=ap-northeast-1
VITE_USE_MOCK_DATA=false
"@

# Copy environment variables to clipboard
$ENV_VARS | Set-Clipboard
Write-Host "✅ Environment variables copied to clipboard!" -ForegroundColor Green

# Create Netlify configuration
$NETLIFY_CONFIG = @"
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "*"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"@

$NETLIFY_CONFIG | Out-File -FilePath "netlify.toml" -Encoding UTF8 -Force
Write-Host "✅ Netlify configuration created: netlify.toml" -ForegroundColor Green

# Open Netlify Deploy URL
Write-Host ""
Write-Host "🌐 Opening Netlify Deploy URL..." -ForegroundColor Yellow
Start-Process $NETLIFY_DEPLOY_URL

Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔗 Connect to GitHub (if not already connected)" -ForegroundColor Yellow
Write-Host "2. 🎯 Select repository: yasu-dev/lpnavgator-withBE" -ForegroundColor Yellow
Write-Host "3. ⚙️  Configure build settings:" -ForegroundColor Yellow
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Publish directory: dist" -ForegroundColor White
Write-Host ""
Write-Host "4. 🔧 Add environment variables:" -ForegroundColor Yellow
Write-Host "   (Paste from clipboard - already copied!)" -ForegroundColor White
Write-Host $ENV_VARS -ForegroundColor Cyan
Write-Host ""
Write-Host "5. 🚀 Click 'Deploy site'" -ForegroundColor Yellow

Write-Host ""
Write-Host "⏳ Deployment will take 2-3 minutes" -ForegroundColor Yellow
Write-Host "🎯 You'll get a URL like: https://[random-name].netlify.app" -ForegroundColor Green

# Commit netlify.toml to repository
Write-Host ""
Write-Host "📝 Adding Netlify config to repository..." -ForegroundColor Yellow

try {
    git add netlify.toml
    git commit -m "Add Netlify configuration for deployment"
    git push origin main
    Write-Host "✅ Netlify config committed and pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Git commit failed - manual commit may be needed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Repository is ready for deployment!" -ForegroundColor Green 