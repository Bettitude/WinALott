import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiClock, FiGift, FiStar, FiAward, FiZap,
  FiTrendingUp, FiActivity, FiAlertCircle,
} from 'react-icons/fi';
import { useTickets } from '../../hooks/useTickets';
import { matchApi } from '../../api/matchApi';

const TIER_BADGE = {
  silver:   { Icon: FiStar,  cls: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600' },
  gold:     { Icon: FiAward, cls: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700' },
  platinum: { Icon: FiZap,   cls: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700' },
  free:     { Icon: FiGift,  cls: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function maskUsername(name) {
  if (!name || name.length <= 2) return name || 'player';
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 2))}`;
}

// ── Live activity feed for one pool ────────────────────────────────────────
function PoolActivity({ kind, fetchKey }) {
  const [activity, setActivity] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const req = kind === 'free'
      ? matchApi.getFreeGameActivity(fetchKey)
      : matchApi.getMarketActivity(fetchKey);

    req
      .then(res => { if (!cancelled) setActivity(res.data?.data || { entry_count: 0, recent: [] }); })
      .catch(() => { if (!cancelled) setActivity({ entry_count: 0, recent: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [kind, fetchKey]);

  if (loading) {
    return <div className="h-16 bg-gray-50 dark:bg-slate-700/40 rounded-xl animate-pulse mt-3" />;
  }

  const recent = activity?.recent || [];

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">
          <FiUsers className="w-3 h-3" /> {activity?.entry_count ?? 0} in this pool
        </span>
        {recent.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-[11px] text-gray-400 dark:text-slate-500">Be the first to see activity here.</p>
      ) : (
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {recent.slice(0, 6).map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-slate-400 truncate">
                <strong className="text-[#1A1A2E] dark:text-white font-bold">{maskUsername(r.username)}</strong>
                {' '}entered{r.prediction || r.option_key ? <> · <span className="text-gray-400 dark:text-slate-500">{r.prediction || r.option_key}</span></> : null}
              </span>
              <span className="text-gray-300 dark:text-slate-600 shrink-0 ml-2">{timeAgo(r.entered_at || r.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── One pool card (ticket market or free game) ─────────────────────────────
function PoolCard({ pool }) {
  const tier = TIER_BADGE[pool.tier] || TIER_BADGE.silver;
  const TierIcon = tier.Icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${tier.cls}`}>
          <TierIcon className="w-2.5 h-2.5" />
          {pool.tier.charAt(0).toUpperCase() + pool.tier.slice(1)}
        </span>
        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
          <FiClock className="w-2.5 h-2.5" /> Open
        </span>
      </div>

      <div className="px-4 pt-2 pb-4">
        <p className="text-sm font-black text-[#1A1A2E] dark:text-white truncate">{pool.match}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{pool.market}</p>

        <div className="mt-3 flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Your Pick</p>
            <p className="text-sm font-black text-[#1A4D8F] dark:text-blue-300">{pool.myPick}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{pool.entryFee > 0 ? 'Entry' : 'Prize'}</p>
            <p className="text-sm font-black text-[#1A1A2E] dark:text-white">
              {pool.entryFee > 0 ? `$${pool.entryFee.toFixed(2)}` : pool.prizeLabel}
            </p>
          </div>
        </div>

        <PoolActivity kind={pool.type} fetchKey={pool.activityKey} />
      </div>
    </div>
  );
}

export default function Pools() {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets({ status: 'active', limit: 100 });
  const [freeEntries, setFreeEntries] = useState([]);
  const [freeLoading, setFreeLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    matchApi.getMyFreeEntries()
      .then(res => { if (!cancelled) setFreeEntries(res.data?.data?.entries || []); })
      .catch(() => { if (!cancelled) setFreeEntries([]); })
      .finally(() => { if (!cancelled) setFreeLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const ticketPools = useMemo(() => tickets
    .filter(t => t.status === 'pending')
    .map(t => ({
      id:          t.id,
      type:        'ticket',
      activityKey: t._raw?.market_id,
      tier:        t._raw?.tier || 'silver',
      match:       t.match,
      market:      t.market,
      myPick:      t.myPick,
      entryFee:    t.entryFee,
      prizeLabel:  '',
    })), [tickets]);

  const freePools = useMemo(() => freeEntries
    .filter(e => e.status === 'open')
    .map(e => ({
      id:          e.id,
      type:        'free',
      activityKey: e.fixture_id,
      tier:        'free',
      match:       `${e.home_team || ''} vs ${e.away_team || ''}`,
      market:      e.question,
      myPick:      e.my_pick,
      entryFee:    0,
      prizeLabel:  e.prize_type === 'cash' ? `$${e.prize_usd} cash` : (e.prize_description || 'Prize'),
    })), [freeEntries]);

  const pools   = [...freePools, ...ticketPools];
  const loading = ticketsLoading || freeLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My Pools</h1>
          <p className="text-gray-400 dark:text-slate-500 text-sm">Live pools you've entered — see who else is in</p>
        </div>
        <div className="flex gap-2">
          <Link to="/worldcup" className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#1A4D8F] dark:text-blue-400 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-[#1A4D8F] transition-colors">
            World Cup Games
          </Link>
          <Link to="/lobby" className="bg-[#1A4D8F] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
            + Enter New Match
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <FiTrendingUp className="w-5 h-5 mb-1 text-[#1A4D8F] dark:text-blue-400" />
          <p className="text-xl font-black tabular-nums text-[#1A4D8F] dark:text-blue-400">{pools.length}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Active Pools</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <FiGift className="w-5 h-5 mb-1 text-green-500" />
          <p className="text-xl font-black tabular-nums text-green-600 dark:text-green-400">{freePools.length}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Free Games</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <FiActivity className="w-5 h-5 mb-1 text-[#F5C518]" />
          <p className="text-xl font-black tabular-nums text-[#1A1A2E] dark:text-white">{ticketPools.length}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Paid Pools</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : ticketsError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Could not load pools</p>
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
          <FiUsers className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">You're not in any pools yet</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <Link to="/worldcup" className="text-[#1A4D8F] dark:text-blue-400 text-sm font-medium hover:underline">Free World Cup Games</Link>
            <span className="text-gray-300">·</span>
            <Link to="/lobby" className="text-[#1A4D8F] dark:text-blue-400 text-sm font-medium hover:underline">Browse the Lobby</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pools.map(p => <PoolCard key={`${p.type}-${p.id}`} pool={p} />)}
        </div>
      )}
    </div>
  );
}
