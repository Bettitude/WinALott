import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import { FiShield, FiKey, FiMail } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';

const PERKS = [
  { Icon: FiKey,    text: 'Reset link sent directly to your email' },
  { Icon: FiShield, text: 'Secure password update — no old password needed' },
  { Icon: FiMail,   text: 'Check your spam folder if you don\'t see it' },
];

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left image panel — desktop only */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80&auto=format&fit=crop"
          alt="football"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/80" />
        <div className="relative z-10 text-white px-12 max-w-sm">
          <Link to="/" className="inline-block mb-10">
            <Logo variant="full" height={56} className="brightness-200" />
          </Link>
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Forgot Your<br />Password?
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            No worries — enter your email and we'll send you a secure link to get back in.
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* Logo — mobile only */}
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-block">
              <Logo variant="full" height={52} />
            </Link>
            <p className="text-gray-400 text-sm mt-2">Forgot Your Password?</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Reset Password</h2>
            <p className="text-gray-400 text-sm mb-6">We'll send you a link to reset your password.</p>
            <ForgotPasswordForm />
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
