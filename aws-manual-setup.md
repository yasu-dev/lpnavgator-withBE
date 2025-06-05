# AWS手動セットアップ手順

## 1. Cognito User Pool作成

### AWS Console → Cognito → User pools → Create user pool

```
User pool name: MyAppUserPool-manual
Sign-in options: Email
Password policy: 
  - Minimum length: 8
  - Require lowercase: Yes
  - Require uppercase: Yes  
  - Require numbers: Yes
  - Require symbols: No
MFA: OFF
```

**作成後に取得する値:**
- User Pool ID: `ap-northeast-1_XXXXXXXXX`
- App Client ID: `XXXXXXXXXXXXXXXXXXXXXXXXXX`

## 2. DynamoDB テーブル作成

### AWS Console → DynamoDB → Tables → Create table

```
Table name: UserTable-manual
Partition key: pk (String)
Sort key: sk (String)
Billing mode: On-demand
```

## 3. Lambda関数作成

### 3.1 IAM Role作成
AWS Console → IAM → Roles → Create role
```
Service: Lambda
Policies:
  - AWSLambdaBasicExecutionRole
  - DynamoDBFullAccess
  - AmazonCognitoPowerUser
Role name: LambdaExecutionRole-manual
```

### 3.2 Lambda関数作成 (3つ)

#### CreateUser関数
```
Function name: CreateUserFunction-manual
Runtime: Node.js 18.x
Role: LambdaExecutionRole-manual
Environment variables:
  - USER_POOL_ID: [Cognitoで作成したPool ID]
  - USER_POOL_CLIENT_ID: [Cognitoで作成したClient ID]
  - USER_TABLE_NAME: UserTable-manual
```

#### Login関数
```
Function name: LoginFunction-manual
Runtime: Node.js 18.x
Role: LambdaExecutionRole-manual
Environment variables:
  - USER_POOL_CLIENT_ID: [Cognitoで作成したClient ID]
```

#### GetUser関数
```
Function name: GetUserFunction-manual
Runtime: Node.js 18.x
Role: LambdaExecutionRole-manual
Environment variables:
  - USER_TABLE_NAME: UserTable-manual
```

## 4. API Gateway作成

### AWS Console → API Gateway → Create API → REST API

```
API name: ServerlessBackendApi-manual
Endpoint type: Regional

Resources:
/v1
  /users
    /signup (POST) → CreateUserFunction-manual
    /login (POST) → LoginFunction-manual
    /{userId} (GET) → GetUserFunction-manual

CORS設定: Enable for all methods
```

**作成後に取得する値:**
- API Gateway URL: `https://XXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/prod`

## 5. フロントエンド環境変数更新

`.env`ファイルを更新:
```
REACT_APP_API_BASE_URL=https://XXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/prod
REACT_APP_ENV=production
REACT_APP_USE_MOCK_DATA=false
```

## 6. 動作確認

1. Cognito User Poolでテストユーザー作成
2. API Gateway経由でLambda関数テスト
3. フロントエンドからAPI呼び出しテスト 