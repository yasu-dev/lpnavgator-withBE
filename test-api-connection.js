// API Connection Test Script
const API_BASE_URL = 'http://localhost:3001';

async function testApi() {
  console.log('🔧 API Connection Test Started\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Success:', healthData);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return;
  }
  
  // Test 2: Signup
  console.log('\n2️⃣ Testing Signup...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test1234',
    name: 'テストユーザー'
  };
  
  try {
    const signupResponse = await fetch(`${API_BASE_URL}/v1/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupResponse.json();
    console.log(`✅ Signup Success (Status: ${signupResponse.status}):`, signupData);
    
    if (!signupResponse.ok) {
      console.error('❌ Signup returned error status');
      return;
    }
    
    // Test 3: Login
    console.log('\n3️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/v1/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`✅ Login Success (Status: ${loginResponse.status}):`, loginData);
    
    if (!loginResponse.ok) {
      console.error('❌ Login returned error status');
      return;
    }
    
    // Test 4: Get Questions
    console.log('\n4️⃣ Testing Get Questions...');
    const questionsResponse = await fetch(`${API_BASE_URL}/v1/questions`);
    const questionsData = await questionsResponse.json();
    console.log(`✅ Get Questions Success (Count: ${questionsData.length})`);
    console.log('First question:', questionsData[0]);
    
    // Test 5: Duplicate Signup (should fail)
    console.log('\n5️⃣ Testing Duplicate Signup (should fail)...');
    const dupResponse = await fetch(`${API_BASE_URL}/v1/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const dupData = await dupResponse.json();
    if (dupResponse.status === 400) {
      console.log('✅ Duplicate signup correctly rejected:', dupData.message);
    } else {
      console.error('❌ Duplicate signup should have been rejected');
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

// Run tests
testApi(); 