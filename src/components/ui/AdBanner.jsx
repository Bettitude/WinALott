export default function AdBanner({ size = 'rectangle', className = '' }) {
  const dimensions = {
    rectangle: 'w-full h-32',
    leaderboard: 'w-full h-24',
    skyscraper: 'w-full h-64',
    square: 'w-full h-48',
  };

  return (
    <div className={`${dimensions[size]} border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 ${className}`}>
      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ad Space</span>
      <span className="text-gray-300 text-xs mt-1">
        {size === 'skyscraper' ? '160 × 600' : size === 'leaderboard' ? '728 × 90' : size === 'square' ? '300 × 250' : '300 × 250'}
      </span>
    </div>
  );
}
