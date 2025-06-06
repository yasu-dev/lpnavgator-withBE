# Poll Amplify Deployment Status and Open URL
param(
    [string]$AppId = 'd144ueb812hf5o',
    [string]$BranchName = 'main',
    [int]$IntervalSeconds = 15
)

# 環境変数設定
if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY) {
    Write-Host 'AWS認証情報を環境変数に設定してください' -ForegroundColor Red
    exit 1
}
$Region = 'ap-northeast-1'

# Active Job ID を取得
$branchJson = aws amplify get-branch --app-id $AppId --branch-name $BranchName --region $Region --output json 2>$null
if (-not $branchJson) { Write-Host 'ブランチ情報の取得に失敗しました' -ForegroundColor Red; exit 1 }
$jobId = (ConvertFrom-Json $branchJson).branch.activeJobId
if (-not $jobId) { Write-Host 'ジョブIDが見つかりません。デプロイが開始されているか確認してください' -ForegroundColor Red; exit 1 }
Write-Host "監視ジョブID: $jobId" -ForegroundColor Cyan

# ステータスをポーリング
$status = ''
while ($true) {
    $jobJson = aws amplify get-job --app-id $AppId --branch-name $BranchName --job-id $jobId --region $Region --output json 2>$null
    if ($jobJson) {
        $status = (ConvertFrom-Json $jobJson).job.summary.status
        Write-Host "ステータス: $status" -ForegroundColor Yellow
        if ($status -eq 'SUCCEED') { break }
        if ($status -in @('FAILED','CANCELLED')) { Write-Host "デプロイ失敗: $status" -ForegroundColor Red; exit 1 }
    } else {
        Write-Host 'ジョブ情報の取得に失敗...' -ForegroundColor Red
    }
    Start-Sleep -Seconds $IntervalSeconds
}

# 完了後、URLを開く
$appUrl = "https://$BranchName.$AppId.amplifyapp.com"
Write-Host "`nデプロイが完了しました: $appUrl" -ForegroundColor Green
Start-Process $appUrl 