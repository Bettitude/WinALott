import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import Logo from '../../components/ui/Logo';

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FA] flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo variant="full" height={40} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Reset Password</h2>
          <p className="text-gray-400 text-sm mb-6">We'll send you a link to reset your password.</p>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
