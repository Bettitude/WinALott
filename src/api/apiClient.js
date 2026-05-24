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
      // Only clear stored credentials — do NOT auto-redirect.
      // Protected pages (dashboard, checkout) handle their own login gates.
      // Browsing/public pages must always work without login.
      localStorage.removeItem('winalott_token');
      localStorage.removeItem('winalott_user');
    }
    return Promise.reject(err);
  }
);

export default apiClient;
