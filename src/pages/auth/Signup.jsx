import { Link } from 'react-router-dom';
import SignupForm from '../../components/forms/SignupForm';

export default function Signup() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F7FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1 justify-center">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-[#F5C518]">b</span>
              <span className="text-[#0D2B5E]">WinAL</span>
              <span className="text-[#F5C518] font-black">OTT</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5C518] mt-1.5" />
          </Link>
          <p className="text-gray-400 text-sm mt-2">Take a Side. Win the Pride.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Create your account</h2>
          <p className="text-gray-400 text-sm mb-6">Join thousands of winners on WinALot</p>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
