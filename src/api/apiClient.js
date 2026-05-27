import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('winalott_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('winalott_token');
      // Never clear demo session tokens — the backend rejects them by design
      // (demo_token_ is not a real JWT) but the session must survive.
      if (!token?.startsWith('demo_token_')) {
        localStorage.removeItem('winalott_token');
        localStorage.removeItem('winalott_user');
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;
