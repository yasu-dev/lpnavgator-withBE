const AWS = require('aws-sdk');
const { putItem } = require('../lib/dynamoHelper');
const { v4: uuidv4 } = require('uuid');

const USER_POOL_ID = process.env.USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;
const USER_TABLE_NAME = process.env.USER_TABLE_NAME;
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password, name } = body;
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'email, password, name は必須です' })
      };
    }

    await cognito.signUp({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ]
    }).promise();

    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    const item = {
      pk: `USER#${userId}`,
      sk: `METADATA`,
      email: email,
      name: name,
      createdAt: timestamp
    };
    await putItem(USER_TABLE_NAME, item);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'ユーザー登録に成功しました',
        userId: userId
      })
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    if (error.code === 'UsernameExistsException') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'そのメールアドレスは既に登録されています' })
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'サーバーエラーが発生しました' })
    };
  }
}; 