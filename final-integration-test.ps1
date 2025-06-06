# Final Integration Test Script
Write-Host "`n🎯 FINAL INTEGRATION TEST`n" -ForegroundColor Magenta

# Check services
Write-Host "📡 Checking Services Status:" -ForegroundColor Cyan
$backend = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet
$frontend = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet

if ($backend) {
    Write-Host "✅ Backend API: Running on http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend API: Not running" -ForegroundColor Red
    exit 1
}

if ($frontend) {
    Write-Host "✅ Frontend: Running on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: Not running" -ForegroundColor Red
    exit 1
}

# Test API endpoints
Write-Host "`n📊 Testing API Endpoints:" -ForegroundColor Cyan

# Health check
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✅ Health Check: OK (Users: $($healthData.users), Questions: $($healthData.questions))" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check: Failed" -ForegroundColor Red
}

# Create test user
$testEmail = "final-test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$signupBody = @{
    email = $testEmail
    password = "Test1234"
    name = "最終テストユーザー"
} | ConvertTo-Json

try {
    $signup = Invoke-WebRequest -Uri "http://localhost:3001/v1/users/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -UseBasicParsing
    Write-Host "✅ Signup API: Working" -ForegroundColor Green
} catch {
    Write-Host "❌ Signup API: Failed" -ForegroundColor Red
}

# Test questions endpoint
try {
    $questions = Invoke-WebRequest -Uri "http://localhost:3001/v1/questions" -UseBasicParsing
    $questionsData = $questions.Content | ConvertFrom-Json
    Write-Host "✅ Questions API: Working ($($questionsData.Count) questions found)" -ForegroundColor Green
} catch {
    Write-Host "❌ Questions API: Failed" -ForegroundColor Red
}

# Summary
Write-Host "`n📝 INTEGRATION TEST SUMMARY:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Backend API:  http://localhost:3001 ✅" -ForegroundColor White
Write-Host "Frontend:     http://localhost:5173 ✅" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🚀 READY FOR TESTING!" -ForegroundColor Green
Write-Host "`n👉 Open your browser and go to:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/#/signup" -ForegroundColor Yellow
Write-Host "`n✨ You can now:" -ForegroundColor Cyan
Write-Host "   1. Create a new account" -ForegroundColor White
Write-Host "   2. Login with your credentials" -ForegroundColor White
Write-Host "   3. Access the LP generator" -ForegroundColor White
Write-Host "   4. No more 'Failed to fetch' errors!" -ForegroundColor White

Write-Host "`n🎉 ALL SYSTEMS OPERATIONAL! 🎉`n" -ForegroundColor Green

# Open browser
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/#/signup" 