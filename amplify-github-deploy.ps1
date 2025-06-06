Write-Host ""
Write-Host "AWS Amplify GitHub Integration Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Repository pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "Repository: https://github.com/yasu-dev/lpnavgator-withBE" -ForegroundColor White
Write-Host ""

# Open GitHub repository
Write-Host "Opening GitHub repository..." -ForegroundColor Yellow
Start-Process "https://github.com/yasu-dev/lpnavgator-withBE"

# Open AWS Amplify console for GitHub integration
Write-Host "Opening AWS Amplify console for GitHub integration..." -ForegroundColor Yellow
$amplifyUrl = "https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1#/create"
Start-Process $amplifyUrl

Write-Host ""
Write-Host "GitHub Integration Steps:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "1. In AWS Amplify Console:" -ForegroundColor Yellow
Write-Host "   - Select 'Host your web app'" -ForegroundColor White
Write-Host "   - Choose 'GitHub' as source" -ForegroundColor White
Write-Host "   - Authorize Amplify to access GitHub" -ForegroundColor White
Write-Host ""
Write-Host "2. Repository Configuration:" -ForegroundColor Yellow
Write-Host "   - Repository: yasu-dev/lpnavgator-withBE" -ForegroundColor Cyan
Write-Host "   - Branch: main" -ForegroundColor Cyan
Write-Host "   - App name: lpnavigator-v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Build Settings:" -ForegroundColor Yellow
Write-Host "   - Build spec: Use existing amplify.yml" -ForegroundColor White
Write-Host "   - Advanced settings > Add environment variables:" -ForegroundColor White

$envVars = @"

VITE_API_BASE_URL=https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-northeast-1_m1LkBYqEc
VITE_USER_POOL_CLIENT_ID=7f5hft1ip7gp9kqdh58bidsc4r
VITE_REGION=ap-northeast-1
VITE_USE_MOCK_DATA=false
"@

Write-Host $envVars -ForegroundColor Cyan

# Copy environment variables to clipboard
$envVars.Trim() | Set-Clipboard
Write-Host ""
Write-Host "Environment variables copied to clipboard!" -ForegroundColor Green

Write-Host ""
Write-Host "4. Deploy:" -ForegroundColor Yellow
Write-Host "   - Review and click 'Save and deploy'" -ForegroundColor White
Write-Host "   - Wait for deployment to complete" -ForegroundColor White

Write-Host ""
Write-Host "Auto-deployment features:" -ForegroundColor Green
Write-Host "- Automatic builds on Git push" -ForegroundColor White  
Write-Host "- Pull request previews" -ForegroundColor White
Write-Host "- Custom domains support" -ForegroundColor White
Write-Host "- SSL/TLS certificates" -ForegroundColor White

Write-Host ""
Write-Host "After deployment, your app will be available at:" -ForegroundColor Yellow
Write-Host "https://main.d[APP_ID].amplifyapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Region: Tokyo (ap-northeast-1)" -ForegroundColor Green 