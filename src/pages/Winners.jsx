import { Link } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import WinnerCard from '../components/ui/WinnerCard';
import { useWinners } from '../hooks/useWinners';

export default function Winners() {
  const { winners, loading } = useWinners(30);

  const stats = [
    { icon: FiDollarSign, label: 'Total Paid Out',      value: '$48,250', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-l-green-400' },
    { icon: FiUsers,      label: 'Winners This Month',  value: '312',     color: 'text-[#1A4D8F] dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30',  border: 'border-l-[#1A4D8F]' },
    { icon: FiAward,      label: 'Biggest Prize',       value: '$125.00', color: 'text-[#F5C518]',  bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-l-yellow-400' },
    { icon: FiTrendingUp, label: 'Avg Win Rate',        value: '62%',     color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-l-purple-400' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative py-20 px-4 text-white text-center overflow-hidden min-h-[260px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1567537234878-ed2d8a0cbdcd?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/78" />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-3 border-l-4 ${s.border} flex items-center gap-3`}>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-base font-black ${s.color} leading-none`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Winners feed */}
      <section className="max-w-2xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#1A1A2E] dark:text-white">Recent Winners</h2>
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Feed
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : winners.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
            <FiAward className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-slate-500 font-medium">No winners yet</p>
            <p className="text-gray-300 dark:text-slate-600 text-sm">Be the first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((w, i) => (
              <div key={w.id} className="fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <WinnerCard winner={w} />
              </div>
            ))}
          </div>
        )}
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
