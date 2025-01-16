import axios from 'axios';

const safeHavenApiBaseUrl = process.env.SAFE_HAVEN_API_BASE_URL;
const clientId = process.env.SAFE_HAVEN_IBS_CLIENT_ID;
const authorizationToken = process.env.SAFE_HAVEN_AUTH_TOKEN;

export const initiateVerification = async ({
  type,
  number,
  debitAccountNumber,
}) => {
  const url = `${safeHavenApiBaseUrl}/identity/v2`;
  const headers = {
    Authorization: `Bearer ${authorizationToken}`,
    'Content-Type': 'application/json',
    clientId,
  };

  const body = { type, number, debitAccountNumber, async: false };

  const response = await axios.post(url, body, { headers });
  return response.data;
};

export const validateVerification = async ({ identityId, type, otp }) => {
  const url = `${safeHavenApiBaseUrl}/identity/v2/validate`;
  const headers = {
    Authorization: `Bearer ${authorizationToken}`,
    'Content-Type': 'application/json',
    clientId,
  };

  const body = { identityId, type, otp };

  const response = await axios.post(url, body, { headers });
  return response.data;
};
