import { Link, useLocation } from 'react-router-dom';
import { FiTrendingUp, FiShoppingCart, FiX, FiZap } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useState, useEffect } from 'react';

export default function PotentialWinBanner() {
  const { cartCount, cartTotal, cartPotentialWin } = useCart();
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  // Re-show banner whenever a new item is added
  useEffect(() => {
    if (cartCount > 0) setDismissed(false);
  }, [cartCount]);

  // Hide on checkout (it has its own display), auth pages, and when cart is empty
  if (cartCount === 0 || dismissed) return null;
  if (pathname.startsWith('/checkout') || pathname.startsWith('/auth')) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg pointer-events-none">
      <div className="bg-[#0D2B5E] text-white rounded-2xl shadow-2xl border border-[#1A4D8F]/60 flex items-center gap-3 px-4 py-3 pointer-events-auto">

        {/* Animated icon */}
        <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center shrink-0 relative">
          <FiTrendingUp className="w-5 h-5 text-[#1A1A2E]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <FiZap className="w-3 h-3 text-[#F5C518] shrink-0" />
            <p className="text-[10px] font-black text-[#F5C518] uppercase tracking-wider">
              {cartCount} stake{cartCount !== 1 ? 's' : ''} · ${cartTotal.toFixed(2)} total entry
            </p>
          </div>
          {cartPotentialWin > 0 ? (
            <p className="text-sm font-black text-white leading-tight">
              You could win{' '}
              <span className="text-green-400 text-base">${cartPotentialWin.toFixed(2)}</span>
              <span className="text-white/50 text-xs font-medium ml-1">if all correct</span>
            </p>
          ) : (
            <p className="text-sm font-black text-white leading-tight">
              {cartCount} prediction{cartCount !== 1 ? 's' : ''} ready — complete your entry
            </p>
          )}
        </div>

        {/* Checkout CTA */}
        <Link
          to="/checkout"
          className="shrink-0 bg-[#F5C518] text-[#1A1A2E] font-black text-xs px-3.5 py-2 rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <FiShoppingCart className="w-3.5 h-3.5" />
          Checkout
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-white/30 hover:text-white/70 transition-colors p-0.5 -mr-1"
          aria-label="Dismiss"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
