const markets = [
  'All Markets', 'Corners', 'Total Cards', 'Goal Scorer', 'Shots',
  'Penalty', 'Scores', 'Throw Ins', 'Fouls', 'BTTS',
];

export default function MarketFilterTabs({ active, onChange }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-1">
      <div className="flex gap-2 min-w-max px-1">
        {markets.map(m => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              active === m
                ? 'bg-[#1A4D8F] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
