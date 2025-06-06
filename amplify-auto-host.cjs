// AWS Amplify Auto Hosting with GitHub Integration
const { AmplifyClient, CreateAppCommand, CreateBranchCommand, GetAppCommand, ListAppsCommand } = require("@aws-sdk/client-amplify");

const REGION = "ap-northeast-1";
const APP_NAME = "lpnavigator-v1";
const REPOSITORY = "https://github.com/yasu-dev/lpnavgator-withBE";
const BRANCH_NAME = "main";

async function hostWithAmplify() {
    console.log("🚀 Starting AWS Amplify hosting...");
    console.log(`Repository: ${REPOSITORY}`);
    console.log(`Region: ${REGION}\n`);

    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log("⚠️  AWS credentials not found.");
        console.log("Using AWS Amplify Console for manual setup...\n");
        
        // Open required URLs for manual setup
        const { spawn } = require('child_process');
        
        console.log("📋 Opening AWS Amplify Console and GitHub repository...");
        
        // Open AWS Amplify Console
        spawn('cmd', ['/c', 'start', 'https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1#/create'], { shell: true });
        
        // Open GitHub repository
        spawn('cmd', ['/c', 'start', REPOSITORY], { shell: true });
        
        console.log("\n✅ Manual Setup Instructions:");
        console.log("============================");
        console.log("1. In AWS Amplify Console:");
        console.log("   ✓ Click 'Host your web app'");
        console.log("   ✓ Select 'GitHub' as source");
        console.log("   ✓ Authorize Amplify to access GitHub");
        console.log("\n2. Repository Configuration:");
        console.log(`   ✓ Repository: yasu-dev/lpnavgator-withBE`);
        console.log(`   ✓ Branch: ${BRANCH_NAME}`);
        console.log(`   ✓ App name: ${APP_NAME}`);
        console.log("\n3. Build Configuration:");
        console.log("   ✓ Framework: React");
        console.log("   ✓ Build command: npm run build");
        console.log("   ✓ Output directory: dist");
        console.log("   ✓ Use existing amplify.yml: YES");
        
        console.log("\n4. Environment Variables:");
        const envVars = {
            "VITE_API_BASE_URL": "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod",
            "VITE_USER_POOL_ID": "ap-northeast-1_m1LkBYqEc", 
            "VITE_USER_POOL_CLIENT_ID": "7f5hft1ip7gp9kqdh58bidsc4r",
            "VITE_REGION": "ap-northeast-1",
            "VITE_USE_MOCK_DATA": "false"
        };
        
        console.log("   Add these environment variables:");
        Object.entries(envVars).forEach(([key, value]) => {
            console.log(`   ✓ ${key} = ${value}`);
        });
        
        console.log("\n5. Deploy:");
        console.log("   ✓ Review settings");
        console.log("   ✓ Click 'Save and deploy'");
        console.log("   ✓ Wait for deployment (5-10 minutes)");
        
        console.log("\n🎯 Expected URL format:");
        console.log("https://main.d[APP_ID].amplifyapp.com");
        console.log("\n🌏 Region: Tokyo (ap-northeast-1)");
        
        return;
    }

    // If AWS credentials are available, use API
    const amplifyClient = new AmplifyClient({ region: REGION });

    try {
        console.log("🔍 Checking existing apps...");
        
        // Check if app already exists
        let appId = null;
        try {
            const listResponse = await amplifyClient.send(new ListAppsCommand({}));
            const existingApp = listResponse.apps.find(app => app.name === APP_NAME);
            if (existingApp) {
                appId = existingApp.appId;
                console.log(`✅ Found existing app: ${APP_NAME} (${appId})`);
            }
        } catch (error) {
            console.log("📝 No existing apps found or error checking apps");
        }

        // Create app if it doesn't exist
        if (!appId) {
            console.log("🆕 Creating new Amplify app...");
            const createResponse = await amplifyClient.send(new CreateAppCommand({
                name: APP_NAME,
                repository: REPOSITORY,
                platform: "WEB",
                environmentVariables: {
                    "VITE_API_BASE_URL": "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod",
                    "VITE_USER_POOL_ID": "ap-northeast-1_m1LkBYqEc",
                    "VITE_USER_POOL_CLIENT_ID": "7f5hft1ip7gp9kqdh58bidsc4r", 
                    "VITE_REGION": "ap-northeast-1",
                    "VITE_USE_MOCK_DATA": "false"
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
            
            appId = createResponse.app.appId;
            console.log(`✅ App created successfully: ${appId}`);
        }

        // Create branch if needed
        console.log("🌿 Setting up branch...");
        try {
            await amplifyClient.send(new CreateBranchCommand({
                appId: appId,
                branchName: BRANCH_NAME
            }));
            console.log(`✅ Branch '${BRANCH_NAME}' created`);
        } catch (error) {
            if (error.name === 'BadRequestException') {
                console.log(`✅ Branch '${BRANCH_NAME}' already exists`);
            } else {
                throw error;
            }
        }

        console.log("\n🎉 Hosting setup completed!");
        console.log(`🌐 Your app URL: https://${BRANCH_NAME}.${appId}.amplifyapp.com`);
        console.log(`📊 Console: https://console.aws.amazon.com/amplify/home?region=${REGION}#/${appId}/${BRANCH_NAME}`);

    } catch (error) {
        console.error("❌ Error during setup:", error.message);
        console.log("\n🔄 Falling back to manual setup...");
        
        // Fallback to manual setup
        const { spawn } = require('child_process');
        spawn('cmd', ['/c', 'start', 'https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1#/create'], { shell: true });
        spawn('cmd', ['/c', 'start', REPOSITORY], { shell: true });
        
        console.log("✅ Browser opened for manual configuration");
    }
}

// Execute
hostWithAmplify().catch(console.error); 