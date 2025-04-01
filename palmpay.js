import md5 from 'md5';
import { KJUR, hextob64, b64tohex } from 'jsrsasign';
import { generateNonceStr } from './services/palmpay.js';
import { generateRandomReference } from './utils/helpers.js';

// Define constants for signature algorithms and PEM formatting
const HashMap = {
  SHA256withRSA: 'SHA256withRSA',
  SHA1withRSA: 'SHA1withRSA',
};

const PEM_BEGIN_PRIVATE = '-----BEGIN PRIVATE KEY-----\n';
const PEM_END_PRIVATE = '\n-----END PRIVATE KEY-----';
const PEM_BEGIN_PUBLIC = '-----BEGIN PUBLIC KEY-----\n';
const PEM_END_PUBLIC = '\n-----END PUBLIC KEY-----';

// // Define types
// type HashAlgorithm = keyof typeof HashMap;
// type KeyType = 'private' | 'public';
// type RequestParams = Record<string, string | number>;

// Function to sign the request body using RSA-SHA1 algorithm
export function sign(params, privateKey) {
  let parseStr = sortParams(params);
  console.log('parseStr:', parseStr);

  parseStr = md5(parseStr).toUpperCase();
  console.log('MD5:', parseStr);

  const str = rsaSign(parseStr, privateKey, HashMap.SHA1withRSA);
  console.log('Signature: ', str);

  return str;
}

// Function to sort parameters in ascending order and create a query string
export function sortParams(params) {
  return Object.keys(params)
    .sort()
    .filter((item) => params[item] !== undefined && params[item] !== null)
    .map((item) => `${item}=${params[item]}`)
    .join('&');
}

export function rsaSign(content, privateKey, hash) {
  const _privateKey = formatKey(privateKey, 'private');

  // Create the signature object with the specified hash algorithm
  const signature = new KJUR.crypto.Signature({ alg: hash });

  // Initialize with the private key
  signature.init(_privateKey);

  // Update with content and sign it
  signature.updateString(content);
  return hextob64(signature.sign());
}

// Function to verify the RSA signature using jsrsasign library
export function rsaVerify(encryData, signature, publicKey, hash) {
  const _publicKey = formatKey(publicKey, 'public');

  const sig = new KJUR.crypto.Signature({
    alg: hash,
  });

  sig.init(_publicKey);
  sig.updateString(encryData);
  return sig.verify(b64tohex(signature));
}

// Function to ensure private or public key is correctly formatted with PEM header and footer
export function formatKey(key, keyType) {
  if (keyType === 'private') {
    if (!key.startsWith(PEM_BEGIN_PRIVATE)) {
      key = PEM_BEGIN_PRIVATE + key;
    }
    if (!key.endsWith(PEM_END_PRIVATE)) {
      key = key + PEM_END_PRIVATE;
    }
  } else {
    if (!key.startsWith(PEM_BEGIN_PUBLIC)) {
      key = PEM_BEGIN_PUBLIC + key;
    }
    if (!key.endsWith(PEM_END_PUBLIC)) {
      key = key + PEM_END_PUBLIC;
    }
  }
  return key;
}

// Request body
// const requestBody = {
//   requestTime: 1726048905583,
//   version: 'V1.1',
//   nonceStr: 'c9e7c64f2a0245e5814709bfab1b4c61',
//   amount: 10000,
//   notifyUrl: 'https://webhook.site/7da52d0e-e021-46a4-a477-b3e8d7a81050',
//   orderId: '300305d48521d11i',
//   currency: 'NGN',
//   customerInfo:
//     '{"phone":"23407065413489","firstName":"DAMILARE SAMUEL","lastName":"OGUNNAIKE","email":"n.kerantzakis\\u002Bng@kaizengaming.com"}',
// };

// const nonceStr = generateNonceStr();
// const accountReference = generateRandomReference('VIR_ACC', 'Boluwatife');

// const requestBody = {
//   virtualAccountName: 'Boluwatife Adeyemi',
//   identityType: 'company',
//   licenceNumber: 'RC12345',
//   email: 'finzyphinzy@gmail.com',
//   customerName: 'Boluwatife Adeyemi',
//   accountReference,
//   version: 'V2.0',
//   requestTime: Date.now(),
//   nonceStr,
// };

// Private key
const privateKey =
  'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAICK1MVSH/1bR1ghWfzlXl2v/wVkLhwZT9CfzwFVE5VwifdKBRzSi5GjeZqM9vcuC7bZrpkI2IKhXH9QbzPWHgP1eeCCwTDp6esKux6LWpT60DKvYGIrAGBFCM8WMS24d2luOaB6BTEJS7WBN0j81cJGzNqdsfB1nnnr8J4T/euXAgMBAAECgYB7X0RqArGrZNFr98672JWizAmzbfyHgY/Gh6uR9sruEm6IxyVzDW1hogpT2NosUahynilivke30RHLLDMfCHITNFkTmxIMH0uaBfWPM8xRCL4Jq4hJKsvMZhVxvVK8SxKjElawhlswBt5xBcuT/i5GasBvIiNw6Gr7gV7OIJN2CQJBALl/s8FvKkmgQ2AwQzfbx0Q5M89Yx/qfY2vgMJkpVnNrgmcRKhXZFFoQwqPCvRcW4Ij2QTwiqZuF09QDFTXPIWUCQQCxZXxZbxJnKfUV2tZnefLpag7sp5hJuvbGx5oRx22oKzxl5NA3tLVH10xFeZ5Qjf72luKxl3ghdlNiPy/QKedLAkEAknEIXdr+zWUiC5vOVRjCdU+bYUO7jFWsTYuNkjyaLUBgkDFywhDACmJU5qdkVAgRds7BrVHICClck3FjmzlMKQJAMaX7pXQmrGTbySAUPaWtzJH4V1eYkZoYEw4uGqe8EwL2xnXBqLWUvuSM3izpmBYFs7ILBDUmVAcv0yFoGlR//QJACMBGCaNr6e3JmGTo8HJRmPpdOJlJPISLYxHlXhDtUs+UuYzZrnU4SEQUnflmUijTDX4FXxm2TX4gm+6OTUkkHg==';

// Call the sign function with the defined requestBody and privateKey
// const generatedSignature = sign(requestBody, privateKey);
// console.log('Generated Signature:', generatedSignature);

// Public key
const publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCAitTFUh/9W0dYIVn85V5dr/8FZC4cGU/Qn88BVROVcIn3SgUc0ouRo3majPb3Lgu22a6ZCNiCoVx/UG8z1h4D9XnggsEw6enrCrsei1qU+tAyr2BiKwBgRQjPFjEtuHdpbjmgegUxCUu1gTdI/NXCRszanbHwdZ556/CeE/3rlwIDAQAB';

// // Call the rsaVerify function to verify the signature
// const isVerified = rsaVerify(
//   md5(sortParams(requestBody)).toUpperCase(),
//   generatedSignature,
//   publicKey,
//   HashMap.SHA1withRSA
// );
// console.log('Signature Verified:', isVerified);
