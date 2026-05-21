import { Link } from 'react-router-dom';
import { FiList, FiDollarSign, FiTrendingUp, FiClock, FiArrowRight, FiGift } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTickets } from '../../hooks/useTickets';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  won:     'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  lost:    'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets({ limit: 5 });

  const activeCount = tickets.filter(t => t.status === 'pending' || t.status === 'active').length;
  const totalWon    = tickets.filter(t => t.status === 'won').reduce((s, t) => s + t.prize, 0);

  const stats = [
    { icon: FiList,       label: 'Active Tickets', value: activeCount,                        color: 'text-[#1A4D8F]',  bg: 'bg-blue-50 dark:bg-blue-950/50',     border: 'border-l-[#1A4D8F]' },
    { icon: FiDollarSign, label: 'Total Winnings',  value: `$${totalWon.toFixed(2)}`,          color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/50',   border: 'border-l-green-400' },
    { icon: FiTrendingUp, label: 'Wallet Balance',  value: `$${(user?.balance ?? 0).toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-l-purple-400' },
    { icon: FiClock,      label: 'Total Tickets',   value: tickets.length,                     color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/50', border: 'border-l-orange-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10">
          <div className="w-full h-full bg-[#F5C518] rounded-l-full" />
        </div>
        <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
        <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Player'}</h1>
        <p className="text-blue-300 text-sm mt-1">@{user?.username}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 border-l-4 ${s.border}`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/lobby',               label: 'Buy Tickets',    desc: 'Browse active markets',     icon: FiList,       bg: 'bg-[#1A4D8F]'  },
          { to: '/dashboard/wallet',    label: 'My Wallet',      desc: 'Deposit or withdraw funds', icon: FiDollarSign, bg: 'bg-green-600' },
          { to: '/dashboard/winnings',  label: 'My Winnings',    desc: 'Check your prizes',         icon: FiTrendingUp, bg: 'bg-purple-600' },
          { to: '/dashboard/referrals', label: 'Refer a Friend', desc: 'Earn $0.50 per referral',   icon: FiGift,       bg: 'bg-orange-500' },
        ].map(q => (
          <Link key={q.to} to={q.to}
            className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition-shadow card-hover">
            <div className={`${q.bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
              <q.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A2E] dark:text-slate-100 text-sm">{q.label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{q.desc}</p>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recent tickets */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-[#1A1A2E] dark:text-white">Recent Tickets</h2>
          <Link to="/dashboard/tickets" className="text-sm text-[#1A4D8F] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
            View all <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10">
            <FiList className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">No tickets yet</p>
            <Link to="/lobby" className="text-[#1A4D8F] dark:text-blue-400 text-sm font-medium hover:underline mt-1 inline-block">Browse Lobby</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/60">
                <tr className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                  <th className="text-left px-5 py-3">Match</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3 hidden md:table-cell">My Pick</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-right py-3 pr-5">Entry</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map(t => (
                  <tr key={t.id} className="border-t border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1A2E] dark:text-slate-200 text-xs leading-tight">{t.match}</p>
                      <p className="text-gray-400 dark:text-slate-500 text-xs">{t.date}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{t.market}</span>
                    </td>
                    <td className="py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-600 dark:text-slate-300">{t.myPick}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[t.status] || 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <span className="text-xs font-bold text-[#1A4D8F] dark:text-blue-400">${t.entryFee.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
