import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';
import { authApi } from '../../api/authApi';
import { friendlyError } from '../../utils/friendlyError';

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs ${score < 2 ? 'text-red-500' : score < 4 ? 'text-orange-500' : 'text-green-600'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function ResetPassword() {
  const [token,       setToken]       = useState(null);
  const [tokenError,  setTokenError]  = useState(false);
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');
  const navigate = useNavigate();

  // Supabase sends the reset link in one of two formats depending on project settings:
  //   Implicit flow: /auth/reset-password#access_token=XXX&type=recovery
  //   PKCE flow:     /auth/reset-password?code=XXX
  useEffect(() => {
    // 1. Try PKCE flow — query param ?code=XXX
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (code) {
      setToken({ type: 'code', value: code });
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    // 2. Try implicit flow — hash #access_token=XXX&type=recovery
    const hash   = new URLSearchParams(window.location.hash.slice(1));
    const aToken = hash.get('access_token');
    const type   = hash.get('type');

    if (aToken && type === 'recovery') {
      setToken({ type: 'token', value: aToken });
      window.history.replaceState(null, '', window.location.pathname);
    } else if (aToken) {
      navigate('/auth/login', { replace: true });
    } else {
      setTokenError(true);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(friendlyError(err, 'Reset failed. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FA] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Link Expired or Invalid</h2>
            <p className="text-gray-400 text-sm mb-6">
              This reset link is missing or has expired. Request a new one.
            </p>
            <Link to="/auth/forgot-password"
              className="inline-block w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FA] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Password Updated</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your password has been changed successfully. You can now log in.
            </p>
            <button onClick={() => navigate('/auth/login')}
              className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo variant="full" height={40} />
          </Link>
          <p className="text-gray-400 text-sm mt-2">Choose a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#1A4D8F]/10 flex items-center justify-center">
              <FiLock className="w-5 h-5 text-[#1A4D8F]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1A2E]">Reset Password</h2>
              <p className="text-gray-400 text-xs">Must be at least 8 characters</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 ${
                    confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1A4D8F]'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading || !password || !confirm || !token}
              className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating…</>
                : 'Update Password'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Remember your password?{' '}
            <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
