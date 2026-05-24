import apiClient from './apiClient';

export const authApi = {
  login:          (email, password) => apiClient.post('/auth/login',           { email, password }),
  register:       (data)            => apiClient.post('/auth/register',         data),
  logout:         ()                => apiClient.post('/auth/logout'),
  me:             ()                => apiClient.get('/auth/me'),

  forgotPassword: (email)           => apiClient.post('/auth/forgot-password',  { email }),
  resetPassword:  (payload)         => apiClient.post('/auth/reset-password',   payload),
  changePassword: (payload)         => apiClient.post('/auth/change-password',  payload),

  updateProfile:  (data)            => apiClient.put('/users/me',               data),
};
