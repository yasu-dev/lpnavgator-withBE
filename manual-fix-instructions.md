# AWS コンソールでの手動修正手順

## 前提条件
- AWS Management Console へのアクセス権限
- API Gateway、Lambda、CloudWatch Logs の操作権限

## 手順1: API Gateway の確認と修正

### 1.1 API Gateway コンソールを開く
1. AWS Management Console にログイン
2. サービス検索で "API Gateway" を検索
3. API Gateway コンソールを開く

### 1.2 対象APIの確認
1. 左側メニューで "APIs" を選択
2. API ID `7dm1erset7` のAPIを探す
3. API名をクリックして詳細を開く

### 1.3 ルートの確認
1. 左側メニューで "Routes" を選択
2. 以下のルートが存在するか確認：
   - `POST /v1/users/signup`
   - `POST /v1/users/login`
   - `GET /v1/users/{userId}`

### 1.4 統合の確認と修正
各ルートについて以下を実行：

1. ルート（例：`POST /v1/users/signup`）をクリック
2. "Integration" セクションを確認
3. 統合タイプが "Lambda function" になっているか確認
4. Lambda関数が正しく設定されているか確認：
   - signup: `CreateUserFunction-lpnavigator-backend`
   - login: `LoginFunction-lpnavigator-backend`
   - getUser: `GetUserFunction-lpnavigator-backend`

### 1.5 統合の再設定（必要な場合）
統合が正しくない場合：

1. "Integration" セクションで "Edit" をクリック
2. Integration type: "Lambda function" を選択
3. Lambda function: 対応する関数名を入力
4. "Save" をクリック

## 手順2: デプロイメントの実行

### 2.1 デプロイの実行
1. 左側メニューで "Deploy" を選択
2. Stage: "prod" を選択
3. "Deploy" ボタンをクリック
4. デプロイ完了を待つ

## 手順3: テストの実行

### 3.1 API Gateway コンソールでのテスト
1. 左側メニューで "Test" を選択
2. Method: "POST" を選択
3. Path: "/v1/users/signup" を入力
4. Request body に以下を入力：
   ```json
   {
     "email": "console-test@example.com",
     "password": "Password123",
     "name": "Console Test User"
   }
   ```
5. "Test" ボタンをクリック
6. レスポンスを確認

### 3.2 外部からのテスト
コマンドプロンプトで以下を実行：
```bash
curl -X POST "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1/users/signup" -H "Content-Type: application/json" -d "{\"email\":\"external-test@example.com\",\"password\":\"Password123\",\"name\":\"External Test User\"}"
```

## 手順4: ログの確認

### 4.1 CloudWatch Logs の確認
1. AWS Management Console で "CloudWatch" を検索
2. CloudWatch コンソールを開く
3. 左側メニューで "Log groups" を選択
4. `/aws/lambda/CreateUserFunction-lpnavigator-backend` を探してクリック
5. 最新のログストリームを確認
6. Lambda関数の実行ログが表示されることを確認

## 手順5: 成功確認

### 5.1 Cognito での確認
1. AWS Management Console で "Cognito" を検索
2. "User pools" を選択
3. User Pool ID `ap-northeast-1_m1LkBYqEc` をクリック
4. "Users" タブを選択
5. テストで作成したユーザーが表示されることを確認

### 5.2 DynamoDB での確認
1. AWS Management Console で "DynamoDB" を検索
2. "Tables" を選択
3. `UserTable-lpnavigator-backend` をクリック
4. "Explore table items" を選択
5. テストで作成したユーザーデータが表示されることを確認

## トラブルシューティング

### 問題1: 統合が見つからない
**解決策**: 新しい統合を作成
1. Routes で対象ルートを選択
2. "Create integration" をクリック
3. Integration type: "Lambda function"
4. Lambda function: 対応する関数名
5. "Create" をクリック

### 問題2: Lambda関数が見つからない
**解決策**: 関数名を確認
1. Lambda コンソールで関数一覧を確認
2. 正確な関数名をコピー
3. API Gateway の統合設定で使用

### 問題3: 権限エラー
**解決策**: Lambda権限の追加
1. Lambda コンソールで対象関数を開く
2. "Configuration" → "Permissions" を選択
3. Resource-based policy で API Gateway からの呼び出し権限を確認

## 成功の確認方法

以下がすべて成功すれば修正完了：

1. ✅ API Gateway テストで 200/201 レスポンス
2. ✅ CloudWatch Logs にLambda実行ログが記録
3. ✅ Cognito にユーザーが作成
4. ✅ DynamoDB にユーザーデータが保存
5. ✅ 外部からのcurlテストが成功

修正完了後は、提供済みの `final-test-with-existing.bat` と `register-mock-users.ps1` を実行してください。 