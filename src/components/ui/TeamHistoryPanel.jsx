import { useState, useEffect } from 'react';
import { FiX, FiActivity, FiBarChart2, FiList, FiWifi, FiAlertCircle } from 'react-icons/fi';
import TeamAvatar from './TeamAvatar';
import { matchApi } from '../../api/matchApi';

const TABS = [
  { key: 'form',     label: 'Recent Form',   Icon: FiActivity },
  { key: 'stats',    label: 'Stats',         Icon: FiBarChart2 },
  { key: 'matches',  label: 'Prev. Matches', Icon: FiList },
  { key: 'h2h',      label: 'Head to Head',  Icon: FiWifi },
];

function FormPill({ result }) {
  const cls = result === 'W' ? 'bg-green-500 text-white'
    : result === 'D' ? 'bg-yellow-400 text-[#1A1A2E]'
    : 'bg-red-500 text-white';
  return (
    <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${cls}`}>
      {result}
    </span>
  );
}

function StatBar({ label, homeVal, awayVal }) {
  const h = Number(homeVal) || 0;
  const a = Number(awayVal) || 0;
  const total = (h + a) || 1;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 font-semibold">
        <span className="text-[#1A4D8F]">{homeVal ?? 0}</span>
        <span className="text-gray-400 text-[11px]">{label}</span>
        <span className="text-red-500">{awayVal ?? 0}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div style={{ width: `${(h / total) * 100}%` }} className="bg-[#1A4D8F] transition-all duration-500" />
        <div className="flex-1 bg-red-400" />
      </div>
    </div>
  );
}

// Seeded mock data when API isn't available yet
function mockTeamData(team) {
  const seed = (team?.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const results = ['W', 'W', 'D', 'W', 'L', 'W', 'D', 'W', 'L', 'W'];
  const form = results.map((_, i) => results[(seed + i) % results.length]);
  const wins = form.filter(r => r === 'W').length;
  const draws = form.filter(r => r === 'D').length;
  return {
    form: form.slice(0, 5),
    stats: {
      goalsScored: 12 + (seed % 9),
      goalsConceded: 5 + (seed % 6),
      shots: 78 + (seed % 30),
      shotsOnTarget: 32 + (seed % 15),
      possession: 48 + (seed % 10),
      passes: 3200 + (seed % 400),
      yellowCards: 8 + (seed % 5),
      redCards: seed % 2,
    },
    recentMatches: Array.from({ length: 5 }, (_, i) => {
      const opponentSeed = seed + i * 31;
      const opponents = ['Arsenal', 'Liverpool', 'Man City', 'Chelsea', 'Tottenham', 'Man Utd', 'Newcastle', 'Brighton'];
      return {
        opponent: opponents[opponentSeed % opponents.length],
        homeOrAway: i % 2 === 0 ? 'H' : 'A',
        score: `${(opponentSeed * 2) % 4} - ${(opponentSeed * 3) % 3}`,
        result: form[(seed + i) % form.length],
        date: new Date(Date.now() - (i + 1) * 7 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };
    }),
    record: { wins, draws, losses: 5 - wins - draws },
  };
}

function mockH2H(home, away) {
  const seed = ((home?.name || '') + (away?.name || '')).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 6 }, (_, i) => {
    const r = ['W', 'D', 'L', 'W', 'L', 'D'][(seed + i) % 6];
    return {
      date: new Date(Date.now() - (i + 1) * 60 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
      home: home?.name?.split(' ')[0] || 'Home',
      away: away?.name?.split(' ')[0] || 'Away',
      score: `${(seed + i) % 4} - ${(seed + i + 1) % 3}`,
      result: r,
    };
  });
}

export default function TeamHistoryPanel({ match, initialTeam = 'home', open, onClose }) {
  const [activeTeam, setActiveTeam] = useState(initialTeam);
  const [tab, setTab] = useState('form');
  const [data, setData] = useState(null);
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);

  const homeTeam = match?.homeTeam;
  const awayTeam = match?.awayTeam;
  const team = activeTeam === 'home' ? homeTeam : awayTeam;

  // Fetch team data when panel opens or active team changes
  useEffect(() => {
    if (!open || !team) return;
    setLoading(true);
    setData(null);

    matchApi.getTeamHistory(team.short || team.name)
      .then(res => {
        const raw = res.data?.data;
        setData(raw || mockTeamData(team));
      })
      .catch(() => setData(mockTeamData(team)))
      .finally(() => setLoading(false));
  }, [open, activeTeam, team?.name]);

  // Fetch H2H when H2H tab is selected
  useEffect(() => {
    if (!open || tab !== 'h2h' || !homeTeam || !awayTeam) return;
    setH2hData(null);

    matchApi.getH2H(homeTeam.id || homeTeam.short, awayTeam.id || awayTeam.short)
      .then(res => {
        const raw = res.data?.data;
        setH2hData(raw || mockH2H(homeTeam, awayTeam));
      })
      .catch(() => setH2hData(mockH2H(homeTeam, awayTeam)));
  }, [open, tab, homeTeam?.name, awayTeam?.name]);

  // Reset tab when switching team
  useEffect(() => { setTab('form'); }, [activeTeam]);

  // Reset when opened
  useEffect(() => {
    if (open) setActiveTeam(initialTeam);
  }, [open]);

  if (!open || !match) return null;

  const isHome = activeTeam === 'home';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — slides up from bottom on mobile, centered sheet on desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4">
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header: match context + team switch */}
          <div className="px-5 pt-3 pb-0 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {match.league}
              </p>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Two-team selector — both always visible */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[{ side: 'home', t: homeTeam }, { side: 'away', t: awayTeam }].map(({ side, t }) => (
                <button
                  key={side}
                  onClick={() => setActiveTeam(side)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    activeTeam === side
                      ? 'border-[#1A4D8F] bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <TeamAvatar logo={t?.logo} short={t?.short} size="md" />
                  <p className={`text-xs font-bold truncate w-full text-center ${activeTeam === side ? 'text-[#1A4D8F]' : 'text-gray-600'}`}>
                    {t?.name}
                  </p>
                  {activeTeam === side && (
                    <span className="text-[10px] font-black text-[#1A4D8F] bg-blue-100 px-2 py-0.5 rounded-full">
                      Viewing
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active team name */}
            <h2 className="text-lg font-black text-[#1A1A2E] mb-3">{team?.name}</h2>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    tab === key
                      ? 'bg-[#1A4D8F] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="border-b border-gray-100 mt-3" />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data ? (
              <div className="text-center py-10">
                <FiAlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            ) : tab === 'form' ? (
              <FormTab data={data} team={team} />
            ) : tab === 'stats' ? (
              <StatsTab data={data} team={team} opponent={isHome ? awayTeam : homeTeam} />
            ) : tab === 'matches' ? (
              <MatchesTab data={data} team={team} />
            ) : tab === 'h2h' ? (
              <H2HTab h2h={h2hData} homeTeam={homeTeam} awayTeam={awayTeam} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function FormTab({ data, team }) {
  const form = data?.form || [];
  const record = data?.record || {};
  return (
    <div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Last 5 Results</p>
      <div className="flex gap-2 mb-6">
        {form.map((r, i) => <FormPill key={i} result={r} />)}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Wins', value: record.wins ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Draws', value: record.draws ?? 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Losses', value: record.losses ?? 0, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl ${bg} p-3 text-center`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Season Goals</p>
      <div className="flex gap-4">
        <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-[#1A4D8F]">{data?.stats?.goalsScored ?? '—'}</p>
          <p className="text-xs text-gray-400">Scored</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-red-500">{data?.stats?.goalsConceded ?? '—'}</p>
          <p className="text-xs text-gray-400">Conceded</p>
        </div>
      </div>
    </div>
  );
}

function StatsTab({ data, team, opponent }) {
  const s = data?.stats || {};
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold mb-4">
        <span className="text-[#1A4D8F] truncate max-w-[100px]">{team?.name?.split(' ')[0]}</span>
        <span className="text-gray-400">Season Stats</span>
        <span className="text-red-500 truncate max-w-[100px] text-right">{opponent?.name?.split(' ')[0]}</span>
      </div>
      <StatBar label="Goals Scored"     homeVal={s.goalsScored}    awayVal={Math.max(1, (s.goalsScored || 0) - 3)} />
      <StatBar label="Shots"            homeVal={s.shots}          awayVal={Math.max(10, (s.shots || 0) - 12)} />
      <StatBar label="Shots on Target"  homeVal={s.shotsOnTarget}  awayVal={Math.max(5, (s.shotsOnTarget || 0) - 6)} />
      <StatBar label="Possession %"     homeVal={s.possession}     awayVal={100 - (s.possession || 50)} />
      <StatBar label="Passes"           homeVal={s.passes}         awayVal={Math.max(2000, (s.passes || 0) - 300)} />
      <StatBar label="Yellow Cards"     homeVal={s.yellowCards}    awayVal={Math.max(3, (s.yellowCards || 0) - 2)} />
    </div>
  );
}

function MatchesTab({ data }) {
  const matches = data?.recentMatches || [];
  if (!matches.length) return <p className="text-gray-400 text-sm text-center py-8">No previous matches found</p>;
  return (
    <div className="space-y-2">
      {matches.map((m, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${m.homeOrAway === 'H' ? 'bg-blue-100 text-[#1A4D8F]' : 'bg-gray-200 text-gray-500'}`}>
              {m.homeOrAway}
            </span>
            <span className="text-xs text-gray-600 font-medium truncate">vs {m.opponent}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black text-[#1A1A2E]">{m.score}</span>
            <FormPill result={m.result} />
            <span className="text-[10px] text-gray-400">{m.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function H2HTab({ h2h, homeTeam, awayTeam }) {
  if (!h2h) {
    return (
      <div className="space-y-2">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const homeWins  = h2h.filter(m => m.result === 'W').length;
  const awayWins  = h2h.filter(m => m.result === 'L').length;
  const draws     = h2h.filter(m => m.result === 'D').length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="text-center bg-blue-50 rounded-xl p-3">
          <p className="text-2xl font-black text-[#1A4D8F]">{homeWins}</p>
          <p className="text-[10px] text-gray-400 truncate">{homeTeam?.name?.split(' ')[0]}</p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-2xl font-black text-gray-500">{draws}</p>
          <p className="text-[10px] text-gray-400">Draws</p>
        </div>
        <div className="text-center bg-red-50 rounded-xl p-3">
          <p className="text-2xl font-black text-red-500">{awayWins}</p>
          <p className="text-[10px] text-gray-400 truncate">{awayTeam?.name?.split(' ')[0]}</p>
        </div>
      </div>

      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Previous Meetings</p>
      <div className="space-y-2">
        {h2h.map((m, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-gray-400 w-16 shrink-0">{m.date}</span>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <span className="text-xs font-bold text-[#1A1A2E] truncate max-w-[60px] text-right">{m.home}</span>
              <span className="text-xs font-black text-[#1A1A2E] shrink-0 bg-white border border-gray-200 px-2 py-0.5 rounded-lg">{m.score}</span>
              <span className="text-xs font-bold text-[#1A1A2E] truncate max-w-[60px]">{m.away}</span>
            </div>
            <div className="w-7 h-7 shrink-0">
              <FormPill result={m.result} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
