import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { liveApi } from '../api/liveApi';

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

export default function TeamSquad() {
  const { state }   = useLocation();
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [team, setTeam]       = useState(state?.team || null);
  const league                = state?.league || '';
  const [squad, setSquad]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.allSettled([
      team ? Promise.resolve({ data: { data: team } }) : liveApi.getTeamInfo(id),
      liveApi.getTeamSquad(id),
    ]).then(([infoRes, squadRes]) => {
      if (cancelled) return;
      if (!team && infoRes.status === 'fulfilled' && infoRes.value.data?.data?.team) {
        const t = infoRes.value.data.data.team;
        setTeam({ id: t.id, name: t.name, logo: t.logo });
      }
      if (squadRes.status === 'fulfilled') setSquad(squadRes.value.data?.data || []);
      else setError(true);
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const grouped = POSITION_ORDER.map(pos => ({
    position: pos,
    players: squad.filter(p => p.position === pos),
  })).filter(g => g.players.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-[#1A4D8F] dark:hover:text-blue-400 font-semibold mb-6 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Team header */}
      <div className="flex items-center gap-4 mb-6">
        {team?.logo ? (
          <img src={team.logo} alt={team.name} className="w-14 h-14 object-contain bg-white dark:bg-slate-800 rounded-2xl p-2 border border-gray-200 dark:border-slate-700" onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#1A4D8F] flex items-center justify-center text-white font-black">
            {team?.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          {league && <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">{league}</p>}
          <h1 className="text-xl font-black text-[#1A1A2E] dark:text-white">{team?.name || 'Squad'}</h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : error || squad.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
          <FiAlertCircle className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No squad data available for this team.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(g => (
            <div key={g.position} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
                <h2 className="font-black text-[#1A1A2E] dark:text-slate-200 text-xs uppercase tracking-wide">{g.position}s</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {g.players.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-6 text-xs text-gray-400 dark:text-slate-500 font-bold shrink-0">{p.number ?? '–'}</span>
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                    ) : null}
                    <span className="flex-1 text-sm font-semibold text-[#1A1A2E] dark:text-slate-200 truncate">{p.name}</span>
                    {p.age && <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{p.age}y</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
