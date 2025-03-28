import dotenv from 'dotenv';
import crypto from 'node:crypto';
dotenv.config();

const privateKey = process.env.PALMPAY_PRIVATE_KEY;

function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();

  const signingString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  console.log('signing string', signingString);

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingString);
  sign.end();

  const signature = sign.sign(privateKey, 'base64');

  return signature;
}

export default generateSignature;
