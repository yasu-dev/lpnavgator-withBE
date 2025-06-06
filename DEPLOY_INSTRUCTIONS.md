# lpnavigator-v1 デプロイ手順

## 🚀 今すぐデプロイする方法

### 方法1: Netlify Drop（最速・推奨）

1. ブラウザで [https://app.netlify.com/drop](https://app.netlify.com/drop) を開く
2. 既にビルド済みの `dist` フォルダをドラッグ＆ドロップ
3. デプロイ完了！URLが発行されます

### 方法2: Vercel（GitHub連携）

1. [https://vercel.com](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. "Import Project" をクリック
4. GitHubリポジトリを選択
5. 環境変数は自動的に `vercel.json` から読み込まれます
6. "Deploy" をクリック

### 方法3: AWS Amplify Console（AWS連携）

1. AWS Management Consoleにログイン
2. AWS Amplifyサービスを開く
3. "Host web app" をクリック
4. GitHubリポジトリを接続
5. ビルド設定は `amplify.yml` から自動的に読み込まれます
6. 環境変数を設定:
   - `VITE_API_BASE_URL`: https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
   - `VITE_USER_POOL_ID`: ap-northeast-1_m1LkBYqEc
   - `VITE_USER_POOL_CLIENT_ID`: 7f5hft1ip7gp9kqdh58bidsc4r
   - `VITE_REGION`: ap-northeast-1
   - `VITE_USE_MOCK_DATA`: false
7. "Save and deploy" をクリック

## 📁 ビルド済みファイル

`dist` フォルダには以下のビルド済みファイルが含まれています：
- `index.html` - メインのHTMLファイル
- `assets/` - CSS、JavaScript、その他のアセット

## 🔗 バックエンドAPI

バックエンドは既にAWSにデプロイ済みです：
- API URL: https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
- 利用可能なエンドポイント:
  - POST /v1/users/signup
  - POST /v1/users/login
  - GET /v1/users/{userId}

## ✅ デプロイ後の確認

1. デプロイされたURLにアクセス
2. ユーザー登録・ログイン機能をテスト
3. APIとの接続を確認

## 🆘 トラブルシューティング

- **CORS エラー**: バックエンドのCORS設定を確認
- **環境変数が反映されない**: ビルド時に環境変数が正しく設定されているか確認
- **404 エラー**: SPAのルーティング設定（netlify.toml、vercel.json）を確認 