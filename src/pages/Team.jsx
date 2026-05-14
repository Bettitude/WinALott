import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFlag, FiTrendingUp, FiShield } from 'react-icons/fi';

const FORMATIONS = ['4-3-3','4-4-2','4-2-3-1','3-5-2','5-3-2','4-1-4-1','3-4-3'];

function seeded(n, min, max) {
  const x = Math.sin(n * 127.1 + 311.7) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function StatBar({ label, value, max = 100, color = 'bg-[#1A4D8F]' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="font-black text-[#1A1A2E] dark:text-slate-200">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Team() {
  const { teamSlug } = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();

  // Prefer data passed via navigate state; fall back to slug-derived display
  const team   = state?.team   || { name: teamSlug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), short: teamSlug?.slice(0,3).toUpperCase(), logo: null };
  const league = state?.league || '';

  const seed = team.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const formation    = FORMATIONS[seed % FORMATIONS.length];
  const gamesPlayed  = seeded(seed, 22, 38);
  const wins         = seeded(seed, 8, 24);
  const draws        = seeded(seed + 1, 3, 10);
  const losses       = gamesPlayed - wins - draws < 0 ? 2 : gamesPlayed - wins - draws;
  const goalsFor     = seeded(seed + 2, 28, 72);
  const goalsAgainst = seeded(seed + 3, 18, 55);
  const points       = wins * 3 + draws;
  const cleanSheets  = seeded(seed + 4, 4, 16);
  const avgPossession = seeded(seed + 5, 42, 65);
  const passAccuracy  = seeded(seed + 6, 73, 91);
  const shotsPerGame  = seeded(seed + 7, 8, 18);

  const form = Array.from({ length: 8 }, (_, i) => {
    const r = seeded(seed + i * 13, 0, 2);
    return r === 0 ? 'W' : r === 1 ? 'D' : 'L';
  });

  const gd = goalsFor - goalsAgainst;

  const players = Array.from({ length: 11 }, (_, i) => {
    const pSeed = seed + i * 31;
    const roles = ['GK','CB','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];
    const firstNames = ['James','Carlos','Lucas','Marcos','Diego','Andre','Luis','Rafael','Mateo','Pedro','Ivan','Kai','Leroy','Jamal','Erling','Vinicius','Kylian','Bukayo','Phil','Rodri'];
    const lastNames  = ['Silva','Costa','Oliveira','Fernandez','Martinez','Santos','Rodrigues','Alves','Pereira','Sousa','Muller','Havertz','Sane','Musiala','Haaland','Junior','Mbappe','Saka','Foden','Casado'];
    const name = `${firstNames[pSeed % firstNames.length]} ${lastNames[(pSeed + 7) % lastNames.length]}`;
    const rating = seeded(pSeed, 68, 89);
    const goals  = i >= 8 ? seeded(pSeed, 2, 18) : seeded(pSeed, 0, 4);
    return { name, role: roles[i], rating, goals };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 font-semibold mb-6 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl overflow-hidden shadow-xl mb-6">
        <div className="relative px-6 py-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F5C518]/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative flex items-center gap-5">
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="w-20 h-20 object-contain drop-shadow-2xl bg-white/10 rounded-2xl p-2 shrink-0"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black text-white shrink-0">
                {team.short}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#F5C518] text-xs font-black bg-[#F5C518]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {league || 'Football Club'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white leading-tight">{team.name}</h1>
              <div className="flex items-center gap-1 mt-1 text-blue-200 text-xs">
                <FiFlag className="w-3 h-3" />
                Formation: <span className="font-bold text-white ml-1">{formation}</span>
              </div>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="relative mt-6 grid grid-cols-4 gap-2">
            {[
              { label: 'Played', value: gamesPlayed },
              { label: 'Wins',   value: wins },
              { label: 'Points', value: points },
              { label: 'GD',     value: gd >= 0 ? `+${gd}` : gd },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl py-3 text-center">
                <div className="text-xl font-black text-white leading-none">{s.value}</div>
                <div className="text-[10px] text-blue-200 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Season record */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 flex items-center gap-2">
            <FiShield className="w-4 h-4 text-[#1A4D8F]" /> Season Record
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Wins',   value: wins,   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40' },
              { label: 'Draws',  value: draws,  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
              { label: 'Losses', value: losses, color: 'text-red-500 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/40' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <StatBar label="Goals Scored"    value={goalsFor}     max={80}  color="bg-[#1A4D8F]" />
            <StatBar label="Goals Conceded"  value={goalsAgainst} max={70}  color="bg-red-400" />
            <StatBar label="Clean Sheets"    value={cleanSheets}  max={20}  color="bg-green-500" />
          </div>
        </div>

        {/* Playing style */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-[#F5C518]" /> Playing Style
          </h2>

          <div className="space-y-3 mb-4">
            <StatBar label="Avg. Possession (%)" value={avgPossession} max={100} color="bg-[#F5C518]" />
            <StatBar label="Pass Accuracy (%)"   value={passAccuracy}  max={100} color="bg-purple-500" />
            <StatBar label="Shots per Game"       value={shotsPerGame}  max={25}  color="bg-orange-400" />
          </div>

          {/* Form */}
          <div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-2">Recent Form (last 8)</p>
            <div className="flex gap-1.5 flex-wrap">
              {form.map((r, i) => (
                <span key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    r === 'W' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                    : r === 'D' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Squad */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-black text-[#1A1A2E] dark:text-slate-200">First XI</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            {formation}
          </span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700">
          {players.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="w-6 text-xs text-gray-400 dark:text-slate-500 font-bold shrink-0">{i + 1}</span>
              <span className={`w-10 text-[10px] font-black px-1.5 py-0.5 rounded text-center shrink-0 ${
                p.role === 'GK' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                : p.role.includes('B') ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                : p.role.includes('M') ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              }`}>{p.role}</span>
              <span className="flex-1 text-sm font-semibold text-[#1A1A2E] dark:text-slate-200">{p.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="hidden sm:block">{p.goals} goals</span>
                <span className={`font-black px-2 py-0.5 rounded-lg ${
                  p.rating >= 85 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  : p.rating >= 80 ? 'bg-blue-100 dark:bg-blue-900/40 text-[#1A4D8F] dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                }`}>{p.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
