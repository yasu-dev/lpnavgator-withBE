# Mock Users Batch Registration Script
# PowerShell Version

Write-Host "=== Mock Users Batch Registration Started ===" -ForegroundColor Green

# Configuration
$HTTP_API_URL = "https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/"
$MOCK_FILE = "mock-users.json"

Write-Host "API URL: $HTTP_API_URL" -ForegroundColor Cyan
Write-Host "Mock file: $MOCK_FILE" -ForegroundColor Cyan

# Check if mock file exists
if (-not (Test-Path $MOCK_FILE)) {
    Write-Host "Mock file '$MOCK_FILE' not found" -ForegroundColor Red
    exit 1
}

# Load mock data
try {
    $mockUsers = Get-Content $MOCK_FILE | ConvertFrom-Json
    Write-Host "Number of mock users: $($mockUsers.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to load mock file: $_" -ForegroundColor Red
    exit 1
}

# Array to store results
$results = @()

# Register each user
foreach ($user in $mockUsers) {
    Write-Host "`n>>> Registering: $($user.email)" -ForegroundColor Yellow
    
    $userData = @{
        email = $user.email
        password = $user.password
        name = $user.name
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "${HTTP_API_URL}v1/users/signup" -Method Post -Body $userData -ContentType "application/json"
        Write-Host "Success: $($user.email)" -ForegroundColor Green
        Write-Host "  User ID: $($response.userId)" -ForegroundColor White
        
        $results += @{
            email = $user.email
            status = "Success"
            userId = $response.userId
            message = $response.message
        }
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Host "Failed: $($user.email)" -ForegroundColor Red
        Write-Host "  Error: $errorMessage" -ForegroundColor Red
        
        $results += @{
            email = $user.email
            status = "Failed"
            userId = $null
            message = $errorMessage
        }
    }
    
    # Wait to avoid API rate limits
    Start-Sleep -Milliseconds 500
}

# Display summary
Write-Host "`n=== Registration Summary ===" -ForegroundColor Green
$successCount = ($results | Where-Object { $_.status -eq "Success" }).Count
$failureCount = ($results | Where-Object { $_.status -eq "Failed" }).Count

Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor Red

# Display detailed results
Write-Host "`n=== Detailed Results ===" -ForegroundColor Yellow
foreach ($result in $results) {
    $color = if ($result.status -eq "Success") { "Green" } else { "Red" }
    Write-Host "$($result.email): $($result.status)" -ForegroundColor $color
    if ($result.userId) {
        Write-Host "  ID: $($result.userId)" -ForegroundColor White
    }
    if ($result.message) {
        Write-Host "  Message: $($result.message)" -ForegroundColor White
    }
}

# Check Cognito
Write-Host "`n=== Cognito Check ===" -ForegroundColor Yellow
$USER_POOL_ID = "ap-northeast-1_m1LkBYqEc"

try {
    Write-Host "Getting Cognito user list..." -ForegroundColor Cyan
    $cognitoUsers = aws cognito-idp list-users --user-pool-id $USER_POOL_ID --max-results 10 --output json | ConvertFrom-Json
    
    if ($cognitoUsers.Users.Count -gt 0) {
        Write-Host "Users registered in Cognito:" -ForegroundColor Green
        foreach ($cognitoUser in $cognitoUsers.Users) {
            $email = ($cognitoUser.Attributes | Where-Object { $_.Name -eq "email" }).Value
            Write-Host "  - $email" -ForegroundColor White
        }
    } else {
        Write-Host "No users found in Cognito" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Cognito check failed: $_" -ForegroundColor Red
}

# Check DynamoDB
Write-Host "`n=== DynamoDB Check ===" -ForegroundColor Yellow
$TABLE_NAME = "UserTable-lpnavigator-backend"

try {
    Write-Host "Getting DynamoDB items..." -ForegroundColor Cyan
    $dynamoItems = aws dynamodb scan --table-name $TABLE_NAME --limit 10 --output json | ConvertFrom-Json
    
    if ($dynamoItems.Items.Count -gt 0) {
        Write-Host "Users saved in DynamoDB:" -ForegroundColor Green
        foreach ($item in $dynamoItems.Items) {
            if ($item.email -and $item.email.S) {
                Write-Host "  - $($item.email.S) (ID: $($item.pk.S))" -ForegroundColor White
            }
        }
    } else {
        Write-Host "No items found in DynamoDB" -ForegroundColor Yellow
    }
} catch {
    Write-Host "DynamoDB check failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Mock Users Batch Registration Completed ===" -ForegroundColor Green 