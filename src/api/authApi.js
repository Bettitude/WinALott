import apiClient from './apiClient';

export const authApi = {
  login:         (email, password)  => apiClient.post('/auth/login',          { email, password }),
  register:      (data)             => apiClient.post('/auth/register',        data),
  logout:        ()                 => apiClient.post('/auth/logout'),
  me:            ()                 => apiClient.get('/auth/me'),
  forgotPassword:(email)            => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (password)         => apiClient.post('/auth/reset-password',  { password }),
};
