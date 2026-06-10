import axios from 'axios';
import { getToken, clearSession } from '../utils/tokenStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

apiClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(err);
  }
);

export default apiClient;
