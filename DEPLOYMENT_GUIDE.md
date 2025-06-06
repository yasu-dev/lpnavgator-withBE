# LP Navigator デプロイメントガイド

## 概要
このガイドでは、LP NavigatorアプリケーションをAWS Amplifyを使用してデプロイする手順を説明します。バックエンド（Lambda + API Gateway）とフロントエンド（React + Vite）の両方をカバーしています。

## 前提条件

### 必要なツール
- **AWS CLI**: [インストールガイド](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Node.js** (v18以上): [ダウンロード](https://nodejs.org/)
- **PowerShell** (Windows)

### AWS設定
```powershell
# AWS CLIの設定
aws configure
```
以下を入力：
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `ap-northeast-1`
- Default output format: `json`

## デプロイ手順

### 1. 簡単デプロイ（推奨）
すべてを一度にデプロイする場合：
```powershell
./deploy-all.ps1
```

### 2. 個別デプロイ

#### バックエンドのデプロイ
```powershell
./deploy-backend.ps1
```
このスクリプトは以下を実行します：
- Lambda関数のパッケージング
- S3へのアップロード
- CloudFormationスタックの更新
- APIエンドポイントの取得

#### フロントエンドのデプロイ
```powershell
./deploy-to-amplify.ps1
```
このスクリプトは以下を実行します：
- フロントエンドのビルド
- Amplifyアプリの作成/更新
- 環境変数の設定（API エンドポイント）
- デプロイメントの実行

## アーキテクチャ

```
┌─────────────────┐     ┌──────────────────┐
│   AWS Amplify   │────▶│   CloudFront     │
│   (Frontend)    │     │   Distribution   │
└─────────────────┘     └──────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐     ┌──────────────────┐
│  API Gateway    │────▶│  Lambda Functions │
│  (HTTP API)     │     │  - createUser     │
└─────────────────┘     │  - login          │
                        │  - getUser        │
                        └──────────────────┘
                                 │
                        ┌────────▼─────────┐
                        │                  │
                        │  DynamoDB        │
                        │  Cognito         │
                        │                  │
                        └──────────────────┘
```

## 環境変数

### フロントエンド（Amplify）
- `VITE_API_BASE_URL`: バックエンドAPIのエンドポイント

### バックエンド（Lambda）
- `USER_POOL_ID`: Cognito User Pool ID
- `USER_POOL_CLIENT_ID`: Cognito User Pool Client ID
- `USER_TABLE_NAME`: DynamoDB テーブル名
- `REGION`: AWSリージョン

## トラブルシューティング

### CORS エラー
すべてのLambda関数のレスポンスにCORSヘッダーが含まれていることを確認：
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};
```

### デプロイメントの失敗
1. AWS認証情報を確認
2. 必要なIAMポリシーがあることを確認
3. CloudFormationスタックのイベントログを確認

### ログの確認
- **Lambda関数**: CloudWatch Logs
- **Amplifyビルド**: Amplifyコンソールのビルドログ

## デプロイ後の確認

1. **アプリケーションURL**を開く
2. **サインアップ機能**をテスト
3. **ログイン機能**をテスト
4. **CloudWatch**でエラーログを確認

## 削除手順

リソースを削除する場合：
```powershell
# Amplifyアプリの削除
aws amplify delete-app --app-id <APP_ID> --region ap-northeast-1

# CloudFormationスタックの削除
aws cloudformation delete-stack --stack-name serverless-backend --region ap-northeast-1
```

## サポート

問題が発生した場合は、以下を確認してください：
- AWS CloudFormationコンソール
- AWS Amplifyコンソール
- CloudWatch Logs 