// Live crowd consensus — % of real entries per option. No login required,
// no dummy data: every bar reflects actual ticket counts at render time.
export default function CrowdConsensusBars({ options = [], compact = false, max = 3 }) {
  if (!options.length) return null;

  const sorted = [...options].sort((a, b) => b.pct - a.pct).slice(0, compact ? max : options.length);

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2.5'}>
      {sorted.map(o => (
        <div key={o.key}>
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <span className={`font-semibold text-gray-700 dark:text-slate-200 truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>{o.label}</span>
            <span className={`font-black text-[#1A4D8F] dark:text-blue-400 shrink-0 ${compact ? 'text-[10px]' : 'text-xs'}`}>{o.pct}%</span>
          </div>
          <div className={`bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden ${compact ? 'h-1' : 'h-2'}`}>
            <div className="h-full bg-[#1A4D8F] dark:bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${o.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
