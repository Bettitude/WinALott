import { Link } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import { FiShield, FiZap, FiAward } from 'react-icons/fi';

const PERKS = [
  { Icon: FiShield, text: 'Provably fair draws — HMAC-SHA256 verified' },
  { Icon: FiZap,    text: 'Instant payouts direct to your wallet' },
  { Icon: FiAward,  text: 'Silver, Gold & Platinum prediction tiers' },
];

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left image panel — hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80&auto=format&fit=crop"
          alt="stadium"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/80" />
        <div className="relative z-10 text-white px-12 max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1 mb-10">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-[#F5C518]">b</span>
              <span className="text-white">WinAL</span>
              <span className="text-[#F5C518]">OTT</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5C518] mt-1.5" />
          </Link>
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Take a Side.<br />Win the Pride.
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            The smarter way to follow football — predict, stake, and win from every match.
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
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="text-center mb-8 lg:hidden">
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
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6">Log in to your WinALot account</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
