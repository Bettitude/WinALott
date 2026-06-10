import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordForm() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <h3 className="font-bold text-[#1A1A2E] text-lg mb-2">Check your inbox</h3>
        <p className="text-gray-500 text-sm mb-6">
          If <strong>{email}</strong> is registered, a password reset link has been sent.
          Check your spam folder if you don't see it within a minute.
        </p>
        <Link to="/auth/login" className="text-[#1A4D8F] font-semibold text-sm hover:underline">
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter the email address linked to your account and we'll send you a reset link.
      </p>

      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-gray-500">
        <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">
          Back to Log In
        </Link>
      </p>
    </form>
  );
}
