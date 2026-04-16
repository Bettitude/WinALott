import { FiRadio } from 'react-icons/fi';
import { tickerScores } from '../../data/mockData';

// Duplicate items so the marquee loops seamlessly
const items = [...tickerScores, ...tickerScores];

export default function LiveTicker() {
  return (
    <div className="ticker-bar">
      {/* Label */}
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-white/20 mr-2 h-full bg-[#F5C518]/20">
        <FiRadio className="w-3 h-3 text-[#F5C518]" />
        <span className="text-[#F5C518] text-xs font-black uppercase tracking-wider whitespace-nowrap">Live</span>
      </div>

      {/* Scrolling scores */}
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
