import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiList } from 'react-icons/fi';
import { dashboardTickets } from '../../data/mockData';

const filters = ['All', 'Active', 'Won', 'Lost'];
const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  won: 'bg-green-50 text-green-700',
  lost: 'bg-red-50 text-red-500',
};

export default function MyTickets() {
  const [filter, setFilter] = useState('All');

  const filtered = dashboardTickets.filter(t => {
    if (filter === 'Active') return t.status === 'pending';
    if (filter === 'Won') return t.status === 'won';
    if (filter === 'Lost') return t.status === 'lost';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E]">My Tickets</h1>
          <p className="text-gray-400 text-sm">All your prediction tickets</p>
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
              filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-16">
          <FiList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No tickets found</p>
          <Link to="/lobby" className="text-[#1A4D8F] text-sm font-medium hover:underline mt-2 inline-block">Browse Lobby</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 font-medium">
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
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1A2E] text-xs">{t.match}</p>
                      <p className="text-gray-400 text-xs">{t.date}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs bg-blue-50 text-[#1A4D8F] px-2 py-0.5 rounded-full font-medium">{t.market}</span>
                    </td>
                    <td className="py-3.5 hidden md:table-cell text-xs text-gray-600">{t.myPick}</td>
                    <td className="py-3.5 hidden lg:table-cell text-xs text-gray-600">{t.adminPick}</td>
                    <td className="py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-3.5 text-right text-xs font-bold text-[#1A4D8F]">${t.entryFee.toFixed(2)}</td>
                    <td className="py-3.5 pr-5 text-right">
                      <span className={`text-xs font-bold ${t.prize > 0 ? 'text-green-600' : 'text-gray-300'}`}>
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
