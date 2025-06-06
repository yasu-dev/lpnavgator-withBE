# Complete Deployment Script - Backend & Frontend
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LP Navigator Complete Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 前提条件のチェック
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# AWS CLIのチェック
$AWS_VERSION = aws --version 2>$null
if (-not $AWS_VERSION) {
    Write-Host "AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ AWS CLI found: $AWS_VERSION" -ForegroundColor Green

# Node.jsのチェック
$NODE_VERSION = node --version 2>$null
if (-not $NODE_VERSION) {
    Write-Host "Node.js is not installed. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: $NODE_VERSION" -ForegroundColor Green

# npmのチェック
$NPM_VERSION = npm --version 2>$null
if (-not $NPM_VERSION) {
    Write-Host "npm is not installed. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm found: $NPM_VERSION" -ForegroundColor Green

# AWS認証チェック
try {
    $AWS_IDENTITY = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ AWS authenticated as: $($AWS_IDENTITY.Arn)" -ForegroundColor Green
} catch {
    Write-Host "AWS authentication failed. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 1: Deploy Backend (Lambda + API Gateway)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# バックエンドのデプロイ
& ./deploy-backend.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBackend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 2: Deploy Frontend (AWS Amplify)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# フロントエンドのデプロイ
& ./deploy-to-amplify.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nFrontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# デプロイ結果の表示
if (Test-Path "amplify-deployment-result.json") {
    $RESULT = Get-Content "amplify-deployment-result.json" | ConvertFrom-Json
    Write-Host "Application Details:" -ForegroundColor Yellow
    Write-Host "  - Frontend URL: $($RESULT.AppUrl)" -ForegroundColor White
    Write-Host "  - API Endpoint: $($RESULT.ApiEndpoint)" -ForegroundColor White
    Write-Host "  - Region: $($RESULT.Region)" -ForegroundColor White
    Write-Host "  - Amplify App ID: $($RESULT.AppId)" -ForegroundColor White
    
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your application at: $($RESULT.AppUrl)" -ForegroundColor White
    Write-Host "2. Test the signup and login functionality" -ForegroundColor White
    Write-Host "3. Monitor logs in AWS CloudWatch" -ForegroundColor White
    
    # ブラウザで開く
    Write-Host "`nOpening application in browser..." -ForegroundColor Green
    Start-Process $RESULT.AppUrl
} 