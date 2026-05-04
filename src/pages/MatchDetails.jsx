import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiClock, FiMapPin, FiUsers, FiChevronRight, FiZap, FiStar, FiAward,
  FiCheckCircle, FiShoppingCart, FiTrendingUp, FiBarChart2, FiList,
  FiActivity, FiGrid, FiWifi, FiTv, FiInfo, FiLock,
  FiAlertCircle, FiSearch,
} from 'react-icons/fi';
import { mockMatches, matchTiers } from '../data/mockData';
import { getMatchDetail } from '../data/matchDetailData';
import { useCart } from '../hooks/useCart';
import TeamAvatar from '../components/ui/TeamAvatar';

// ── Constants ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',   label: 'Overview',  Icon: FiActivity },
  { key: 'lineups',    label: 'Lineups',   Icon: FiGrid },
  { key: 'stats',      label: 'Stats',     Icon: FiBarChart2 },
  { key: 'standings',  label: 'Standings', Icon: FiList },
  { key: 'h2h',        label: 'H2H',       Icon: FiWifi },
  { key: 'odds',       label: 'Odds',      Icon: FiTrendingUp },
  { key: 'media',      label: 'Media',     Icon: FiTv },
];

const TIER_CFG = {
  silver:   { label: 'Silver',   Icon: FiStar,  badge: 'bg-gray-100 text-gray-700 border border-gray-300',      priceColor: 'text-gray-600',   btn: 'bg-gray-500 hover:bg-gray-600' },
  gold:     { label: 'Gold',     Icon: FiAward, badge: 'bg-yellow-50 text-yellow-800 border border-yellow-300', priceColor: 'text-yellow-600',  btn: 'bg-[#1A4D8F] hover:bg-[#0D2B5E]' },
  platinum: { label: 'Platinum', Icon: FiZap,   badge: 'bg-purple-50 text-purple-700 border border-purple-300', priceColor: 'text-purple-600',  btn: 'bg-purple-600 hover:bg-purple-700' },
};

const OTHER_FILTERS = ['All', 'Live', 'Today', 'Tomorrow'];

// ── Small helpers ─────────────────────────────────────────────────────────
function FormPill({ result }) {
  const cls = result === 'W' ? 'bg-green-500 text-white'
    : result === 'D' ? 'bg-yellow-400 text-white'
    : 'bg-red-500 text-white';
  return <span className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center ${cls}`}>{result}</span>;
}

function StatRow({ label, homeVal, awayVal }) {
  const total = (homeVal + awayVal) || 1;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold text-[#1A4D8F]">{homeVal}</span>
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-red-500">{awayVal}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div style={{ width: `${(homeVal / total) * 100}%` }} className="bg-[#1A4D8F] transition-all" />
        <div className="flex-1 bg-red-400" />
      </div>
    </div>
  );
}

function EventDot({ type }) {
  if (type === 'goal')   return <span className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center text-[9px] font-black text-green-600">G</span>;
  if (type === 'yellow') return <span className="w-5 h-5 rounded-sm bg-yellow-400 flex items-center justify-center text-[8px] font-black text-white">Y</span>;
  if (type === 'red')    return <span className="w-5 h-5 rounded-sm bg-red-500 flex items-center justify-center text-[8px] font-black text-white">R</span>;
  return <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-500">E</span>;
}

function RatingBadge({ r }) {
  const cls = r >= 7 ? 'bg-green-500 text-white' : r >= 6 ? 'bg-yellow-400 text-white' : 'bg-red-400 text-white';
  return <span className={`text-[9px] font-black px-1 py-0.5 rounded ${cls}`}>{r.toFixed(1)}</span>;
}

// ── Pitch lineup ─────────────────────────────────────────────────────────
function PitchLineup({ players, side }) {
  const rows = useMemo(() => {
    const gk  = players.filter(p => p.pos === 'GK');
    const def = players.filter(p => ['CB','RB','LB'].includes(p.pos));
    const mid = players.filter(p => ['DM','CM'].includes(p.pos));
    const att = players.filter(p => ['RW','LW','AM','ST'].includes(p.pos));
    return side === 'home' ? [att, mid, def, gk] : [gk, def, mid, att];
  }, [players, side]);

  return (
    <div className="flex flex-col gap-3 py-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-2 flex-wrap">
          {row.map((p, pi) => (
            <div key={pi} className="flex flex-col items-center gap-0.5 w-14">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow ${
                side === 'home' ? 'bg-[#1A4D8F] text-white' : 'bg-red-500 text-white'
              }`}>{p.num}</div>
              <span className="text-[9px] text-white/80 text-center leading-tight truncate w-full text-center">{p.name.split(' ').pop()}</span>
              <RatingBadge r={p.rating} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────
function OverviewTab({ detail, match }) {
  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Recent Form (last 5)</p>
        <div className="flex gap-6 flex-wrap">
          {[['home', match.homeTeam.name], ['away', match.awayTeam.name]].map(([side, name]) => (
            <div key={side}>
              <p className="text-xs text-gray-500 mb-1.5">{name}</p>
              <div className="flex gap-1">
                {detail.form[side].map((r, i) => <FormPill key={i} result={r} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {detail.events.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Match Events</p>
          <div className="relative pl-8 space-y-3">
            <div className="absolute left-[14px] top-0 bottom-0 w-px bg-gray-100" />
            {detail.events.map((ev, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="absolute left-0 w-7 flex justify-end">
                  <EventDot type={ev.type} />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A2E]">{ev.player}</p>
                    {ev.detail && <p className="text-[10px] text-gray-400">{ev.detail}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      ev.team === 'home' ? 'bg-blue-50 text-[#1A4D8F]' : 'bg-red-50 text-red-500'
                    }`}>
                      {ev.team === 'home' ? match.homeTeam.short : match.awayTeam.short}
                    </span>
                    <span className="text-xs font-black text-gray-500">{ev.min}'</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Match Facts</p>
        <div className="grid grid-cols-2 gap-2">
          {[['Venue', detail.venue], ['Referee', detail.referee], ['Attendance', detail.attendance], ['Round', detail.round], ['League', match.league], ['Date', match.date]]
            .map(([lbl, val]) => (
              <div key={lbl} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400">{lbl}</p>
                <p className="text-xs font-bold text-[#1A1A2E] mt-0.5">{val}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function LineupsTab({ detail, match }) {
  return (
    <div className="p-4">
      <div className="bg-green-700 rounded-2xl overflow-hidden">
        <div className="flex justify-between px-4 pt-3 pb-1">
          <span className="text-white/70 text-xs font-bold">{match.homeTeam.short} {detail.lineup.formation.home}</span>
          <span className="text-white/70 text-xs font-bold">{detail.lineup.formation.away} {match.awayTeam.short}</span>
        </div>
        <div className="divide-y divide-white/10">
          <div className="p-3"><PitchLineup players={detail.lineup.home.starting} side="home" /></div>
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-x-4 h-px bg-white/20" />
            <div className="w-16 h-16 rounded-full border border-white/20 z-10" />
          </div>
          <div className="p-3"><PitchLineup players={detail.lineup.away.starting} side="away" /></div>
        </div>
        <div className="flex justify-between px-4 pb-3 pt-2 border-t border-white/10 gap-4">
          {[['home', match.homeTeam.name], ['away', match.awayTeam.name]].map(([side, name]) => (
            <div key={side} className="flex-1">
              <p className="text-white/50 text-[10px] mb-1">{name} — Bench</p>
              <div className="flex flex-wrap gap-1">
                {detail.lineup[side].bench.map((b, i) => (
                  <span key={i} className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded">{b}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsTab({ detail, match }) {
  const rows = [
    ['Possession %',    detail.stats.home.possession, detail.stats.away.possession],
    ['Total Shots',     detail.stats.home.shots,       detail.stats.away.shots],
    ['Shots on Target', detail.stats.home.shotsOT,     detail.stats.away.shotsOT],
    ['Corners',         detail.stats.home.corners,     detail.stats.away.corners],
    ['Fouls',           detail.stats.home.fouls,       detail.stats.away.fouls],
    ['Yellow Cards',    detail.stats.home.yellows,     detail.stats.away.yellows],
    ['Red Cards',       detail.stats.home.reds,        detail.stats.away.reds],
    ['Offsides',        detail.stats.home.offsides,    detail.stats.away.offsides],
    ['Passes',          detail.stats.home.passes,      detail.stats.away.passes],
    ['Pass Accuracy %', detail.stats.home.passAcc,     detail.stats.away.passAcc],
    ['Tackles',         detail.stats.home.tackles,     detail.stats.away.tackles],
    ['Saves (GK)',      detail.stats.home.saves,       detail.stats.away.saves],
  ];
  return (
    <div className="p-4">
      <div className="flex justify-between text-xs font-bold mb-4">
        <span className="text-[#1A4D8F]">{match.homeTeam.name}</span>
        <span className="text-red-500">{match.awayTeam.name}</span>
      </div>
      {rows.map(([lbl, h, a]) => <StatRow key={lbl} label={lbl} homeVal={h} awayVal={a} />)}
    </div>
  );
}

function StandingsTab({ detail, match }) {
  return (
    <div className="p-4">
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">{match.league}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              {['#','Club','P','W','D','L','GF','GA','GD','Pts'].map(h => (
                <th key={h} className={`py-2 font-medium ${h === 'Club' ? 'text-left pr-2' : 'text-center px-1'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.standings.map(row => (
              <tr key={row.pos} className={`border-b border-gray-50 ${row.highlight ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <td className="py-2 text-gray-400 text-center">{row.pos}</td>
                <td className={`py-2 pr-2 font-bold ${row.highlight ? 'text-[#1A4D8F]' : 'text-gray-700'}`}>{row.team}</td>
                <td className="py-2 text-center text-gray-500">{row.p}</td>
                <td className="py-2 text-center text-gray-500">{row.w}</td>
                <td className="py-2 text-center text-gray-500">{row.d}</td>
                <td className="py-2 text-center text-gray-500">{row.l}</td>
                <td className="py-2 text-center text-gray-500">{row.gf}</td>
                <td className="py-2 text-center text-gray-500">{row.ga}</td>
                <td className="py-2 text-center text-gray-500">{row.gd}</td>
                <td className="py-2 text-center font-black text-[#1A4D8F]">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function H2HTab({ detail, match }) {
  const homeWins = detail.h2h.filter(r =>
    (r.winner === 'home' && r.home === match.homeTeam.name) ||
    (r.winner === 'away' && r.away === match.homeTeam.name)
  ).length;
  const awayWins = detail.h2h.filter(r =>
    (r.winner === 'home' && r.home === match.awayTeam.name) ||
    (r.winner === 'away' && r.away === match.awayTeam.name)
  ).length;
  const draws = detail.h2h.filter(r => r.winner === 'draw').length;

  return (
    <div className="p-4">
      <div className="flex justify-around bg-gray-50 rounded-2xl p-4 mb-4 text-center">
        <div><p className="text-xl font-black text-[#1A4D8F]">{homeWins}</p><p className="text-[10px] text-gray-400 mt-0.5">{match.homeTeam.short} Wins</p></div>
        <div><p className="text-xl font-black text-gray-400">{draws}</p><p className="text-[10px] text-gray-400 mt-0.5">Draws</p></div>
        <div><p className="text-xl font-black text-red-500">{awayWins}</p><p className="text-[10px] text-gray-400 mt-0.5">{match.awayTeam.short} Wins</p></div>
      </div>
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Recent Meetings</p>
      <div className="space-y-1.5">
        {detail.h2h.map((r, i) => {
          const homeIsMatch = r.home === match.homeTeam.name;
          const resultCls = r.winner === 'draw' ? 'text-gray-500'
            : (r.winner === 'home' && homeIsMatch) || (r.winner === 'away' && !homeIsMatch)
              ? 'text-[#1A4D8F]' : 'text-red-500';
          return (
            <div key={i} className="flex items-center text-xs gap-2">
              <span className="text-gray-300 w-20 shrink-0 text-[10px]">{r.date}</span>
              <span className="flex-1 text-right font-medium text-gray-700 truncate">{r.home}</span>
              <span className={`font-black px-2 py-0.5 rounded-lg bg-gray-50 shrink-0 ${resultCls}`}>{r.score}</span>
              <span className="flex-1 font-medium text-gray-700 truncate">{r.away}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OddsTab({ detail, match }) {
  const bestHome = Math.max(...detail.odds.map(o => o.home));
  const bestAway = Math.max(...detail.odds.map(o => o.away));
  const bestDraw = Math.max(...detail.odds.map(o => o.draw));
  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Match Result Odds</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="text-left py-2 font-medium pr-3">Bookmaker</th>
                <th className="text-center py-2 font-medium text-[#1A4D8F]">{match.homeTeam.short}</th>
                <th className="text-center py-2 font-medium text-gray-500">Draw</th>
                <th className="text-center py-2 font-medium text-red-500">{match.awayTeam.short}</th>
              </tr>
            </thead>
            <tbody>
              {detail.odds.map((o, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium text-gray-700">{o.bookmaker}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.home === bestHome ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>{o.home.toFixed(2)}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.draw === bestDraw ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>{o.draw.toFixed(2)}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.away === bestAway ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>{o.away.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-300 mt-2">Odds for reference only. WinALott is not a bookmaker.</p>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Where to Watch</p>
        <div className="flex flex-wrap gap-2">
          {detail.tv.map(ch => (
            <span key={ch} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600">
              <FiTv className="w-3 h-3" /> {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-100 rounded-2xl aspect-video flex flex-col items-center justify-center gap-2">
        <FiTv className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-bold text-gray-400">Highlights — Available after match</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
            <p className="text-[10px] text-gray-300">Photo {n}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Staking Panel ─────────────────────────────────────────────────────────
function StakingPanel({ match, tiers }) {
  const { addToCart, items } = useCart();
  const [pick, setPick]         = useState(null);
  const [selTier, setSelTier]   = useState(tiers[1]?.tier || tiers[0]?.tier);
  const [qty, setQty]           = useState(1);
  const [payState, setPayState] = useState('idle');
  const [added, setAdded]       = useState(false);

  const inCart   = items.some(i => i.matchId === match.id);
  const cartItem = items.find(i => i.matchId === match.id);
  const chosen   = tiers.find(t => t.tier === selTier);
  const total    = (chosen?.price || 0) * qty;

  const closesMs  = new Date(`${match.date}T${match.time}:00`).getTime() - Date.now();
  const closesMin = Math.max(0, Math.floor(closesMs / 60000));
  const closingSoon = closesMin < 15;

  const handleAddToCart = () => {
    if (!pick || !chosen || inCart) return;
    for (let i = 0; i < qty; i++) {
      addToCart({ cartId: `${match.id}-${chosen.tier}-${Date.now()}-${i}`, matchId: match.id,
        match: `${match.homeTeam.name} vs ${match.awayTeam.name}`, market: match.market,
        pick: `${match.adminPick} (${pick.toUpperCase()})`, prediction: pick,
        tier: chosen.tier, price: chosen.price });
    }
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  const handlePayNow = () => {
    if (!pick || !chosen) return;
    setPayState('paying');
    setTimeout(() => setPayState('done'), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <FiShoppingCart className="w-4 h-4 text-[#1A4D8F]" />
        <h3 className="font-black text-[#1A1A2E] text-xs uppercase tracking-wider">Stake on this Match</h3>
      </div>

      <div className="bg-blue-50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-gray-400">Market — Admin Pick</p>
        <p className="text-sm font-bold text-[#1A4D8F]">{match.market}: <span>{match.adminPick}</span></p>
      </div>

      {inCart && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-700">Already staked</p>
            <p className="text-[10px] text-green-600">{TIER_CFG[cartItem?.tier]?.label} · {cartItem?.pick}</p>
          </div>
        </div>
      )}

      {payState === 'done' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-black text-green-700">Ticket Confirmed!</p>
          <p className="text-[10px] text-green-600 mt-0.5">Good luck in the draw</p>
          <button onClick={() => setPayState('idle')} className="mt-3 text-xs text-green-700 underline">Stake again</button>
        </div>
      ) : (
        <>
          {/* YES / NO */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Your Prediction</p>
            <div className="flex gap-2">
              {['yes','no'].map(v => (
                <button key={v} onClick={() => !inCart && setPick(pick === v ? null : v)} disabled={inCart}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    pick === v
                      ? v === 'yes' ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>
                  {v === 'yes' ? 'YES — Agree' : 'NO — Disagree'}
                </button>
              ))}
            </div>
          </div>

          {/* Tier selector */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Tier</p>
            <div className="space-y-1.5">
              {tiers.map(t => {
                const tc = TIER_CFG[t.tier];
                const active = selTier === t.tier;
                return (
                  <button key={t.tier} onClick={() => !inCart && setSelTier(t.tier)} disabled={inCart}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      active ? 'border-[#1A4D8F] bg-blue-50' : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${tc.badge}`}>
                      <tc.Icon className="w-2.5 h-2.5" /> {tc.label}
                    </span>
                    <div className="text-right">
                      <p className={`text-sm font-black ${tc.priceColor}`}>${t.price.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-400">{t.stakers} staked</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pool info */}
          {chosen && (
            <div className="text-xs space-y-1 text-gray-500">
              <div className="flex justify-between"><span>Pool</span><span className="font-bold text-[#1A1A2E]">${chosen.prizePool.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Winners</span><span className="font-bold text-[#1A1A2E]">{chosen.maxWinners}</span></div>
              {closingSoon && (
                <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                  <FiAlertCircle className="w-3 h-3" /> Closes in {closesMin} min
                </div>
              )}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#1A4D8F] rounded-full" style={{ width: `${chosen.fillPercent}%` }} />
              </div>
              <p className="text-[10px] text-gray-400">{chosen.fillPercent}% filled · {chosen.stakers} staking</p>
            </div>
          )}

          {/* Qty */}
          {!inCart && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Quantity</p>
              <div className="flex gap-1.5">
                {[1,2,5,10].map(n => (
                  <button key={n} onClick={() => setQty(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      qty === n ? 'border-[#1A4D8F] bg-blue-50 text-[#1A4D8F]' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {!inCart && chosen && (
            <div className="flex justify-between text-sm font-black border-t border-gray-100 pt-2">
              <span className="text-gray-600">Total ({qty} ticket{qty > 1 ? 's' : ''})</span>
              <span className="text-[#1A4D8F]">${total.toFixed(2)}</span>
            </div>
          )}

          {/* CTAs */}
          {!inCart && (
            <div className="space-y-2">
              {!pick && <p className="text-[10px] text-center text-amber-500 font-medium">Select YES or NO above</p>}

              <button onClick={handlePayNow} disabled={!pick || !selTier || payState === 'paying'}
                className={`w-full py-3 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 transition-all ${
                  !pick || !selTier ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : payState === 'paying' ? 'bg-[#F5C518] text-[#1A1A2E] cursor-wait'
                  : 'bg-[#F5C518] hover:bg-yellow-400 text-[#1A1A2E]'
                }`}>
                <span>{payState === 'paying' ? 'Processing...' : `Pay with Wallet — $${total.toFixed(2)}`}</span>
                {payState !== 'paying' && <span className="text-[10px] opacity-60 font-normal">$24.50 available</span>}
              </button>

              <button onClick={handleAddToCart} disabled={!pick || !selTier || added}
                className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 transition-all ${
                  added ? 'bg-green-50 border-green-300 text-green-600'
                  : !pick || !selTier ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
                }`}>
                <FiShoppingCart className="w-3.5 h-3.5" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <p className="text-[10px] text-center text-gray-400">Or add to cart to buy multiple matches at once</p>
            </div>
          )}

          {inCart && (
            <button className="w-full py-3 rounded-xl text-xs font-black bg-gray-100 text-gray-500 flex items-center justify-center gap-2">
              <FiLock className="w-3.5 h-3.5" /> Remove from cart to change stake
            </button>
          )}
        </>
      )}

      <div className="border-t border-gray-100 pt-3 flex items-start gap-2">
        <FiInfo className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          If your prediction matches the admin pick, you enter the draw.
          {chosen && ` ${chosen.maxWinners} winner${chosen.maxWinners > 1 ? 's' : ''} selected randomly. Est. prize: ~$${((chosen.prizePool * 0.9) / chosen.maxWinners).toFixed(2)}.`}
        </p>
      </div>
    </div>
  );
}

// ── Left sidebar — Other Games ────────────────────────────────────────────
function OtherGames({ currentMatchId }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = mockMatches.filter(m => m.id !== currentMatchId);
    if (filter === 'Live') list = list.filter(m => m.status === 'live');
    if (filter === 'Today') {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter(m => m.date === today);
    }
    if (filter === 'Tomorrow') {
      const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
      list = list.filter(m => m.date === tmr.toISOString().slice(0, 10));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentMatchId, filter, search]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">More Matches</p>
      <div className="relative mb-2">
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A4D8F]/30 bg-white"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {OTHER_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
              filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>{f}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {filtered.length === 0 && (
          <p className="text-[10px] text-gray-400 text-center py-4">No matches found</p>
        )}
        {filtered.map(m => {
          const isLive = m.status === 'live';
          const tc = TIER_CFG[m.tier] || TIER_CFG.silver;
          return (
            <button key={m.id} onClick={() => navigate(`/match/${m.id}`)}
              className="w-full text-left bg-white rounded-xl border border-gray-200 px-2.5 py-2 hover:border-[#1A4D8F]/40 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] text-gray-400 truncate flex-1">{m.league}</span>
                {isLive && <span className="flex items-center gap-0.5 text-[9px] font-black text-red-500 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />{m.minute}
                </span>}
              </div>
              <p className="text-[10px] font-bold text-[#1A1A2E] leading-tight">
                {m.homeTeam.short} <span className="text-gray-400 font-normal">vs</span> {m.awayTeam.short}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${tc.badge}`}>
                  <tc.Icon className="w-2 h-2" />{tc.label}
                </span>
                <span className="text-[9px] text-gray-400">
                  {isLive ? `${m.score?.home}-${m.score?.away}` : m.time}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center shrink-0">
        <p className="text-[10px] text-gray-300 font-medium">Ad Space 240×400</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate    = useNavigate();
  const match       = useMemo(() => mockMatches.find(m => m.id === matchId), [matchId]);
  const detail      = useMemo(() => getMatchDetail(matchId, match), [matchId, match]);
  const tiers       = matchTiers[matchId] || [];
  const [activeTab, setActiveTab] = useState('overview');

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 mb-4">Match not found</p>
        <button onClick={() => navigate('/lobby')} className="bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          Back to Lobby
        </button>
      </div>
    );
  }

  const isLive = match.status === 'live';

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3 flex-wrap">
        <Link to="/" className="hover:text-[#1A4D8F] transition-colors">Home</Link>
        {detail.breadcrumb?.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <FiChevronRight className="w-3 h-3" /><span>{crumb}</span>
          </span>
        ))}
        <FiChevronRight className="w-3 h-3" />
        <span className="text-[#1A1A2E] font-bold">{match.homeTeam.short} vs {match.awayTeam.short}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A1A2E] rounded-2xl p-5 mb-4 text-white">
        <p className="text-center text-xs text-blue-300 font-medium uppercase tracking-widest mb-0.5">{match.league}</p>
        {detail.venue && (
          <p className="text-center text-[10px] text-white/40 mb-4 flex items-center justify-center gap-1">
            <FiMapPin className="w-3 h-3" />{detail.venue}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar logo={match.homeTeam.logo} short={match.homeTeam.short} size="xl" />
            <p className="font-bold text-sm text-center leading-tight">{match.homeTeam.name}</p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            {isLive ? (
              <>
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-300 text-xs font-black">LIVE {match.minute}</span>
                </div>
                <span className="text-5xl font-black tabular-nums">{match.score?.home} — {match.score?.away}</span>
              </>
            ) : match.status === 'finished' ? (
              <>
                <span className="text-white/50 text-xs font-bold px-3 py-1 rounded-full bg-white/10">FT</span>
                <span className="text-4xl font-black tabular-nums">{match.score?.home ?? '—'} — {match.score?.away ?? '—'}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <FiClock className="w-3 h-3 text-white/60" />
                  <span className="text-white/80 text-xs font-bold">{match.date} · {match.time}</span>
                </div>
                <span className="text-4xl font-black text-white/30">VS</span>
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar logo={match.awayTeam.logo} short={match.awayTeam.short} size="xl" />
            <p className="font-bold text-sm text-center leading-tight">{match.awayTeam.name}</p>
          </div>
        </div>
      </div>

      {/* 3-column */}
      <div className="flex gap-4 items-start">
        {/* Left */}
        <aside className="hidden xl:flex flex-col w-56 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-hidden">
          <OtherGames currentMatchId={matchId} />
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                    activeTab === t.key ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <t.Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
            {activeTab === 'overview'  && <OverviewTab  detail={detail} match={match} />}
            {activeTab === 'lineups'   && <LineupsTab   detail={detail} match={match} />}
            {activeTab === 'stats'     && <StatsTab     detail={detail} match={match} />}
            {activeTab === 'standings' && <StandingsTab detail={detail} match={match} />}
            {activeTab === 'h2h'       && <H2HTab       detail={detail} match={match} />}
            {activeTab === 'odds'      && <OddsTab      detail={detail} match={match} />}
            {activeTab === 'media'     && <MediaTab />}
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center mb-4">
            <p className="text-[10px] text-gray-300 font-medium">Ad Space 728×90</p>
          </div>

          {/* Mobile staking panel */}
          <div className="xl:hidden">
            <StakingPanel match={match} tiers={tiers} />
          </div>
        </main>

        {/* Right */}
        <aside className="hidden xl:block w-[300px] shrink-0 sticky top-28 space-y-4">
          <StakingPanel match={match} tiers={tiers} />
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 flex items-center justify-center">
            <p className="text-[10px] text-gray-300 font-medium">Ad Space 300×250</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Tier Breakdown</p>
            <div className="space-y-2">
              {tiers.map(t => {
                const tc = TIER_CFG[t.tier];
                return (
                  <div key={t.tier} className="flex items-center justify-between text-xs">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${tc.badge}`}>
                      <tc.Icon className="w-2.5 h-2.5" />{tc.label}
                    </span>
                    <div className="flex items-center gap-3 text-gray-500">
                      <span><FiUsers className="w-3 h-3 inline mr-0.5" />{t.stakers}</span>
                      <span className="font-bold text-[#1A1A2E]">${t.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom: more matches */}
      <div className="xl:hidden mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">More Matches</p>
        <div className="space-y-2">
          {mockMatches.filter(m => m.id !== matchId).slice(0, 4).map(m => {
            const tc = TIER_CFG[m.tier] || TIER_CFG.silver;
            return (
              <button key={m.id} onClick={() => navigate(`/match/${m.id}`)}
                className="w-full flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-left hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#1A1A2E]">{m.homeTeam.short} vs {m.awayTeam.short}</p>
                  <p className="text-[10px] text-gray-400">{m.league}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tc.badge}`}>{tc.label}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
