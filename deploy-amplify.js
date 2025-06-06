const { AmplifyClient, CreateAppCommand, CreateBranchCommand, CreateDeploymentCommand, StartDeploymentCommand } = require("@aws-sdk/client-amplify");
const { S3Client, PutObjectCommand, CreateBucketCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const path = require('path');

// 設定
const REGION = "ap-northeast-1";
const APP_NAME = "lpnavigator-v1";
const BRANCH_NAME = "main";

async function deployToAmplify() {
    console.log("AWS Amplifyへのデプロイを開始します...");

    // AWS認証情報の確認
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error("AWS認証情報が設定されていません。");
        console.log("以下を実行してください：");
        console.log('set AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY');
        console.log('set AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY');
        process.exit(1);
    }

    const amplifyClient = new AmplifyClient({ region: REGION });
    const s3Client = new S3Client({ region: REGION });

    try {
        // 1. Amplifyアプリを作成
        console.log("Amplifyアプリを作成中...");
        let appId;
        
        try {
            const createAppResponse = await amplifyClient.send(new CreateAppCommand({
                name: APP_NAME,
                description: "LP Navigator Application",
                environmentVariables: {
                    VITE_API_BASE_URL: "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod",
                    VITE_USER_POOL_ID: "ap-northeast-1_m1LkBYqEc",
                    VITE_USER_POOL_CLIENT_ID: "7f5hft1ip7gp9kqdh58bidsc4r",
                    VITE_REGION: "ap-northeast-1",
                    VITE_USE_MOCK_DATA: "false"
                },
                buildSpec: `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*`
            }));
            
            appId = createAppResponse.app.appId;
            console.log(`アプリ作成成功: ${appId}`);
        } catch (error) {
            if (error.name === 'BadRequestException' && error.message.includes('already exists')) {
                console.log("アプリが既に存在します。既存のアプリを使用します。");
                // 既存のアプリのIDを取得する必要があります
                // ここでは仮のIDを使用
                appId = "existing-app-id";
            } else {
                throw error;
            }
        }

        // 2. ブランチを作成
        console.log("ブランチを作成中...");
        try {
            await amplifyClient.send(new CreateBranchCommand({
                appId: appId,
                branchName: BRANCH_NAME
            }));
            console.log("ブランチ作成成功");
        } catch (error) {
            if (error.name === 'BadRequestException' && error.message.includes('already exists')) {
                console.log("ブランチが既に存在します。");
            } else {
                throw error;
            }
        }

        // 3. デプロイメントを作成
        console.log("デプロイメントを作成中...");
        const createDeploymentResponse = await amplifyClient.send(new CreateDeploymentCommand({
            appId: appId,
            branchName: BRANCH_NAME
        }));

        const jobId = createDeploymentResponse.jobSummary.jobId;
        const uploadUrl = createDeploymentResponse.zipUploadUrl;

        console.log(`デプロイメントID: ${jobId}`);

        // 4. ZIPファイルをアップロード
        console.log("ZIPファイルをアップロード中...");
        const zipFile = fs.readFileSync('amplify-deploy.zip');
        
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: zipFile,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Length': zipFile.length
            }
        });

        if (!response.ok) {
            throw new Error(`アップロード失敗: ${response.status}`);
        }

        // 5. デプロイメントを開始
        console.log("デプロイメントを開始中...");
        await amplifyClient.send(new StartDeploymentCommand({
            appId: appId,
            branchName: BRANCH_NAME,
            jobId: jobId
        }));

        console.log("\nデプロイメントが開始されました！");
        console.log(`アプリURL: https://${BRANCH_NAME}.${appId}.amplifyapp.com`);
        console.log("\n進行状況は以下で確認できます：");
        console.log(`https://console.aws.amazon.com/amplify/home?region=${REGION}#/${appId}/${BRANCH_NAME}`);

    } catch (error) {
        console.error("エラーが発生しました:", error);
        process.exit(1);
    }
}

// 実行
deployToAmplify(); 