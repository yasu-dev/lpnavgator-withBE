# Netlify デプロイスクリプト
Write-Host "=== lpnavigator-v1 Netlify デプロイ ===" -ForegroundColor Green

# 環境変数の設定
$env:VITE_API_BASE_URL = "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod"
$env:VITE_USER_POOL_ID = "ap-northeast-1_m1LkBYqEc"
$env:VITE_USER_POOL_CLIENT_ID = "7f5hft1ip7gp9kqdh58bidsc4r"
$env:VITE_REGION = "ap-northeast-1"
$env:VITE_USE_MOCK_DATA = "false"

Write-Host "`n環境変数を設定しました:" -ForegroundColor Yellow
Write-Host "VITE_API_BASE_URL: $env:VITE_API_BASE_URL" -ForegroundColor Cyan
Write-Host "VITE_USER_POOL_ID: $env:VITE_USER_POOL_ID" -ForegroundColor Cyan
Write-Host "VITE_USER_POOL_CLIENT_ID: $env:VITE_USER_POOL_CLIENT_ID" -ForegroundColor Cyan
Write-Host "VITE_REGION: $env:VITE_REGION" -ForegroundColor Cyan
Write-Host "VITE_USE_MOCK_DATA: $env:VITE_USE_MOCK_DATA" -ForegroundColor Cyan

# ビルドの実行
Write-Host "`nアプリケーションをビルドしています..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nビルドが成功しました！" -ForegroundColor Green
    
    # distフォルダの確認
    if (Test-Path -Path "dist") {
        Write-Host "`ndistフォルダが作成されました。" -ForegroundColor Green
        Write-Host "ファイル一覧:" -ForegroundColor Yellow
        Get-ChildItem -Path dist -Recurse | Format-Table Name, Length, LastWriteTime
        
        Write-Host "`n=== デプロイ方法 ===" -ForegroundColor Green
        Write-Host "1. https://app.netlify.com/drop を開く" -ForegroundColor Yellow
        Write-Host "2. distフォルダをドラッグ＆ドロップ" -ForegroundColor Yellow
        Write-Host "3. デプロイ完了！" -ForegroundColor Yellow
        
        # distフォルダを開く
        Write-Host "`ndistフォルダを開いています..." -ForegroundColor Cyan
        explorer dist
        
        # Netlify Dropページを開く
        Write-Host "Netlify Dropページを開いています..." -ForegroundColor Cyan
        Start-Process "https://app.netlify.com/drop"
        
    } else {
        Write-Host "`nエラー: distフォルダが見つかりません。" -ForegroundColor Red
    }
} else {
    Write-Host "`nビルドに失敗しました。" -ForegroundColor Red
    exit 1
} 