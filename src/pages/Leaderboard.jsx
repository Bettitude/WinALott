import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import { leaderboardData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const TABS = ['weekly', 'monthly', 'allTime'];
const TAB_LABELS = { weekly: 'This Week', monthly: 'This Month', allTime: 'All Time' };

const RANK_STYLES = {
  1: { bg: 'bg-yellow-400', text: 'text-[#1A1A2E]', ring: 'ring-2 ring-yellow-300' },
  2: { bg: 'bg-gray-300',   text: 'text-gray-700',  ring: 'ring-2 ring-gray-200'  },
  3: { bg: 'bg-orange-400', text: 'text-white',      ring: 'ring-2 ring-orange-200' },
};

function RankBadge({ rank }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <div className={`w-7 h-7 rounded-full ${style.bg} ${style.ring} flex items-center justify-center font-black text-xs ${style.text} shrink-0`}>
        {rank <= 3 ? <FiAward className="w-3.5 h-3.5" /> : rank}
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
      {rank}
    </div>
  );
}

const podiumColors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];
const podiumHeights = ['h-24', 'h-16', 'h-12'];
const podiumRanks  = [1, 2, 3];

export default function Leaderboard() {
  const [tab, setTab]   = useState('weekly');
  const { user }        = useAuth();
  const rows            = leaderboardData[tab];
  const top3            = rows.slice(0, 3);
  const rest            = rows.slice(3);

  // Mock: highlight user if they're in the list
  const myUsername = user?.username || 'J***n88';

  const stats = [
    { icon: FiUsers,    label: 'Total Players',   value: '12,480', color: 'text-[#1A4D8F]', bg: 'bg-blue-50',   border: 'border-l-[#1A4D8F]' },
    { icon: FiAward,    label: 'Winners This Week', value: '284',  color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-l-yellow-400' },
    { icon: FiDollarSign,label: 'Total Paid Out',  value: '$48.2K',color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-l-green-400' },
    { icon: FiTrendingUp,label: 'Avg Win Rate',    value: '64%',   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-400' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] via-[#1A4D8F] to-[#0D2B5E] py-14 px-4 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-16 w-36 h-36 rounded-full bg-[#F5C518]" />
          <div className="absolute bottom-8 right-16 w-28 h-28 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F5C518]/20 border border-[#F5C518]/30 mb-4">
            <FiTrendingUp className="w-7 h-7 text-[#F5C518]" />
          </div>
          <h1 className="text-4xl font-black mb-2">Leaderboard</h1>
          <p className="text-blue-200 max-w-md mx-auto text-sm">
            The top predictors ranked by winnings. Can you make it to the top?
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-8">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-[#1A4D8F] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
              }`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Podium — top 3 */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, i) => {
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const hgt = podiumHeights[realRank - 1];
            const bg  = podiumColors[realRank - 1];
            return (
              <div key={player.username} className="flex flex-col items-center gap-2">
                <div className="text-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-[#1A4D8F]/10 border-2 border-[#1A4D8F]/20 flex items-center justify-center mx-auto mb-1">
                    <span className="text-sm font-black text-[#1A4D8F]">{player.username.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <p className="text-xs font-bold text-[#1A1A2E] max-w-[80px] truncate">{player.username}</p>
                  <p className="text-xs text-green-600 font-bold">${player.totalPrize.toFixed(2)}</p>
                </div>
                <div className={`w-20 ${hgt} ${bg} rounded-t-xl flex items-start justify-center pt-2`}>
                  <span className="text-white font-black text-lg">#{realRank}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1A1A2E]">Full Rankings — {TAB_LABELS[tab]}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 font-medium">
                  <th className="text-left px-5 py-3">Rank</th>
                  <th className="text-left py-3">Player</th>
                  <th className="text-right py-3 hidden sm:table-cell">Wins</th>
                  <th className="text-right py-3 hidden md:table-cell">Win Rate</th>
                  <th className="text-right py-3 hidden lg:table-cell">Last Win On</th>
                  <th className="text-right py-3 pr-5">Total Won</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(player => {
                  const isMe = player.username === myUsername;
                  return (
                    <tr key={player.rank}
                      className={`border-t border-gray-50 transition-colors ${isMe ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3.5">
                        <RankBadge rank={player.rank} />
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1A4D8F]/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-[#1A4D8F]">{player.username.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#1A1A2E] text-xs">{player.username}</p>
                            {isMe && <span className="text-xs text-[#1A4D8F] font-semibold">You</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-right hidden sm:table-cell">
                        <span className="text-xs font-bold text-[#1A1A2E]">{player.wins}</span>
                      </td>
                      <td className="py-3.5 text-right hidden md:table-cell">
                        <span className="text-xs text-gray-500">{player.winRate}%</span>
                      </td>
                      <td className="py-3.5 text-right hidden lg:table-cell">
                        <span className="text-xs text-gray-400 truncate max-w-[120px] block">{player.lastWin}</span>
                      </td>
                      <td className="py-3.5 pr-5 text-right">
                        <span className="text-sm font-black text-green-600">${player.totalPrize.toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A4D8F] py-12 px-4 text-center mt-4">
        <h2 className="text-2xl font-black text-white mb-2">Climb the Rankings</h2>
        <p className="text-blue-200 mb-6 text-sm">Every correct prediction counts. Start predicting for just $0.99.</p>
        <Link to="/lobby"
          className="bg-[#F5C518] text-[#1A1A2E] font-black px-7 py-3.5 rounded-xl hover:brightness-110 transition-all text-sm">
          Play Now
        </Link>
      </section>
    </div>
  );
}
