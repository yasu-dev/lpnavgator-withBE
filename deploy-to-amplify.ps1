# AWS Amplify Deploy Script
Write-Host "Starting AWS Amplify deployment..." -ForegroundColor Green

# 変数設定
$APP_NAME = "lpnavigator-v1"
$REGION = "ap-northeast-1"
$BRANCH_NAME = "main"

# バックエンドのAPIエンドポイントを読み込む
if (Test-Path "api-endpoint.txt") {
    $API_ENDPOINT = Get-Content "api-endpoint.txt" -Raw
    Write-Host "Using API endpoint: $API_ENDPOINT" -ForegroundColor Cyan
} else {
    Write-Host "API endpoint file not found. Please run deploy-backend.ps1 first." -ForegroundColor Red
    exit 1
}

try {
    # 1. フロントエンドをビルド
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build
    
    # 2. 既存のAmplifyアプリケーションを確認
    Write-Host "Checking for existing Amplify app..." -ForegroundColor Yellow
    $EXISTING_APP = aws amplify list-apps `
        --query "apps[?name=='$APP_NAME'].appId" `
        --output text `
        --region $REGION
    
    if ($EXISTING_APP) {
        Write-Host "Found existing app: $EXISTING_APP" -ForegroundColor Yellow
        $APP_ID = $EXISTING_APP
    } else {
        # 3. Amplifyアプリケーションを作成
        Write-Host "Creating new Amplify app..." -ForegroundColor Yellow
        $CREATE_RESULT = aws amplify create-app `
            --name $APP_NAME `
            --description "LP Navigator Application" `
            --region $REGION `
            --output json | ConvertFrom-Json
        
        $APP_ID = $CREATE_RESULT.app.appId
        Write-Host "Created app with ID: $APP_ID" -ForegroundColor Green
    }
    
    # 4. 環境変数を設定
    Write-Host "Setting environment variables..." -ForegroundColor Yellow
    aws amplify update-app `
        --app-id $APP_ID `
        --environment-variables "VITE_API_BASE_URL=$API_ENDPOINT" `
        --region $REGION
    
    # 5. ビルド設定を更新（amplify.ymlがすでに存在する場合はそれを使用）
    if (-not (Test-Path "amplify.yml")) {
        Write-Host "Creating amplify.yml..." -ForegroundColor Yellow
        @"
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
"@ | Out-File -FilePath "amplify.yml" -Encoding UTF8
    }
    
    # 6. 手動デプロイ用のzipファイルを作成
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    
    # 既存のzipファイルを削除
    if (Test-Path "amplify-deploy.zip") {
        Remove-Item "amplify-deploy.zip" -Force
    }
    
    # distディレクトリとamplify.ymlをzipに圧縮
    Compress-Archive -Path "dist/*", "amplify.yml" -DestinationPath "amplify-deploy.zip" -Force
    
    # 7. S3バケットを作成（デプロイ用）
    $DEPLOY_BUCKET = "amplify-deploy-$APP_ID"
    $BUCKET_EXISTS = aws s3api head-bucket --bucket $DEPLOY_BUCKET 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating S3 bucket for deployment..." -ForegroundColor Yellow
        aws s3api create-bucket `
            --bucket $DEPLOY_BUCKET `
            --region $REGION `
            --create-bucket-configuration LocationConstraint=$REGION
    }
    
    # 8. zipファイルをS3にアップロード
    Write-Host "Uploading deployment package to S3..." -ForegroundColor Yellow
    aws s3 cp amplify-deploy.zip s3://$DEPLOY_BUCKET/amplify-deploy.zip --region $REGION
    
    # 9. ブランチを作成（存在しない場合）
    $BRANCH_EXISTS = aws amplify list-branches `
        --app-id $APP_ID `
        --query "branches[?branchName=='$BRANCH_NAME'].branchName" `
        --output text `
        --region $REGION
    
    if (-not $BRANCH_EXISTS) {
        Write-Host "Creating branch..." -ForegroundColor Yellow
        aws amplify create-branch `
            --app-id $APP_ID `
            --branch-name $BRANCH_NAME `
            --region $REGION
    }
    
    # 10. デプロイメントを作成
    Write-Host "Creating deployment..." -ForegroundColor Yellow
    $DEPLOYMENT_RESULT = aws amplify create-deployment `
        --app-id $APP_ID `
        --branch-name $BRANCH_NAME `
        --region $REGION `
        --output json | ConvertFrom-Json
    
    $JOB_ID = $DEPLOYMENT_RESULT.jobId
    $UPLOAD_URL = $DEPLOYMENT_RESULT.zipUploadUrl
    
    # 11. デプロイメントパッケージをアップロード
    Write-Host "Uploading to Amplify..." -ForegroundColor Yellow
    $zipContent = [System.IO.File]::ReadAllBytes("amplify-deploy.zip")
    Invoke-WebRequest -Uri $UPLOAD_URL -Method PUT -Body $zipContent -ContentType "application/zip"
    
    # 12. デプロイメントを開始
    Write-Host "Starting deployment..." -ForegroundColor Yellow
    aws amplify start-deployment `
        --app-id $APP_ID `
        --branch-name $BRANCH_NAME `
        --job-id $JOB_ID `
        --region $REGION
    
    # 13. デプロイメントの完了を待つ
    Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
    $DEPLOYMENT_STATUS = "PENDING"
    while ($DEPLOYMENT_STATUS -in @("PENDING", "PROVISIONING", "DEPLOYING", "RUNNING")) {
        Start-Sleep -Seconds 10
        $JOB_RESULT = aws amplify get-job `
            --app-id $APP_ID `
            --branch-name $BRANCH_NAME `
            --job-id $JOB_ID `
            --region $REGION `
            --output json | ConvertFrom-Json
        
        $DEPLOYMENT_STATUS = $JOB_RESULT.job.summary.status
        Write-Host "Status: $DEPLOYMENT_STATUS" -ForegroundColor Yellow
    }
    
    if ($DEPLOYMENT_STATUS -eq "SUCCEED") {
        # アプリケーションのURLを取得
        $APP_URL = aws amplify get-app `
            --app-id $APP_ID `
            --query "app.defaultDomain" `
            --output text `
            --region $REGION
        
        Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
        Write-Host "Application URL: https://$BRANCH_NAME.$APP_URL" -ForegroundColor Cyan
        
        # 結果をファイルに保存
        @{
            AppId = $APP_ID
            AppUrl = "https://$BRANCH_NAME.$APP_URL"
            ApiEndpoint = $API_ENDPOINT
            Region = $REGION
        } | ConvertTo-Json | Out-File -FilePath "amplify-deployment-result.json" -Encoding UTF8
        
    } else {
        Write-Host "Deployment failed with status: $DEPLOYMENT_STATUS" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    exit 1
} finally {
    # クリーンアップ
    if (Test-Path "amplify-deploy.zip") {
        Remove-Item "amplify-deploy.zip" -Force
    }
} 