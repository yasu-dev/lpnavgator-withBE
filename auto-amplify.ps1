Write-Host ""
Write-Host "AWS Amplify Deployment Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Open AWS Amplify console
$url = "https://ap-northeast-1.console.aws.amazon.com/amplify/create?region=ap-northeast-1#"
Write-Host "Opening AWS Amplify console..." -ForegroundColor Yellow
Start-Process $url

# Open file explorer
Write-Host "Opening file location..." -ForegroundColor Yellow
Start-Process explorer.exe -ArgumentList "."

Write-Host ""
Write-Host "Steps to deploy:" -ForegroundColor Green
Write-Host "1. Select 'Host your web app'" -ForegroundColor White
Write-Host "2. Select 'Deploy without Git provider'" -ForegroundColor White
Write-Host "3. App name: lpnavigator-v1" -ForegroundColor White
Write-Host "4. Drop amplify-deploy.zip file" -ForegroundColor White
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Yellow
Write-Host "https://main.d[APP_ID].amplifyapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Region: Tokyo (ap-northeast-1)" -ForegroundColor Green 