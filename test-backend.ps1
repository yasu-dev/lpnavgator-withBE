# AWS Backend Test Script
# PowerShell Version

Write-Host "=== AWS Backend Test Started ===" -ForegroundColor Green

# Configuration values from aws-deployment-info.md
$HTTP_API_URL = "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/"
$USER_POOL_ID = "ap-northeast-1_m1LkBYqEc"
$USER_POOL_CLIENT_ID = "7f5hft1ip7gp9kqdh58bidsc4r"
$TABLE_NAME = "UserTable-lpnavigator-backend"
$STACK_NAME = "lpnavigator-api"

Write-Host "HTTP API URL: $HTTP_API_URL" -ForegroundColor Cyan
Write-Host "User Pool ID: $USER_POOL_ID" -ForegroundColor Cyan
Write-Host "Table Name: $TABLE_NAME" -ForegroundColor Cyan

# 1. Check AWS credentials
Write-Host "`n=== 1. AWS Credentials Check ===" -ForegroundColor Yellow
try {
    $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "Account: $($callerIdentity.Account)" -ForegroundColor Green
    Write-Host "Arn: $($callerIdentity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "Failed to get AWS credentials: $_" -ForegroundColor Red
    exit 1
}

# 2. Check CloudFormation stack
Write-Host "`n=== 2. CloudFormation Stack Check ===" -ForegroundColor Yellow
try {
    $stacks = aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[].StackName" --output text
    if ($stacks -match $STACK_NAME) {
        Write-Host "Stack '$STACK_NAME' exists" -ForegroundColor Green
    } else {
        Write-Host "Stack '$STACK_NAME' not found" -ForegroundColor Red
        Write-Host "Available stacks: $stacks" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Stack check failed: $_" -ForegroundColor Red
}

# 3. User registration test
Write-Host "`n=== 3. User Registration Test ===" -ForegroundColor Yellow
$testUser = @{
    email = "testuser@example.com"
    password = "Password123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Calling POST ${HTTP_API_URL}v1/users/signup..." -ForegroundColor Cyan

try {
    $signupResponse = Invoke-RestMethod -Uri "${HTTP_API_URL}v1/users/signup" -Method Post -Body $testUser -ContentType "application/json"
    Write-Host "User registration successful:" -ForegroundColor Green
    $signupResponse | ConvertTo-Json -Depth 3 | Write-Host
    $USER_ID = $signupResponse.userId
} catch {
    Write-Host "User registration failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# 4. Check user in Cognito
Write-Host "`n=== 4. Cognito User Check ===" -ForegroundColor Yellow
try {
    $cognitoUsers = aws cognito-idp list-users --user-pool-id $USER_POOL_ID --filter "email = `"testuser@example.com`"" --query "Users[0].Username" --output text
    if ($cognitoUsers -and $cognitoUsers -ne "None") {
        Write-Host "User created in Cognito: $cognitoUsers" -ForegroundColor Green
    } else {
        Write-Host "User not found in Cognito" -ForegroundColor Red
    }
} catch {
    Write-Host "Cognito check failed: $_" -ForegroundColor Red
}

# 5. Check data in DynamoDB
if ($USER_ID) {
    Write-Host "`n=== 5. DynamoDB Data Check ===" -ForegroundColor Yellow
    try {
        $dynamoKey = @{
            pk = @{ S = "USER#$USER_ID" }
            sk = @{ S = "METADATA" }
        } | ConvertTo-Json -Compress
        
        $dynamoItem = aws dynamodb get-item --table-name $TABLE_NAME --key $dynamoKey --output json | ConvertFrom-Json
        if ($dynamoItem.Item) {
            Write-Host "Data saved in DynamoDB:" -ForegroundColor Green
            $dynamoItem.Item | ConvertTo-Json -Depth 3 | Write-Host
        } else {
            Write-Host "Data not found in DynamoDB" -ForegroundColor Red
        }
    } catch {
        Write-Host "DynamoDB check failed: $_" -ForegroundColor Red
    }
}

# 6. Login test
Write-Host "`n=== 6. Login Test ===" -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "${HTTP_API_URL}v1/users/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "Login successful:" -ForegroundColor Green
    Write-Host "Access Token obtained: $($loginResponse.accessToken.Substring(0, 50))..." -ForegroundColor Green
    $ACCESS_TOKEN = $loginResponse.accessToken
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
}

# 7. Get user info test
if ($USER_ID -and $ACCESS_TOKEN) {
    Write-Host "`n=== 7. Get User Info Test ===" -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $ACCESS_TOKEN"
            "Content-Type" = "application/json"
        }
        $userResponse = Invoke-RestMethod -Uri "${HTTP_API_URL}v1/users/$USER_ID" -Method Get -Headers $headers
        Write-Host "Get user info successful:" -ForegroundColor Green
        $userResponse | ConvertTo-Json -Depth 3 | Write-Host
    } catch {
        Write-Host "Get user info failed: $_" -ForegroundColor Red
    }
}

# 8. Lambda execution logs check
Write-Host "`n=== 8. Lambda Execution Logs Check ===" -ForegroundColor Yellow
$lambdaFunctions = @("CreateUserFunction-lpnavigator-backend", "LoginFunction-lpnavigator-backend", "GetUserFunction-lpnavigator-backend")

foreach ($funcName in $lambdaFunctions) {
    Write-Host "Checking logs for function $funcName..." -ForegroundColor Cyan
    try {
        $logGroupName = "/aws/lambda/$funcName"
        $logEvents = aws logs filter-log-events --log-group-name $logGroupName --limit 3 --output json | ConvertFrom-Json
        if ($logEvents.events.Count -gt 0) {
            Write-Host "Logs found (latest 3):" -ForegroundColor Green
            foreach ($event in $logEvents.events) {
                Write-Host "  $($event.timestamp): $($event.message)" -ForegroundColor White
            }
        } else {
            Write-Host "No logs found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Log check failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Backend Test Completed ===" -ForegroundColor Green 