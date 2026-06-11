import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiUsers, FiActivity,
  FiGrid, FiBarChart2, FiGift, FiCheckCircle, FiClock,
  FiLogIn, FiZap, FiChevronRight, FiLock, FiDollarSign,
} from 'react-icons/fi';
import { liveApi } from '../api/liveApi';
import { useAuth } from '../hooks/useAuth';
import { requireAuth } from '../utils/requireAuth';
import { OfficialLineup } from '../components/OfficialLineup';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Mock data (dev fallback) ──────────────────────────────────────────────────
function mockLineup(teamName, seed) {
  const formations = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];
  const namePools = [
    ['Martínez','Silva','Costa','García','López','Fernández','Rodríguez','González','Pérez','Sánchez','Ramirez'],
    ['Smith','Jones','Williams','Brown','Taylor','Davies','Wilson','Evans','Thomas','Roberts','Johnson'],
    ['Müller','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Schäfer','Koch'],
    ['Dupont','Martin','Bernard','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon'],
  ];
  const pool = namePools[seed % namePools.length];
  const players = Array.from({ length: 11 }, (_, i) => ({
    number: i + 1,
    name: pool[i % pool.length] + (i > 0 ? ` ${String.fromCharCode(65 + ((i * seed) % 26))}.` : ''),
    pos: i === 0 ? 'G' : i <= 4 ? 'D' : i <= 7 ? 'M' : 'F',
    rating: (6 + (((i + seed) * 13) % 30) / 10).toFixed(1),
  }));
  return { team: { name: teamName }, formation: formations[seed % formations.length], startXI: players };
}

function mockStats() {
  return [
    { type: 'Ball Possession', home: '58%', away: '42%' },
    { type: 'Total Shots',     home: '14',  away: '8'   },
    { type: 'Shots on Goal',   home: '6',   away: '3'   },
    { type: 'Corners',         home: '7',   away: '4'   },
    { type: 'Fouls',           home: '11',  away: '14'  },
    { type: 'Yellow Cards',    home: '1',   away: '2'   },
    { type: 'Passes',          home: '542', away: '398' },
    { type: 'Pass Accuracy',   home: '87%', away: '81%' },
    { type: 'Offsides',        home: '3',   away: '1'   },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isLive     = s => ['1H','HT','2H','ET','BT','P','INT'].includes(s);
const isFinished = s => ['FT','AET','PEN'].includes(s);

function parseStatVal(v) {
  if (!v) return 0;
  const s = String(v);
  return s.endsWith('%') ? parseFloat(s) : (parseFloat(s) || 0);
}

function prizeBadge(game) {
  if (!game) return null;
  return game.prize_type === 'merch'
    ? { label: game.prize_description, isPurple: true }
    : { label: `$${game.prize_usd} cash`, isPurple: false };
}

// ── Stat bar ──────────────────────────────────────────────────────────────────
function StatBar({ stat }) {
  const hv = parseStatVal(stat.home), av = parseStatVal(stat.away);
  const total = hv + av || 1;
  const hPct = Math.round((hv / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-black text-white">{stat.home}</span>
        <span className="text-white/40 text-[11px] font-medium">{stat.type}</span>
        <span className="font-black text-white">{stat.away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        <div className="bg-[#1A4D8F] rounded-l-full" style={{ width: `${hPct}%` }} />
        <div className="bg-[#7C3AED] rounded-r-full" style={{ width: `${100-hPct}%` }} />
      </div>
    </div>
  );
}

// ── Prediction panel ──────────────────────────────────────────────────────────
function PredictionPanel({ fixtureId, game, isAuthenticated }) {
  const navigate = useNavigate();
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const badge   = prizeBadge(game);
  const settled = game.status === 'settled';
  const closed  = game.status === 'closed';

  const handleSubmit = async () => {
    if (!requireAuth(navigate, isAuthenticated)) return;
    if (!selected) return;
    setLoading(true); setError(null);
    const token = localStorage.getItem('winalott_token');
    try {
      const res  = await fetch(`${API_BASE}/worldcup/games/${fixtureId}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ option_key: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubmitted(true);
    } catch (err) {
      if (err.message.includes('fetch')) { setSubmitted(true); return; }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (settled) {
    const won = game.options?.find(o => o.key === game.correct_option);
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
        <FiCheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-black text-sm">Draw Complete</p>
          <p className="text-white/40 text-xs mt-0.5">
            Correct answer: <span className="text-white font-bold">{won?.label || '—'}</span>
            {' · '}{game.winner_count} winner{game.winner_count !== 1 ? 's' : ''}
            {' · '}<span className={badge?.isPurple ? 'text-purple-300' : 'text-[#F5C518]'}>{badge?.label}</span> each
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
        <FiCheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-green-300 font-black text-sm">You're in the draw!</p>
          <p className="text-white/40 text-xs mt-0.5">
            If your pick is correct you'll enter the draw for{' '}
            <span className={badge?.isPurple ? 'text-purple-300' : 'text-[#F5C518]'}>{badge?.label}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-2 text-orange-300 text-sm">
        <FiClock className="w-4 h-4 shrink-0" />
        Predictions closed · awaiting result · {game.entry_count ?? 0} entered
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#F5C518]/10 to-[#F5C518]/5 border border-[#F5C518]/30 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#F5C518] flex items-center justify-center">
            <FiGift className="w-3.5 h-3.5 text-[#1A1A2E]" />
          </div>
          <div>
            <p className="text-[#F5C518] font-black text-sm uppercase tracking-wider">Free to Play</p>
            <p className="text-white/40 text-[11px]">Win {badge?.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs">{game.entry_count ?? 0} entered</p>
          <p className="text-white/30 text-[10px]">{game.winner_count} winner{game.winner_count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Question */}
      <p className="text-white font-bold text-sm sm:text-base">{game.question}</p>

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {game.options.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              selected === opt.key
                ? 'bg-[#F5C518] text-[#1A1A2E] border-[#F5C518] shadow-[0_0_20px_rgba(245,197,24,0.3)]'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* CTA */}
      {!isAuthenticated ? (
        <button
          onClick={() => requireAuth(navigate, false)}
          className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-bold py-3 rounded-xl hover:bg-white/15 transition-colors"
        >
          <FiLogIn className="w-4 h-4" /> Log in to predict
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className={`w-full flex items-center justify-center gap-2 font-black py-3.5 rounded-xl text-sm transition-all ${
            selected
              ? 'bg-[#F5C518] text-[#1A1A2E] hover:brightness-110 shadow-[0_4px_24px_rgba(245,197,24,0.35)] active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" /> Submitting…</>
          ) : selected ? (
            <><FiZap className="w-4 h-4" /> Predict Now — {game.options.find(o => o.key === selected)?.label}</>
          ) : (
            'Select an option above'
          )}
        </button>
      )}
    </div>
  );
}

// ── Sidebar match card ────────────────────────────────────────────────────────
function SidebarCard({ item, currentId, onClick }) {
  const { teams, goals, freeGame } = item;
  const s = item.fixture.status;
  const live = isLive(s.short), fin = isFinished(s.short);
  const isCurrent = String(item.fixture.id) === String(currentId);
  const d = new Date(item.fixture.date);
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false });
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const badge = freeGame ? prizeBadge(freeGame) : null;

  return (
    <button
      onClick={() => !isCurrent && onClick(item)}
      className={`w-full text-left rounded-xl p-3 border transition-all ${
        isCurrent
          ? 'border-[#F5C518]/40 bg-[#F5C518]/5 cursor-default'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer'
      }`}
    >
      {/* Status row */}
      <div className="flex items-center justify-between mb-2">
        {live ? (
          <span className="flex items-center gap-1 text-[10px] font-black text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            LIVE {s.elapsed ? `${s.elapsed}'` : ''}
          </span>
        ) : fin ? (
          <span className="text-[10px] font-bold text-white/30">FT</span>
        ) : (
          <span className="text-[10px] font-semibold text-white/40">{dateStr} · {timeStr}</span>
        )}
        {isCurrent && <span className="text-[9px] font-black text-[#F5C518] uppercase">Viewing</span>}
        {badge && !isCurrent && (
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${badge.isPurple ? 'bg-purple-500/20 text-purple-300' : 'bg-[#F5C518]/20 text-[#F5C518]'}`}>
            FREE
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <img src={teams.home.logo} alt="" className="w-5 h-5 object-contain shrink-0" onError={e => { e.target.style.display='none'; }} />
          <span className="text-white text-xs font-semibold truncate">{teams.home.name}</span>
        </div>
        {(live || fin) ? (
          <span className="text-white font-black text-sm tabular-nums shrink-0">{goals.home ?? 0}–{goals.away ?? 0}</span>
        ) : (
          <span className="text-white/30 text-xs font-bold shrink-0">vs</span>
        )}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="text-white text-xs font-semibold truncate text-right">{teams.away.name}</span>
          <img src={teams.away.logo} alt="" className="w-5 h-5 object-contain shrink-0" onError={e => { e.target.style.display='none'; }} />
        </div>
      </div>

      {/* Prize label */}
      {badge && (
        <p className={`text-[10px] font-semibold mt-1.5 ${badge.isPurple ? 'text-purple-300/70' : 'text-[#F5C518]/70'}`}>
          Win {badge.label}
        </p>
      )}
    </button>
  );
}

// ── Ad slot ───────────────────────────────────────────────────────────────────
function AdSlot({ label = 'Advertisement' }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 flex flex-col items-center justify-center gap-1 min-h-[80px]">
      <span className="text-white/15 text-[9px] font-black uppercase tracking-widest">{label}</span>
      <div className="w-8 h-px bg-white/10" />
      <span className="text-white/10 text-[10px]">Your ad here</span>
    </div>
  );
}

// ── Stakes section ────────────────────────────────────────────────────────────
const TIER_STYLES = {
  silver:   { bg: 'bg-gray-400/20',   border: 'border-gray-400/40',   text: 'text-gray-300',   label: 'Silver',   order: 0 },
  gold:     { bg: 'bg-[#F5C518]/20',  border: 'border-[#F5C518]/40',  text: 'text-[#F5C518]',  label: 'Gold',     order: 1 },
  platinum: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300', label: 'Platinum', order: 2 },
};
const TIER_ORDER = ['silver', 'gold', 'platinum'];

const MARKET_TYPE_LABELS = {
  match_winner:       'Match Winner',
  both_teams_score:   'Both Teams to Score',
  over_under:         'Over / Under Goals',
  first_goalscorer:   'First Goalscorer',
  correct_score:      'Correct Score',
  half_time:          'Half Time Result',
  double_chance:      'Double Chance',
  asian_handicap:     'Asian Handicap',
};

function getMarketDisplay(market) {
  if (market.prediction_type === 'market_type') {
    return {
      question: MARKET_TYPE_LABELS[market.market_type] || market.market_type,
      options: (market.auto_options || []).map(o =>
        typeof o === 'string' ? { key: o, label: o } : o
      ),
    };
  }
  return {
    question: market.admin_pick || 'Make your prediction',
    options: [
      { key: 'yes', label: 'YES — Agree' },
      { key: 'no',  label: 'NO — Disagree' },
    ],
  };
}

// Group markets by their question and deduplicate tiers within each group.
// If admin created 10 markets for the same question (many duplicate tiers),
// this collapses them to 1 card with up to 3 unique tier buttons.
function groupMarkets(markets) {
  const map = new Map();
  markets.forEach(market => {
    const { question } = getMarketDisplay(market);
    const key = `${market.prediction_type}__${question}`;
    if (!map.has(key)) map.set(key, { question, markets: [] });
    const existing = map.get(key);
    // Only keep one market per tier (first one wins)
    const hasTier = existing.markets.some(m => m.tier === market.tier);
    if (!hasTier) existing.markets.push(market);
  });
  return Array.from(map.values());
}

// A single market group card: shows the question once, lets user pick
// their prediction AND their tier in one flow.
function MarketGroupCard({ group, isAuthenticated }) {
  const navigate = useNavigate();

  // Build tierMap: tier → market (deduplicated, ordered)
  const tierMap = {};
  group.markets.forEach(m => { tierMap[m.tier] = m; });
  const availableTiers = TIER_ORDER.filter(t => tierMap[t]);

  const { question, options } = getMarketDisplay(group.markets[0]);

  const [prediction,  setPrediction]  = useState(null);
  const [selectedTier, setSelectedTier] = useState(availableTiers.length === 1 ? availableTiers[0] : null);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);

  const market = selectedTier ? tierMap[selectedTier] : null;
  const entryFee = market ? market.entry_fee / 100 : null;
  const prizePool = market?.prize_pool ? market.prize_pool / 100 : 0;
  const potentialWin = market && prizePool > 0 ? (prizePool / (market.winner_count || 1)) : 0;
  const totalEntries = market?.total_entries ?? 0;

  const handleEnter = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (!prediction || !market) return;
    setSubmitting(true); setError(null);
    try {
      const token = localStorage.getItem('winalott_token') || sessionStorage.getItem('winalott_token');
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ market_id: market.id, match_id: market.match_id, user_prediction: prediction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const ts = TIER_STYLES[selectedTier] || TIER_STYLES.silver;
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-start gap-3">
        <FiCheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-green-300 font-black text-sm">Stake confirmed!</p>
          <p className="text-white/50 text-xs mt-0.5">
            {question} · {ts.label} · ${entryFee?.toFixed(2)} entry
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 space-y-4">

      {/* Question */}
      <p className="text-white font-bold text-sm leading-snug">{question}</p>

      {/* Step 1 — Prediction */}
      <div>
        <p className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2">Your Prediction</p>
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => setPrediction(opt.key)}
              className={`flex-1 min-w-[80px] px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                prediction === opt.key
                  ? 'bg-[#F5C518] text-[#1A1A2E] border-[#F5C518] shadow-[0_0_16px_rgba(245,197,24,0.25)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Tier (only show if more than one tier available) */}
      {availableTiers.length > 1 && (
        <div>
          <p className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2">Select Tier</p>
          <div className="flex gap-2">
            {availableTiers.map(tier => {
              const ts = TIER_STYLES[tier];
              const m  = tierMap[tier];
              const isActive = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`flex-1 py-2.5 px-2 rounded-xl border-2 transition-all text-center ${
                    isActive
                      ? `${ts.bg} ${ts.border} ${ts.text}`
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                  }`}
                >
                  <p className={`text-xs font-black ${isActive ? ts.text : ''}`}>{ts.label}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${isActive ? ts.text : 'text-white/30'}`}>
                    ${(m.entry_fee / 100).toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats row: pool + entries */}
      {market && (
        <div className="flex items-center justify-between text-[11px] text-white/30 border-t border-white/5 pt-3">
          <span className="flex items-center gap-1">
            <FiUsers className="w-3 h-3" /> {totalEntries} staked
          </span>
          {prizePool > 0 ? (
            <span className="text-green-400 font-semibold">
              Pool ${prizePool.toFixed(2)} · Win up to ${potentialWin.toFixed(2)}
            </span>
          ) : (
            <span>${entryFee?.toFixed(2)} entry</span>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-[11px]">{error}</p>}

      {/* CTA */}
      {!isAuthenticated ? (
        <button
          onClick={() => navigate('/auth/login')}
          className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white/15 transition-colors"
        >
          <FiLogIn className="w-3.5 h-3.5" /> Log in to stake
        </button>
      ) : (
        <button
          disabled={!prediction || !market || submitting}
          onClick={handleEnter}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all active:scale-[0.98] ${
            prediction && market
              ? 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E] shadow-lg'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
          ) : prediction && market ? (
            `Stake $${entryFee?.toFixed(2)}${availableTiers.length > 1 ? ` · ${TIER_STYLES[selectedTier]?.label}` : ''}`
          ) : !prediction ? (
            'Pick your prediction first'
          ) : (
            'Select a tier'
          )}
        </button>
      )}
    </div>
  );
}

function StakesSection({ markets, loading, isAuthenticated }) {
  const openMarkets = markets.filter(m => m.status === 'open');

  if (loading) {
    return (
      <div className="border border-white/10 rounded-2xl p-5 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <span className="text-white/30 text-xs">Loading stakes…</span>
      </div>
    );
  }

  if (openMarkets.length === 0) {
    return (
      <div className="border border-dashed border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <FiLock className="w-4 h-4 text-white/30" />
          </div>
          <div>
            <p className="text-white/60 font-black text-sm uppercase tracking-wide">Stakes</p>
            <p className="text-white/25 text-[11px]">No active stakes for this match yet</p>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none space-y-2.5">
          <p className="text-white text-xs font-bold">Match Winner</p>
          <div className="flex gap-1.5">
            {['Home Win', 'Draw', 'Away Win'].map(opt => (
              <div key={opt} className="flex-1 px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-center">
                <p className="text-white text-[10px] font-bold">{opt}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {['Silver', 'Gold', 'Platinum'].map(t => (
              <div key={t} className="flex-1 px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-center">
                <p className="text-white text-[10px] font-bold">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/15 text-[10px] text-center mt-3 border-t border-white/5 pt-3">
          Admin will open stakes before kick-off
        </p>
      </div>
    );
  }

  // Collapse duplicates: group by question, one tier per group
  const groups = groupMarkets(openMarkets);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FiZap className="w-4 h-4 text-[#F5C518]" />
        <h3 className="text-white font-black text-sm uppercase tracking-wide">Stakes</h3>
        <span className="bg-green-500/20 text-green-300 text-[10px] font-black px-2 py-0.5 rounded-full">
          {groups.length} market{groups.length !== 1 ? 's' : ''} open
        </span>
      </div>
      {groups.map((group, i) => (
        <MarketGroupCard key={i} group={group} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview', label: 'Overview', Icon: FiActivity  },
  { key: 'lineups',  label: 'Lineups',  Icon: FiGrid      },
  { key: 'stats',    label: 'Stats',    Icon: FiBarChart2 },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorldCupMatchDetail() {
  const { fixtureId }       = useParams();
  const { state }           = useLocation();
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tab,           setTab]           = useState('overview');
  const [fixture,       setFixture]       = useState(state?.item || null);
  const [allFixtures,   setAllFixtures]   = useState([]);
  const [lineups,       setLineups]       = useState(null);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(!state?.item);
  const [sideFilter,    setSideFilter]    = useState('all');
  const [markets,       setMarkets]       = useState([]);
  const [marketsLoading,setMarketsLoading]= useState(true);

  // Fetch all fixtures (for sidebar + current if not in state)
  useEffect(() => {
    fetch(`${API_BASE}/worldcup/fixtures`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length) {
          setAllFixtures(d.data);
          const found = d.data.find(f => String(f.fixture.id) === String(fixtureId));
          if (found) setFixture(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fixtureId]);

  // Fetch lineups + stats from API-Football
  useEffect(() => {
    setLineups(null); setStats(null);
    Promise.allSettled([
      liveApi.getMatchLineups(fixtureId),
      liveApi.getMatchStats(fixtureId),
    ]).then(([linRes, stRes]) => {
      const lin = linRes.value?.data?.data;
      const st  = stRes.value?.data?.data;
      if (lin?.length) setLineups(lin);
      if (st?.length)  setStats(st[0]?.statistics || st);
    }).catch(() => {});
  }, [fixtureId]);

  // Fetch markets from backend for this fixture
  useEffect(() => {
    setMarketsLoading(true);
    setMarkets([]);
    fetch(`${API_BASE}/markets/fixture/${fixtureId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMarkets(d.data?.markets || []); })
      .catch(() => {})
      .finally(() => setMarketsLoading(false));
  }, [fixtureId]);

  // Reset tab when fixture changes
  useEffect(() => { setTab('overview'); }, [fixtureId]);

  if (loading || !fixture) {
    return (
      <div className="min-h-screen bg-[#0D2B5E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin" />
      </div>
    );
  }

  const { teams, goals, freeGame } = fixture;
  const fStatus  = fixture.fixture.status;
  const live     = isLive(fStatus.short);
  const finished = isFinished(fStatus.short);

  const homeLineup = lineups?.[0] || mockLineup(teams.home.name, teams.home.id || 1);
  const awayLineup = lineups?.[1] || mockLineup(teams.away.name, (teams.away.id || 2) + 1);
  const statRows   = stats || mockStats();

  const d       = new Date(fixture.fixture.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';

  const otherFixtures = allFixtures.filter(f => String(f.fixture.id) !== String(fixtureId));

  const SIDE_FILTERS = [
    { key: 'all',      label: 'All'      },
    { key: 'live',     label: 'Live'     },
    { key: 'free',     label: 'Free'     },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'finished', label: 'FT'       },
  ];

  const filteredSidebar = allFixtures.filter(f => {
    const s = f.fixture.status.short;
    if (sideFilter === 'live')     return isLive(s);
    if (sideFilter === 'finished') return isFinished(s);
    if (sideFilter === 'upcoming') return !isLive(s) && !isFinished(s);
    if (sideFilter === 'free')     return !!f.freeGame;
    return true;
  });

  const goToGame = (item) => {
    navigate(`/worldcup/match/${item.fixture.id}`, { state: { item } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D2B5E]">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/worldcup')}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> All World Cup Games
        </button>

        <div className="flex gap-6 items-start">

          {/* ── LEFT: main content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Free game prediction — shown FIRST, before match stats */}
            {freeGame && (
              <PredictionPanel
                fixtureId={String(fixture.fixture.id)}
                game={freeGame}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Match header card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1f45]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#1A4D8F]/20 blur-3xl" />
              </div>
              <div className="relative px-4 sm:px-6 py-6">
                {/* Round + status */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[11px] text-white/30 font-semibold uppercase tracking-widest">
                    {fixture.league?.round || 'Group Stage'}
                  </span>
                  {live && (
                    <span className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      LIVE {fStatus.elapsed ? `${fStatus.elapsed}'` : ''}
                    </span>
                  )}
                  {finished && (
                    <span className="text-[10px] text-white/30 font-bold bg-white/5 px-2 py-0.5 rounded-full">FULL TIME</span>
                  )}
                </div>

                {/* Teams + score */}
                <div className="flex items-center gap-3 sm:gap-6">
                  <button
                    onClick={() => navigate(`/team/${teams.home.id}`, { state: {
                      teamId: teams.home.id, teamName: teams.home.name, teamLogo: teams.home.logo,
                      league: fixture.league?.name || 'FIFA World Cup 2026',
                      fromMatch: { title: `${teams.home.name} vs ${teams.away.name}`, path: `/worldcup/match/${fixture.fixture.id}` },
                      opponent: { id: teams.away.id, name: teams.away.name, logo: teams.away.logo },
                    }})}
                    className="flex flex-col items-center flex-1 gap-2 rounded-xl hover:bg-white/5 py-3 transition-colors"
                  >
                    <img src={teams.home.logo} alt={teams.home.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" onError={e => { e.target.style.display='none'; }} />
                    <span className="text-white font-black text-sm sm:text-base text-center leading-tight">{teams.home.name}</span>
                    <span className="text-white/30 text-[10px]">Home</span>
                  </button>

                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {(live || finished) ? (
                      <div className="text-white font-black text-3xl sm:text-5xl tabular-nums">
                        {goals.home ?? 0}<span className="text-white/20 mx-1.5 sm:mx-3">–</span>{goals.away ?? 0}
                      </div>
                    ) : (
                      <>
                        <span className="text-white/20 font-black text-2xl sm:text-3xl">VS</span>
                        <span className="text-[#F5C518] text-xs font-bold">{timeStr}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/team/${teams.away.id}`, { state: {
                      teamId: teams.away.id, teamName: teams.away.name, teamLogo: teams.away.logo,
                      league: fixture.league?.name || 'FIFA World Cup 2026',
                      fromMatch: { title: `${teams.home.name} vs ${teams.away.name}`, path: `/worldcup/match/${fixture.fixture.id}` },
                      opponent: { id: teams.home.id, name: teams.home.name, logo: teams.home.logo },
                    }})}
                    className="flex flex-col items-center flex-1 gap-2 rounded-xl hover:bg-white/5 py-3 transition-colors"
                  >
                    <img src={teams.away.logo} alt={teams.away.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" onError={e => { e.target.style.display='none'; }} />
                    <span className="text-white font-black text-sm sm:text-base text-center leading-tight">{teams.away.name}</span>
                    <span className="text-white/30 text-[10px]">Away</span>
                  </button>
                </div>

                {/* Venue */}
                <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                  {fixture.fixture.venue?.name && (
                    <span className="flex items-center gap-1.5 text-white/30 text-xs">
                      <FiMapPin className="w-3 h-3" /> {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-white/30 text-xs">
                    <FiCalendar className="w-3 h-3" /> {dateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Stakes — mobile only (desktop version lives in the sidebar) */}
            <div className="lg:hidden">
              <StakesSection markets={markets} loading={marketsLoading} isAuthenticated={isAuthenticated} />
            </div>

            {/* Tabs */}
            <div>
              <div className="flex border-b border-white/10 mb-5">
                {TABS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                      tab === key ? 'border-[#F5C518] text-[#F5C518]' : 'border-transparent text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Possession', find: 'possession' },
                      { label: 'Shots',      find: 'total shot' },
                      { label: 'Corners',    find: 'corner'     },
                    ].map(({ label, find }) => {
                      const row = statRows.find(s => s.type?.toLowerCase().includes(find));
                      return (
                        <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-black text-base">{row?.home || '—'}</span>
                            <span className="text-white font-black text-base">{row?.away || '—'}</span>
                          </div>
                          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-white/40 text-xs font-semibold mb-2">
                      <span>{teams.home.name} ({homeLineup.formation})</span>
                      <span>({awayLineup.formation}) {teams.away.name}</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {[['G','GK','yellow'],['D','DEF','blue'],['M','MID','green'],['F','FWD','red']].map(([pos,label,color]) => (
                        <div key={pos} className="flex items-center gap-1.5 text-[11px] text-white/40">
                          <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lineups */}
              {tab === 'lineups' && (
                <OfficialLineup
                  home={{ ...homeLineup, team: teams.home }}
                  away={{ ...awayLineup, team: teams.away }}
                  venue={fixture.fixture.venue?.name}
                  date={new Date(fixture.fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                />
              )}

              {/* Stats */}
              {tab === 'stats' && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img src={teams.home.logo} alt="" className="w-5 h-5 object-contain" onError={e=>{e.target.style.display='none';}} />
                      <span className="text-white font-black text-xs">{teams.home.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-xs">{teams.away.name}</span>
                      <img src={teams.away.logo} alt="" className="w-5 h-5 object-contain" onError={e=>{e.target.style.display='none';}} />
                    </div>
                  </div>
                  {statRows.map((s, i) => (
                    <StatBar key={i} stat={{ type: s.type, home: s.home ?? s.value, away: s.away ?? '' }} />
                  ))}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <div className="w-3 h-1.5 rounded-full bg-[#1A4D8F]" />{teams.home.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <div className="w-3 h-1.5 rounded-full bg-purple-600" />{teams.away.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: sidebar ─────────────────────────────────────────────── */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="sticky top-6 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto pr-1 scrollbar-hide">

              {/* Stakes — desktop sidebar */}
              <StakesSection markets={markets} loading={marketsLoading} isAuthenticated={isAuthenticated} />

              {/* Top ad */}
              <AdSlot label="Sponsored" />

              {/* Header + filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-black text-sm">WC 2026 Games</h3>
                  <button
                    onClick={() => navigate('/worldcup')}
                    className="text-[#F5C518] text-xs font-semibold flex items-center gap-1 hover:underline"
                  >
                    Full list <FiChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {SIDE_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setSideFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                        sideFilter === f.key
                          ? 'bg-[#F5C518] text-[#1A1A2E] border-[#F5C518]'
                          : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {f.label}
                      {f.key === 'live' && allFixtures.some(x => isLive(x.fixture.status.short)) && (
                        <span className="ml-1 w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match list */}
              {allFixtures.length === 0 ? (
                <p className="text-white/30 text-xs py-4 text-center">Loading…</p>
              ) : filteredSidebar.length === 0 ? (
                <p className="text-white/20 text-xs py-4 text-center">No matches in this filter</p>
              ) : (
                <div className="space-y-2">
                  {filteredSidebar.map((item, idx) => (
                    <div key={item.fixture.id}>
                      <SidebarCard item={item} currentId={fixtureId} onClick={goToGame} />
                      {(idx + 1) % 5 === 0 && <div className="pt-2"><AdSlot /></div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom ad */}
              <AdSlot label="Advertisement" />
            </div>
          </div>
        </div>

        {/* ── Mobile: other games strip ────────────────────────────────────── */}
        {allFixtures.length > 0 && (
          <div className="lg:hidden mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-black text-sm">WC 2026 Games</h3>
              <button
                onClick={() => navigate('/worldcup')}
                className="text-[#F5C518] text-xs font-semibold flex items-center gap-1"
              >
                See all <FiChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Mobile filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-3">
              {SIDE_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setSideFilter(f.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    sideFilter === f.key
                      ? 'bg-[#F5C518] text-[#1A1A2E] border-[#F5C518]'
                      : 'border-white/10 text-white/40 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {filteredSidebar.filter(f => String(f.fixture.id) !== String(fixtureId)).map(item => {
                const { teams: t, goals: g, freeGame: fg } = item;
                const s = item.fixture.status;
                const lv = isLive(s.short), fn = isFinished(s.short);
                const bd = fg ? prizeBadge(fg) : null;
                return (
                  <button
                    key={item.fixture.id}
                    onClick={() => goToGame(item)}
                    className="shrink-0 snap-start w-48 bg-white/5 border border-white/10 rounded-xl p-3 text-left hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                  >
                    {lv ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-400 mb-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        LIVE {s.elapsed ? `${s.elapsed}'` : ''}
                      </span>
                    ) : (
                      <span className="block text-[10px] text-white/30 font-semibold mb-2">
                        {new Date(item.fixture.date).toLocaleDateString('en-US', { month:'short', day:'numeric', timeZone:'UTC' })}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={t.home.logo} alt="" className="w-6 h-6 object-contain shrink-0" onError={e=>{e.target.style.display='none';}} />
                      <span className="text-white font-bold text-xs truncate flex-1">{t.home.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={t.away.logo} alt="" className="w-6 h-6 object-contain shrink-0" onError={e=>{e.target.style.display='none';}} />
                      <span className="text-white font-bold text-xs truncate flex-1">{t.away.name}</span>
                      {(lv || fn) && <span className="text-white font-black text-xs tabular-nums shrink-0">{g.home ?? 0}–{g.away ?? 0}</span>}
                    </div>
                    {bd && (
                      <p className={`text-[10px] font-semibold mt-2 ${bd.isPurple ? 'text-purple-300/70' : 'text-[#F5C518]/70'}`}>
                        Win {bd.label}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
