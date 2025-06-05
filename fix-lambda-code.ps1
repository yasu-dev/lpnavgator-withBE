Write-Host "Fixing Lambda function code and updating..." -ForegroundColor Green

# Change to serverless-backend directory
Set-Location serverless-backend

Write-Host "Creating corrected package.json..." -ForegroundColor Yellow
$packageJson = @{
    name = "serverless-backend"
    version = "1.0.0"
    description = "Serverless backend for mock frontend"
    main = "index.js"
    dependencies = @{
        "aws-sdk" = "^2.1350.0"
        "jsonwebtoken" = "^9.0.0"
        "jwk-to-pem" = "^2.0.5"
        "uuid" = "^9.0.0"
        "node-fetch" = "^2.6.7"
    }
}

$packageJson | ConvertTo-Json -Depth 3 | Out-File -FilePath "package.json" -Encoding UTF8

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --production

Write-Host "Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path "src", "node_modules", "package.json" -DestinationPath "lambda-functions-fixed.zip" -Force

Write-Host "Updating Lambda functions..." -ForegroundColor Yellow
aws lambda update-function-code --function-name CreateUserFunction-lpnavigator-backend-v3 --zip-file fileb://lambda-functions-fixed.zip --region ap-northeast-1
aws lambda update-function-code --function-name LoginFunction-lpnavigator-backend-v3 --zip-file fileb://lambda-functions-fixed.zip --region ap-northeast-1
aws lambda update-function-code --function-name GetUserFunction-lpnavigator-backend-v3 --zip-file fileb://lambda-functions-fixed.zip --region ap-northeast-1

Set-Location ..
Write-Host "Lambda functions updated successfully!" -ForegroundColor Green
Read-Host "Press Enter to continue" 