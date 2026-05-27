import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiZap, FiAward, FiStar,
  FiAlertCircle, FiRefreshCw, FiGift,
} from 'react-icons/fi';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';

const TIER_BADGE = {
  silver:   { Icon: FiStar,  cls: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600' },
  gold:     { Icon: FiAward, cls: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700' },
  platinum: { Icon: FiZap,   cls: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700' },
  free:     { Icon: FiGift,  cls: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' },
};

const HISTORY_FILTERS = ['All', 'Wins', 'Losses', 'Refunds'];

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-1">
      {Icon && <Icon className={`w-5 h-5 mb-1 ${color}`} />}
      <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
    </div>
  );
}

function ActiveStakeCard({ ticket }) {
  const tierStr = ticket._raw?.tier || ticket._raw?.markets?.tier || 'silver';
  const tier = TIER_BADGE[tierStr] || TIER_BADGE.silver;
  const TierIcon = tier.Icon;
  const matchStatus = ticket._raw?.markets?.matches?.status || 'upcoming';
  const isLive = matchStatus === 'live';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        {isLive ? (
          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
            <FiClock className="w-2.5 h-2.5" /> Upcoming
          </span>
        )}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${tier.cls}`}>
          <TierIcon className="w-2.5 h-2.5" />
          {tierStr.charAt(0).toUpperCase() + tierStr.slice(1)}
        </span>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm font-black text-[#1A1A2E] dark:text-white truncate">{ticket.match}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{ticket.market}</p>

        <div className="mt-3 flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Your Pick</p>
            <p className="text-sm font-black text-[#1A4D8F] dark:text-blue-300">{ticket.myPick}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Entry</p>
            <p className="text-sm font-black text-[#1A1A2E] dark:text-white">${ticket.entryFee.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{ticket.ticketNumber}</span>
          <Link
            to={`/match/${ticket._raw?.market_id || ''}`}
            className="text-xs font-bold text-[#1A4D8F] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View Match
          </Link>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ ticket }) {
  const isWin     = ticket.status === 'won';
  const isLoss    = ticket.status === 'lost';
  const isVoided  = ticket.status === 'voided';
  const netChange = isWin ? ticket.prize - ticket.entryFee : isLoss ? -ticket.entryFee : 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-sm p-4 ${
      isWin   ? 'border-green-200 dark:border-green-800' :
      isLoss  ? 'border-red-200 dark:border-red-800' :
                'border-gray-200 dark:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isWin ? (
              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700">
                <FiCheckCircle className="w-2.5 h-2.5" /> WON
              </span>
            ) : isLoss ? (
              <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 dark:border-red-700">
                <FiXCircle className="w-2.5 h-2.5" /> LOST
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600">
                <FiRefreshCw className="w-2.5 h-2.5" /> REFUNDED
              </span>
            )}
            <p className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate">{ticket.match}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500">{ticket.market}</p>

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
            <span>Pick: <strong className="text-[#1A1A2E] dark:text-white">{ticket.myPick}</strong></span>
            {ticket.adminPick && ticket.adminPick !== '—' && (
              <span>Correct: <strong className="text-[#1A1A2E] dark:text-white">{ticket.adminPick}</strong></span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-base font-black ${
            netChange > 0 ? 'text-green-600 dark:text-green-400' :
            netChange < 0 ? 'text-red-500 dark:text-red-400' :
            'text-gray-400 dark:text-slate-500'
          }`}>
            {netChange > 0 ? `+$${netChange.toFixed(2)}` : netChange < 0 ? `-$${Math.abs(netChange).toFixed(2)}` : '$0.00'}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{ticket.date}</p>
        </div>
      </div>
    </div>
  );
}

export default function MyStakes() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'history' ? 'history' : 'active');
  const [historyFilter, setHistoryFilter] = useState(
    searchParams.get('filter') === 'wins' ? 'Wins' : 'All'
  );

  const { tickets, loading, error, refetch } = useTickets({ limit: 100 });

  // Merge API tickets with any locally-persisted stakes (mock / offline mode)
  const localStakes = useMemo(() => {
    if (!user?.id) return [];
    try { return JSON.parse(localStorage.getItem(`winalot_stakes_${user.id}`) || '[]'); }
    catch { return []; }
  }, [user?.id]);

  const allTickets = useMemo(() => {
    const apiNums = new Set(tickets.map(t => t.ticketNumber));
    return [...tickets, ...localStakes.filter(t => !apiNums.has(t.ticketNumber))];
  }, [tickets, localStakes]);

  const active  = useMemo(() => allTickets.filter(t => t.status === 'pending' || t.status === 'active'), [allTickets]);
  const history = useMemo(() => allTickets.filter(t => ['won', 'lost', 'voided'].includes(t.status)), [allTickets]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'Wins')    return history.filter(t => t.status === 'won');
    if (historyFilter === 'Losses')  return history.filter(t => t.status === 'lost');
    if (historyFilter === 'Refunds') return history.filter(t => t.status === 'voided');
    return history;
  }, [history, historyFilter]);

  // Stats
  const totalStakes  = allTickets.length;
  const totalWins    = history.filter(t => t.status === 'won').length;
  const totalLosses  = history.filter(t => t.status === 'lost').length;
  const totalWon     = history.reduce((s, t) => s + (t.prize || 0), 0);
  const totalSpent   = history.reduce((s, t) => s + (t.entryFee || 0), 0);
  const netPoints    = totalWon - totalSpent;
  const winRate      = history.length > 0 ? Math.round((totalWins / history.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My Stakes</h1>
          <p className="text-gray-400 dark:text-slate-500 text-sm">All your prediction entries</p>
        </div>
        <Link to="/lobby"
          className="bg-[#1A4D8F] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
          + Enter New Match
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Stakes" value={totalStakes} color="text-[#1A4D8F] dark:text-blue-400" icon={FiTrendingUp} />
        <StatCard label="Wins" value={totalWins} color="text-green-600 dark:text-green-400" icon={FiCheckCircle} />
        <StatCard label="Losses" value={totalLosses} color="text-red-500 dark:text-red-400" icon={FiXCircle} />
        <StatCard
          label="Net Profit"
          value={`${netPoints >= 0 ? '+' : ''}$${Math.abs(netPoints).toFixed(2)}`}
          color={netPoints >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}
          icon={FiTrendingUp}
        />
      </div>

      {/* Win rate bar */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Win Rate</span>
            <span className="text-sm font-black text-[#1A4D8F] dark:text-blue-400">{winRate}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1A4D8F] to-[#F5C518] rounded-full transition-all duration-700"
              style={{ width: `${winRate}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5">
            {totalWins} win{totalWins !== 1 ? 's' : ''} from {history.length} settled stake{history.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[['active', `Active (${active.length})`], ['history', `History (${history.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === key
                ? 'bg-[#1A4D8F] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-[#1A4D8F] hover:text-[#1A4D8F] dark:hover:text-blue-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">Could not load stakes</p>
            <button onClick={refetch} className="text-xs text-red-500 hover:underline mt-0.5">Try again</button>
          </div>
        </div>
      ) : tab === 'active' ? (
        active.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
            <FiClock className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">No active stakes</p>
            <Link to="/lobby" className="text-[#1A4D8F] dark:text-blue-400 text-sm font-medium hover:underline mt-2 inline-block">
              Browse the Lobby
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {active.map(t => <ActiveStakeCard key={t.id} ticket={t} />)}
          </div>
        )
      ) : (
        <>
          {/* History filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {HISTORY_FILTERS.map(f => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  historyFilter === f
                    ? 'bg-[#1A4D8F] text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
              <FiTrendingUp className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">No history yet</p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Your settled stakes will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map(t => <HistoryCard key={t.id} ticket={t} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
