import axios from 'axios';

import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
const CLIENT_ASSERTION = process.env.SAFE_HAVEN_CLIENT_ASSERTION;
const TOKEN_URL = process.env.TOKEN_URL;

let accessToken = null;
let refreshToken = null;
let tokenExpiry = null;

// Function to obtain tokens (initial or refresh)
export const getTokens = async (grantType, refreshToken = null) => {
  const body = {
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_assertion: CLIENT_ASSERTION,
    client_assertion_type:
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  };

  if (grantType === 'refresh_token') {
    body.refresh_token = refreshToken;
  }

  try {
    const response = await axios.post(TOKEN_URL, body);

    // Store tokens and expiry time
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;

    console.log('Tokens obtained successfully:');

    // Schedule automatic refresh
    scheduleTokenRefresh(response.data.expires_in);
  } catch (error) {
    console.error(
      'Failed to obtain tokens:',
      error.response ? error.response.data : error.message
    );
  }
};

// Function to schedule token refresh
const scheduleTokenRefresh = (expiresIn) => {
  const refreshTime = (expiresIn - 60) * 1000; // Refresh 1 minute before expiry
  setTimeout(() => {
    console.log('Refreshing token...');
    getTokens('refresh_token', refreshToken);
  }, refreshTime);
};

// Example function to use the access token
const makeApiRequest = async (url, method, data = {}) => {
  if (!accessToken) {
    console.error('No access token available. Please authenticate first.');
    return;
  }

  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('API response:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Access token expired. Refreshing token...');
      await getTokens('refresh_token', refreshToken);
      return makeApiRequest(url, method, data); // Retry after refreshing
    } else {
      console.error(
        'API request failed:',
        error.response ? error.response.data : error.message
      );
    }
  }
};

export const getAccessToken = async () => {
  if (!accessToken || Date.now() >= tokenExpiry) {
    console.log('Access token expired or unavailable, fetching new token...');
    await fetchTokens();
  }
  return accessToken;
};

// Start the authentication process
(async () => {
  console.log('Obtaining initial tokens...');
  await getTokens('client_credentials');

  // Example: Make an API request
  //   const apiUrl = 'https://api.sandbox.safehavenmfb.com/some-endpoint';
  //   await makeApiRequest(apiUrl, 'GET');
})();
