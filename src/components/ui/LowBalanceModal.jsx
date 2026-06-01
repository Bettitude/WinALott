import { useNavigate } from 'react-router-dom';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import { formatBTP } from '../../utils/btp';

export default function LowBalanceModal({ open, onClose, needed = 0, have = 0 }) {
  const navigate  = useNavigate();
  const shortfall = Math.max(0, needed - have);

  if (!open) return null;

  const handleBuy = () => {
    localStorage.setItem('redirect_after_topup', window.location.pathname + window.location.search);
    onClose();
    navigate(`/dashboard/wallet?deposit=1&amount_needed=${shortfall}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-black text-[#1A1A2E] dark:text-white">Not Enough BT Points</h3>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              <FiX className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="space-y-2 mb-5">
              {[
                { label: 'You need',   value: formatBTP(needed),   cls: 'text-[#1A1A2E] dark:text-white' },
                { label: 'You have',   value: formatBTP(have),     cls: 'text-gray-500 dark:text-slate-400' },
                { label: 'Shortfall',  value: formatBTP(shortfall), cls: 'text-red-500 font-black' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 dark:border-slate-700 last:border-0">
                  <span className="text-gray-500 dark:text-slate-400">{row.label}</span>
                  <span className={row.cls}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={handleBuy}
                className="w-full py-3 rounded-xl bg-[#F5C518] text-[#1A1A2E] font-black text-sm hover:brightness-95 transition-all flex items-center justify-center gap-2">
                Buy BT Points
              </button>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
