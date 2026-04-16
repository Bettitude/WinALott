import { FiAward, FiTag, FiCalendar } from 'react-icons/fi';

export default function WinnerCard({ winner }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md card-hover overflow-hidden">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#F5C518] to-[#1A4D8F]" />

      <div className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/20 border-2 border-[#F5C518]/40 flex items-center justify-center shrink-0">
          <FiAward className="w-6 h-6 text-[#F5C518]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-[#1A1A2E] text-sm truncate">{winner.username}</span>
            <span className="font-black text-[#22C55E] text-base shrink-0">
              +${winner.prize.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mb-1.5 leading-tight">{winner.match}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#1A4D8F] px-2 py-0.5 rounded-full font-medium">
              <FiTag className="w-2.5 h-2.5" />
              {winner.market}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <FiCalendar className="w-2.5 h-2.5" />
              {winner.date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
