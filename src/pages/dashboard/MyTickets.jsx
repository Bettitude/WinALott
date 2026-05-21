import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiList } from 'react-icons/fi';
import { useTickets } from '../../hooks/useTickets';

const filters = ['All', 'Active', 'Won', 'Lost'];
const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  won:     'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  lost:    'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
  voided:  'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
};

export default function MyTickets() {
  const [filter, setFilter] = useState('All');
  const { tickets, loading } = useTickets({ limit: 50 });

  const filtered = tickets.filter(t => {
    if (filter === 'Active') return t.status === 'pending' || t.status === 'active';
    if (filter === 'Won')    return t.status === 'won';
    if (filter === 'Lost')   return t.status === 'lost';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My Tickets</h1>
          <p className="text-gray-400 dark:text-slate-500 text-sm">All your prediction tickets</p>
        </div>
        <Link to="/lobby" className="bg-[#1A4D8F] text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
          + Buy Tickets
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
          <FiList className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 font-medium">No tickets found</p>
          <Link to="/lobby" className="text-[#1A4D8F] dark:text-blue-400 text-sm font-medium hover:underline mt-2 inline-block">Browse Lobby</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <tr className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                  <th className="text-left px-5 py-3">Match</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3 hidden md:table-cell">My Pick</th>
                  <th className="text-left py-3 hidden lg:table-cell">Admin Pick</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-right py-3">Entry</th>
                  <th className="text-right py-3 pr-5">Prize</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-t border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1A2E] dark:text-white text-xs">{t.match}</p>
                      <p className="text-gray-400 dark:text-slate-500 text-xs">{t.date}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{t.market}</span>
                    </td>
                    <td className="py-3.5 hidden md:table-cell text-xs text-gray-600 dark:text-slate-400">{t.myPick}</td>
                    <td className="py-3.5 hidden lg:table-cell text-xs text-gray-600 dark:text-slate-400">{t.adminPick}</td>
                    <td className="py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[t.status] || 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-xs font-bold text-[#1A4D8F] dark:text-blue-400">${t.entryFee.toFixed(2)}</td>
                    <td className="py-3.5 pr-5 text-right">
                      <span className={`text-xs font-bold ${t.prize > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-slate-600'}`}>
                        {t.prize > 0 ? `$${t.prize.toFixed(2)}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
