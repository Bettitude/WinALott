import apiClient from './apiClient';

export const authApi = {
  login:          (email, password) => apiClient.post('/auth/login',            { email, password }),
  register:       (data)            => apiClient.post('/auth/register',          data),
  logout:         ()                => apiClient.post('/auth/logout'),
  me:             ()                => apiClient.get('/auth/me'),

  forgotPassword: (email)           => apiClient.post('/auth/forgot-password',   { email, origin: window.location.origin }),

  // token = { type: 'code', value } (PKCE) or { type: 'token', value } (implicit)
  resetPassword:  (token, new_password) =>
                    apiClient.post('/auth/reset-password',
                      token?.type === 'code'
                        ? { code: token.value, new_password }
                        : { access_token: token?.value ?? token, new_password }
                    ),

  changePassword: (current_password, new_password) =>
                    apiClient.post('/auth/change-password', { current_password, new_password }),

  // Exchange the Supabase access_token from the Google OAuth callback for our JWT
  googleToken:    (access_token)    => apiClient.post('/auth/google/token',      { access_token }),

  updateProfile:  (data)            => apiClient.put('/users/me',                data),
};
