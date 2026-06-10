import apiClient from './apiClient';

export const authApi = {
  login:          (email, password) => apiClient.post('/auth/login',            { email, password }),
  register:       (data)            => apiClient.post('/auth/register',          data),
  logout:         ()                => apiClient.post('/auth/logout'),
  me:             ()                => apiClient.get('/auth/me'),

  forgotPassword: (email)           => apiClient.post('/auth/forgot-password',   { email }),

  // access_token comes from URL hash (#access_token=...&type=recovery) after reset email
  resetPassword:  (access_token, new_password) =>
                    apiClient.post('/auth/reset-password', { access_token, new_password }),

  changePassword: (current_password, new_password) =>
                    apiClient.post('/auth/change-password', { current_password, new_password }),

  // Exchange the Supabase access_token from the Google OAuth callback for our JWT
  googleToken:    (access_token)    => apiClient.post('/auth/google/token',      { access_token }),

  updateProfile:  (data)            => apiClient.put('/users/me',                data),
};
