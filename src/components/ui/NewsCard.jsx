import { useState } from 'react';
import { FiCalendar, FiTag } from 'react-icons/fi';

const categoryGradients = {
  'Champions League': 'from-[#003087] to-[#1A4D8F]',
  'Premier League':   'from-[#38003C] to-[#1A4D8F]',
  'Football':         'from-[#0D2B5E] to-[#22C55E]',
};

export default function NewsCard({ item }) {
  const [imgError, setImgError] = useState(false);
  const gradient = categoryGradients[item.category] || 'from-[#0D2B5E] to-[#1A4D8F]';
  const initials = item.category.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md card-hover overflow-hidden flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-1`}>
            <span className="text-3xl font-black text-white/90 tracking-widest">{initials}</span>
            <span className="text-xs text-white/60 font-medium">{item.category}</span>
          </div>
        )}
        {/* Category pill overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/90 backdrop-blur-sm text-[#1A4D8F] px-2.5 py-1 rounded-full shadow-sm">
            <FiTag className="w-2.5 h-2.5" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[#1A1A2E] leading-snug line-clamp-2 flex-1 mb-3">
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {item.excerpt}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
          <FiCalendar className="w-3 h-3" />
          {item.date}
        </div>
      </div>
    </div>
  );
}
