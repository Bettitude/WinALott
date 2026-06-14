import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertTriangle, FiShield } from 'react-icons/fi';
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

const TIPS = [
  { Icon: FiShield, text: 'Use at least 8 characters with a mix of letters and numbers' },
  { Icon: FiLock,   text: 'Never share your password with anyone' },
  { Icon: FiCheckCircle, text: 'Your account will be secured immediately after reset' },
];

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (code) {
      setToken({ type: 'code', value: code });
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F5F7FA] px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiAlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Link Expired or Invalid</h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              This reset link is missing or has expired. Request a fresh one and use it within 1 hour.
            </p>
            <Link to="/auth/forgot-password"
              className="inline-block w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
              Request New Reset Link
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F5F7FA] px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Password Updated</h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              Your password has been changed successfully. You can now log in with your new password.
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
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80&auto=format&fit=crop"
          alt="stadium"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/80" />
        <div className="relative z-10 text-white px-12 max-w-sm">
          <Link to="/" className="inline-block mb-10">
            <Logo variant="full" height={56} className="brightness-200" />
          </Link>
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Secure Your<br />Account
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Choose a strong new password to protect your bWinALOTT wallet and predictions.
          </p>
          <div className="space-y-3">
            {TIPS.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#F5C518]" />
                </div>
                <p className="text-sm text-blue-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* Logo — mobile only */}
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-block">
              <Logo variant="full" height={52} />
            </Link>
            <p className="text-gray-400 text-sm mt-2">Choose a new password</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1A4D8F]/10 flex items-center justify-center">
                <FiLock className="w-5 h-5 text-[#1A4D8F]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A1A2E]">Reset Password</h2>
                <p className="text-gray-400 text-xs">Must be at least 8 characters</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] bg-white text-gray-900 placeholder-gray-400"
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
                    className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 bg-white text-gray-900 placeholder-gray-400 ${
                      confirm && confirm !== password
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-[#1A4D8F]'
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

              <button
                type="submit"
                disabled={loading || !password || !confirm || !token}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
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
    </div>
  );
}
