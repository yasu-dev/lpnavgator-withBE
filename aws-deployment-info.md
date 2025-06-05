# AWS デプロイメント完了情報

## 作成されたリソース

### 1. DynamoDB テーブル
- **テーブル名**: `UserTable-lpnavigator-backend`
- **リージョン**: `ap-northeast-1`
- **キー構造**: 
  - パーティションキー: `pk` (String)
  - ソートキー: `sk` (String)

### 2. Cognito User Pool
- **User Pool ID**: `ap-northeast-1_m1LkBYqEc`
- **User Pool Client ID**: `7f5hft1ip7gp9kqdh58bidsc4r`
- **リージョン**: `ap-northeast-1`

### 3. Lambda 関数
- **CreateUserFunction**: `CreateUserFunction-lpnavigator-backend`
- **LoginFunction**: `LoginFunction-lpnavigator-backend`
- **GetUserFunction**: `GetUserFunction-lpnavigator-backend`
- **IAM Role**: `LambdaExecRole-lpnavigator-backend`

### 4. API Gateway
- **API ID**: `7dm1erset7`
- **エンドポイント URL**: `https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod`
- **利用可能なルート**:
  - `POST /v1/users/signup` - ユーザー登録
  - `POST /v1/users/login` - ユーザーログイン
  - `GET /v1/users/{userId}` - ユーザー情報取得

## フロントエンド設定

フロントエンドアプリケーションで以下の環境変数を設定してください：

```env
REACT_APP_API_BASE_URL=https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1
REACT_APP_USER_POOL_ID=ap-northeast-1_m1LkBYqEc
REACT_APP_USER_POOL_CLIENT_ID=7f5hft1ip7gp9kqdh58bidsc4r
```

## テスト方法

### 1. ユーザー登録のテスト
```bash
curl -X POST https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'
```

### 2. ログインのテスト
```bash
curl -X POST https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 次のステップ

1. フロントエンドアプリケーションの環境変数を更新
2. アプリケーションをビルドして動作確認
3. 必要に応じてCORS設定を追加
4. 認証が必要なエンドポイントにJWT認証を追加

## 注意事項

- 現在、すべてのエンドポイントは認証なしでアクセス可能です
- 本番環境では適切な認証・認可の設定が必要です
- Lambda関数のログはCloudWatch Logsで確認できます 