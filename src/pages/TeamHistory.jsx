import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiActivity, FiBarChart2, FiList, FiWifi,
  FiAlertCircle, FiLoader, FiUsers, FiTarget, FiTrendingUp,
  FiShield, FiAward, FiGrid,
} from 'react-icons/fi';
import TeamAvatar from '../components/ui/TeamAvatar';
import { useMatchDetail } from '../hooks/useMatchDetail';
import { liveApi } from '../api/liveApi';
import { normalizeMatch } from '../api/normalizers';

// ── League ID map ────────────────────────────────────────────────────────────
const LEAGUE_IDS = {
  'Premier League': 39, 'La Liga': 140, 'Bundesliga': 78, 'Serie A': 135,
  'Ligue 1': 61, 'Champions League': 2, 'Europa League': 3,
  'Conference League': 848, 'Primeira Liga': 94, 'Eredivisie': 88,
  'Super Lig': 203, 'MLS': 253, 'Saudi Pro League': 307,
  'Scottish Premiership': 179, 'Copa Libertadores': 13,
  'World Cup': 1, 'AFCON': 6, 'Copa America': 9,
};

const TABS = [
  { key: 'form',     label: 'Form',        Icon: FiActivity },
  { key: 'stats',    label: 'Stats',       Icon: FiBarChart2 },
  { key: 'squad',    label: 'Squad',       Icon: FiUsers },
  { key: 'matches',  label: 'Matches',     Icon: FiList },
  { key: 'h2h',      label: 'H2H',         Icon: FiWifi },
  { key: 'table',    label: 'Table',       Icon: FiGrid },
];

// ── Mock data helpers ─────────────────────────────────────────────────────────

function seed(str) {
  return String(str).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

function mockTeamStats(team) {
  const s    = seed(team?.name || '');
  const pool = ['W','W','D','W','L','W','D','W','L','W'];
  const form = Array.from({ length: 10 }, (_, i) => pool[(s + i) % pool.length]);
  const f5   = form.slice(0, 5);
  const wins = form.filter(r => r === 'W').length;
  const drws = form.filter(r => r === 'D').length;
  const gf   = 28 + (s % 22);
  const ga   = 14 + (s % 16);
  const pos  = 1 + (s % 14);
  return {
    leaguePosition: pos, played: 30, points: wins * 3 + drws,
    form: f5,
    record: { wins, draws: drws, losses: 10 - wins - drws },
    homeRecord: { wins: Math.ceil(wins * 0.6), draws: Math.ceil(drws * 0.5), losses: Math.floor((10 - wins - drws) * 0.4) },
    awayRecord: { wins: Math.floor(wins * 0.4), draws: Math.floor(drws * 0.5), losses: Math.ceil((10 - wins - drws) * 0.6) },
    goals: { scored: gf, conceded: ga, avgScored: (gf / 30).toFixed(1), avgConceded: (ga / 30).toFixed(1) },
    cleanSheets: 6 + (s % 8),
    failedToScore: 3 + (s % 5),
    biggestWin: `${2 + (s % 3)}-0`,
    biggestLoss: `0-${2 + ((s * 3) % 3)}`,
    currentStreak: wins > 7 ? `${2 + (s % 4)}W` : drws > 3 ? '1D' : '1L',
    shots: 280 + (s % 80),
    shotsOnTarget: 120 + (s % 40),
    shotAccuracy: (42 + (s % 15)) + '%',
    possession: 48 + (s % 14),
    passes: 14000 + (s % 3000),
    passAccuracy: (80 + (s % 12)) + '%',
    corners: 120 + (s % 50),
    fouls: 280 + (s % 60),
    offsides: 40 + (s % 30),
    yellowCards: 48 + (s % 20),
    redCards: s % 4,
    saves: 80 + (s % 30),
    xG: (gf * 0.9 + (s % 8) * 0.1).toFixed(1),
    xGA: (ga * 0.9 + (s % 5) * 0.1).toFixed(1),
    recentMatches: Array.from({ length: 10 }, (_, i) => {
      const rs = s + i * 31;
      const ops = ['Arsenal','Liverpool','Man City','Chelsea','Tottenham','Man Utd','Newcastle','Brighton','Aston Villa','West Ham','Wolves','Brentford'];
      const comps = ['Premier League','Champions League','FA Cup','Premier League','Premier League'];
      return {
        opponent: ops[rs % ops.length],
        homeOrAway: i % 2 === 0 ? 'H' : 'A',
        score: `${(rs * 2) % 4} - ${(rs * 3) % 3}`,
        result: form[(s + i) % form.length],
        competition: comps[i % comps.length],
        date: new Date(Date.now() - (i + 1) * 7 * 86400000)
               .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };
    }),
    squad: [
      ...Array.from({ length: 3 }, (_, i) => ({ name: mockName(s + i), pos: 'GK', number: 1 + i * 12, nat: mockNat(s + i) })),
      ...Array.from({ length: 8 }, (_, i) => ({ name: mockName(s + 100 + i), pos: 'DEF', number: 2 + i, nat: mockNat(s + 100 + i) })),
      ...Array.from({ length: 8 }, (_, i) => ({ name: mockName(s + 200 + i), pos: 'MID', number: 8 + i, nat: mockNat(s + 200 + i) })),
      ...Array.from({ length: 6 }, (_, i) => ({ name: mockName(s + 300 + i), pos: 'FWD', number: 7 + i * 3, nat: mockNat(s + 300 + i) })),
    ],
  };
}

const FIRST_NAMES = ['Marcus','Kevin','Erling','Kylian','Vinicius','Pedri','Bellingham','Salah','Saka','Mbappe','Lewandowski','Kane','Messi','Ronaldo','Haaland','Modric','Kroos','Neymar','De Bruyne','Thiago'];
const LAST_NAMES  = ['Smith','Müller','García','Johnson','Brown','Silva','Fernandez','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark'];
const NATIONALITIES = ['England','Germany','Spain','France','Brazil','Argentina','Portugal','Netherlands','Italy','Nigeria','Senegal','Ivory Coast','Ghana','Denmark','Belgium'];

function mockName(s) {
  return `${FIRST_NAMES[s % FIRST_NAMES.length]} ${LAST_NAMES[(s * 3) % LAST_NAMES.length]}`;
}
function mockNat(s) {
  return NATIONALITIES[s % NATIONALITIES.length];
}

function mockH2H(home, away) {
  const s = seed((home?.name || '') + (away?.name || ''));
  return {
    summary: { homeWins: 3 + (s % 4), draws: 2 + (s % 3), awayWins: 1 + ((s * 2) % 4) },
    meetings: Array.from({ length: 8 }, (_, i) => {
      const r = ['W','D','L','W','L','D','W','L'][(s + i) % 8];
      const hg = (s + i) % 4;
      const ag = (s + i + 1) % 3;
      return {
        date: new Date(Date.now() - (i + 1) * 90 * 86400000)
               .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
        home: home?.name?.split(' ')[0] || 'Home',
        away: away?.name?.split(' ')[0] || 'Away',
        homeGoals: hg, awayGoals: ag,
        result: r,
        competition: i % 3 === 0 ? 'Champions League' : i % 2 === 0 ? 'FA Cup' : 'Premier League',
      };
    }),
  };
}

function mockStandings(teamName, league) {
  const s = seed(league || '');
  const teams = ['Arsenal','Manchester City','Liverpool','Chelsea','Tottenham','Manchester Utd',
                 'Newcastle','Brighton','Aston Villa','West Ham','Brentford','Fulham',
                 'Crystal Palace','Wolves','Everton','Nottm Forest','Bournemouth','Luton',
                 'Burnley','Sheffield Utd'];
  const myPos = 1 + (seed(teamName || '') % 10);
  return teams.slice(0, 12).map((t, i) => {
    const ts = seed(t);
    const w = 16 - i + (ts % 4);
    const d = 6 - Math.floor(i / 3) + (ts % 3);
    const l = 30 - w - d;
    const gf = w * 2 + d + (ts % 10);
    const ga = l * 1.5 + (ts % 8);
    return {
      position: i + 1, team: i === myPos - 1 ? teamName || t : t,
      played: 30, won: w, drawn: d, lost: l,
      gf: Math.round(gf), ga: Math.round(ga),
      gd: Math.round(gf - ga), points: w * 3 + d,
      form: ['W','W','D','W','L'].map((_, fi) => ['W','D','L','W','W'][(ts + fi) % 3 === 0 ? 0 : (ts + fi) % 3 === 1 ? 1 : 2]),
      isCurrentTeam: i + 1 === myPos,
    };
  }).sort((a, b) => b.points - a.points || b.gd - a.gd).map((t, i) => ({ ...t, position: i + 1 }));
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function FormPill({ result, size = 'sm' }) {
  const sz  = size === 'lg' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  const cls = result === 'W' ? 'bg-green-500 text-white'
    : result === 'D' ? 'bg-yellow-400 text-[#1A1A2E]'
    : 'bg-red-500 text-white';
  return <span className={`${sz} rounded-lg font-black flex items-center justify-center shrink-0 ${cls}`}>{result}</span>;
}

function StatBar({ label, homeVal, awayVal, homeColor = 'bg-[#1A4D8F]', awayColor = 'bg-red-400' }) {
  const h = Number(homeVal) || 0;
  const a = Number(awayVal) || 0;
  const total = (h + a) || 1;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5 font-semibold">
        <span className="text-[#1A4D8F] dark:text-blue-400">{homeVal ?? 0}</span>
        <span className="text-gray-400 dark:text-slate-500 text-xs">{label}</span>
        <span className="text-red-500">{awayVal ?? 0}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        <div style={{ width: `${(h / total) * 100}%` }} className={`${homeColor} transition-all duration-700`} />
        <div className={`flex-1 ${awayColor}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-[#1A4D8F]', bg = 'bg-blue-50 dark:bg-blue-950/40' }) {
  return (
    <div className={`${bg} rounded-2xl p-3 text-center`}>
      <p className={`text-2xl font-black ${color} dark:text-inherit`}>{value}</p>
      <p className="text-xs font-bold text-gray-600 dark:text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function SkeletonRows({ n = 5 }) {
  return (
    <div className="space-y-2.5">
      {Array(n).fill(0).map((_, i) => (
        <div key={i} className="h-11 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function FormTab({ stats, team }) {
  if (!stats) return <SkeletonRows />;
  const { form, record, homeRecord, awayRecord, goals, cleanSheets, currentStreak, leaguePosition, biggestWin, biggestLoss, xG, xGA } = stats;
  return (
    <div className="space-y-6">
      {/* Form + quick summary */}
      <div>
        <p className="section-label">Last 5 Results</p>
        <div className="flex gap-2.5 mb-4">
          {(form || []).map((r, i) => <FormPill key={i} result={r} size="lg" />)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Wins"   value={record?.wins   ?? 0} color="text-green-600" bg="bg-green-50 dark:bg-green-950/40" />
          <StatCard label="Draws"  value={record?.draws  ?? 0} color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-950/40" />
          <StatCard label="Losses" value={record?.losses ?? 0} color="text-red-500" bg="bg-red-50 dark:bg-red-950/40" />
        </div>
      </div>

      {/* League snapshot */}
      <div>
        <p className="section-label">Season Snapshot</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard label="Position"    value={`#${leaguePosition ?? '—'}`} color="text-[#1A4D8F]" />
          <StatCard label="Clean Sheets" value={cleanSheets ?? 0} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/40" />
          <StatCard label="xG"          value={xG ?? '—'} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-950/40" sub="Expected goals" />
          <StatCard label="xGA"         value={xGA ?? '—'} color="text-red-500" bg="bg-red-50 dark:bg-red-950/40" sub="Expected conceded" />
        </div>
      </div>

      {/* Goals */}
      <div>
        <p className="section-label">Goals</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-[#1A4D8F] dark:text-blue-400">{goals?.scored ?? '—'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Scored</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{goals?.avgScored ?? '—'} per game</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-red-500">{goals?.conceded ?? '—'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Conceded</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{goals?.avgConceded ?? '—'} per game</p>
          </div>
        </div>
      </div>

      {/* Home vs Away split */}
      <div>
        <p className="section-label">Home vs Away Record</p>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'Home', r: homeRecord, color: 'text-[#1A4D8F]', bg: 'bg-blue-50 dark:bg-blue-950/40' },
            { label: 'Away', r: awayRecord,  color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/40' }].map(({ label, r, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <p className={`text-xs font-black uppercase tracking-wider mb-2 ${color}`}>{label}</p>
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <p className="text-lg font-black text-green-600">{r?.wins ?? 0}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">W</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-yellow-600">{r?.draws ?? 0}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">D</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-red-500">{r?.losses ?? 0}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">L</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5 flex justify-between">
          <span className="text-gray-500 dark:text-slate-400 text-xs">Biggest Win</span>
          <span className="font-black text-green-600">{biggestWin ?? '—'}</span>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5 flex justify-between">
          <span className="text-gray-500 dark:text-slate-400 text-xs">Biggest Loss</span>
          <span className="font-black text-red-500">{biggestLoss ?? '—'}</span>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5 flex justify-between col-span-2">
          <span className="text-gray-500 dark:text-slate-400 text-xs">Current Streak</span>
          <span className="font-black text-[#1A4D8F] dark:text-blue-400">{currentStreak ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function StatsTab({ stats, team, opponent }) {
  if (!stats) return <SkeletonRows />;
  const s = stats;
  const oppStats = mockTeamStats(opponent);
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold mb-5 px-1">
        <span className="text-[#1A4D8F] dark:text-blue-400 truncate max-w-[120px]">{team?.name?.split(' ')[0]}</span>
        <span className="text-gray-400 dark:text-slate-500 text-xs">Season Comparison</span>
        <span className="text-red-500 truncate max-w-[120px] text-right">{opponent?.name?.split(' ')[0]}</span>
      </div>
      <StatBar label="Goals Scored"     homeVal={s.goals?.scored}    awayVal={oppStats.goals.scored} />
      <StatBar label="Goals Conceded"   homeVal={s.goals?.conceded}  awayVal={oppStats.goals.conceded} />
      <StatBar label="Clean Sheets"     homeVal={s.cleanSheets}      awayVal={oppStats.cleanSheets} />
      <StatBar label="xG"               homeVal={s.xG}               awayVal={oppStats.xG} />
      <StatBar label="Shots"            homeVal={s.shots}            awayVal={oppStats.shots} />
      <StatBar label="Shots on Target"  homeVal={s.shotsOnTarget}    awayVal={oppStats.shotsOnTarget} />
      <StatBar label="Possession %"     homeVal={s.possession}       awayVal={100 - (s.possession || 50)} />
      <StatBar label="Pass Accuracy %"  homeVal={s.passAccuracy?.replace('%','')} awayVal={oppStats.passAccuracy?.replace('%','')} />
      <StatBar label="Corners"          homeVal={s.corners}          awayVal={oppStats.corners} />
      <StatBar label="Fouls"            homeVal={s.fouls}            awayVal={oppStats.fouls} />
      <StatBar label="Offsides"         homeVal={s.offsides}         awayVal={oppStats.offsides} />
      <StatBar label="Yellow Cards"     homeVal={s.yellowCards}      awayVal={oppStats.yellowCards} />
      <StatBar label="Red Cards"        homeVal={s.redCards}         awayVal={oppStats.redCards} />
      <StatBar label="Saves"            homeVal={s.saves}            awayVal={oppStats.saves} />
    </div>
  );
}

const POS_ORDER = ['GK', 'DEF', 'MID', 'FWD'];
const POS_LABELS = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };
const POS_COLORS = {
  GK:  'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400',
  DEF: 'bg-blue-100 dark:bg-blue-950/40 text-[#1A4D8F] dark:text-blue-400',
  MID: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  FWD: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
};

function SquadTab({ stats, loading: squadLoading }) {
  if (squadLoading) return <SkeletonRows n={8} />;
  const players = stats?.squad || [];
  if (!players.length) return <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-10">No squad data available</p>;

  return (
    <div className="space-y-5">
      {POS_ORDER.map(pos => {
        const group = players.filter(p => p.pos === pos);
        if (!group.length) return null;
        return (
          <div key={pos}>
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              {POS_LABELS[pos]} ({group.length})
            </p>
            <div className="space-y-1.5">
              {group.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5">
                  <span className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black text-gray-600 dark:text-slate-300 shrink-0">
                    {p.number}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${POS_COLORS[p.pos]}`}>
                    {p.pos}
                  </span>
                  <span className="text-sm font-semibold text-[#1A1A2E] dark:text-white flex-1 truncate">{p.name}</span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">{p.nat}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchesTab({ stats }) {
  if (!stats) return <SkeletonRows />;
  const matches = stats.recentMatches || [];
  if (!matches.length) return <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-10">No matches found</p>;
  return (
    <div className="space-y-2">
      {matches.map((m, i) => (
        <div key={i} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                m.homeOrAway === 'H' ? 'bg-blue-100 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300'
              }`}>{m.homeOrAway}</span>
              <div className="min-w-0">
                <p className="text-sm text-gray-700 dark:text-slate-200 font-semibold truncate">vs {m.opponent}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500">{m.competition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black text-[#1A1A2E] dark:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-2 py-0.5 rounded-lg">{m.score}</span>
              <FormPill result={m.result} />
              <span className="text-[10px] text-gray-400 dark:text-slate-500 w-12 text-right">{m.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function H2HTab({ h2h, homeTeam, awayTeam }) {
  if (!h2h) return <SkeletonRows />;
  const { summary, meetings } = h2h;
  const total = (summary.homeWins || 0) + (summary.draws || 0) + (summary.awayWins || 0);
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold mb-2 px-1">
          <span className="text-[#1A4D8F] dark:text-blue-400 truncate max-w-[100px]">{homeTeam?.name?.split(' ').pop()}</span>
          <span className="text-gray-400 dark:text-slate-500">Last {total} Meetings</span>
          <span className="text-red-500 truncate max-w-[100px] text-right">{awayTeam?.name?.split(' ').pop()}</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div style={{ width: `${((summary.homeWins || 0) / total) * 100}%` }} className="bg-[#1A4D8F] transition-all duration-700" />
          <div style={{ width: `${((summary.draws || 0) / total) * 100}%` }} className="bg-gray-300 dark:bg-slate-500" />
          <div style={{ flex: 1 }} className="bg-red-400" />
        </div>
        <div className="flex justify-between text-[10px] font-bold mt-1 px-0.5">
          <span className="text-[#1A4D8F] dark:text-blue-400">{summary.homeWins} W</span>
          <span className="text-gray-400 dark:text-slate-500">{summary.draws} D</span>
          <span className="text-red-500">{summary.awayWins} W</span>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={homeTeam?.name?.split(' ')[0] || 'Home'} value={summary.homeWins} color="text-[#1A4D8F]" />
        <StatCard label="Draws" value={summary.draws} color="text-gray-500" bg="bg-gray-50 dark:bg-slate-700/50" />
        <StatCard label={awayTeam?.name?.split(' ')[0] || 'Away'} value={summary.awayWins} color="text-red-500" bg="bg-red-50 dark:bg-red-950/40" />
      </div>

      {/* Meetings */}
      <div>
        <p className="section-label">Previous Meetings</p>
        <div className="space-y-2">
          {meetings.map((m, i) => (
            <div key={i} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 w-16 shrink-0">{m.date}</span>
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <span className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate max-w-[80px] text-right">{m.home}</span>
                  <span className="text-sm font-black text-[#1A1A2E] dark:text-white shrink-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-2.5 py-0.5 rounded-lg">
                    {m.homeGoals} - {m.awayGoals}
                  </span>
                  <span className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate max-w-[80px]">{m.away}</span>
                </div>
                <FormPill result={m.result} />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 pl-[72px]">{m.competition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableTab({ standings, teamName, loading: tableLoading }) {
  if (tableLoading) return <SkeletonRows n={12} />;
  if (!standings?.length) return <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-10">League table unavailable</p>;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
              <th className="text-left py-2 font-semibold w-6">#</th>
              <th className="text-left py-2 font-semibold">Team</th>
              <th className="py-2 font-semibold w-6 text-center">P</th>
              <th className="py-2 font-semibold w-6 text-center">W</th>
              <th className="py-2 font-semibold w-6 text-center">D</th>
              <th className="py-2 font-semibold w-6 text-center">L</th>
              <th className="py-2 font-semibold w-8 text-center">GD</th>
              <th className="py-2 font-semibold w-8 text-center font-black">Pts</th>
              <th className="py-2 font-semibold w-20 text-center">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                  row.isCurrentTeam
                    ? 'bg-blue-50 dark:bg-blue-950/40 font-bold'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <td className="py-2.5 text-gray-500 dark:text-slate-400">{row.position}</td>
                <td className="py-2.5">
                  <span className={`font-semibold truncate ${row.isCurrentTeam ? 'text-[#1A4D8F] dark:text-blue-400' : 'text-[#1A1A2E] dark:text-slate-200'}`}>
                    {row.team}
                  </span>
                </td>
                <td className="py-2.5 text-center text-gray-500 dark:text-slate-400">{row.played}</td>
                <td className="py-2.5 text-center text-green-600 dark:text-green-400">{row.won}</td>
                <td className="py-2.5 text-center text-yellow-600">{row.drawn}</td>
                <td className="py-2.5 text-center text-red-500">{row.lost}</td>
                <td className={`py-2.5 text-center ${row.gd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {row.gd > 0 ? '+' : ''}{row.gd}
                </td>
                <td className={`py-2.5 text-center font-black text-sm ${row.isCurrentTeam ? 'text-[#1A4D8F] dark:text-blue-400' : 'text-[#1A1A2E] dark:text-white'}`}>
                  {row.points}
                </td>
                <td className="py-2.5">
                  <div className="flex gap-0.5 justify-center">
                    {(row.form || []).map((r, fi) => (
                      <span key={fi} className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                        r === 'W' ? 'bg-green-500 text-white' : r === 'D' ? 'bg-yellow-400 text-[#1A1A2E]' : 'bg-red-500 text-white'
                      }`}>{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeamHistory() {
  const { matchId, side } = useParams();
  const navigate = useNavigate();
  const [activeTeam, setActiveTeam] = useState(side === 'away' ? 'away' : 'home');
  const [tab, setTab] = useState('form');
  const [teamStats, setTeamStats] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loadingStats, setLoadingStats]       = useState(false);
  const [loadingH2h, setLoadingH2h]           = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(false);

  const { match: rawMatch, loading: matchLoading } = useMatchDetail(matchId);
  const match    = rawMatch ? normalizeMatch(rawMatch) : null;
  const homeTeam = match?.homeTeam;
  const awayTeam = match?.awayTeam;
  const team     = activeTeam === 'home' ? homeTeam : awayTeam;
  const opponent = activeTeam === 'home' ? awayTeam : homeTeam;
  const leagueId = LEAGUE_IDS[match?.league] || null;

  useEffect(() => { setActiveTeam(side === 'away' ? 'away' : 'home'); }, [side]);
  useEffect(() => { setTab('form'); setTeamStats(null); }, [activeTeam]);

  // Fetch team stats (search → stats + squad in parallel)
  useEffect(() => {
    if (!team?.name) return;
    setLoadingStats(true);
    setTeamStats(null);

    liveApi.searchTeam(team.name)
      .then(async res => {
        const found = res.data?.data?.teams?.[0] || res.data?.data?.[0];
        const teamId = found?.team?.id;

        if (teamId) {
          const [statsRes, squadRes] = await Promise.allSettled([
            leagueId ? liveApi.getTeamStats(teamId, leagueId) : Promise.resolve(null),
            liveApi.getTeamSquad(teamId),
          ]);

          const apiStats = statsRes.status === 'fulfilled' ? statsRes.value?.data?.data : null;
          const apiSquad = squadRes.status === 'fulfilled' ? squadRes.value?.data?.data : null;

          if (apiStats || apiSquad) {
            const mock = mockTeamStats(team);
            const f = apiStats?.fixtures;
            const g = apiStats?.goals;
            setTeamStats({
              ...mock,
              leaguePosition: apiStats?.league?.round ? parseInt(apiStats.league.round) : mock.leaguePosition,
              played: f?.played?.total || mock.played,
              record: {
                wins:   f?.wins?.total  || mock.record.wins,
                draws:  f?.draws?.total || mock.record.draws,
                losses: f?.loses?.total || mock.record.losses,
              },
              homeRecord: {
                wins:   f?.wins?.home  || mock.homeRecord.wins,
                draws:  f?.draws?.home || mock.homeRecord.draws,
                losses: f?.loses?.home || mock.homeRecord.losses,
              },
              awayRecord: {
                wins:   f?.wins?.away  || mock.awayRecord.wins,
                draws:  f?.draws?.away || mock.awayRecord.draws,
                losses: f?.loses?.away || mock.awayRecord.losses,
              },
              goals: {
                scored:      g?.for?.total?.total   || mock.goals.scored,
                conceded:    g?.against?.total?.total || mock.goals.conceded,
                avgScored:   g?.for?.average?.total  || mock.goals.avgScored,
                avgConceded: g?.against?.average?.total || mock.goals.avgConceded,
              },
              cleanSheets: apiStats?.clean_sheet?.total || mock.cleanSheets,
              squad: apiSquad?.length
                ? apiSquad.map(p => ({
                    name:   p.player?.name || p.name || '—',
                    number: p.player?.number || p.statistics?.[0]?.games?.number || '—',
                    pos:    p.player?.position?.[0]?.toUpperCase() === 'G' ? 'GK'
                            : p.player?.position?.[0]?.toUpperCase() === 'D' ? 'DEF'
                            : p.player?.position?.[0]?.toUpperCase() === 'M' ? 'MID' : 'FWD',
                    nat:    p.player?.nationality || '—',
                  }))
                : mock.squad,
            });
            return;
          }
        }
        setTeamStats(mockTeamStats(team));
      })
      .catch(() => setTeamStats(mockTeamStats(team)))
      .finally(() => setLoadingStats(false));
  }, [team?.name, leagueId]);

  // Fetch H2H on H2H tab
  useEffect(() => {
    if (tab !== 'h2h' || !homeTeam?.name || !awayTeam?.name) return;
    if (h2h) return;
    setLoadingH2h(true);
    liveApi.getH2H(null, null, homeTeam.name, awayTeam.name, leagueId)
      .then(res => {
        const raw = res.data?.data;
        if (raw?.length) {
          const hWins = raw.filter(m => {
            const ht = m.teams?.home?.name === homeTeam.name;
            return ht ? m.goals?.home > m.goals?.away : m.goals?.away > m.goals?.home;
          }).length;
          const draws = raw.filter(m => m.goals?.home === m.goals?.away).length;
          setH2h({
            summary: { homeWins: hWins, draws, awayWins: raw.length - hWins - draws },
            meetings: raw.slice(0, 8).map(m => {
              const isHome = m.teams?.home?.name === homeTeam.name;
              const hg = m.goals?.home ?? 0;
              const ag = m.goals?.away ?? 0;
              const result = hg === ag ? 'D' : (isHome ? hg > ag : ag > hg) ? 'W' : 'L';
              return {
                date:        new Date(m.fixture?.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
                home:        m.teams?.home?.name?.split(' ')[0] || homeTeam.name.split(' ')[0],
                away:        m.teams?.away?.name?.split(' ')[0] || awayTeam.name.split(' ')[0],
                homeGoals:   hg, awayGoals: ag, result,
                competition: m.league?.name || 'League',
              };
            }),
          });
        } else {
          setH2h(mockH2H(homeTeam, awayTeam));
        }
      })
      .catch(() => setH2h(mockH2H(homeTeam, awayTeam)))
      .finally(() => setLoadingH2h(false));
  }, [tab, homeTeam?.name, awayTeam?.name]);

  // Fetch standings on Table tab
  useEffect(() => {
    if (tab !== 'table' || !leagueId || standings) return;
    setLoadingStandings(true);
    liveApi.getStandings(leagueId, 2024)
      .then(res => {
        const raw = res.data?.data;
        if (raw?.length) {
          setStandings(raw.map((r, i) => ({
            position:      r.rank || i + 1,
            team:          r.team?.name || r.name || '—',
            played:        r.all?.played ?? r.played ?? 0,
            won:           r.all?.win  ?? r.won  ?? 0,
            drawn:         r.all?.draw ?? r.drawn ?? 0,
            lost:          r.all?.lose ?? r.lost  ?? 0,
            gf:            r.all?.goals?.for   ?? r.goalsFor ?? 0,
            ga:            r.all?.goals?.against ?? r.goalsAgainst ?? 0,
            gd:            r.goalsDiff ?? 0,
            points:        r.points ?? 0,
            form:          (r.form || '').split('').slice(0, 5),
            isCurrentTeam: r.team?.name === team?.name,
          })));
        } else {
          setStandings(mockStandings(team?.name, match?.league));
        }
      })
      .catch(() => setStandings(mockStandings(team?.name, match?.league)))
      .finally(() => setLoadingStandings(false));
  }, [tab, leagueId, team?.name]);

  const switchTeam = (s) => {
    setActiveTeam(s);
    navigate(`/match/${matchId}/team/${s}`, { replace: true });
  };

  if (matchLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <FiLoader className="w-8 h-8 text-[#1A4D8F] animate-spin" />
        <p className="text-gray-400 text-sm">Loading team data…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Match not found</p>
        <Link to="/lobby" className="text-[#1A4D8F] text-sm font-semibold hover:underline mt-2 inline-block">Back to Lobby</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">

      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(`/match/${matchId}`)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to match
        </button>
        <span className="text-gray-200 dark:text-slate-700">/</span>
        <span className="text-sm text-gray-400 dark:text-slate-500 truncate">{match.league}</span>
      </div>

      {/* Match banner */}
      <div className="bg-gradient-to-r from-[#0D2B5E] to-[#1A4D8F] rounded-2xl px-5 py-4 mb-5 flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar logo={homeTeam?.logo} short={homeTeam?.short} size="md" />
          <p className="text-xs font-bold text-white/80 text-center leading-tight">{homeTeam?.name}</p>
        </div>
        <div className="text-center px-3">
          {match.score ? (
            <p className="text-2xl font-black text-white tabular-nums">{match.score.home} – {match.score.away}</p>
          ) : (
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">vs</p>
          )}
          <p className="text-white/40 text-[10px] mt-0.5">{match.date} · {match.time}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar logo={awayTeam?.logo} short={awayTeam?.short} size="md" />
          <p className="text-xs font-bold text-white/80 text-center leading-tight">{awayTeam?.name}</p>
        </div>
      </div>

      {/* Team selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[{ s: 'home', t: homeTeam }, { s: 'away', t: awayTeam }].map(({ s, t }) => (
          <button key={s} onClick={() => switchTeam(s)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              activeTeam === s
                ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-950/40 dark:border-blue-600'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300'
            }`}
          >
            <TeamAvatar logo={t?.logo} short={t?.short} size="md" />
            <p className={`text-sm font-bold truncate w-full text-center ${activeTeam === s ? 'text-[#1A4D8F] dark:text-blue-400' : 'text-gray-600 dark:text-slate-300'}`}>
              {t?.name}
            </p>
            {activeTeam === s && (
              <span className="text-[10px] font-black text-[#1A4D8F] dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                Viewing
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick stats row */}
      {teamStats && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Position', value: `#${teamStats.leaguePosition}`,  color: 'text-[#1A4D8F] dark:text-blue-400' },
            { label: 'Points',   value: teamStats.points,                color: 'text-green-600 dark:text-green-400' },
            { label: 'Scored',   value: teamStats.goals?.scored,         color: 'text-orange-500' },
            { label: 'Conceded', value: teamStats.goals?.conceded,       color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-2.5 text-center shadow-sm">
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Team heading */}
      <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-4">{team?.name}</h1>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
              tab === key
                ? 'bg-[#1A4D8F] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-[#1A4D8F] hover:text-[#1A4D8F] dark:hover:border-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        {loadingStats && tab !== 'h2h' && tab !== 'table' ? (
          <SkeletonRows />
        ) : tab === 'form' ? (
          <FormTab stats={teamStats} team={team} />
        ) : tab === 'stats' ? (
          <StatsTab stats={teamStats} team={team} opponent={opponent} />
        ) : tab === 'squad' ? (
          <SquadTab stats={teamStats} loading={loadingStats} />
        ) : tab === 'matches' ? (
          <MatchesTab stats={teamStats} />
        ) : tab === 'h2h' ? (
          <H2HTab h2h={loadingH2h ? null : h2h} homeTeam={homeTeam} awayTeam={awayTeam} />
        ) : tab === 'table' ? (
          <TableTab standings={loadingStandings ? null : standings} teamName={team?.name} loading={loadingStandings} />
        ) : null}
      </div>

    </div>
  );
}
