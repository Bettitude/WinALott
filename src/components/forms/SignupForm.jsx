import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAtSign } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export default function SignupForm() {
  const [form, setForm] = useState({
    fullName: '', username: '', email: '',
    password: '', confirmPassword: '', terms: false, age: false,
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.terms) e.terms = 'You must accept the Terms and Conditions';
    if (!form.age) e.age = 'You must confirm you are 18+';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await signup(form);
      if (res.success) navigate('/dashboard');
    } catch {
      setErrors({ submit: 'Sign up failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const Field = ({ name, label, icon: Icon, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
            errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {errors.submit}
        </div>
      )}

      <Field name="fullName" label="Full Name" icon={FiUser} placeholder="John Doe" />
      <Field name="username" label="Username" icon={FiAtSign} placeholder="johndoe88" />
      <Field name="email" label="Email" icon={FiMail} type="email" placeholder="you@example.com" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Min. 8 characters"
            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            placeholder="Repeat your password"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)}
            className="w-4 h-4 accent-[#1A4D8F] mt-0.5 rounded shrink-0" />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/terms" className="text-[#1A4D8F] hover:underline font-medium">Terms and Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[#1A4D8F] hover:underline font-medium">Privacy Policy</Link>
          </span>
        </label>
        {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.age} onChange={e => set('age', e.target.checked)}
            className="w-4 h-4 accent-[#1A4D8F] mt-0.5 rounded shrink-0" />
          <span className="text-sm text-gray-600">I confirm I am 18 years of age or older</span>
        </label>
        {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">
          Log In
        </Link>
      </p>
    </form>
  );
}
