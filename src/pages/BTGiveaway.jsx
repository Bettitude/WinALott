import { Link } from 'react-router-dom';
import { FiGift, FiCheck, FiArrowRight } from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import { useMatches } from '../hooks/useMatches';

const rules = [
  'No purchase required — BTGiveaway entries are completely free.',
  'Must have a verified WinALot account to enter.',
  'One free ticket per user per giveaway event.',
  'Your prediction must match the admin\'s pick to enter the draw.',
  'Winners are randomly selected from all correct predictors.',
  'Must be 18 years or older to participate.',
];

// Defined prize categories for the giveaway
const PRIZES = [
  {
    icon: '👟',
    name: 'Soccer Boot Bundle',
    desc: 'Nike Phantom GX Elite + Adidas Predator Elite — top-of-range boots worth $450+',
    color: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    tag: 'Most Popular',
  },
  {
    icon: '🏆',
    name: 'Cash Prize',
    desc: 'Direct bank transfer or wallet credit — up to $500 per draw',
    color: 'from-yellow-50 to-green-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    tag: 'Cash',
  },
  {
    icon: '🎽',
    name: 'Official Club Jersey',
    desc: 'Latest season authentic jersey of your favourite club with player name',
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    tag: 'Merch',
  },
  {
    icon: '🎟️',
    name: 'Match Day Tickets',
    desc: 'Two premium tickets to a Premier League or Champions League fixture',
    color: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    tag: 'Experience',
  },
  {
    icon: '⌚',
    name: 'Sports Watch',
    desc: 'Garmin Forerunner or Apple Watch SE — track your match day performance',
    color: 'from-gray-50 to-slate-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    tag: 'Gadget',
  },
  {
    icon: '🎮',
    name: 'Gaming Bundle',
    desc: 'EA FC 2025 + FIFA Points + Controller — dominate on and off the pitch',
    color: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    tag: 'Gaming',
  },
];

export default function BTGiveaway() {
  const { matches, loading } = useMatches({ tier: 'free', status: 'active' });

  return (
    <div>
      {/* Hero */}
      <div className="relative py-20 px-4 text-center overflow-hidden min-h-[260px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A1A2E]/70" />
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-[#F5C518]/20 border border-[#F5C518]/40 rounded-full p-4">
              <FiGift className="w-10 h-10 text-[#F5C518]" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            100% FREE — NO PAYMENT REQUIRED
          </div>
          <h1 className="text-4xl font-black text-white mb-3">BT Giveaway</h1>
          <p className="text-blue-200 text-lg font-medium max-w-lg mx-auto">
            Your Free Shot at Real Prizes — Boots, Cash, Jerseys & More
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-8">How BTGiveaway Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { n: '01', title: 'Pick a Giveaway Match', desc: 'Browse the BTGiveaway matches below — marked with a FREE badge.' },
            { n: '02', title: 'Make Your Prediction', desc: 'Predict the match result. No payment, no card details — completely free.' },
            { n: '03', title: 'Win Real Prizes', desc: 'Correct predictors enter the draw. Winners receive boots, cash, jerseys, and more.' },
          ].map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center card-hover">
              <div className="w-12 h-12 rounded-full bg-[#F5C518] text-[#1A1A2E] font-black text-lg flex items-center justify-center mx-auto mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize showcase */}
      <section className="bg-gray-50 border-t border-b border-gray-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">This Month's Prize Pool</h2>
            <p className="text-gray-500 text-sm">Prizes rotate every month. Enter free and win real gear.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIZES.map(p => (
              <div
                key={p.name}
                className={`bg-gradient-to-br ${p.color} border ${p.border} rounded-2xl p-5 card-hover`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{p.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.badge}`}>{p.tag}</span>
                </div>
                <h3 className="font-black text-[#1A1A2E] mb-1.5">{p.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active giveaway matches */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1A1A2E]">Active Giveaway Matches</h2>
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            FREE ENTRY
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <MatchCard key={i} loading />)}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          /* Show real upcoming matches from lobby as free-entry targets */
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <FiGift className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold mb-1">No dedicated giveaway matches right now.</p>
            <p className="text-gray-400 text-sm mb-5">Check the Lobby — some matches have free entry tiers.</p>
            <Link
              to="/lobby"
              className="inline-flex items-center gap-2 bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors"
            >
              Browse Free Games <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Entry rules */}
      <section className="max-w-2xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A2E] mb-4">Entry Rules</h3>
          <ul className="space-y-3">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
