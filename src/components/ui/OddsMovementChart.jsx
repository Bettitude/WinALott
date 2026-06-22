import { useState, useMemo, useRef } from 'react';

const PALETTE = ['#22D3A8', '#F43F5E', '#3B82F6', '#F5C518', '#A855F7', '#FB923C'];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Pure-SVG line chart showing real % share of each option over time.
// Every point comes from an actual prediction's timestamp — no synthetic data.
export default function OddsMovementChart({ options = [], points = [], loading = false, height = 180 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const W = 600, H = height;
  const padL = 6, padR = 50, padT = 14, padB = 10;

  const keys     = options.map(o => o.key ?? o);
  const labelFor = k => options.find(o => (o.key ?? o) === k)?.label || k;
  const tss      = points.map(p => new Date(p.ts).getTime());

  const { xScale, yScale, maxY } = useMemo(() => {
    if (points.length === 0) return { xScale: () => padL, yScale: () => H - padB, maxY: 100 };
    const minTs = Math.min(...tss), maxTs = Math.max(...tss);
    const allPcts = points.flatMap(p => keys.map(k => p.pcts[k] || 0));
    const maxVal  = Math.max(...allPcts, 10);
    const maxYv   = Math.min(100, Math.ceil((maxVal + 8) / 10) * 10);

    const xs = ts => (minTs === maxTs ? (W - padL - padR) / 2 + padL : padL + ((ts - minTs) / (maxTs - minTs)) * (W - padL - padR));
    const ys = v  => H - padB - (v / maxYv) * (H - padT - padB);
    return { xScale: xs, yScale: ys, maxY: maxYv };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/15 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div style={{ height: height * 0.8 }} className="flex items-center justify-center text-center px-4">
        <p className="text-white/30 text-xs font-medium">No predictions yet — be the first and start the movement.</p>
      </div>
    );
  }

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px   = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0, best = Infinity;
    tss.forEach((ts, i) => {
      const d = Math.abs(xScale(ts) - px);
      if (d < best) { best = d; nearest = i; }
    });
    setHoverIdx(nearest);
  };

  const activeIdx = hoverIdx ?? points.length - 1;
  const hp = points[activeIdx];
  const hx = xScale(tss[activeIdx]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f}
            x1={padL} x2={W - padR}
            y1={padT + f * (H - padT - padB)} y2={padT + f * (H - padT - padB)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        ))}

        {keys.map((k, i) => {
          const d = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xScale(tss[idx])} ${yScale(p.pcts[k] || 0)}`).join(' ');
          return <path key={k} d={d} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="2" strokeLinejoin="round" />;
        })}

        {hoverIdx != null && (
          <line x1={hx} x2={hx} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" strokeDasharray="3,3" />
        )}

        {keys.map((k, i) => {
          const lastPct = points[points.length - 1].pcts[k] || 0;
          return (
            <g key={k}>
              <circle cx={xScale(tss[tss.length - 1])} cy={yScale(lastPct)} r="3" fill={PALETTE[i % PALETTE.length]} />
              <text x={W - padR + 6} y={yScale(lastPct) + 3} fontSize="10" fontWeight="700" fill={PALETTE[i % PALETTE.length]}>
                {lastPct}%
              </text>
            </g>
          );
        })}

        {hoverIdx != null && keys.map((k, i) => (
          <circle key={k} cx={hx} cy={yScale(hp.pcts[k] || 0)} r="3.5" fill={PALETTE[i % PALETTE.length]} stroke="#0D2B5E" strokeWidth="1.5" />
        ))}
      </svg>

      {hoverIdx != null && (
        <div className="absolute top-1 left-1 bg-[#0D2B5E] border border-white/10 rounded-lg px-3 py-2 shadow-xl pointer-events-none z-10">
          <p className="text-[10px] text-white/40 font-semibold mb-1">{formatTime(hp.ts)}</p>
          {keys.map((k, i) => (
            <div key={k} className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="text-white/60 flex-1">{labelFor(k)}</span>
              <span className="font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>{hp.pcts[k] ?? 0}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap mt-2 px-1">
        {keys.map((k, i) => (
          <div key={k} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="text-white/50">{labelFor(k)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
