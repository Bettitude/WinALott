import { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiClock, FiMapPin, FiUsers, FiChevronRight, FiZap, FiStar, FiAward,
  FiCheckCircle, FiShoppingCart, FiTrendingUp, FiBarChart2, FiList,
  FiActivity, FiGrid, FiWifi, FiTv, FiInfo, FiLock,
  FiAlertCircle, FiSearch, FiTag, FiPlay,
} from 'react-icons/fi';
import { useMatchDetail } from '../hooks/useMatchDetail';
import { useMatches } from '../hooks/useMatches';
import { matchApi } from '../api/matchApi';
import { normalizeMatch, normalizeMarketToTier, normalizeTicket } from '../api/normalizers';
import { useCart } from '../hooks/useCart';
import { AuthContext } from '../context/AuthContext';
import TeamAvatar from '../components/ui/TeamAvatar';
import { OfficialLineup } from '../components/OfficialLineup';
import PotentialWinBanner from '../components/ui/PotentialWinBanner';
import AdBanner from '../components/ui/AdBanner';
import OddsMovementChart from '../components/ui/OddsMovementChart';
import CrowdConsensusBars from '../components/ui/CrowdConsensusBars';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  silver:   { label: 'Silver',   Icon: FiStar,  badge: 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-500',      priceColor: 'text-gray-600 dark:text-slate-300',   btn: 'bg-gray-500 hover:bg-gray-600' },
  gold:     { label: 'Gold',     Icon: FiAward, badge: 'bg-yellow-50 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700', priceColor: 'text-yellow-600 dark:text-yellow-400',  btn: 'bg-[#1A4D8F] hover:bg-[#0D2B5E]' },
  platinum: { label: 'Platinum', Icon: FiZap,   badge: 'bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700', priceColor: 'text-purple-600 dark:text-purple-400',  btn: 'bg-purple-600 hover:bg-purple-700' },
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
  const hv    = typeof homeVal === 'number' ? homeVal : parseInt(homeVal) || 0;
  const av    = typeof awayVal === 'number' ? awayVal : parseInt(awayVal) || 0;
  const total = (hv + av) || 1;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold text-[#1A4D8F]">{homeVal ?? 0}</span>
        <span className="text-gray-400 dark:text-slate-400">{label}</span>
        <span className="font-bold text-red-500">{awayVal ?? 0}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        <div style={{ width: `${(hv / total) * 100}%` }} className="bg-[#1A4D8F] transition-all" />
        <div className="flex-1 bg-red-400" />
      </div>
    </div>
  );
}

function EventDot({ type, detail }) {
  const t = type?.toLowerCase() || '';
  const d = detail?.toLowerCase() || '';
  if (t === 'goal') return <span className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center text-[9px] font-black text-green-600">G</span>;
  if (t === 'card' && d.includes('yellow')) return <span className="w-5 h-5 rounded-sm bg-yellow-400 flex items-center justify-center text-[8px] font-black text-white">Y</span>;
  if (t === 'card' && d.includes('red'))    return <span className="w-5 h-5 rounded-sm bg-red-500 flex items-center justify-center text-[8px] font-black text-white">R</span>;
  return <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-[9px] text-gray-500 dark:text-slate-400">E</span>;
}

function RatingBadge({ r }) {
  const cls = r >= 7 ? 'bg-green-500 text-white' : r >= 6 ? 'bg-yellow-400 text-white' : 'bg-red-400 text-white';
  return <span className={`text-[9px] font-black px-1 py-0.5 rounded ${cls}`}>{Number(r).toFixed(1)}</span>;
}

function NoData({ label }) {
  return (
    <div className="py-12 text-center text-gray-400 dark:text-slate-500">
      <p className="text-sm font-medium">{label || 'No data available'}</p>
      <p className="text-xs mt-1 text-gray-300 dark:text-slate-600">Data will appear once the match is active</p>
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────
function OverviewTab({ events, fixture, h2h, match }) {
  const homeForm = [];
  const awayForm = [];
  if (Array.isArray(h2h)) {
    h2h.slice(0, 5).forEach(f => {
      const hw = f.teams?.home?.winner;
      const aw = f.teams?.away?.winner;
      const isHomeTeam = f.teams?.home?.name === match.homeTeam.name;
      if (hw === true) { homeForm.push(isHomeTeam ? 'W' : 'L'); awayForm.push(isHomeTeam ? 'L' : 'W'); }
      else if (aw === true) { homeForm.push(isHomeTeam ? 'L' : 'W'); awayForm.push(isHomeTeam ? 'W' : 'L'); }
      else { homeForm.push('D'); awayForm.push('D'); }
    });
  }

  const fixtureData = Array.isArray(fixture) ? fixture[0] : fixture;
  const venue    = fixtureData?.fixture?.venue?.name || match._raw?.stadium || '';
  const referee  = fixtureData?.fixture?.referee || '';
  const dateStr  = match.date;
  const timeStr  = match.time;

  return (
    <div className="p-4 space-y-5">
      {(homeForm.length > 0 || awayForm.length > 0) && (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Recent Form (H2H)</p>
          <div className="flex gap-6 flex-wrap">
            {[[homeForm, match.homeTeam.name], [awayForm, match.awayTeam.name]].map(([form, name], i) => (
              <div key={i}>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1.5">{name}</p>
                <div className="flex gap-1">
                  {form.map((r, j) => <FormPill key={j} result={r} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(events) && events.length > 0 ? (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Match Events</p>
          <div className="relative pl-8 space-y-3">
            <div className="absolute left-[14px] top-0 bottom-0 w-px bg-gray-100 dark:bg-slate-700" />
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="absolute left-0 w-7 flex justify-end">
                  <EventDot type={ev.type} detail={ev.detail} />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2 bg-gray-50 dark:bg-slate-700/60 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200">{ev.player?.name || '—'}</p>
                    {ev.detail && <p className="text-[10px] text-gray-400 dark:text-slate-500">{ev.detail}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      ev.team?.name === match.homeTeam.name ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400' : 'bg-red-50 dark:bg-red-950/50 text-red-500'
                    }`}>
                      {ev.team?.name === match.homeTeam.name ? match.homeTeam.short : match.awayTeam.short}
                    </span>
                    <span className="text-xs font-black text-gray-500 dark:text-slate-400">{ev.time?.elapsed}'</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        events === null && <NoData label="Match events not yet available" />
      )}

      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Match Facts</p>
        <div className="grid grid-cols-2 gap-2">
          {[['Venue', venue], ['Referee', referee], ['League', match.league], ['Date', dateStr + (timeStr ? ' · ' + timeStr : '')]]
            .filter(([, val]) => val)
            .map(([lbl, val]) => (
              <div key={lbl} className="bg-gray-50 dark:bg-slate-700/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 dark:text-slate-500">{lbl}</p>
                <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200 mt-0.5">{val}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function LineupsTab({ lineups, match }) {
  if (!Array.isArray(lineups) || lineups.length < 2) return <NoData label="Lineups not yet available" />;

  const home = lineups.find(l => l.team?.name === match.homeTeam.name) || lineups[0];
  const away = lineups.find(l => l.team?.name === match.awayTeam.name) || lineups[1];

  const fixtureData = match._raw?.fixture || match._raw?.[0]?.fixture;
  const venue   = fixtureData?.venue?.name || '';
  const dateStr = match.date || '';

  return (
    <div className="p-3">
      <OfficialLineup
        home={home}
        away={away}
        venue={venue}
        date={dateStr}
      />
    </div>
  );
}

function StatsTab({ stats, match }) {
  if (!Array.isArray(stats) || stats.length < 2) return <NoData label="Match stats not yet available" />;

  const home = stats.find(s => s.team?.name === match.homeTeam.name) || stats[0];
  const away = stats.find(s => s.team?.name === match.awayTeam.name) || stats[1];

  const getStat = (teamStats, type) => {
    const item = (teamStats?.statistics || []).find(s => s.type === type);
    return item?.value ?? 0;
  };

  const rows = [
    ['Possession %',    getStat(home, 'Ball Possession'),  getStat(away, 'Ball Possession')],
    ['Total Shots',     getStat(home, 'Total Shots'),      getStat(away, 'Total Shots')],
    ['Shots on Target', getStat(home, 'Shots on Goal'),    getStat(away, 'Shots on Goal')],
    ['Corners',         getStat(home, 'Corner Kicks'),     getStat(away, 'Corner Kicks')],
    ['Fouls',           getStat(home, 'Fouls'),            getStat(away, 'Fouls')],
    ['Yellow Cards',    getStat(home, 'Yellow Cards'),     getStat(away, 'Yellow Cards')],
    ['Red Cards',       getStat(home, 'Red Cards'),        getStat(away, 'Red Cards')],
    ['Offsides',        getStat(home, 'Offsides'),         getStat(away, 'Offsides')],
    ['Total Passes',    getStat(home, 'Total passes'),     getStat(away, 'Total passes')],
    ['Tackles',         getStat(home, 'Tackles'),          getStat(away, 'Tackles')],
    ['GK Saves',        getStat(home, 'Goalkeeper Saves'), getStat(away, 'Goalkeeper Saves')],
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

function StandingsTab({ match }) {
  return <NoData label={`Standings for ${match.league} — coming soon`} />;
}

function H2HTab({ h2h, match }) {
  if (!Array.isArray(h2h) || h2h.length === 0) return <NoData label="H2H data not available" />;

  const homeWins = h2h.filter(f => {
    const hw = f.teams?.home?.winner;
    const isHome = f.teams?.home?.name === match.homeTeam.name;
    return (hw === true && isHome) || (hw === false && !isHome);
  }).length;
  const awayWins = h2h.filter(f => {
    const aw = f.teams?.away?.winner;
    const isAway = f.teams?.away?.name === match.awayTeam.name;
    return (aw === true && isAway) || (aw === false && !isAway);
  }).length;
  const draws = h2h.filter(f => f.teams?.home?.winner === null && f.teams?.away?.winner === null).length;

  return (
    <div className="p-4">
      <div className="flex justify-around bg-gray-50 dark:bg-slate-700/60 rounded-2xl p-4 mb-4 text-center">
        <div><p className="text-xl font-black text-[#1A4D8F]">{homeWins}</p><p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{match.homeTeam.short} Wins</p></div>
        <div><p className="text-xl font-black text-gray-400 dark:text-slate-400">{draws}</p><p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Draws</p></div>
        <div><p className="text-xl font-black text-red-500">{awayWins}</p><p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{match.awayTeam.short} Wins</p></div>
      </div>
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Recent Meetings</p>
      <div className="space-y-1.5">
        {h2h.slice(0, 10).map((f, i) => {
          const homeName = f.teams?.home?.name || '';
          const awayName = f.teams?.away?.name || '';
          const hg = f.goals?.home ?? '—';
          const ag = f.goals?.away ?? '—';
          const score = `${hg} - ${ag}`;
          const homeIsMatch = homeName === match.homeTeam.name;
          const hw = f.teams?.home?.winner;
          const resultCls = hw === null ? 'text-gray-500 dark:text-slate-400'
            : (hw === true && homeIsMatch) || (hw === false && !homeIsMatch)
              ? 'text-[#1A4D8F] dark:text-blue-400' : 'text-red-500';
          const dateStr = f.fixture?.date ? new Date(f.fixture.date).toLocaleDateString('en-GB', { year: '2-digit', month: 'short', day: 'numeric' }) : '';
          return (
            <div key={i} className="flex items-center text-xs gap-2">
              <span className="text-gray-300 dark:text-slate-600 w-20 shrink-0 text-[10px]">{dateStr}</span>
              <span className="flex-1 text-right font-medium text-gray-700 dark:text-slate-300 truncate">{homeName}</span>
              <span className={`font-black px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-700 shrink-0 ${resultCls}`}>{score}</span>
              <span className="flex-1 font-medium text-gray-700 dark:text-slate-300 truncate">{awayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OddsStrip({ odds, match }) {
  if (!Array.isArray(odds) || odds.length === 0) return null;

  const bestHome = Math.max(...odds.map(o => Number(o.home) || 0));
  const bestDraw = Math.max(...odds.map(o => Number(o.draw) || 0));
  const bestAway = Math.max(...odds.map(o => Number(o.away) || 0));

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
          <FiTrendingUp className="w-3 h-3" /> Best Available Odds
        </p>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">{odds.length} bookmaker{odds.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl py-2.5 px-1">
          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-0.5 truncate max-w-full text-center">{match.homeTeam.short}</span>
          <span className="text-xl font-black text-[#1A4D8F] dark:text-blue-400 tabular-nums">{bestHome > 0 ? bestHome.toFixed(2) : '—'}</span>
          <span className="text-[9px] font-black text-blue-300 dark:text-blue-600 mt-0.5">HOME</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600 rounded-xl py-2.5 px-1">
          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Draw</span>
          <span className="text-xl font-black text-gray-700 dark:text-slate-200 tabular-nums">{bestDraw > 0 ? bestDraw.toFixed(2) : '—'}</span>
          <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 mt-0.5">DRAW</span>
        </div>
        <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl py-2.5 px-1">
          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-0.5 truncate max-w-full text-center">{match.awayTeam.short}</span>
          <span className="text-xl font-black text-red-500 dark:text-red-400 tabular-nums">{bestAway > 0 ? bestAway.toFixed(2) : '—'}</span>
          <span className="text-[9px] font-black text-red-300 dark:text-red-600 mt-0.5">AWAY</span>
        </div>
      </div>
      <p className="text-[9px] text-gray-300 dark:text-slate-600 text-center mt-2">For reference only — bWinALOTT is not a bookmaker</p>
    </div>
  );
}

function OddsTab({ odds, match }) {
  if (!Array.isArray(odds) || odds.length === 0) return <NoData label="Odds not available" />;

  const bestHome = Math.max(...odds.map(o => o.home || 0));
  const bestAway = Math.max(...odds.map(o => o.away || 0));
  const bestDraw = Math.max(...odds.map(o => o.draw || 0));

  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Match Result Odds</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400">
                <th className="text-left py-2 font-medium pr-3">Bookmaker</th>
                <th className="text-center py-2 font-medium text-[#1A4D8F]">{match.homeTeam.short}</th>
                <th className="text-center py-2 font-medium text-gray-500 dark:text-slate-400">Draw</th>
                <th className="text-center py-2 font-medium text-red-500">{match.awayTeam.short}</th>
              </tr>
            </thead>
            <tbody>
              {odds.map((o, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="py-2 pr-3 font-medium text-gray-700 dark:text-slate-300">{o.bookmaker}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.home === bestHome ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 dark:text-slate-300'}`}>{Number(o.home || 0).toFixed(2)}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.draw === bestDraw ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 dark:text-slate-300'}`}>{Number(o.draw || 0).toFixed(2)}</td>
                  <td className={`py-2 text-center font-bold rounded ${o.away === bestAway ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 dark:text-slate-300'}`}>{Number(o.away || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-2">Odds for reference only. bWinALOTT is not a bookmaker.</p>
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-100 dark:bg-slate-700/60 rounded-2xl aspect-video flex flex-col items-center justify-center gap-2">
        <FiTv className="w-10 h-10 text-gray-300 dark:text-slate-500" />
        <p className="text-sm font-bold text-gray-400 dark:text-slate-500">Highlights — Available after match</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="bg-gray-100 dark:bg-slate-700/60 rounded-xl aspect-video flex items-center justify-center">
            <p className="text-[10px] text-gray-300 dark:text-slate-600">Photo {n}</p>
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
  const [selTier, setSelTier]   = useState(null);
  const [qty, setQty]           = useState(1);
  const [payState, setPayState] = useState('idle');
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    if (tiers.length > 0 && !selTier) {
      setSelTier(tiers[1]?.tier || tiers[0]?.tier);
    }
  }, [tiers, selTier]);

  const inCart   = items.some(i => i.matchId === match.id);
  const cartItem = items.find(i => i.matchId === match.id);
  const chosen   = tiers.find(t => t.tier === selTier);
  const total    = (chosen?.price || 0) * qty;

  const [moveOptions, setMoveOptions] = useState([]);
  const [movePoints,  setMovePoints]  = useState([]);
  const [moveLoading, setMoveLoading] = useState(true);

  useEffect(() => {
    if (!chosen?.marketId) return;
    setMoveLoading(true);
    fetch(`${API}/markets/${chosen.marketId}/movement`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMoveOptions(d.data.options || []);
          setMovePoints(d.data.points || []);
        }
      })
      .catch(() => {})
      .finally(() => setMoveLoading(false));
  }, [chosen?.marketId]);

  const closesMs  = new Date(`${match.date}T${match.time}:00`).getTime() - Date.now();
  const closesMin = Math.max(0, Math.floor(closesMs / 60000));
  const closingSoon = closesMin > 0 && closesMin < 15;

  const handleAddToCart = () => {
    if (!pick || !chosen || inCart) return;
    for (let i = 0; i < qty; i++) {
      addToCart({ cartId: `${match.id}-${chosen.tier}-${Date.now()}-${i}`, matchId: match.id,
        match: `${match.homeTeam.name} vs ${match.awayTeam.name}`, market: match.market,
        pick: `${match.adminPick} (${pick.toUpperCase()})`, prediction: pick,
        tier: chosen.tier, price: chosen.price, marketId: chosen.marketId });
    }
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  const handlePayNow = () => {
    if (!pick || !chosen) return;
    setPayState('paying');
    setTimeout(() => setPayState('done'), 1800);
  };

  if (tiers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 text-center py-8">
        <p className="text-sm text-gray-400 dark:text-slate-500">No active markets for this match</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
        <FiShoppingCart className="w-4 h-4 text-[#1A4D8F]" />
        <h3 className="font-black text-[#1A1A2E] dark:text-white text-xs uppercase tracking-wider">Stake on this Match</h3>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-gray-400 dark:text-slate-500">Market — Admin Pick</p>
        <p className="text-sm font-bold text-[#1A4D8F] dark:text-blue-400">{match.market}: <span>{match.adminPick}</span></p>
      </div>

      {inCart && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400">Already staked</p>
            <p className="text-[10px] text-green-600 dark:text-green-500">{TIER_CFG[cartItem?.tier]?.label} · {cartItem?.pick}</p>
          </div>
        </div>
      )}

      {payState === 'done' ? (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
          <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-black text-green-700 dark:text-green-400">Ticket Confirmed!</p>
          <p className="text-[10px] text-green-600 dark:text-green-500 mt-0.5">Good luck in the draw</p>
          <button onClick={() => setPayState('idle')} className="mt-3 text-xs text-green-700 dark:text-green-400 underline">Stake again</button>
        </div>
      ) : (
        <>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Your Prediction</p>
            <div className="flex gap-2">
              {['yes','no'].map(v => (
                <button key={v} onClick={() => !inCart && setPick(pick === v ? null : v)} disabled={inCart}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    pick === v
                      ? v === 'yes' ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-400'
                  }`}>
                  {v === 'yes' ? 'YES — Agree' : 'NO — Disagree'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Select Tier</p>
            <div className="space-y-1.5">
              {tiers.map(t => {
                const tc = TIER_CFG[t.tier] || TIER_CFG.silver;
                const active = selTier === t.tier;
                return (
                  <button key={t.tier} onClick={() => !inCart && setSelTier(t.tier)} disabled={inCart}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      active ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-950/50' : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${tc.badge}`}>
                      <tc.Icon className="w-2.5 h-2.5" /> {tc.label}
                    </span>
                    <div className="text-right">
                      <p className={`text-sm font-black ${tc.priceColor}`}>${t.price.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-400 dark:text-slate-500">{t.stakers} staked</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {chosen && (
            <div className="text-xs space-y-1 text-gray-500 dark:text-slate-400">
              <div className="flex justify-between"><span>Pool</span><span className="font-bold text-[#1A1A2E] dark:text-slate-200">${chosen.prizePool.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Winners</span><span className="font-bold text-[#1A1A2E] dark:text-slate-200">{chosen.maxWinners}</span></div>
              {closingSoon && (
                <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                  <FiAlertCircle className="w-3 h-3" /> Closes in {closesMin} min
                </div>
              )}
              <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#1A4D8F] rounded-full" style={{ width: `${chosen.fillPercent}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{chosen.fillPercent}% filled · {chosen.stakers} staking</p>
            </div>
          )}

          {chosen && chosen.optionBreakdown?.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-2">Live Crowd Consensus</p>
              <CrowdConsensusBars options={chosen.optionBreakdown} />
              <p className="text-[9px] text-gray-300 dark:text-slate-600 mt-2">No login required · calculated from real entries</p>
            </div>
          )}

          {chosen && (
            <div className="bg-[#0D2B5E] rounded-xl p-3">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1.5">Prediction Movement</p>
              <OddsMovementChart options={moveOptions} points={movePoints} loading={moveLoading} height={130} />
            </div>
          )}

          {!inCart && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Quantity</p>
              <div className="flex gap-1.5">
                {[1,2,5,10].map(n => (
                  <button key={n} onClick={() => setQty(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      qty === n ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-400'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {!inCart && chosen && (
            <div className="flex justify-between text-sm font-black border-t border-gray-100 dark:border-slate-700 pt-2">
              <span className="text-gray-600 dark:text-slate-300">Total ({qty} ticket{qty > 1 ? 's' : ''})</span>
              <span className="text-[#1A4D8F] dark:text-blue-400">${total.toFixed(2)}</span>
            </div>
          )}

          {!inCart && (
            <div className="space-y-2">
              {!pick && <p className="text-[10px] text-center text-amber-500 font-medium">Select YES or NO above</p>}

              <button onClick={handlePayNow} disabled={!pick || !selTier || payState === 'paying'}
                className={`w-full py-3 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 transition-all ${
                  !pick || !selTier ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                  : payState === 'paying' ? 'bg-[#F5C518] text-[#1A1A2E] cursor-wait'
                  : 'bg-[#F5C518] hover:bg-yellow-400 text-[#1A1A2E]'
                }`}>
                <span>{payState === 'paying' ? 'Processing...' : `Pay with Wallet — $${total.toFixed(2)}`}</span>
              </button>

              <button onClick={handleAddToCart} disabled={!pick || !selTier || added}
                className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 transition-all ${
                  added ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400'
                  : !pick || !selTier ? 'border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                  : 'border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50 dark:hover:bg-blue-950/50'
                }`}>
                <FiShoppingCart className="w-3.5 h-3.5" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <p className="text-[10px] text-center text-gray-400 dark:text-slate-500">Or add to cart to buy multiple matches at once</p>
            </div>
          )}

          {inCart && (
            <button className="w-full py-3 rounded-xl text-xs font-black bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <FiLock className="w-3.5 h-3.5" /> Remove from cart to change stake
            </button>
          )}
        </>
      )}

      <div className="border-t border-gray-100 dark:border-slate-700 pt-3 flex items-start gap-2">
        <FiInfo className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed">
          If your prediction matches the admin pick, you enter the draw.
          {chosen && ` ${chosen.maxWinners} winner${chosen.maxWinners > 1 ? 's' : ''} selected randomly. Est. prize: ~$${((chosen.prizePool * 0.9) / chosen.maxWinners).toFixed(2)}.`}
        </p>
      </div>
    </div>
  );
}

// ── My Stakes Panel ───────────────────────────────────────────────────────
const STAKE_STATUS = {
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  won:     'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  lost:    'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
  voided:  'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
};

function MyStakesPanel({ matchId, matchStatus, onWatchLive }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [stakes,  setStakes]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !matchId) return;
    setLoading(true);
    matchApi.getMyTickets({ match_id: matchId })
      .then(res => setStakes((res.data?.data?.tickets || []).map(normalizeTicket)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matchId, isAuthenticated]);

  if (!isAuthenticated) return null;
  if (!loading && stakes.length === 0) return null;

  const isLive     = matchStatus === 'live';
  const isFinished = matchStatus === 'finished';
  const hasActive  = stakes.some(s => s.status === 'pending' || s.status === 'active');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
          <FiTag className="w-3.5 h-3.5" />
          {isFinished ? 'My Stakes — Ended' : 'My Stakes'}
        </p>
        {stakes.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400">
            {stakes.length} ticket{stakes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2].map(n => <div key={n} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {stakes.map(s => (
            <div key={s.id} className="bg-gray-50 dark:bg-slate-700/60 rounded-xl px-3 py-2.5 border border-gray-100 dark:border-slate-600">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 tracking-tight">{s.ticketNumber}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STAKE_STATUS[s.status] || STAKE_STATUS.pending}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#1A1A2E] dark:text-slate-200 truncate">{s.market || 'Market'}</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Your pick: <span className="font-black text-[#1A4D8F] dark:text-blue-400">{s.myPick}</span>
                    {s.adminPick && s.adminPick !== '—' && (
                      <> · Admin: <span className="font-bold">{s.adminPick}</span></>
                    )}
                  </p>
                </div>
                <p className="text-sm font-black text-[#1A1A2E] dark:text-slate-200 shrink-0">${s.entryFee.toFixed(2)}</p>
              </div>
              {s.status === 'won' && s.prize > 0 && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400">
                  <FiCheckCircle className="w-3 h-3" /> Won ${s.prize.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action button — changes based on match state */}
      {isLive && (
        <button onClick={onWatchLive}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white transition-colors">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          Watch Live
        </button>
      )}
      {!isLive && !isFinished && hasActive && (
        <button onClick={onWatchLive}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-[#1A4D8F] hover:bg-[#0D2B5E] text-white transition-colors">
          <FiPlay className="w-3.5 h-3.5" />
          Follow Match
        </button>
      )}
      {isFinished && (
        <button onClick={onWatchLive}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-600">
          <FiActivity className="w-3.5 h-3.5" />
          View Match History
        </button>
      )}
    </div>
  );
}

// ── Left sidebar — Other Games ────────────────────────────────────────────
function OtherGames({ currentMatchId }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { matches } = useMatches({ limit: 30 });

  const filtered = useMemo(() => {
    let list = matches.filter(m => m.id !== currentMatchId && m.status !== 'finished');
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
        `${m.homeTeam?.name} ${m.awayTeam?.name} ${m.league}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [matches, currentMatchId, filter, search]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">More Matches</p>
      <div className="relative mb-2">
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A4D8F]/30 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {OTHER_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
              filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}>{f}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {filtered.length === 0 && (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center py-4">No matches found</p>
        )}
        {filtered.map(m => {
          const isLive = m.status === 'live';
          const tc = TIER_CFG[m.tier] || TIER_CFG.silver;
          return (
            <button key={m.id} onClick={() => navigate(`/match/${m.id}`)}
              className="w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-2.5 py-2 hover:border-[#1A4D8F]/40 dark:hover:border-blue-700/60 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] text-gray-400 dark:text-slate-500 truncate flex-1">{m.league}</span>
                {isLive && <span className="flex items-center gap-0.5 text-[9px] font-black text-red-500 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />{m.minute}
                </span>}
              </div>
              <p className="text-[10px] font-bold text-[#1A1A2E] dark:text-slate-200 leading-tight">
                {m.homeTeam?.short} <span className="text-gray-400 dark:text-slate-500 font-normal">vs</span> {m.awayTeam?.short}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${tc.badge}`}>
                  <tc.Icon className="w-2 h-2" />{tc.label}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-slate-500">
                  {isLive ? `${m.score?.home}-${m.score?.away}` : m.time}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <AdBanner slot="sidebar_left" className="mt-3 shrink-0" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate    = useNavigate();

  const { match: rawMatch, fixture, stats, lineups, events, h2h, odds, loading, error } = useMatchDetail(matchId);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    if (!matchId) return;
    matchApi.getMarkets({ match_id: matchId, status: 'active' })
      .then(res => {
        const markets = res.data?.data?.markets || res.data?.data || [];
        setTiers(Array.isArray(markets) ? markets.map(normalizeMarketToTier) : []);
      })
      .catch(() => {});
  }, [matchId]);

  const match = useMemo(() => rawMatch ? normalizeMatch(rawMatch) : null, [rawMatch]);
  const [activeTab, setActiveTab] = useState('overview');

  const handleWatchLive = () => {
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { matches: otherMatchesMobile } = useMatches({ limit: 4 });

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-4 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-2.5 w-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-2 w-2 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-2.5 w-12 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-2 w-2 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-2.5 w-28 bg-gray-200 dark:bg-slate-700 rounded-full" />
        </div>
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A1A2E] rounded-2xl p-5 mb-4">
          <div className="h-2.5 w-28 bg-white/20 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-14 h-14 rounded-full bg-white/20" />
              <div className="h-3 w-20 bg-white/20 rounded-full" />
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="h-6 w-24 bg-white/20 rounded-full" />
              <div className="h-8 w-16 bg-white/10 rounded-lg" />
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-14 h-14 rounded-full bg-white/20" />
              <div className="h-3 w-20 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
        {/* Odds strip placeholder */}
        <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-4" />
        {/* 3-column */}
        <div className="flex gap-4">
          <div className="hidden xl:flex flex-col w-56 shrink-0 gap-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-full mb-1" />
            {[1,2,3,4,5].map(n => (
              <div key={n} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-2.5 space-y-1.5">
                <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full" />
                <div className="h-2.5 w-3/4 bg-gray-100 dark:bg-slate-700 rounded-full" />
                <div className="flex justify-between mt-1">
                  <div className="h-4 w-12 bg-gray-100 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-8 bg-gray-100 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                {[80,60,52,72,40,48,52].map((w,n) => (
                  <div key={n} className={`h-7 w-${w === 80 ? 20 : w === 72 ? 20 : 16} bg-gray-100 dark:bg-slate-700 rounded-full`} style={{ width: w }} />
                ))}
              </div>
              <div className="p-4 space-y-4">
                <div className="h-3 w-32 bg-gray-100 dark:bg-slate-700 rounded-full" />
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(n => <div key={n} className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl" />)}
                </div>
                <div className="h-3 w-24 bg-gray-100 dark:bg-slate-700 rounded-full" />
                {[1,2,3].map(n => <div key={n} className="h-14 bg-gray-100 dark:bg-slate-700 rounded-xl" />)}
              </div>
            </div>
          </div>
          <div className="hidden xl:block w-[300px] shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
              <div className="h-3 w-28 bg-gray-100 dark:bg-slate-700 rounded-full" />
              {[1,2,3].map(n => <div key={n} className="h-10 bg-gray-100 dark:bg-slate-700 rounded-xl" />)}
              <div className="h-12 bg-[#F5C518]/20 rounded-xl" />
              <div className="h-10 bg-gray-100 dark:bg-slate-700 rounded-xl" />
              <div className="h-3 w-40 bg-gray-100 dark:bg-slate-700 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!match || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 dark:text-slate-500 mb-4">{error || 'Match not found'}</p>
        <button onClick={() => navigate('/lobby')} className="bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          Back to Lobby
        </button>
      </div>
    );
  }

  const isLive       = match.status === 'live';
  const isFinishedM  = match.status === 'finished';
  const matchStarted = isLive || isFinishedM;   // stats/events only meaningful once kicked off
  const fixtureData  = Array.isArray(fixture) ? fixture[0] : fixture;
  const venueStr = fixtureData?.fixture?.venue?.name || match._raw?.stadium || '';

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500 mb-3 flex-wrap">
        <Link to="/" className="hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3" />
        <Link to="/lobby" className="hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">Lobby</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-[#1A1A2E] dark:text-slate-200 font-bold">{match.homeTeam.short} vs {match.awayTeam.short}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A1A2E] rounded-2xl p-5 mb-4 text-white">
        <p className="text-center text-xs text-blue-300 font-medium uppercase tracking-widest mb-0.5">{match.league}</p>
        {venueStr && (
          <p className="text-center text-[10px] text-white/40 mb-4 flex items-center justify-center gap-1">
            <FiMapPin className="w-3 h-3" />{venueStr}
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

      {/* Odds strip — always visible below hero */}
      <OddsStrip odds={odds} match={match} />

      {/* 3-column */}
      <div className="flex gap-4 items-start">
        {/* Left */}
        <aside className="hidden xl:flex flex-col w-56 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-hidden">
          <OtherGames currentMatchId={matchId} />
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mb-4">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-slate-700">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                    activeTab === t.key ? 'border-[#1A4D8F] text-[#1A4D8F] dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}>
                  <t.Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
            {activeTab === 'overview'  && <OverviewTab  events={matchStarted ? events : null} fixture={fixture} h2h={h2h} match={match} />}
            {activeTab === 'lineups'   && <LineupsTab   lineups={lineups} match={match} />}
            {activeTab === 'stats'     && (!matchStarted
              ? <NoData label="Stats available once the match kicks off" />
              : <StatsTab stats={stats} match={match} />
            )}
            {activeTab === 'standings' && <StandingsTab match={match} />}
            {activeTab === 'h2h'       && <H2HTab       h2h={h2h} match={match} />}
            {activeTab === 'odds'      && <OddsTab      odds={odds} match={match} />}
            {activeTab === 'media'     && <MediaTab />}
          </div>

          <AdBanner slot="leaderboard" className="mb-4" />

          {/* Mobile staking panel + stakes */}
          <div className="xl:hidden space-y-4">
            <StakingPanel match={match} tiers={tiers} />
            <MyStakesPanel matchId={matchId} matchStatus={match.status} onWatchLive={handleWatchLive} />
          </div>
        </main>

        {/* Right */}
        <aside className="hidden xl:block w-[300px] shrink-0 sticky top-28 space-y-4">
          <StakingPanel match={match} tiers={tiers} />
          <MyStakesPanel matchId={matchId} matchStatus={match.status} onWatchLive={handleWatchLive} />
          <AdBanner slot="sidebar_right" />
          {tiers.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Tier Breakdown</p>
              <div className="space-y-2">
                {tiers.map(t => {
                  const tc = TIER_CFG[t.tier] || TIER_CFG.silver;
                  return (
                    <div key={t.tier} className="flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${tc.badge}`}>
                        <tc.Icon className="w-2.5 h-2.5" />{tc.label}
                      </span>
                      <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                        <span><FiUsers className="w-3 h-3 inline mr-0.5" />{t.stakers}</span>
                        <span className="font-bold text-[#1A1A2E] dark:text-slate-200">${t.price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile bottom: more matches */}
      <div className="xl:hidden mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">More Matches</p>
        <div className="space-y-2">
          {otherMatchesMobile.filter(m => m.id !== matchId).slice(0, 4).map(m => {
            const tc = TIER_CFG[m.tier] || TIER_CFG.silver;
            return (
              <button key={m.id} onClick={() => navigate(`/match/${m.id}`)}
                className="w-full flex items-center justify-between bg-gray-50 dark:bg-slate-700/60 rounded-xl px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200">{m.homeTeam?.short} vs {m.awayTeam?.short}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{m.league}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tc.badge}`}>{tc.label}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating potential-win betslip banner */}
      <PotentialWinBanner />

    </div>
  );
}
