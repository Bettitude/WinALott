import { useState, useMemo } from 'react';

// ── Player data normalisation ─────────────────────────────────────────────────
function toPlayer(item) {
  const p = item.player || item;
  const grid = p.grid || item.grid || '';
  const [col, row] = grid.split(':').map(Number);
  return {
    id:     p.id   || item.id   || null,
    number: p.number || item.number || '',
    name:   p.name   || item.name   || '',
    pos:    p.pos    || item.pos    || 'M',
    rating: item.statistics?.[0]?.games?.rating ?? item.rating ?? null,
    gridCol: col || null,
    gridRow: row || null,
  };
}

// Group into columns.  Prefer the API grid field; fall back to position codes.
function groupColumns(players) {
  const hasGrid = players.some(p => p.gridCol);

  if (hasGrid) {
    const map = {};
    players.forEach(p => {
      const c = p.gridCol || 1;
      (map[c] = map[c] || []).push(p);
    });
    return Object.keys(map)
      .sort((a, b) => +a - +b)
      .map(k => map[k].sort((a, b) => (a.gridRow || 0) - (b.gridRow || 0)));
  }

  // Fallback: group by position code
  const GK  = players.filter(p => ['G','GK'].includes(p.pos));
  const DEF = players.filter(p => ['D','CB','RB','LB','RWB','LWB','DF'].includes(p.pos));
  const MID = players.filter(p => ['M','DM','CM','AM','RM','LM','MF'].includes(p.pos));
  const FWD = players.filter(p => ['F','RW','LW','ST','CF','SS','FW'].includes(p.pos));
  const rest = players.filter(p => ![...GK,...DEF,...MID,...FWD].includes(p));
  return [GK, DEF, MID, FWD, ...(rest.length ? [rest] : [])].filter(c => c.length);
}

// ── Player avatar ─────────────────────────────────────────────────────────────
function PlayerAvatar({ player, color }) {
  const [failed, setFailed] = useState(false);
  const lastName = (player.name || '').split(' ').at(-1) || '?';
  const photoUrl = player.id
    ? `https://media.api-sports.io/football/players/${player.id}.png`
    : null;
  const showPhoto = photoUrl && !failed;

  return (
    <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 36 }}>
      <div className="relative">
        {showPhoto ? (
          <div
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/50 shadow-md"
            style={{ background: color }}
          >
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setFailed(true)}
            />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-white/40 shadow-md"
            style={{ background: `linear-gradient(135deg,${color},${color}aa)` }}
          >
            {player.number || '?'}
          </div>
        )}
        {player.rating && (
          <span
            className={`absolute -bottom-1 -right-0.5 text-[7px] font-black px-[3px] py-[1px] rounded-sm leading-none ${
              Number(player.rating) >= 7   ? 'bg-green-500 text-white'
              : Number(player.rating) >= 6 ? 'bg-yellow-400 text-black'
              :                              'bg-red-500 text-white'
            }`}
          >
            {Number(player.rating).toFixed(1)}
          </span>
        )}
      </div>
      <span
        className="text-white/90 font-semibold text-center leading-tight"
        style={{ fontSize: 8, maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {lastName}
      </span>
    </div>
  );
}

// ── Subs side panel ───────────────────────────────────────────────────────────
function SubsPanel({ subs, coach, side }) {
  return (
    <div
      className="flex flex-col py-3"
      style={{ width: 100, minWidth: 84, background: '#060e1d' }}
    >
      <p
        className={`text-[7px] font-black uppercase tracking-widest text-center mb-2 ${
          side === 'home' ? 'text-blue-400' : 'text-purple-400'
        }`}
      >
        Substitutes
      </p>

      <div className="flex-1 overflow-hidden space-y-1 px-2">
        {subs.slice(0, 9).map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className="text-white/30 font-bold text-right shrink-0"
              style={{ fontSize: 8, minWidth: 14 }}
            >
              {s.number}
            </span>
            <span
              className="text-white/60 truncate"
              style={{ fontSize: 8 }}
            >
              {(s.name || '').split(' ').at(-1)}
            </span>
          </div>
        ))}
      </div>

      {coach && (
        <div className="mt-2 pt-2 border-t border-white/10 px-2 text-center">
          <p className="text-white/20 uppercase tracking-widest" style={{ fontSize: 7 }}>Manager</p>
          <p className="text-white/60 font-bold truncate" style={{ fontSize: 8 }}>
            {coach.split(' ').at(-1)}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Formation column (vertical stack of avatars) ──────────────────────────────
function FormationCol({ players, color }) {
  return (
    <div className="flex flex-col items-center justify-around flex-1 gap-1 py-2">
      {players.map((p, i) => (
        <PlayerAvatar key={i} player={p} color={color} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function OfficialLineup({ home, away, venue, matchday, date }) {
  const homePlayers = useMemo(() => (home.startXI || []).map(toPlayer), [home]);
  const awayPlayers = useMemo(() => (away.startXI || []).map(toPlayer), [away]);
  const homeSubs    = useMemo(() => (home.substitutes || []).map(toPlayer).filter(p => p.name), [home]);
  const awaySubs    = useMemo(() => (away.substitutes || []).map(toPlayer).filter(p => p.name), [away]);

  const homeCoach = home.coach?.name || '';
  const awayCoach = away.coach?.name || '';
  const HOME_COLOR = '#1A4D8F';
  const AWAY_COLOR = '#7C3AED';

  // Home: GK → FWD left to right
  const homeCols = useMemo(() => groupColumns(homePlayers), [homePlayers]);
  // Away: FWD → GK left to right (mirrored so they face each other)
  const awayCols = useMemo(() => [...groupColumns(awayPlayers)].reverse(), [awayPlayers]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ fontFamily: 'Inter,sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3" style={{ background: '#060e1d' }}>
        <div className="flex items-center justify-between">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {home.team?.logo && (
              <img src={home.team.logo} alt="" className="w-7 h-7 object-contain shrink-0" onError={e => { e.target.style.display='none'; }} />
            )}
            <div className="min-w-0">
              <p className="text-white font-black text-xs truncate">{home.team?.name}</p>
              {home.formation && <p className="text-white/30 font-bold" style={{ fontSize: 9 }}>{home.formation}</p>}
            </div>
          </div>
          {/* Title */}
          <div className="text-center px-3 shrink-0">
            <p className="text-[#F5C518] font-black uppercase tracking-[0.15em]" style={{ fontSize: 9 }}>
              Official Line-Ups
            </p>
            {(venue || matchday || date) && (
              <p className="text-white/20 mt-0.5" style={{ fontSize: 8 }}>
                {[venue, matchday, date].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="text-white font-black text-xs truncate">{away.team?.name}</p>
              {away.formation && <p className="text-white/30 font-bold" style={{ fontSize: 9 }}>{away.formation}</p>}
            </div>
            {away.team?.logo && (
              <img src={away.team.logo} alt="" className="w-7 h-7 object-contain shrink-0" onError={e => { e.target.style.display='none'; }} />
            )}
          </div>
        </div>
      </div>

      {/* ── Body: [subs] | [pitch] | [subs] ────────────────────────────────── */}
      <div className="flex" style={{ minHeight: 300 }}>
        {/* Home subs (left) */}
        <SubsPanel subs={homeSubs} coach={homeCoach} side="home" />

        {/* Pitch */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ background: 'linear-gradient(90deg,#186626 0%,#1d7a2e 45%,#1d7a2e 55%,#186626 100%)' }}
        >
          {/* SVG pitch markings */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 560 300"
            preserveAspectRatio="none"
            fill="none"
          >
            <rect x="3" y="3" width="554" height="294" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {/* Centre line */}
            <line x1="280" y1="3" x2="280" y2="297" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {/* Centre circle */}
            <circle cx="280" cy="150" r="48" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <circle cx="280" cy="150" r="2.5" fill="rgba(255,255,255,0.5)" />
            {/* Home goal / penalty area */}
            <rect x="3" y="85" width="72" height="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <rect x="3" y="116" width="30" height="68" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="78" cy="150" r="26" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {/* Away goal / penalty area */}
            <rect x="485" y="85" width="72" height="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <rect x="527" y="116" width="30" height="68" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="482" cy="150" r="26" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          </svg>

          {/* Players layer */}
          <div className="relative z-10 flex h-full">
            {/* Home side */}
            <div className="flex flex-1 items-stretch px-1">
              {homeCols.map((col, i) => (
                <FormationCol key={i} players={col} color={HOME_COLOR} />
              ))}
            </div>
            {/* Away side */}
            <div className="flex flex-1 items-stretch px-1">
              {awayCols.map((col, i) => (
                <FormationCol key={i} players={col} color={AWAY_COLOR} />
              ))}
            </div>
          </div>
        </div>

        {/* Away subs (right) */}
        <SubsPanel subs={awaySubs} coach={awayCoach} side="away" />
      </div>

      {/* ── Manager footer ──────────────────────────────────────────────────── */}
      {(homeCoach || awayCoach) && (
        <div
          className="flex items-center justify-between px-4 py-2 border-t border-white/10"
          style={{ background: '#060e1d' }}
        >
          <div>
            <p className="text-white/20 uppercase tracking-widest" style={{ fontSize: 7 }}>Manager</p>
            <p className="text-white font-bold" style={{ fontSize: 10 }}>{homeCoach || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-white/20 uppercase tracking-widest" style={{ fontSize: 7 }}>Manager</p>
            <p className="text-white font-bold" style={{ fontSize: 10 }}>{awayCoach || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
