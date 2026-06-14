import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAtSign } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { friendlyError } from '../../utils/friendlyError';

// Defined outside SignupForm so React never remounts it on re-render
function Field({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SignupForm() {
  const [form, setForm] = useState({
    fullName: '', username: '', email: '',
    password: '', confirmPassword: '',
    terms: false, age: false,
  });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { signup } = useAuth();
  const navigate   = useNavigate();

  // Read referral code from URL: /auth/signup?ref=A3F8C2D1
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setReferralCode(ref.toUpperCase());
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers and underscore only';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.terms) e.terms = 'You must agree to the Terms and Conditions to continue';
    if (!form.age)   e.age   = 'You must confirm you are 18 or older to continue';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await signup({ ...form, terms_accepted: form.terms, age_confirmed: form.age, referral_code: referralCode || undefined });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: friendlyError(err, 'Sign up failed. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {errors.submit}
        </div>
      )}

      <Field
        id="signup-fullName"
        label="Full Name"
        icon={FiUser}
        placeholder="John Doe"
        value={form.fullName}
        onChange={e => set('fullName', e.target.value)}
        error={errors.fullName}
      />
      <Field
        id="signup-username"
        label="Username"
        icon={FiAtSign}
        placeholder="johndoe88"
        value={form.username}
        onChange={e => set('username', e.target.value)}
        error={errors.username}
      />
      <Field
        id="signup-email"
        label="Email"
        icon={FiMail}
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={e => set('email', e.target.value)}
        error={errors.email}
      />

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="signup-password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Min. 8 characters"
            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] transition-colors ${
              errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          <button type="button" onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="signup-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="signup-confirmPassword"
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

      {/* Terms & age — required */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)}
              className={`w-4 h-4 accent-[#1A4D8F] mt-0.5 rounded shrink-0 ${errors.terms ? 'outline outline-2 outline-red-400' : ''}`} />
            <span className="text-sm text-gray-600">
              I agree with the{' '}
              <Link to="/terms" className="text-[#1A4D8F] hover:underline font-medium">Terms and Conditions</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-[#1A4D8F] hover:underline font-medium">Privacy Policy</Link>.
              {' '}Note: <strong>1 WALP = $1.00 USD</strong>.
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs mt-1 ml-6">{errors.terms}</p>}
        </div>

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={form.age} onChange={e => set('age', e.target.checked)}
              className={`w-4 h-4 accent-[#1A4D8F] mt-0.5 rounded shrink-0 ${errors.age ? 'outline outline-2 outline-red-400' : ''}`} />
            <span className="text-sm text-gray-600">I confirm I am 18 years of age or older</span>
          </label>
          {errors.age && <p className="text-red-500 text-xs mt-1 ml-6">{errors.age}</p>}
        </div>
      </div>

      {referralCode && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2.5 rounded-xl">
          <span className="font-bold text-[#F5C518]">&#9733;</span>
          <span>Joining with referral code <strong>{referralCode}</strong></span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !form.terms || !form.age}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

    </form>
  );
}
