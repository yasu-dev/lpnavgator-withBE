# AWS Amplify 手動デプロイ手順

## 重要：AWS CLIなしでAmplifyにデプロイする方法

### 方法1：AWS Amplifyコンソールから直接デプロイ

1. **AWS Amplifyコンソールにアクセス**
   - URL: https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1
   - 東京リージョン（ap-northeast-1）を選択

2. **新しいアプリを作成**
   - 「新しいアプリケーション」→「ウェブアプリケーションをホスト」をクリック
   - 「Deploy without Git provider」を選択

3. **アプリケーション名を設定**
   - App name: `lpnavigator-v1`
   - Environment name: `main`

4. **手動デプロイ**
   - 「Drag and drop」オプションを選択
   - `dist`フォルダをドラッグ＆ドロップ

5. **環境変数を設定**
   - アプリの設定 → 環境変数
   - 以下を追加：
     ```
     VITE_API_BASE_URL=https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
     VITE_USER_POOL_ID=ap-northeast-1_m1LkBYqEc
     VITE_USER_POOL_CLIENT_ID=7f5hft1ip7gp9kqdh58bidsc4r
     VITE_REGION=ap-northeast-1
     VITE_USE_MOCK_DATA=false
     ```

### 方法2：ZIPファイルアップロード

1. **distフォルダをZIP化**
   ```powershell
   Compress-Archive -Path dist/* -DestinationPath amplify-deploy.zip -Force
   ```

2. **AWS Amplifyコンソール**
   - https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1
   - 「Deploy without Git provider」を選択
   - ZIPファイルをアップロード

### デプロイ後のURL

デプロイが完了すると、以下の形式のURLが提供されます：
```
https://main.d[APP_ID].amplifyapp.com
```

### 確認事項

1. **CORS設定**
   - バックエンドのLambda関数がCORSヘッダーを返すことを確認
   - API Gatewayの設定でCORSが有効になっていることを確認

2. **環境変数**
   - すべての環境変数が正しく設定されていることを確認
   - ビルド時に環境変数が適用されていることを確認

3. **ビルド設定**
   - `amplify.yml`ファイルが正しく設定されていることを確認
   - ビルドコマンドが正しく実行されることを確認

## トラブルシューティング

### ビルドエラーの場合
- Amplifyコンソールでビルドログを確認
- 環境変数が正しく設定されているか確認

### CORSエラーの場合
- Lambda関数のレスポンスヘッダーを確認
- API GatewayのCORS設定を確認

### 404エラーの場合
- `_redirects`ファイルが含まれているか確認
- SPAのルーティング設定を確認 