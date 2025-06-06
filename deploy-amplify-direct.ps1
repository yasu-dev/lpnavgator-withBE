# Direct Amplify Deployment using AWS API
$ErrorActionPreference = "Stop"

# AWS Credentials (環境変数から取得)
$AWS_ACCESS_KEY_ID = $env:AWS_ACCESS_KEY_ID
$AWS_SECRET_ACCESS_KEY = $env:AWS_SECRET_ACCESS_KEY
$AWS_REGION = "ap-northeast-1"

if (-not $AWS_ACCESS_KEY_ID -or -not $AWS_SECRET_ACCESS_KEY) {
    Write-Host "AWS認証情報が設定されていません。" -ForegroundColor Red
    Write-Host "以下のコマンドを実行してください：" -ForegroundColor Yellow
    Write-Host '$env:AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY"' -ForegroundColor Cyan
    Write-Host '$env:AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_KEY"' -ForegroundColor Cyan
    exit 1
}

# API設定
$API_ENDPOINT = "https://amplify.$AWS_REGION.amazonaws.com"
$APP_NAME = "lpnavigator-v1"
$BRANCH_NAME = "main"

# 署名用の関数
function Get-AWSSignature {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Body = "",
        [hashtable]$Headers = @{}
    )
    
    $Service = "amplify"
    $Date = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
    $DateStamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd")
    
    # ヘッダーを作成
    $Headers["host"] = ([System.Uri]$Uri).Host
    $Headers["x-amz-date"] = $Date
    
    # 正規リクエストを作成
    $CanonicalHeaders = ($Headers.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key):$($_.Value)" }) -join "`n"
    $SignedHeaders = ($Headers.Keys | Sort-Object) -join ";"
    
    $PayloadHash = [System.BitConverter]::ToString(
        [System.Security.Cryptography.SHA256]::Create().ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($Body)
        )
    ).Replace("-", "").ToLower()
    
    $CanonicalRequest = @(
        $Method
        ([System.Uri]$Uri).AbsolutePath
        ([System.Uri]$Uri).Query.TrimStart("?")
        $CanonicalHeaders
        ""
        $SignedHeaders
        $PayloadHash
    ) -join "`n"
    
    # 署名を計算
    $Algorithm = "AWS4-HMAC-SHA256"
    $CredentialScope = "$DateStamp/$AWS_REGION/$Service/aws4_request"
    
    $StringToSign = @(
        $Algorithm
        $Date
        $CredentialScope
        [System.BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash(
                [System.Text.Encoding]::UTF8.GetBytes($CanonicalRequest)
            )
        ).Replace("-", "").ToLower()
    ) -join "`n"
    
    # 署名キーを生成
    $SigningKey = [System.Text.Encoding]::UTF8.GetBytes("AWS4$AWS_SECRET_ACCESS_KEY")
    $SigningKey = (New-Object System.Security.Cryptography.HMACSHA256 @(,$SigningKey)).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($DateStamp))
    $SigningKey = (New-Object System.Security.Cryptography.HMACSHA256 @(,$SigningKey)).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($AWS_REGION))
    $SigningKey = (New-Object System.Security.Cryptography.HMACSHA256 @(,$SigningKey)).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Service))
    $SigningKey = (New-Object System.Security.Cryptography.HMACSHA256 @(,$SigningKey)).ComputeHash([System.Text.Encoding]::UTF8.GetBytes("aws4_request"))
    
    $Signature = [System.BitConverter]::ToString(
        (New-Object System.Security.Cryptography.HMACSHA256 @(,$SigningKey)).ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($StringToSign)
        )
    ).Replace("-", "").ToLower()
    
    # Authorization ヘッダーを作成
    $AuthHeader = "$Algorithm Credential=$AWS_ACCESS_KEY_ID/$CredentialScope, SignedHeaders=$SignedHeaders, Signature=$Signature"
    
    return @{
        "Authorization" = $AuthHeader
        "x-amz-date" = $Date
        "host" = ([System.Uri]$Uri).Host
    }
}

try {
    Write-Host "AWS Amplifyへの直接デプロイを開始します..." -ForegroundColor Green
    
    # 1. アプリを作成
    Write-Host "Amplifyアプリを作成中..." -ForegroundColor Yellow
    
    $CreateAppBody = @{
        name = $APP_NAME
        description = "LP Navigator Application"
        environmentVariables = @{
            VITE_API_BASE_URL = "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod"
            VITE_USER_POOL_ID = "ap-northeast-1_m1LkBYqEc"
            VITE_USER_POOL_CLIENT_ID = "7f5hft1ip7gp9kqdh58bidsc4r"
            VITE_REGION = "ap-northeast-1"
            VITE_USE_MOCK_DATA = "false"
        }
    } | ConvertTo-Json -Compress
    
    $Uri = "$API_ENDPOINT/apps"
    $SignatureHeaders = Get-AWSSignature -Method "POST" -Uri $Uri -Body $CreateAppBody
    
    $Headers = @{
        "Content-Type" = "application/x-amz-json-1.1"
        "Accept" = "application/json"
    }
    $Headers += $SignatureHeaders
    
    try {
        $CreateResponse = Invoke-RestMethod -Uri $Uri -Method POST -Headers $Headers -Body $CreateAppBody
        $APP_ID = $CreateResponse.app.appId
        Write-Host "アプリ作成成功: $APP_ID" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "アプリが既に存在する可能性があります。リスト取得を試みます..." -ForegroundColor Yellow
            # TODO: リスト取得のロジック
        } else {
            throw
        }
    }
    
    Write-Host "`n手動でのデプロイが必要です：" -ForegroundColor Cyan
    Write-Host "1. 以下のURLにアクセス：" -ForegroundColor Yellow
    Write-Host "   https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1" -ForegroundColor White
    Write-Host "2. 'lpnavigator-v1'アプリを選択" -ForegroundColor Yellow
    Write-Host "3. 'Deploy without Git provider'を選択" -ForegroundColor Yellow
    Write-Host "4. 作成済みの 'amplify-deploy.zip' をアップロード" -ForegroundColor Yellow
    
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} 