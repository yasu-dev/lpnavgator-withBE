const AWS = require('aws-sdk');
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'email と password は必須です' })
      };
    }

    const authResult = await cognito.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    }).promise();

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
    console.error('Error in login:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: '認証に失敗しました' })
    };
  }
}; 