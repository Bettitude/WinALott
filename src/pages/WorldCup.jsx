import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiClock, FiMapPin, FiCalendar, FiFlag, FiGift, FiUsers,
  FiCheckCircle, FiZap, FiAward, FiChevronRight, FiLogIn,
  FiLock, FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { requireAuth } from '../utils/requireAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Mock fixtures (used when backend is offline) ──────────────────────────────
// Country flag helper — flagcdn.com serves reliable national flags
const flag = cc => `https://flagcdn.com/w80/${cc}.png`;

const MOCK_FIXTURES = [
  {
    fixture: { id: 1100001, date: '2026-06-11T19:00:00+00:00', status: { short: 'FT', long: 'Match Finished' }, venue: { name: 'Estadio Azteca', city: 'Mexico City' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 16,  name: 'Mexico',      logo: flag('mx') }, away: { id: 24,  name: 'Poland',      logo: flag('pl') } },
    goals:   { home: 2, away: 0 },
    freeGame: {
      id: 'wg-1', question: 'Who will win this match?',
      options: [{ key: 'a', label: 'Mexico Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Poland Win' }],
      correct_option: 'a', prize_type: 'cash', prize_usd: 10, winner_count: 5, status: 'settled',
      entry_count: 184, correct_count: 62,
    },
  },
  {
    fixture: { id: 1100002, date: '2026-06-11T22:00:00+00:00', status: { short: '2H', long: 'Second Half', elapsed: 67 }, venue: { name: 'SoFi Stadium', city: 'Los Angeles' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 2,   name: 'USA',         logo: flag('us') }, away: { id: 101, name: 'Jamaica',     logo: flag('jm') } },
    goals:   { home: 1, away: 0 },
    freeGame: {
      id: 'wg-2', question: 'Who will win?',
      options: [{ key: 'a', label: 'USA Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Jamaica Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 15, winner_count: 8, status: 'open',
      entry_count: 231, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100003, date: '2026-06-12T16:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'Estadio Guadalajara', city: 'Guadalajara' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 6,   name: 'Brazil',      logo: flag('br') }, away: { id: 70,  name: 'Venezuela',   logo: flag('ve') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-3', question: 'Who will win?',
      options: [{ key: 'a', label: 'Brazil Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Venezuela Win' }],
      correct_option: null, prize_type: 'merch', prize_usd: null, prize_description: 'Official Brazil WC Jersey', winner_count: 3, status: 'open',
      entry_count: 88, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100004, date: '2026-06-12T19:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'MetLife Stadium', city: 'New York' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 26,  name: 'Argentina',   logo: flag('ar') }, away: { id: 15,  name: 'Peru',         logo: flag('pe') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-4', question: 'Who will win?',
      options: [{ key: 'a', label: 'Argentina Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Peru Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 25, winner_count: 5, status: 'open',
      entry_count: 142, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100005, date: '2026-06-12T22:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'AT&T Stadium', city: 'Dallas' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 10,  name: 'England',     logo: flag('gb-eng') }, away: { id: 14,  name: 'Serbia',       logo: flag('rs') } },
    goals:   { home: null, away: null },
    freeGame: null,
  },
  {
    fixture: { id: 1100006, date: '2026-06-13T16:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: "Levi's Stadium", city: 'San Francisco' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 2,   name: 'France',      logo: flag('fr') }, away: { id: 94,  name: 'Morocco',      logo: flag('ma') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-6', question: 'Who will win?',
      options: [{ key: 'a', label: 'France Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Morocco Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 10, winner_count: 8, status: 'open',
      entry_count: 67, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100007, date: '2026-06-13T19:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'Arrowhead Stadium', city: 'Kansas City' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 9,   name: 'Spain',       logo: flag('es') }, away: { id: 85,  name: 'Croatia',      logo: flag('hr') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-7', question: 'Who will win?',
      options: [{ key: 'a', label: 'Spain Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Croatia Win' }],
      correct_option: null, prize_type: 'merch', prize_usd: null, prize_description: 'Signed Spain Match Ball', winner_count: 2, status: 'open',
      entry_count: 113, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100008, date: '2026-06-13T22:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'NRG Stadium', city: 'Houston' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 25,  name: 'Germany',     logo: flag('de') }, away: { id: 1178, name: 'Scotland',    logo: flag('gb-sct') } },
    goals:   { home: null, away: null },
    freeGame: null,
  },
  {
    fixture: { id: 1100009, date: '2026-06-14T16:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'BC Place', city: 'Vancouver' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 21,  name: 'Portugal',    logo: flag('pt') }, away: { id: 63,  name: 'Czechia',      logo: flag('cz') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-9', question: 'Who will win?',
      options: [{ key: 'a', label: 'Portugal Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Czechia Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 12, winner_count: 5, status: 'open',
      entry_count: 54, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100010, date: '2026-06-14T19:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'BMO Field', city: 'Toronto' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 18,  name: 'Netherlands', logo: flag('nl') }, away: { id: 68,  name: 'Senegal',      logo: flag('sn') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-10', question: 'Who will win?',
      options: [{ key: 'a', label: 'Netherlands Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Senegal Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 18, winner_count: 7, status: 'open',
      entry_count: 77, correct_count: 0,
    },
  },
  {
    fixture: { id: 1100011, date: '2026-06-14T22:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'Estadio BBVA', city: 'Monterrey' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 3,   name: 'Canada',      logo: flag('ca') }, away: { id: 71,  name: 'Colombia',     logo: flag('co') } },
    goals:   { home: null, away: null },
    freeGame: null,
  },
  {
    fixture: { id: 1100012, date: '2026-06-15T16:00:00+00:00', status: { short: 'NS', long: 'Not Started' }, venue: { name: 'Lincoln Financial Field', city: 'Philadelphia' } },
    league:  { round: 'Group Stage - 1' },
    teams:   { home: { id: 1,   name: 'Belgium',     logo: flag('be') }, away: { id: 92,  name: 'Egypt',       logo: flag('eg') } },
    goals:   { home: null, away: null },
    freeGame: {
      id: 'wg-12', question: 'Who will win?',
      options: [{ key: 'a', label: 'Belgium Win' }, { key: 'b', label: 'Draw' }, { key: 'c', label: 'Egypt Win' }],
      correct_option: null, prize_type: 'cash', prize_usd: 10, winner_count: 6, status: 'open',
      entry_count: 39, correct_count: 0,
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function isLive(s)     { return ['1H','HT','2H','ET','BT','P','INT'].includes(s); }
function isFinished(s) { return ['FT','AET','PEN'].includes(s); }

function kickoffTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';
}

function groupByDate(fixtures) {
  const map = new Map();
  for (const f of fixtures) {
    const day = f.fixture.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(f);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function formatDay(dateStr) {
  const d     = new Date(dateStr + 'T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diff  = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function prizeBadge(game) {
  if (game.prize_type === 'merch') return { label: game.prize_description, color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' };
  return { label: `$${game.prize_usd} cash`, color: 'text-[#F5C518] bg-[#F5C518]/10 border-[#F5C518]/30' };
}

// ── Prediction section inside a match card ────────────────────────────────────
function PredictionPanel({ fixtureId, game, isAuthenticated }) {
  const navigate = useNavigate();
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const settled  = game.status === 'settled';
  const closed   = game.status === 'closed';
  const { label: prizeLabel, color: prizeColor } = prizeBadge(game);

  const handleSubmit = async () => {
    if (!requireAuth(navigate, isAuthenticated)) return;
    if (!selected) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('winalott_token');
    try {
      const res  = await fetch(`${API_BASE}/worldcup/games/${fixtureId}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ option_key: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
    } catch (err) {
      // Mock success in dev
      if (err.message.includes('fetch')) { setSubmitted(true); return; }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Settled: show result
  if (settled) {
    const won = game.options?.find(o => o.key === game.correct_option);
    return (
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-white/40 font-medium">{game.question}</span>
          <span className="text-white/30">{game.entry_count} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <FiCheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <span className="text-green-300 text-xs font-bold">Result: {won?.label || '—'} · {game.winner_count} winner{game.winner_count !== 1 ? 's' : ''} · <span className={`${prizeColor.split(' ')[0]} font-bold`}>{prizeLabel}</span> each</span>
        </div>
      </div>
    );
  }

  // Closed: awaiting result
  if (closed) {
    return (
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-orange-300">
          <FiClock className="w-3.5 h-3.5 shrink-0" />
          Predictions closed · awaiting match result · {game.entry_count} entered
        </div>
      </div>
    );
  }

  // Submitted confirmation
  if (submitted) {
    return (
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2.5">
          <FiCheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <p className="text-green-300 text-xs font-black">Prediction submitted!</p>
            <p className="text-white/40 text-[11px]">If you're correct you'll enter the draw for <span className={prizeColor.split(' ')[0]}>{prizeLabel}</span>.</p>
          </div>
        </div>
      </div>
    );
  }

  // Open: show prediction form
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FiGift className="w-3.5 h-3.5 text-[#F5C518]" />
          <span className="text-[#F5C518] text-[11px] font-black uppercase tracking-wider">FREE · Win {prizeLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-white/30 text-[11px]">
          <FiUsers className="w-3 h-3" />{game.entry_count} entered · {game.winner_count} winners
        </div>
      </div>

      {/* Question */}
      <p className="text-white/70 text-xs font-semibold">{game.question}</p>

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {game.options.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              selected === opt.key
                ? 'bg-[#F5C518] text-[#1A1A2E] border-[#F5C518]'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-[11px]">{error}</p>}

      {/* Submit */}
      {!isAuthenticated ? (
        <button
          onClick={() => requireAuth(navigate, false)}
          className="flex items-center justify-center gap-1.5 w-full border border-white/20 text-white/60 text-xs font-semibold py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <FiLogIn className="w-3.5 h-3.5" /> Log in to predict
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full bg-[#F5C518] text-[#1A1A2E] text-xs font-black py-2 rounded-lg hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting…' : selected ? `Submit: ${game.options.find(o => o.key === selected)?.label}` : 'Select an option'}
        </button>
      )}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ item, isAuthenticated }) {
  const navigate = useNavigate();
  const { fixture, teams, goals, freeGame } = item;
  const live     = isLive(fixture.status.short);
  const finished = isFinished(fixture.status.short);

  const goToMatch = () => navigate(`/worldcup/match/${fixture.id}`, { state: { item } });
  const goToTeam = (team, opponent, e) => {
    e.stopPropagation();
    navigate(`/team/${team.id}`, {
      state: {
        teamId:   team.id,
        teamName: team.name,
        teamLogo: team.logo,
        league:   item.league?.name || 'FIFA World Cup 2026',
        fromMatch: {
          title: `${teams.home.name} vs ${teams.away.name}`,
          path:  `/worldcup/match/${fixture.id}`,
          state: { item },
        },
        opponent: opponent ? { id: opponent.id, name: opponent.name, logo: opponent.logo } : null,
      },
    });
  };

  return (
    <div
      onClick={goToMatch}
      className={`bg-white/5 border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${
        live ? 'border-green-500/40 shadow-green-500/10 shadow-lg' : 'border-white/10'
      }`}
    >
      {live && <div className="h-0.5 bg-gradient-to-r from-green-400 via-green-300 to-green-400 animate-pulse" />}

      <div className="p-4">
        {/* Round + venue */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{item.league?.round}</span>
          <span className="text-[10px] text-white/30 flex items-center gap-0.5"><FiMapPin className="w-2.5 h-2.5" />{fixture.venue?.city}</span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2 mb-1">
          {/* Home team — click navigates to team page */}
          <button
            onClick={e => goToTeam(teams.home, teams.away, e)}
            className="flex flex-col items-center flex-1 gap-1 rounded-xl hover:bg-white/10 px-1 py-1 transition-colors"
          >
            <img src={teams.home.logo} alt={teams.home.name} className="w-9 h-9 object-contain" onError={e => { e.target.style.display='none'; }} />
            <span className="text-white font-black text-xs text-center leading-tight">{teams.home.name}</span>
          </button>

          <div className="flex flex-col items-center gap-0.5 min-w-[60px] shrink-0">
            {(live || finished) ? (
              <div className="text-white font-black text-xl tabular-nums">
                {goals.home ?? 0}<span className="text-white/30 mx-1">:</span>{goals.away ?? 0}
              </div>
            ) : (
              <div className="text-white/60 font-bold text-xs">{kickoffTime(fixture.date)}</div>
            )}
            {live && (
              <span className="flex items-center gap-1 text-green-400 text-[10px] font-black">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {fixture.status.elapsed ? `${fixture.status.elapsed}'` : 'LIVE'}
              </span>
            )}
            {finished && <span className="text-white/30 text-[10px] font-bold">FT</span>}
            {!live && !finished && <span className="text-white/20 text-[10px]">kick-off</span>}
          </div>

          {/* Away team */}
          <button
            onClick={e => goToTeam(teams.away, teams.home, e)}
            className="flex flex-col items-center flex-1 gap-1 rounded-xl hover:bg-white/10 px-1 py-1 transition-colors"
          >
            <img src={teams.away.logo} alt={teams.away.name} className="w-9 h-9 object-contain" onError={e => { e.target.style.display='none'; }} />
            <span className="text-white font-black text-xs text-center leading-tight">{teams.away.name}</span>
          </button>
        </div>

        {/* "Click for details" hint */}
        <div className="flex items-center justify-center gap-1 text-white/20 text-[10px] mb-2">
          <FiChevronDown className="w-3 h-3" /> Tap for lineups &amp; stats
        </div>

        {/* Free prediction game — stop propagation so it doesn't navigate */}
        <div onClick={e => e.stopPropagation()}>
          {freeGame ? (
            <PredictionPanel
              fixtureId={String(fixture.id)}
              game={freeGame}
              isAuthenticated={isAuthenticated}
            />
          ) : (
            <div className="mt-1 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-white/25 text-[11px] flex items-center gap-1"><FiLock className="w-3 h-3" />No free game yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['All Games', 'Live Now', 'With Free Game'];

// ── Fixtures cache (stale-while-revalidate) ───────────────────────────────────
const CACHE_KEY = 'wc_fixtures_v2';
const CACHE_TTL = 2 * 60 * 1000; // 2 min — short enough to catch live score changes

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null; // expired
    return data;
  } catch { return null; }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

export default function WorldCup() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('winalott_token');

  // Lazy init from cache — first render shows cached data immediately, no flash
  const [fixtures,   setFixtures]   = useState(() => readCache() || []);
  const [loading,    setLoading]    = useState(() => !readCache()); // only show spinner on first-ever load
  const [refreshing, setRefreshing] = useState(false);             // silent bg refresh indicator
  const [tab,        setTab]        = useState('All Games');

  useEffect(() => {
    const hasCached = fixtures.length > 0;
    if (!hasCached) setLoading(true);
    else setRefreshing(true);

    fetch(`${API_BASE}/worldcup/fixtures`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length) {
          setFixtures(d.data);
          writeCache(d.data);
        }
      })
      .catch(() => { if (!hasCached) setFixtures(MOCK_FIXTURES); })
      .finally(() => { setLoading(false); setRefreshing(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (() => {
    if (tab === 'Live Now')       return fixtures.filter(f => isLive(f.fixture.status.short));
    if (tab === 'With Free Game') return fixtures.filter(f => f.freeGame && f.freeGame.status === 'open');
    return fixtures;
  })();

  const groups        = groupByDate(filtered);
  const liveCount     = fixtures.filter(f => isLive(f.fixture.status.short)).length;
  const openGameCount = fixtures.filter(f => f.freeGame?.status === 'open').length;

  return (
    <div className="min-h-screen bg-[#0D2B5E] dark:bg-[#060f22]">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#1A4D8F]/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] rounded-full bg-[#F5C518]/10 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-xs font-black uppercase tracking-widest">Now Live · FIFA World Cup 2026</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-2 leading-none">
            WORLD CUP
            <span className="block text-[#F5C518]">FREE GAMES</span>
          </h1>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-4 text-white/50 text-sm">
            <span className="flex items-center gap-1.5"><FiMapPin className="w-4 h-4" />USA · Canada · Mexico</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4" />Jun 11 – Jul 19, 2026</span>
          </div>

          <p className="text-white/40 text-sm mb-8 max-w-xl mx-auto">
            Predict each match result for <span className="text-[#F5C518] font-bold">free</span>. Get it right and enter the draw — win cash or merch. No entry fee, ever.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: FiZap,   label: 'Live Now',       value: liveCount,     color: 'text-green-400' },
              { icon: FiGift,  label: 'Open Free Games', value: openGameCount, color: 'text-[#F5C518]' },
              { icon: FiAward, label: 'Total Fixtures',  value: fixtures.length, color: 'text-white/60' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <Icon className={`w-4 h-4 ${color}`} />
                <div>
                  <p className={`font-black text-lg leading-none ${color}`}>{value}</p>
                  <p className="text-white/30 text-[11px] font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex gap-0 mb-8 border-b border-white/10">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-[#F5C518] text-[#F5C518]' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {t}
              {t === 'Live Now' && liveCount > 0 && (
                <span className="ml-1.5 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{liveCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <FiFlag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No matches found for this filter</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map(([day, items]) => (
              <div key={day}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white font-black text-lg">{formatDay(day)}</h2>
                  <span className="text-white/30 text-sm">
                    {new Date(day + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">{items.length} match{items.length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <MatchCard
                      key={item.fixture.id}
                      item={item}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 text-center border-t border-white/10 pt-10">
          <p className="text-white/40 text-sm mb-4">
            All World Cup predictions are free. Cash prizes credited to your wallet. Merch winners will be emailed for their delivery address.
          </p>
          <Link
            to="/how-to-play"
            className="inline-flex items-center gap-2 border border-white/20 text-white/60 font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            How It Works <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
