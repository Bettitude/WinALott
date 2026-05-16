import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiInfo, FiShield, FiEye, FiBarChart2 } from 'react-icons/fi';

const COOKIE_KEY = 'winalot_cookie_consent';

const COOKIE_TYPES = [
  { icon: FiShield,    title: 'Essential',  desc: 'Required for the site to function. Cannot be disabled.' },
  { icon: FiEye,       title: 'Functional', desc: 'Remember your preferences and settings across sessions.' },
  { icon: FiBarChart2, title: 'Analytics',  desc: 'Help us understand how you use the platform to improve it.' },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const accept  = () => { localStorage.setItem(COOKIE_KEY, 'accepted'); setVisible(false); };
  const decline = () => { localStorage.setItem(COOKIE_KEY, 'declined'); setVisible(false); };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#0D2B5E] rounded-2xl shadow-2xl border border-[#F5C518]/30 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-[#F5C518]" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#F5C518]/15 flex items-center justify-center shrink-0">
              <FiInfo className="w-6 h-6 text-[#F5C518]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">We Value Your Privacy</h2>
              <p className="text-xs text-blue-300">WinALot uses cookies to enhance your experience</p>
            </div>
          </div>

          {/* Body text */}
          <p className="text-sm text-blue-100 leading-relaxed mb-6">
            By continuing to use this platform you agree to our use of cookies for site functionality,
            preferences, and responsible gambling compliance. You can review our{' '}
            <Link to="/privacy" className="text-[#F5C518] hover:underline font-semibold">
              Privacy Policy
            </Link>{' '}
            for full details.
          </p>

          {/* Cookie type breakdown */}
          <div className="space-y-3 mb-7">
            {COOKIE_TYPES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Icon className="w-4 h-4 text-[#F5C518] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-blue-300 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={accept}
              className="flex-1 bg-[#F5C518] hover:brightness-110 text-[#0D2B5E] font-black text-sm px-6 py-3 rounded-xl transition-all"
            >
              Accept All Cookies
            </button>
            <button
              onClick={decline}
              className="flex-1 border border-white/20 text-blue-200 hover:bg-white/10 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
