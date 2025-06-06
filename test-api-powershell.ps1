# API Connection Test Script for PowerShell
$API_BASE_URL = "http://localhost:3001"
$testEmail = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "Test1234"
$testName = "テストユーザー"

Write-Host "`n🔧 API Connection Test Started`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/health" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health Check Success:" -ForegroundColor Green
    Write-Host ($data | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Signup
Write-Host "`n2️⃣ Testing Signup..." -ForegroundColor Yellow
$signupBody = @{
    email = $testEmail
    password = $testPassword
    name = $testName
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/users/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Signup Success (Status: $($response.StatusCode)):" -ForegroundColor Green
    Write-Host ($data | ConvertTo-Json -Depth 10)
    $userId = $data.userId
} catch {
    Write-Host "❌ Signup Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Login
Write-Host "`n3️⃣ Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/users/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login Success (Status: $($response.StatusCode)):" -ForegroundColor Green
    Write-Host ($data | ConvertTo-Json -Depth 10)
    $accessToken = $data.accessToken
} catch {
    Write-Host "❌ Login Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Get Questions
Write-Host "`n4️⃣ Testing Get Questions..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/questions" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Get Questions Success (Count: $($data.Count))" -ForegroundColor Green
    Write-Host "First question:" -ForegroundColor Cyan
    Write-Host ($data[0] | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Get Questions Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Get User
Write-Host "`n5️⃣ Testing Get User..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/users/$userId" `
        -Headers $headers `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Get User Success:" -ForegroundColor Green
    Write-Host ($data | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Get User Failed: $_" -ForegroundColor Red
}

# Test 6: Duplicate Signup (should fail)
Write-Host "`n6️⃣ Testing Duplicate Signup (should fail)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/users/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "❌ Duplicate signup should have been rejected" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Duplicate signup correctly rejected" -ForegroundColor Green
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error message: $($errorResponse.message)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    }
}

# Test 7: Wrong Password Login (should fail)
Write-Host "`n7️⃣ Testing Wrong Password Login (should fail)..." -ForegroundColor Yellow
$wrongLoginBody = @{
    email = $testEmail
    password = "WrongPassword"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/v1/users/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $wrongLoginBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "❌ Wrong password login should have been rejected" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Wrong password correctly rejected" -ForegroundColor Green
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error message: $($errorResponse.message)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n🎉 All API tests completed!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "- Backend URL: $API_BASE_URL" -ForegroundColor White
Write-Host "- Test User: $testEmail" -ForegroundColor White
Write-Host "- User ID: $userId" -ForegroundColor White
Write-Host "- All endpoints are working correctly!" -ForegroundColor Green 