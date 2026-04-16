import { Link } from 'react-router-dom';
import { FiList, FiDollarSign, FiTrendingUp, FiClock, FiArrowRight, FiGift } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { dashboardTickets } from '../../data/mockData';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  won: 'bg-green-50 text-green-700',
  lost: 'bg-red-50 text-red-500',
};

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { icon: FiList, label: 'Active Tickets', value: user?.activeTickets ?? 3, color: 'text-[#1A4D8F]', bg: 'bg-blue-50', border: 'border-l-[#1A4D8F]' },
    { icon: FiDollarSign, label: 'Total Winnings', value: `$${(user?.totalWinnings ?? 54.60).toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-400' },
    { icon: FiTrendingUp, label: 'Win Rate', value: `${user?.winRate ?? 63}%`, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-400' },
    { icon: FiClock, label: 'Pending Draws', value: '2', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-l-orange-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10">
          <div className="w-full h-full bg-[#F5C518] rounded-l-full" />
        </div>
        <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-black">{user?.name || 'Player'}</h1>
        <p className="text-blue-300 text-sm mt-1">@{user?.username}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 border-l-4 ${s.border}`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/lobby',                label: 'Buy Tickets',    desc: 'Browse active markets',      icon: FiList,      bg: 'bg-[#1A4D8F]'  },
          { to: '/dashboard/wallet',     label: 'My Wallet',      desc: 'Deposit or withdraw funds',  icon: FiDollarSign, bg: 'bg-green-600' },
          { to: '/dashboard/winnings',   label: 'My Winnings',    desc: 'Check your prizes',          icon: FiTrendingUp, bg: 'bg-purple-600' },
          { to: '/dashboard/referrals',  label: 'Refer a Friend', desc: 'Earn $0.50 per referral',    icon: FiGift,       bg: 'bg-orange-500' },
        ].map(q => (
          <Link key={q.to} to={q.to}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow card-hover">
            <div className={`${q.bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
              <q.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A2E] text-sm">{q.label}</p>
              <p className="text-xs text-gray-400">{q.desc}</p>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1A1A2E]">Recent Tickets</h2>
          <Link to="/dashboard/tickets" className="text-sm text-[#1A4D8F] font-medium hover:underline flex items-center gap-1">
            View all <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-400 font-medium">
                <th className="text-left px-5 py-3">Match</th>
                <th className="text-left py-3">Market</th>
                <th className="text-left py-3 hidden md:table-cell">My Pick</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3 pr-5">Entry</th>
              </tr>
            </thead>
            <tbody>
              {dashboardTickets.slice(0, 5).map(t => (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#1A1A2E] text-xs leading-tight">{t.match}</p>
                    <p className="text-gray-400 text-xs">{t.date}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs bg-blue-50 text-[#1A4D8F] px-2 py-0.5 rounded-full font-medium">{t.market}</span>
                  </td>
                  <td className="py-3.5 hidden md:table-cell">
                    <span className="text-xs text-gray-600">{t.myPick}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-5 text-right">
                    <span className="text-xs font-bold text-[#1A4D8F]">${t.entryFee.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
