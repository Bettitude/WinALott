import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiArrowLeft, FiRefreshCw, FiAlertCircle, FiKey, FiShield } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PERKS = [
  { Icon: FiKey,    text: 'Reset link sent directly to your inbox' },
  { Icon: FiShield, text: 'Secure one-time link — expires in 1 hour' },
  { Icon: FiMail,   text: 'Check spam if you don\'t see it within a minute' },
];

function LeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80&auto=format&fit=crop"
        alt="football"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#0D2B5E]/80" />
      <div className="relative z-10 text-white px-12 max-w-sm">
        <Link to="/" className="inline-block mb-10">
          <Logo variant="full" height={56} />
        </Link>
        <h2 className="text-3xl font-black mb-3 leading-tight">
          Forgot Your<br />Password?
        </h2>
        <p className="text-blue-200 text-sm mb-8">
          No worries — enter your email and we'll send a secure reset link straight to your inbox.
        </p>
        <div className="space-y-3">
          {PERKS.map(({ Icon, text }) => (
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
  );
}

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [sent,      setSent]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [error,     setError]     = useState('');

  const sendReset = async (isResend = false) => {
    setError('');
    if (isResend) setResending(true);
    else          setLoading(true);

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), origin: window.location.origin }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Something went wrong. Please try again.');
      }

      if (isResend) { setResent(true); setTimeout(() => setResent(false), 4000); }
      else            setSent(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed)                          { setError('Email address is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(trimmed))    { setError('Please enter a valid email address.'); return; }
    sendReset(false);
  };

  // ── Success state ──────────────────────────────────────────────────────────

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex">
        <LeftPanel />

        <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] px-4 py-6 sm:py-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-6">
              <Link to="/"><Logo variant="full" height={52} /></Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiCheckCircle className="w-8 h-8 text-green-500" />
              </div>

              <h2 className="text-xl font-black text-[#1A1A2E] text-center mb-2">Check your inbox</h2>
              <p className="text-gray-400 text-sm text-center mb-1">We sent a password reset link to</p>
              <p className="text-[#1A4D8F] font-bold text-sm text-center mb-6 break-all">{email}</p>

              {/* Ethical nudge — does not confirm whether email exists */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-amber-800 text-xs leading-relaxed">
                  <strong>Didn't receive it?</strong> Make sure <strong>{email}</strong> is the exact address you signed up with — including the correct domain (e.g. .com vs .co). Also check your spam or junk folder.
                </p>
              </div>

              {resent ? (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-semibold mb-4 py-2.5">
                  <FiCheckCircle className="w-4 h-4" /> Resent — check your inbox again
                </div>
              ) : (
                <button
                  onClick={() => sendReset(true)}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 mb-3"
                >
                  <FiRefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Resending…' : 'Resend email'}
                </button>
              )}

              <button
                onClick={() => { setSent(false); setResent(false); setError(''); }}
                className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm hover:text-gray-600 transition-colors py-1"
              >
                <FiArrowLeft className="w-4 h-4" /> Try a different email address
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">Back to Log In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Entry state ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <Link to="/"><Logo variant="full" height={52} /></Link>
            <p className="text-gray-400 text-sm mt-2">Forgot Your Password?</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Reset Password</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
                      error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                  : 'Send Reset Link'
                }
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Remember your password?{' '}
            <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
