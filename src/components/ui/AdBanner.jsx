import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Slot → fallback dimensions for the placeholder
const SLOT_SIZES = {
  leaderboard:   'w-full h-[90px]',
  sidebar_right: 'w-full h-[250px]',
  sidebar_left:  'w-full h-[400px]',
  wc_sidebar:    'w-full h-[200px]',
  lobby_top:     'w-full h-[90px]',
};

const SLOT_LABELS = {
  leaderboard:   '728 × 90',
  sidebar_right: '300 × 250',
  sidebar_left:  '240 × 400',
  wc_sidebar:    '300 × 200',
  lobby_top:     '728 × 90',
};

// Cache ads in memory so we only fetch once per slot per page load
const adCache = {};

export default function AdBanner({ slot = 'leaderboard', className = '', dark = false }) {
  const [ad,        setAd]        = useState(adCache[slot] ?? undefined); // undefined = loading, null = no ad
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (adCache[slot] !== undefined) {
      setAd(adCache[slot]);
      return;
    }
    fetch(`${API_BASE}/ads?slot=${slot}`)
      .then(r => r.json())
      .then(d => {
        const result = d.success ? (d.data || null) : null;
        adCache[slot] = result;
        setAd(result);
      })
      .catch(() => {
        adCache[slot] = null;
        setAd(null);
      });
  }, [slot]);

  const sizeClass = SLOT_SIZES[slot] || 'w-full h-[90px]';

  // Still loading — show a quiet placeholder to avoid layout shift
  if (ad === undefined) {
    return (
      <div className={`${sizeClass} rounded-2xl animate-pulse ${dark ? 'bg-white/5' : 'bg-gray-100 dark:bg-slate-800'} ${className}`} />
    );
  }

  // No active ad — show the dashed placeholder (same look as before)
  if (!ad || dismissed) {
    return (
      <div className={`${sizeClass} border-2 border-dashed rounded-2xl flex flex-col items-center justify-center ${dark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/40'} ${className}`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/15' : 'text-gray-300 dark:text-slate-600'}`}>Ad Space</span>
        <span className={`text-[10px] mt-0.5 ${dark ? 'text-white/10' : 'text-gray-200 dark:text-slate-700'}`}>{SLOT_LABELS[slot] || ''}</span>
      </div>
    );
  }

  // Active ad — display it
  const inner = (
    <div className="relative w-full h-full group">
      {ad.bg_color ? (
        <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: ad.bg_color }}>
          <img
            src={ad.image_url}
            alt={ad.title}
            className="max-w-full max-h-full object-contain"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover rounded-2xl"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}

      {/* Sponsored badge */}
      <span className="absolute bottom-1.5 left-2 text-[9px] font-bold text-white/60 bg-black/30 px-1.5 py-0.5 rounded-full leading-none">
        Sponsored
      </span>

      {/* Dismiss button */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Close ad"
      >
        <FiX className="w-2.5 h-2.5 text-white" />
      </button>
    </div>
  );

  return (
    <div className={`${sizeClass} rounded-2xl overflow-hidden ${className}`}>
      {ad.link_url && ad.link_url !== '#' ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          {inner}
        </a>
      ) : inner}
    </div>
  );
}
