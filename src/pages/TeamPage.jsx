import { useState, useEffect } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFlag, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { liveApi } from '../api/liveApi';

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON     = 2026;

function StatBar({ label, value, max = 100, color = 'bg-[#1A4D8F]' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
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

  const [info,    setInfo]    = useState(null);
  const [stats,   setStats]   = useState(null);
  const [squad,   setSquad]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!team?.id) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.allSettled([
      liveApi.getTeamInfo(team.id),
      liveApi.getTeamStats(team.id, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
      liveApi.getTeamSquad(team.id),
    ]).then(([infoRes, statsRes, squadRes]) => {
      if (cancelled) return;
      if (infoRes.status === 'fulfilled')  setInfo(infoRes.value.data?.data || null);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || null);
      if (squadRes.status === 'fulfilled') setSquad(squadRes.value.data?.data || []);
      if (infoRes.status === 'rejected' && statsRes.status === 'rejected' && squadRes.status === 'rejected') {
        setError(true);
      }
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [team?.id]);

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

  const founded   = info?.team?.founded || null;
  const capacity  = info?.venue?.capacity || null;
  const formation = stats?.lineups?.[0]?.formation || null;

  const played = stats?.fixtures?.played?.total ?? null;
  const wins   = stats?.fixtures?.wins?.total   ?? null;
  const draws  = stats?.fixtures?.draws?.total  ?? null;
  const losses = stats?.fixtures?.loses?.total  ?? null;
  const goalsFor     = stats?.goals?.for?.total?.total     ?? null;
  const goalsAgainst = stats?.goals?.against?.total?.total ?? null;
  const cleanSheets  = stats?.clean_sheet?.total ?? null;
  const points = (wins != null && draws != null) ? wins * 3 + draws : null;
  const gd     = (goalsFor != null && goalsAgainst != null) ? goalsFor - goalsAgainst : null;
  const form   = stats?.form ? stats.form.split('').slice(-8) : [];

  const hasStats = played != null;

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
                {founded && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                    <FiFlag className="w-3 h-3" /> Founded {founded}
                  </span>
                )}
                {formation && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                    <FiActivity className="w-3 h-3" /> {formation}
                  </span>
                )}
                {capacity && (
                  <span className="text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-full">
                    {capacity.toLocaleString()} capacity
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          {!loading && hasStats && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-8 border-t border-white/10 pt-6">
              {[
                { label: 'Played', value: played },
                { label: 'Wins', value: wins },
                { label: 'Draws', value: draws },
                { label: 'Losses', value: losses },
                { label: 'Points', value: points, highlight: true },
                { label: 'GD', value: gd != null ? `${gd >= 0 ? '+' : ''}${gd}` : '—' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl sm:text-2xl font-black tabular-nums ${s.highlight ? 'text-[#F5C518]' : 'text-white'}`}>
                    {s.value ?? '—'}
                  </p>
                  <p className="text-[10px] text-blue-300 uppercase tracking-wide font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-40 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 animate-pulse" />
            <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left col */}
            <div className="lg:col-span-2 space-y-5">

              {!hasStats ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-gray-300 dark:text-slate-600 shrink-0" />
                  <p className="text-sm text-gray-400 dark:text-slate-500">
                    No season stats available yet for {team.name} in this competition.
                  </p>
                </div>
              ) : (
                <>
                  {/* Goals & clean sheets */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
                    <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Goals</h2>
                    <div className="space-y-3">
                      {goalsFor != null && <StatBar label="Goals Scored"   value={goalsFor}     max={Math.max(goalsFor, 1)}     color="bg-[#1A4D8F]" />}
                      {goalsAgainst != null && <StatBar label="Goals Conceded" value={goalsAgainst} max={Math.max(goalsAgainst, 1)} color="bg-red-400" />}
                      {cleanSheets != null && <StatBar label="Clean Sheets"   value={cleanSheets}  max={Math.max(played || 1, 1)}  color="bg-green-500" />}
                    </div>
                  </div>

                  {/* Recent form */}
                  {form.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
                      <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Recent Form</h2>
                      <div className="flex gap-2 mb-5 flex-wrap">
                        {form.map((r, i) => (
                          <span key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${
                            r === 'W' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                            : r === 'D' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                          }`}>{r}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Won</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Drawn</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Lost</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Squad — links to a dedicated squad browser (works for any team by ID) */}
              {squad.length > 0 && (
                <Link
                  to={`/team/${team.id}/squad`}
                  state={{ team, league }}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm px-5 py-4 hover:border-[#1A4D8F] transition-colors"
                >
                  <div>
                    <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 text-sm uppercase tracking-wide">Squad</h2>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{squad.length} players</p>
                  </div>
                  <FiArrowLeft className="w-4 h-4 text-gray-300 dark:text-slate-600 rotate-180" />
                </Link>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-5">
              <Link
                to="/lobby"
                className="block w-full bg-[#1A4D8F] hover:bg-[#0D2B5E] text-white font-black text-sm py-3 rounded-xl text-center transition-colors"
              >
                Predict on {team.name} Matches
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
