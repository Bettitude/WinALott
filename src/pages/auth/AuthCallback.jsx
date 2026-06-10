import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { friendlyError } from '../../utils/friendlyError';

// Handles the redirect back from Google OAuth.
// Supabase sends: /auth/callback#access_token=XXX&token_type=bearer
// We extract the access_token, send it to the backend for verification,
// and receive our own JWT + user profile in return.

export default function AuthCallback() {
  const navigate         = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError]  = useState('');

  useEffect(() => {
    const hash        = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get('access_token');
    const type        = hash.get('type');

    // Recovery tokens are for password reset — they go to ResetPassword, not here
    if (type === 'recovery') {
      navigate('/auth/reset-password' + window.location.hash, { replace: true });
      return;
    }

    if (!accessToken) {
      navigate('/auth/login?error=oauth_failed', { replace: true });
      return;
    }

    authApi.googleToken(accessToken)
      .then(res => {
        const { token, user } = res.data?.data || {};
        if (!token || !user) throw new Error('Invalid response');
        loginWithToken(token, user);
        const dest = localStorage.getItem('redirect_after_login') || '/dashboard';
        localStorage.removeItem('redirect_after_login');
        navigate(dest, { replace: true });
      })
      .catch(err => setError(friendlyError(err, 'Google sign-in failed. Please try again.')));
  }, [navigate, loginWithToken]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => navigate('/auth/login')}
            className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#1A4D8F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
