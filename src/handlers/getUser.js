const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch');
const { getItem } = require('../lib/dynamoHelper');

const USER_POOL_ID = process.env.USER_POOL_ID;
const REGION = process.env.REGION;
const USER_TABLE_NAME = process.env.USER_TABLE_NAME;

let jwks = null;
let jwksFetchTime = 0;

async function getJwks() {
  const now = Date.now();
  if (jwks && (now - jwksFetchTime) < 3600 * 1000) {
    return jwks;
  }
  const url = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch JWKS');
  const data = await res.json();
  jwks = data.keys;
  jwksFetchTime = now;
  return jwks;
}

async function verifyToken(token) {
  const sections = (token || '').split('.');
  if (sections.length < 2) throw new Error('invalid token');

  const headerJSON = Buffer.from(sections[0], 'base64').toString('utf8');
  const { kid, alg } = JSON.parse(headerJSON);

  const keys = await getJwks();
  const key = keys.find(k => k.kid === kid);
  if (!key) throw new Error('unknown kid');

  const pem = jwkToPem(key);
  const payload = jwt.verify(token, pem, { algorithms: [alg] });
  return payload;
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ message: '認証トークンがありません' }) };
    }
    const token = authHeader.slice('Bearer '.length);
    const payload = await verifyToken(token);
    const userId = payload.sub; // Cognito の sub を userId として使用
    const pk = `USER#${userId}`;
    const sk = 'METADATA';
    const userItem = await getItem(USER_TABLE_NAME, pk, sk);
    if (!userItem) {
      return { statusCode: 404, body: JSON.stringify({ message: 'ユーザー情報が見つかりません' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ user: userItem }) };
  } catch (error) {
    console.error('Error in getUser:', error);
    return { statusCode: 401, body: JSON.stringify({ message: 'トークン検証に失敗しました' }) };
  }
}; 