import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'winalot_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const accept  = () => { localStorage.setItem(COOKIE_KEY, 'accepted'); setVisible(false); };
  const decline = () => { localStorage.setItem(COOKIE_KEY, 'declined'); setVisible(false); };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10001] bg-[#0D2B5E] dark:bg-slate-950 border-t-2 border-[#F5C518] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {/* Cookie icon + text */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-[#F5C518] text-lg shrink-0 select-none">🍪</span>
          <p className="text-xs text-blue-100 leading-relaxed">
            We use cookies to improve your experience and for responsible gambling compliance.{' '}
            <Link to="/privacy" className="text-[#F5C518] hover:underline font-semibold">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="text-xs text-blue-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="bg-[#F5C518] hover:brightness-110 text-[#0D2B5E] font-black text-xs px-5 py-2 rounded-lg transition-all"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
