import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUsers, FiGift, FiCheckCircle, FiClock,
  FiLoader, FiAlertCircle,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const OPTION_COLORS = [
  { bg: 'bg-[#1A4D8F]', light: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-[#1A4D8F] dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-purple-600', light: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  { bg: 'bg-green-500', light: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
];

function AnimatedBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function TimeSince({ dateStr }) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)  return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  return <span>{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>;
}

export default function WorldCupPool() {
  const { fixtureId } = useParams();
  const navigate      = useNavigate();
  const [pool,    setPool]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/worldcup/games/${fixtureId}/pool`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || 'Failed');
        setPool(d.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  // Refresh every 30s while game is open
  useEffect(() => {
    if (!pool || pool.status !== 'open') return;
    const id = setInterval(() => {
      fetch(`${API_BASE}/worldcup/games/${fixtureId}/pool`)
        .then(r => r.json())
        .then(d => { if (d.success) setPool(d.data); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [fixtureId, pool?.status]);

  const prize = pool?.prize_type === 'cash'
    ? `$${pool.prize_usd} cash`
    : pool?.prize_description;

  return (
    <div className="min-h-screen bg-[#0D2B5E]">
      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => navigate(`/worldcup/match/${fixtureId}`)}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to match
        </button>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-24">
            <FiLoader className="w-8 h-8 text-white/30 animate-spin" />
            <p className="text-white/30 text-sm">Loading pool…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <FiAlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {pool && (
          <div className="space-y-5">
            {/* Game header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-[#F5C518] flex items-center justify-center">
                  <FiGift className="w-3 h-3 text-[#1A1A2E]" />
                </div>
                <span className="text-[#F5C518] text-xs font-black uppercase tracking-wider">Free to Play · Entry Pool</span>
                {pool.status === 'open' && (
                  <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 animate-pulse">
                    Live
                  </span>
                )}
                {pool.status === 'closed' && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                    <FiClock className="w-2.5 h-2.5" /> Closed
                  </span>
                )}
                {pool.status === 'settled' && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-300 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                    <FiCheckCircle className="w-2.5 h-2.5" /> Settled
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-white">{pool.home_team} vs {pool.away_team}</h1>
              <p className="text-white/50 text-sm mt-0.5">{pool.question}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FiUsers className="w-4 h-4 text-[#F5C518]" />
                </div>
                <p className="text-2xl font-black text-white">{pool.total_entries}</p>
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Entered</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-[#F5C518]">{pool.winner_count}</p>
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Winner{pool.winner_count !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-lg font-black text-white leading-tight">{prize}</p>
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Prize</p>
              </div>
            </div>

            {/* Option breakdown */}
            {pool.breakdown?.length > 0 && pool.total_entries > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Prediction Breakdown</p>
                <div className="space-y-4">
                  {pool.breakdown.map((opt, i) => {
                    const pct = pool.total_entries > 0
                      ? Math.round((opt.count / pool.total_entries) * 100)
                      : 0;
                    const col = OPTION_COLORS[i % OPTION_COLORS.length];
                    const isCorrect = pool.status === 'settled' && opt.key === pool.correct_option;
                    return (
                      <div key={opt.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {isCorrect && <FiCheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                            <span className={`text-sm font-bold ${isCorrect ? 'text-green-300' : 'text-white'}`}>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${col.text}`}>{pct}%</span>
                            <span className="text-white/30 text-xs">{opt.count}</span>
                          </div>
                        </div>
                        <AnimatedBar pct={pct} color={col.bg} delay={i * 120} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent entrants */}
            {pool.recent?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Recent Entries</p>
                <div className="space-y-2">
                  {pool.recent.map((e, i) => {
                    const optLabel = pool.breakdown?.find(o => o.key === e.option_key)?.label ?? e.option_key;
                    const col = OPTION_COLORS[
                      (pool.breakdown?.findIndex(o => o.key === e.option_key) ?? 0) % OPTION_COLORS.length
                    ];
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-white/60 text-[10px] font-black">{e.username?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                          <span className="text-white/60 text-sm font-mono truncate">{e.username}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.light} ${col.text}`}>
                            {optLabel}
                          </span>
                          <span className="text-white/20 text-[10px]">
                            <TimeSince dateStr={e.entered_at} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pool.total_entries === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <FiUsers className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 font-semibold">No entries yet</p>
                <p className="text-white/20 text-sm mt-1">Be the first to predict!</p>
                <button
                  onClick={() => navigate(`/worldcup/match/${fixtureId}`)}
                  className="mt-4 bg-[#F5C518] text-[#1A1A2E] font-black text-sm px-6 py-2.5 rounded-xl hover:brightness-110 transition-all"
                >
                  Predict Now
                </button>
              </div>
            )}

            {/* CTA — go back to predict */}
            {pool.status === 'open' && pool.total_entries > 0 && (
              <button
                onClick={() => navigate(`/worldcup/match/${fixtureId}`)}
                className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-3.5 rounded-xl hover:brightness-110 transition-all"
              >
                Back to Match — Predict Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
