import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFlag, FiActivity } from 'react-icons/fi';

const POSITIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3'];

function seeded(n, min, max) {
  const x = Math.sin(n * 127.1 + 311.7) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function StatBar({ label, value, max = 100, color = 'bg-[#1A4D8F]' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="font-bold text-[#1A1A2E] dark:text-slate-200">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { state } = useLocation();
  const { slug }  = useParams();
  const navigate  = useNavigate();

  // Accepts { team, league } from MatchCard OR { teamId, teamName, teamLogo } from WC pages
  const team      = state?.team || (state?.teamId ? { id: state.teamId, name: state.teamName, logo: state.teamLogo } : null);
  const league    = state?.league || '';
  const fromMatch = state?.fromMatch || null;   // { title, path, state }
  const opponent  = state?.opponent  || null;   // { id, name, logo }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-gray-400 mb-4">Team not found.</p>
        <Link to="/lobby" className="text-[#1A4D8F] font-semibold text-sm hover:underline">
          Back to Lobby
        </Link>
      </div>
    );
  }

  const seed        = team.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const formation   = POSITIONS[seed % POSITIONS.length];
  const gamesPlayed = seeded(seed, 22, 38);
  const wins        = seeded(seed, 8, 24);
  const draws       = seeded(seed + 1, 3, 10);
  const losses      = gamesPlayed - wins - draws;
  const goalsFor    = seeded(seed + 2, 28, 72);
  const goalsAgainst = seeded(seed + 3, 18, 55);
  const points      = wins * 3 + draws;
  const gd          = goalsFor - goalsAgainst;
  const founded     = seeded(seed, 1890, 1985);
  const capacity    = seeded(seed + 4, 18000, 88000);

  const form = Array.from({ length: 8 }, (_, i) => {
    const r = seeded(seed + i * 13, 0, 2);
    return r === 0 ? 'W' : r === 1 ? 'D' : 'L';
  });

  const possession    = seeded(seed + 5, 42, 62);
  const shotsPerGame  = seeded(seed + 6, 8, 18);
  const passAccuracy  = seeded(seed + 7, 72, 91);
  const cleanSheets   = seeded(seed + 8, 4, 16);
  const xG            = (seeded(seed + 9, 8, 22) / 10).toFixed(1);
  const pressureScore = seeded(seed + 10, 55, 90);

  const RECENT_MATCHES = Array.from({ length: 5 }, (_, i) => {
    const opponents = ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham',
                       'Bayer Leverkusen', 'PSG', 'Bayern Munich', 'Real Madrid', 'Barcelona'];
    const opp = opponents[(seed + i * 7) % opponents.length];
    const isHome = seeded(seed + i * 3, 0, 1) === 0;
    const hg = seeded(seed + i * 17, 0, 4);
    const ag = seeded(seed + i * 19, 0, 3);
    const res = isHome ? (hg > ag ? 'W' : hg < ag ? 'L' : 'D') : (ag > hg ? 'W' : ag < hg ? 'L' : 'D');
    return { opponent: opp, isHome, hg, ag, res };
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-[#0D2B5E] via-[#1A4D8F] to-[#0D2B5E] overflow-hidden">
        {/* Background logo watermark */}
        {team.logo && (
          <img
            src={team.logo}
            alt=""
            className="absolute right-0 top-0 h-full w-auto object-contain opacity-5 pointer-events-none select-none"
          />
        )}

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {/* Navigation row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            {fromMatch ? (
              <button
                onClick={() => navigate(fromMatch.path, { state: fromMatch.state })}
                className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                {fromMatch.title}
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Link to the other team in this match */}
            {opponent && (
              <button
                onClick={() => navigate(`/team/${opponent.id}`, {
                  state: {
                    teamId: opponent.id, teamName: opponent.name, teamLogo: opponent.logo,
                    league,
                    fromMatch,
                    opponent: { id: team.id, name: team.name, logo: team.logo },
                  },
                })}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                {opponent.logo && (
                  <img src={opponent.logo} alt={opponent.name} className="w-4 h-4 object-contain" onError={e => e.target.style.display='none'} />
                )}
                View {opponent.name} Stats
                <FiArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Team crest */}
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl bg-white/10 rounded-2xl p-2 shrink-0"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black text-white shrink-0">
                {team.short}
              </div>
            )}

            {/* Info */}
            <div className="text-center sm:text-left">
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">{league}</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">{team.name}</h1>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-3">
                <span className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                  <FiFlag className="w-3 h-3" /> Founded {founded}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                  <FiActivity className="w-3 h-3" /> {formation}
                </span>
                <span className="text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                  {capacity.toLocaleString()} capacity
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-8 border-t border-white/10 pt-6">
            {[
              { label: 'Played', value: gamesPlayed },
              { label: 'Wins', value: wins },
              { label: 'Draws', value: draws },
              { label: 'Losses', value: losses },
              { label: 'Points', value: points, highlight: true },
              { label: 'GD', value: `${gd >= 0 ? '+' : ''}${gd}` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl sm:text-2xl font-black tabular-nums ${s.highlight ? 'text-[#F5C518]' : 'text-white'}`}>
                  {s.value}
                </p>
                <p className="text-[10px] text-blue-300 uppercase tracking-wide font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col — form + recent matches */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
              <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Recent Form</h2>
              <div className="flex gap-2 mb-5">
                {form.map((r, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${
                      r === 'W' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : r === 'D' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                    }`}>{r}</span>
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-medium">
                      {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Won
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Drawn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Lost
                </span>
              </div>
            </div>

            {/* Recent match results */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
              <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Last 5 Results</h2>
              <div className="space-y-2">
                {RECENT_MATCHES.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      m.res === 'W' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : m.res === 'D' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                    }`}>{m.res}</span>

                    <span className="text-[10px] text-gray-400 dark:text-slate-500 w-12 shrink-0">
                      {m.isHome ? 'HOME' : 'AWAY'}
                    </span>

                    <span className="text-sm font-medium text-[#1A1A2E] dark:text-slate-200 flex-1 truncate">
                      {m.isHome ? `${team.name}` : m.opponent} vs {m.isHome ? m.opponent : `${team.name}`}
                    </span>

                    <span className="text-sm font-black text-[#1A1A2E] dark:text-slate-200 tabular-nums shrink-0">
                      {m.hg} – {m.ag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — performance stats */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
              <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Season Stats</h2>
              <div className="space-y-4">
                <StatBar label="Possession %" value={possession} max={100} color="bg-[#1A4D8F]" />
                <StatBar label="Shots / game" value={shotsPerGame} max={20} color="bg-purple-500" />
                <StatBar label="Pass accuracy %" value={passAccuracy} max={100} color="bg-green-500" />
                <StatBar label="Clean sheets" value={cleanSheets} max={20} color="bg-[#F5C518]" />
                <StatBar label="Pressure score" value={pressureScore} max={100} color="bg-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
              <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Advanced</h2>
              <div className="space-y-2">
                {[
                  { label: 'xG (Expected Goals)', value: xG },
                  { label: 'Goals For', value: goalsFor },
                  { label: 'Goals Against', value: goalsAgainst },
                  { label: 'Formation', value: formation },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-slate-700 last:border-0">
                    <span className="text-xs text-gray-500 dark:text-slate-400">{s.label}</span>
                    <span className="text-sm font-black text-[#1A1A2E] dark:text-slate-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/lobby"
              className="block w-full bg-[#1A4D8F] hover:bg-[#0D2B5E] text-white font-black text-sm py-3 rounded-xl text-center transition-colors"
            >
              Predict on {team.name} Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
