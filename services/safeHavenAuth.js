import axios from 'axios';
import Token from '../models/token.js';
import ApiError from '../utils/error.js';
/**
 * Configuration object for Safe Haven authentication
 * @constant {Object}
 */
const CONFIG = Object.freeze({
  baseURL: 'https://api.sandbox.safehavenmfb.com',
  maxRetries: 3,
  retryDelay: 1000,
  tokenRefreshInterval: 60000,
  tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes in milliseconds
  requiredEnvVars: ['SAFE_HAVEN_CLIENT_ID', 'SAFE_HAVEN_CLIENT_ASSERTION'],
});

const createTokenPayload = () => ({
  grant_type: 'client_credentials',
  client_id: process.env.SAFE_HAVEN_CLIENT_ID,
  client_assertion: process.env.SAFE_HAVEN_CLIENT_ASSERTION,
  client_assertion_type:
    'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getToken = async (retryCount = 0) => {
  try {
    const response = await axios.post(
      `${CONFIG.baseURL}/oauth2/token`,
      createTokenPayload(),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const tokenData = response.data;
    await saveToken(tokenData);
    console.log('Successfully obtained new Safe Haven token');
    return tokenData;
  } catch (error) {
    console.error('Failed to get Safe Haven token:', error);

    if (retryCount < CONFIG.maxRetries) {
      console.log(
        `Retrying token request (attempt ${retryCount + 1}/${CONFIG.maxRetries})`
      );
      await delay(CONFIG.retryDelay * (retryCount + 1));
      return getToken(retryCount + 1);
    }

    throw new ApiError(
      error.response?.status || 500,
      'Failed to obtain Safe Haven token',
      error.response?.data
    );
  }
};

export const saveToken = async (tokenData) => {
  try {
    await Token.deleteMany({}); // Ensure we only have one document
    await Token.create({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to save token:', error);
    throw new ApiError(500, 'Failed to save authentication token');
  }
};

export const isTokenExpired = (token) => {
  const expirationTime = new Date(
    token.created_at.getTime() + token.expires_in * 1000
  );
  return expirationTime.getTime() - Date.now() < CONFIG.tokenExpiryBuffer;
};

const getCurrentToken = async () => {
  try {
    const token = await Token.findOne().sort({ created_at: -1 });
    if (!token || isTokenExpired(token)) {
      return null;
    }
    return token;
  } catch (error) {
    console.error('Failed to get current token:', error);
    return null;
  }
};

export const ensureValidToken = async () => {
  const currentToken = await getCurrentToken();
  return currentToken || getToken();
};

export const setupTokenRefresh = () => {
  return setInterval(async () => {
    try {
      await ensureValidToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }, CONFIG.tokenRefreshInterval);
};

export const initialize = async () => {
  await ensureValidToken();
  setupTokenRefresh();
};

export const getAuthorizationToken = async () => {
  const token = await ensureValidToken();
  return token.refresh_token;
};
