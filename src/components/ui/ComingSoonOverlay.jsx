import { FiClock } from 'react-icons/fi';

/**
 * Wraps any page with a semi-transparent "Coming Soon" overlay.
 * The page content shows through (blurred) so users get a preview,
 * but cannot interact with anything underneath.
 */
export default function ComingSoonOverlay({ title = 'Coming Soon', subtitle, children }) {
  return (
    <div className="relative">
      {/* Page content — visible through the overlay but not interactive */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center pt-14 sm:pt-16"
        style={{ background: 'rgba(13, 43, 94, 0.72)', backdropFilter: 'blur(6px)' }}>
        <div className="mx-4 w-full max-w-sm text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#F5C518]/15 border-2 border-[#F5C518]/40 flex items-center justify-center mx-auto mb-6">
            <FiClock className="w-9 h-9 text-[#F5C518]" />
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl px-8 py-8 border border-gray-100 dark:border-slate-700">
            <p className="text-xs font-black text-[#1A4D8F] dark:text-blue-400 uppercase tracking-[0.2em] mb-2">
              bWinALOTT
            </p>
            <h2 className="text-3xl font-black text-[#1A1A2E] dark:text-white mb-3 leading-tight">
              {title}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              {subtitle || 'We\'re putting the finishing touches on this. Check back very soon.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse" />
              Launching soon
              <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
