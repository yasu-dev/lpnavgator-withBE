const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  console.log('Login handler called with event:', JSON.stringify(event));
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password are required' })
      };
    }

    const authResult = await cognito.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    }).promise();

    console.log('Login successful for:', email);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        idToken: authResult.AuthenticationResult.IdToken,
        accessToken: authResult.AuthenticationResult.AccessToken,
        refreshToken: authResult.AuthenticationResult.RefreshToken,
        expiresIn: authResult.AuthenticationResult.ExpiresIn
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Authentication failed' })
    };
  }
};
