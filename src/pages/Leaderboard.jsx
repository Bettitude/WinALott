import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { matchApi } from '../api/matchApi';

const TABS = ['weekly', 'monthly', 'allTime'];
const TAB_LABELS = { weekly: 'This Week', monthly: 'This Month', allTime: 'All Time' };

const RANK_STYLES = {
  1: { bg: 'bg-yellow-400', text: 'text-[#1A1A2E]', ring: 'ring-2 ring-yellow-300' },
  2: { bg: 'bg-gray-300 dark:bg-gray-600',   text: 'text-gray-700 dark:text-gray-200',  ring: 'ring-2 ring-gray-200 dark:ring-gray-500'  },
  3: { bg: 'bg-orange-400', text: 'text-white',      ring: 'ring-2 ring-orange-200' },
};

function RankBadge({ rank }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <div className={`w-7 h-7 rounded-full ${style.bg} ${style.ring} flex items-center justify-center font-black text-xs ${style.text} shrink-0`}>
        <FiAward className="w-3.5 h-3.5" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-gray-500 dark:text-slate-400 shrink-0">
      {rank}
    </div>
  );
}

const podiumColors  = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];
const podiumHeights = ['h-24', 'h-16', 'h-12'];

function fmt(cents) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000)     return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toFixed(2)}`;
}

export default function Leaderboard() {
  const [tab, setTab] = useState('weekly');
  const { user }      = useAuth();
  const { rows, loading } = useLeaderboard(tab === 'allTime' ? 'alltime' : tab);

  const [lbStats, setLbStats]       = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    matchApi.getLeaderboardStats()
      .then(res => setLbStats(res.data?.data || null))
      .catch(() => setLbStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const top3 = rows.slice(0, 3);
  const myUsername = user?.username || '';

  const stats = [
    {
      icon: FiUsers,
      label: 'Total Players',
      value: statsLoading ? '…' : lbStats ? lbStats.total_players.toLocaleString() : '—',
      color: 'text-[#1A4D8F] dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-l-[#1A4D8F]',
    },
    {
      icon: FiAward,
      label: 'Winners This Week',
      value: statsLoading ? '…' : lbStats ? lbStats.winners_this_week.toLocaleString() : '—',
      color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-l-yellow-400',
    },
    {
      icon: FiDollarSign,
      label: 'Total Paid Out',
      value: statsLoading ? '…' : lbStats ? fmt(lbStats.total_paid_out) : '—',
      color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-l-green-400',
    },
    {
      icon: FiTrendingUp,
      label: 'Avg Win Rate',
      value: statsLoading ? '…' : lbStats ? `${lbStats.avg_win_rate}%` : '—',
      color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-l-purple-400',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative py-20 px-4 text-white text-center overflow-hidden min-h-[240px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/75" />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-[#1A4D8F] text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
              }`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 animate-pulse h-14" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
            <FiTrendingUp className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-slate-500 font-medium">No data yet for {TAB_LABELS[tab]}</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {top3.length >= 2 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, i) => {
                  const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  return (
                    <div key={player.username} className="flex flex-col items-center gap-2">
                      <div className="text-center mb-1">
                        <div className="w-12 h-12 rounded-full bg-[#1A4D8F]/10 dark:bg-blue-900/40 border-2 border-[#1A4D8F]/20 dark:border-blue-700/40 flex items-center justify-center mx-auto mb-1">
                          <span className="text-sm font-black text-[#1A4D8F] dark:text-blue-400">{player.username.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <p className="text-xs font-bold text-[#1A1A2E] dark:text-white max-w-[80px] truncate">{player.username}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold">${player.totalPrize.toFixed(2)}</p>
                      </div>
                      <div className={`w-20 ${podiumHeights[realRank - 1]} ${podiumColors[realRank - 1]} rounded-t-xl flex items-start justify-center pt-2`}>
                        <span className="text-white font-black text-lg">#{realRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                <h2 className="font-bold text-[#1A1A2E] dark:text-white">Full Rankings — {TAB_LABELS[tab]}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                    <tr className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                      <th className="text-left px-5 py-3">Rank</th>
                      <th className="text-left py-3">Player</th>
                      <th className="text-right py-3 hidden sm:table-cell">Wins</th>
                      <th className="text-right py-3 hidden lg:table-cell">Last Win</th>
                      <th className="text-right py-3 pr-5">Total Won</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(player => {
                      const isMe = myUsername && player.username === myUsername;
                      return (
                        <tr key={player.rank}
                          className={`border-t border-gray-50 dark:border-slate-700 transition-colors ${isMe ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                          <td className="px-5 py-3.5"><RankBadge rank={player.rank} /></td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1A4D8F]/10 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <span className="text-xs font-black text-[#1A4D8F] dark:text-blue-400">{player.username.slice(0, 2).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-bold text-[#1A1A2E] dark:text-white text-xs">{player.username}</p>
                                {isMe && <span className="text-xs text-[#1A4D8F] dark:text-blue-400 font-semibold">You</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right hidden sm:table-cell">
                            <span className="text-xs font-bold text-[#1A1A2E] dark:text-white">{player.wins}</span>
                          </td>
                          <td className="py-3.5 text-right hidden lg:table-cell">
                            <span className="text-xs text-gray-400 dark:text-slate-500">{player.lastWin}</span>
                          </td>
                          <td className="py-3.5 pr-5 text-right">
                            <span className="text-sm font-black text-green-600 dark:text-green-400">${player.totalPrize.toFixed(2)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
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
