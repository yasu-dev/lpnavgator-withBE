const AWS = require('aws-sdk');
const dynamoClient = new AWS.DynamoDB.DocumentClient();

async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item
  };
  return dynamoClient.put(params).promise();
}

async function getItem(tableName, pk, sk) {
  const params = {
    TableName: tableName,
    Key: {
      pk: pk,
      sk: sk
    }
  };
  const res = await dynamoClient.get(params).promise();
  return res.Item || null;
}

module.exports = {
  putItem,
  getItem
}; 