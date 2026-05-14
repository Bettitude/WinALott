import { useState, useEffect } from 'react';
import { FiRadio } from 'react-icons/fi';
import { liveApi } from '../../api/liveApi';

function formatTickerItem(m) {
  const score = (m.score_home != null && m.score_away != null)
    ? ` ${m.score_home}–${m.score_away}`
    : '';
  const live  = m.status === 'live' ? ' · LIVE' : '';
  return `${m.team_home} vs ${m.team_away}${score}${live}`;
}

export default function LiveTicker() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTicker = async () => {
      try {
        const res = await liveApi.getTicker();
        const items = res.data?.data || [];
        if (!cancelled && items.length > 0) {
          setScores(items.map(formatTickerItem));
        }
      } catch {}
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const items = [...scores, ...scores];

  return (
    <div className="ticker-bar">
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-white/20 mr-2 h-full bg-[#F5C518]/20">
        <FiRadio className="w-3 h-3 text-[#F5C518]" />
        <span className="text-[#F5C518] text-xs font-black uppercase tracking-wider whitespace-nowrap">Live</span>
      </div>

      <div className="marquee-wrap flex-1 overflow-hidden">
        <div className="marquee-inner">
          {items.map((score, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="text-white/90">{score}</span>
              <span className="mx-4 text-white/30 select-none">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
