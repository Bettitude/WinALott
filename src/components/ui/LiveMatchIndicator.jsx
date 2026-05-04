import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiX } from 'react-icons/fi';
import { mockMatches } from '../../data/mockData';

export default function LiveMatchIndicator() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const liveMatches = mockMatches.filter(m => m.status === 'live');
  if (liveMatches.length === 0) return null;

  return (
    <div className="fixed top-20 right-3 z-30">
      {/* Pill toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <FiZap className="w-3 h-3" />
        {liveMatches.length} LIVE
      </button>

      {/* Mini overlay */}
      {open && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black text-[#1A1A2E]">Live Now</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {liveMatches.map(m => (
                <button
                  key={m.id}
                  onClick={() => { navigate(`/match/${m.id}`); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-xs font-bold text-[#1A1A2E]">{m.homeTeam.short} vs {m.awayTeam.short}</p>
                    <p className="text-[10px] text-gray-400">{m.league}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-red-600">{m.score?.home} — {m.score?.away}</p>
                    <p className="text-[10px] text-red-400 font-bold">{m.minute}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
