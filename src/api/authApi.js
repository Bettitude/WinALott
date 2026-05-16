import apiClient from './apiClient';

export const authApi = {
  // Bettitude SSO — website users
  login:         (email, password) => apiClient.post('/website/login',    { email, password }),
  register:      (data)            => apiClient.post('/website/register', data),
  logout:        ()                => apiClient.post('/logout'),
  me:            ()                => apiClient.get('/user'),

  // Password recovery
  forgotPassword: (email)          => apiClient.post('/forgot-password', { email }),
  resetPassword:  (payload)        => apiClient.post('/reset-password',  payload),

  // Profile
  updateProfile:  (data)           => apiClient.put('/website/profile',  data),
};
