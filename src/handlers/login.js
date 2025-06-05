const AWS = require('aws-sdk');

// 環境変数から必要値を取得
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;
    if (!email || !password) {
      return {
        statusCode: 400,
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
      body: JSON.stringify({ message: '認証に失敗しました' })
    };
  }
}; 