const http = require('http');

function testAPI() {
  const data = JSON.stringify({
    email: 'demo@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/v1/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', body);
      try {
        const parsed = JSON.parse(body);
        console.log('✅ API Test Successful!');
        console.log('Access Token:', parsed.accessToken);
        console.log('User:', parsed.user);
      } catch (e) {
        console.log('❌ Failed to parse JSON response');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ API Test Failed: ${e.message}`);
  });

  req.write(data);
  req.end();
}

console.log('🧪 Testing API Server...');
testAPI(); 