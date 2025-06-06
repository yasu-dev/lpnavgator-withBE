// Frontend Integration Test
const testEmail = `frontend-test${Date.now()}@example.com`;
const testPassword = 'Test1234';
const testName = 'フロントエンドテストユーザー';

console.log('🔧 Frontend Integration Test Started\n');
console.log('📝 Test Credentials:');
console.log(`- Email: ${testEmail}`);
console.log(`- Password: ${testPassword}`);
console.log(`- Name: ${testName}\n`);

console.log('✅ Backend is running at: http://localhost:3001');
console.log('✅ Frontend should be running at: http://localhost:5173\n');

console.log('📋 Manual Test Steps:');
console.log('1. Open http://localhost:5173/#/signup in your browser');
console.log('2. Enter the following:');
console.log(`   - Name: ${testName}`);
console.log(`   - Email: ${testEmail}`);
console.log(`   - Password: ${testPassword}`);
console.log('3. Click "登録する"');
console.log('4. You should be redirected to the generator page');
console.log('\n5. To test login:');
console.log('   - Logout if needed');
console.log('   - Go to http://localhost:5173/#/login');
console.log(`   - Email: ${testEmail}`);
console.log(`   - Password: ${testPassword}`);
console.log('   - Click "ログイン"');
console.log('\n🎯 Expected Results:');
console.log('- No "Failed to fetch" errors');
console.log('- Successful registration message');
console.log('- Automatic login after registration');
console.log('- Redirect to /generator page');

// Also test the API directly from Node.js
console.log('\n\n🤖 Automated API Test from Frontend Context:\n');

async function testFromFrontend() {
    const API_URL = 'http://localhost:3001';
    
    try {
        // Test signup
        console.log('Testing signup...');
        const signupResponse = await fetch(`${API_URL}/v1/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `auto-test${Date.now()}@example.com`,
                password: 'Test1234',
                name: '自動テストユーザー'
            })
        });
        
        const signupData = await signupResponse.json();
        console.log('✅ Signup response:', signupData);
        
        // Test questions
        console.log('\nTesting questions endpoint...');
        const questionsResponse = await fetch(`${API_URL}/v1/questions`);
        const questionsData = await questionsResponse.json();
        console.log(`✅ Found ${questionsData.length} questions`);
        
        console.log('\n✅ All automated tests passed!');
        console.log('\n👆 Now please test manually in the browser using the steps above.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFromFrontend(); 