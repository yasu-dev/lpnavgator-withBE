# 🚀 QUICK AWS Amplify Setup Guide

## Repository Information
- **Repository**: https://github.com/yasu-dev/lpnavgator-withBE
- **Branch**: main
- **Region**: Tokyo (ap-northeast-1)

## ⚡ Fast Setup Steps

### 1. Open AWS Amplify Console
🔗 **Link**: https://ap-northeast-1.console.aws.amazon.com/amplify/home?region=ap-northeast-1#/create

### 2. Setup Process (5 minutes)

#### Step 1: Choose Source
- ✅ Click **"Host your web app"**
- ✅ Select **"GitHub"** 
- ✅ Click **"Continue"**
- ✅ Authorize Amplify (if prompted)

#### Step 2: Repository Configuration
- **Repository**: `yasu-dev/lpnavgator-withBE`
- **Branch**: `main`
- ✅ Click **"Next"**

#### Step 3: App Settings
- **App name**: `lpnavigator-v1`
- **Environment name**: `main`

#### Step 4: Build Settings
- **Framework**: React
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- ✅ **Use existing amplify.yml**: YES

#### Step 5: Environment Variables
Click **"Advanced settings"** → **"Add environment variable"**

Add these 5 variables:
```
VITE_API_BASE_URL = https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID = ap-northeast-1_m1LkBYqEc
VITE_USER_POOL_CLIENT_ID = 7f5hft1ip7gp9kqdh58bidsc4r
VITE_REGION = ap-northeast-1
VITE_USE_MOCK_DATA = false
```

#### Step 6: Deploy
- ✅ Review all settings
- ✅ Click **"Save and deploy"**
- ⏳ Wait 5-10 minutes for deployment

## 🎯 Expected Result

Your app will be available at:
```
https://main.d[APP_ID].amplifyapp.com
```

## 🔧 Features Enabled
- ✅ Auto-deploy on Git push
- ✅ PR preview environments
- ✅ Custom domain support
- ✅ SSL certificates
- ✅ CDN (CloudFront)

## 🌏 Infrastructure
- **Region**: Tokyo (ap-northeast-1)
- **CDN**: Global CloudFront distribution
- **Compute**: AWS Fargate (for builds)
- **Storage**: S3 + CloudFront 