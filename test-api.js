// API動作テスト用スクリプト
const fetch = require('node-fetch');

async function testSignupAPI() {
  try {
    console.log('Testing Signup API...');
    const response = await fetch('https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-verification@example.com',
        password: 'TestPass123',
        name: 'Test User'
      })
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
    
    return response.ok;
  } catch (error) {
    console.error('Signup API Error:', error.message);
    return false;
  }
}

async function testLoginAPI() {
  try {
    console.log('\nTesting Login API...');
    const response = await fetch('https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-verification@example.com',
        password: 'TestPass123'
      })
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
    
    return response.ok;
  } catch (error) {
    console.error('Login API Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== API動作検証テスト ===\n');
  
  const signupSuccess = await testSignupAPI();
  const loginSuccess = await testLoginAPI();
  
  console.log('\n=== テスト結果 ===');
  console.log(`Signup API: ${signupSuccess ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`Login API: ${loginSuccess ? '✅ 成功' : '❌ 失敗'}`);
  
  if (signupSuccess && loginSuccess) {
    console.log('\n🎉 すべてのAPIが正常に動作しています');
  } else {
    console.log('\n⚠️ 一部のAPIに問題があります');
  }
}

runTests(); 