import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.success) navigate('/dashboard');
    } catch {
      setErrors({ submit: 'Invalid email or password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDemoLogin = async () => {
    setErrors({});
    setLoading(true);
    try {
      const res = await login('demo@winalott.com', 'Demo1234');
      if (res.success) navigate('/dashboard');
    } catch {
      setErrors({ submit: 'Demo login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Demo login shortcut */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#1A1A2E] text-xs font-bold py-2.5 rounded-xl hover:bg-[#F5C518]/25 transition-colors disabled:opacity-60"
      >
        {loading ? 'Logging in…' : 'Use Demo Account — demo@winalott.com / Demo1234'}
      </button>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {errors.submit}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Your password"
            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={e => set('remember', e.target.checked)}
            className="w-4 h-4 accent-[#1A4D8F] rounded"
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <Link to="/auth/forgot-password" className="text-sm text-[#1A4D8F] hover:underline font-medium">
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Logging in…' : 'Log In'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or continue with</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-[#1A4D8F] font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
