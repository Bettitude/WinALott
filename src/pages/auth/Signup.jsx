import { Link } from 'react-router-dom';
import SignupForm from '../../components/forms/SignupForm';
import { FiUsers, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';

const PERKS = [
  { Icon: FiCreditCard,  text: 'Buy WALP once — stake across all matches' },
  { Icon: FiRefreshCw,   text: 'Top up anytime; 1 WALP = $1.00 USD' },
  { Icon: FiUsers,       text: 'Join 12,400+ active players worldwide' },
];

export default function Signup() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left image panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&auto=format&fit=crop"
          alt="stadium crowd"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/80" />
        <div className="relative z-10 text-white px-12 max-w-sm">
          <Link to="/" className="inline-block mb-10">
            <Logo variant="full" height={56} className="brightness-200" />
          </Link>
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Your first win<br />starts here.
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Create your free WinALot account and start predicting football markets today.
          </p>

          {/* WALP explanation */}
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/25 rounded-xl p-4 mb-6">
            <p className="text-xs font-black text-[#F5C518] uppercase tracking-wide mb-2">How WALP Works</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-blue-200 leading-relaxed">1 WALP = $1.00 USD — simple, always</li>
              <li className="text-xs text-blue-200 leading-relaxed">Buy WALP once using card or bank transfer</li>
              <li className="text-xs text-blue-200 leading-relaxed">Use WALP to stake on any prediction market</li>
              <li className="text-xs text-blue-200 leading-relaxed">Win more WALP — convert to cash at any time</li>
            </ul>
          </div>

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
          {/* Logo (mobile only) */}
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-block">
              <Logo variant="full" height={52} />
            </Link>
            <p className="text-gray-400 text-sm mt-2">Take a Side. Win the Pride.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Create your account</h2>
            <p className="text-gray-400 text-sm mb-6">Free to join. Start predicting in minutes.</p>
            <SignupForm />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#1A4D8F] font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
