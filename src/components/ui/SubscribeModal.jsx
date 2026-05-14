import { useState, useEffect } from 'react';
import { FiX, FiMail, FiCheck } from 'react-icons/fi';

const STORAGE_KEY = 'winalot_subscribed';
const DELAY_MS    = 10000; // show after 10s

export default function SubscribeModal() {
  const [open, setOpen]       = useState(false);
  const [email, setEmail]     = useState('');
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
    setTimeout(close, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Banner image */}
        <div className="h-28 bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-8 w-16 h-16 rounded-full bg-white" />
            <div className="absolute bottom-0 right-4 w-20 h-20 rounded-full bg-[#F5C518]" />
          </div>
          <div className="relative text-center">
            <p className="text-[#F5C518] text-xs font-black uppercase tracking-widest">Stay in the Game</p>
            <p className="text-white text-xl font-black mt-1">Get Match Alerts</p>
          </div>
          <button
            onClick={close}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-black text-[#1A1A2E] mb-1">You're subscribed!</p>
              <p className="text-sm text-gray-500">We'll send you the best matches and deals.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Get notified about the biggest prize pools, free giveaways, and match results.
              </p>
              <form onSubmit={submit} className="space-y-3">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#1A4D8F] text-white font-black text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Subscribing...' : 'Subscribe Now — It\'s Free'}
                </button>
              </form>
              <p className="text-[10px] text-gray-400 text-center mt-3">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
