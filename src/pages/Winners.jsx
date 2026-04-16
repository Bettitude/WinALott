import { Link } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import WinnerCard from '../components/ui/WinnerCard';
import { recentWinners } from '../data/mockData';

const stats = [
  { icon: FiDollarSign, label: 'Total Paid Out', value: '$48,250', color: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-400' },
  { icon: FiUsers, label: 'Winners This Month', value: '312', color: 'text-[#1A4D8F]', bg: 'bg-blue-50', border: 'border-l-[#1A4D8F]' },
  { icon: FiAward, label: 'Biggest Prize', value: '$125.00', color: 'text-[#F5C518]', bg: 'bg-yellow-50', border: 'border-l-yellow-400' },
  { icon: FiTrendingUp, label: 'Avg Win Rate', value: '62%', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-400' },
];

export default function Winners() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] via-[#1A4D8F] to-[#0D2B5E] py-16 px-4 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-40 h-40 rounded-full bg-[#F5C518]" />
          <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-[#F5C518]/20 border border-[#F5C518]/40 rounded-full p-4">
              <FiAward className="w-8 h-8 text-[#F5C518]" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-3">Our Champions</h1>
          <p className="text-blue-200 max-w-md mx-auto">
            Real players. Real winnings. These are our most recent WinALot champions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 border-l-4 ${s.border}`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Winners feed */}
      <section className="max-w-2xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#1A1A2E]">Recent Winners</h2>
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Feed
          </span>
        </div>

        <div className="space-y-3">
          {recentWinners.map((w, i) => (
            <div key={w.id} className="fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <WinnerCard winner={w} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A4D8F] py-12 px-4 text-center">
        <h2 className="text-2xl font-black text-white mb-2">You Could Be Next</h2>
        <p className="text-blue-200 mb-6 text-sm">Join today and make your first prediction for just $0.99</p>
        <Link to="/lobby"
          className="bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-110 transition-all text-sm">
          Join and Win Today
        </Link>
      </section>
    </div>
  );
}
