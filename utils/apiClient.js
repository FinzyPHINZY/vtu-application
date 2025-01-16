import axios from 'axios';
import { getAccessToken } from '../services/tokenService.js';

const apiClient = axios.create({
  baseURL: 'https://api.sandbox.safehavenmfb.com',
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
