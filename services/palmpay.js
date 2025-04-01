import dotenv from 'dotenv';
import crypto from 'node:crypto';
dotenv.config();

const privateKey = process.env.PALMPAY_MERCHANT_PRIVATE_KEY;
// const privateKey = fs.readFileSync('./private_key.pem', 'utf8');

export function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();

  const signingString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingString);
  sign.end();

  const signature = sign.sign(privateKey, 'base64');

  return signature;
}

export function generateNonceStr(length = 32) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
