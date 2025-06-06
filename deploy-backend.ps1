# Backend Deploy Script
Write-Host "Starting backend deployment..." -ForegroundColor Green

# 変数設定
$S3_BUCKET = "lpnavigator-lambda-deploy-137435348064"
$STACK_NAME = "serverless-backend"
$REGION = "ap-northeast-1"

# 現在のディレクトリを保存
$ORIGINAL_DIR = Get-Location

try {
    # serverless-backendディレクトリに移動
    Set-Location -Path "./serverless-backend"
    
    # Lambda関数のパッケージング
    Write-Host "Packaging Lambda functions..." -ForegroundColor Yellow
    
    # 既存のzipファイルを削除
    if (Test-Path "lambda-functions.zip") {
        Remove-Item "lambda-functions.zip" -Force
    }
    
    # srcディレクトリをzipに圧縮
    Compress-Archive -Path "src/*" -DestinationPath "lambda-functions.zip" -Force
    
    # S3にアップロード
    Write-Host "Uploading to S3..." -ForegroundColor Yellow
    aws s3 cp lambda-functions.zip s3://$S3_BUCKET/lambda-functions.zip --region $REGION
    
    # CloudFormationスタックの更新
    Write-Host "Updating CloudFormation stack..." -ForegroundColor Yellow
    aws cloudformation update-stack `
        --stack-name $STACK_NAME `
        --template-body file://template.yaml `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $REGION
    
    # スタックの更新が完了するまで待機
    Write-Host "Waiting for stack update to complete..." -ForegroundColor Yellow
    aws cloudformation wait stack-update-complete `
        --stack-name $STACK_NAME `
        --region $REGION
    
    # APIエンドポイントを取得
    Write-Host "Getting API endpoint..." -ForegroundColor Yellow
    $API_URL = aws cloudformation describe-stacks `
        --stack-name $STACK_NAME `
        --query "Stacks[0].Outputs[?OutputKey=='HttpApiUrl'].OutputValue" `
        --output text `
        --region $REGION
    
    Write-Host "Backend deployment completed!" -ForegroundColor Green
    Write-Host "API Endpoint: $API_URL" -ForegroundColor Cyan
    
    # APIエンドポイントをファイルに保存
    $API_URL | Out-File -FilePath "../api-endpoint.txt" -NoNewline
    
} catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    exit 1
} finally {
    # 元のディレクトリに戻る
    Set-Location -Path $ORIGINAL_DIR
} 