import { useState } from 'react';
import { FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import { useTickets } from '../../hooks/useTickets';

export default function MyWinnings() {
  const { tickets, loading } = useTickets({ status: 'won', limit: 50 });
  const [claimModal, setClaimModal] = useState(null);
  const [claimed, setClaimed]       = useState([]);
  const [claiming, setClaiming]     = useState(false);

  const winnings    = tickets.filter(t => t.prize > 0);
  const totalWon    = winnings.reduce((s, w) => s + w.prize, 0);
  const totalClaimed = winnings.filter(w => claimed.includes(w.id)).reduce((s, w) => s + w.prize, 0);

  const handleClaim = async () => {
    setClaiming(true);
    await new Promise(r => setTimeout(r, 800));
    setClaimed(c => [...c, claimModal.id]);
    setClaiming(false);
    setClaimModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-6">My Winnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Won',  value: `$${totalWon.toFixed(2)}`,               color: 'text-green-600 dark:text-green-400',  border: 'border-l-green-400' },
          { label: 'Claimed',    value: `$${totalClaimed.toFixed(2)}`,            color: 'text-[#1A4D8F] dark:text-blue-400',  border: 'border-l-[#1A4D8F]' },
          { label: 'Unclaimed',  value: `$${(totalWon - totalClaimed).toFixed(2)}`, color: 'text-orange-600 dark:text-orange-400', border: 'border-l-orange-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 border-l-4 ${s.border}`}>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse" />)}
        </div>
      ) : winnings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center py-16">
          <FiDollarSign className="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 font-medium">No winnings yet</p>
          <p className="text-gray-300 dark:text-slate-600 text-sm">Keep predicting — your first win is coming!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <tr className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                  <th className="text-left px-5 py-3">Match</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-right py-3">Prize</th>
                  <th className="text-left py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {winnings.map(w => {
                  const isClaimed = claimed.includes(w.id);
                  return (
                    <tr key={w.id} className="border-t border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1A1A2E] dark:text-white text-xs">{w.match}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{w.market}</p>
                      </td>
                      <td className="py-3.5 text-xs text-gray-400 dark:text-slate-500">{w.date}</td>
                      <td className="py-3.5 text-right font-black text-green-600 dark:text-green-400">${w.prize.toFixed(2)}</td>
                      <td className="py-3.5 px-5">
                        {isClaimed ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <FiCheckCircle className="w-3 h-3" /> Claimed
                          </span>
                        ) : (
                          <button onClick={() => setClaimModal(w)}
                            className="bg-[#F5C518] text-[#1A1A2E] font-bold px-3 py-1 rounded-lg text-xs hover:brightness-105 transition-all">
                            Claim
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!claimModal} onClose={() => setClaimModal(null)} title="Claim Your Winnings">
        {claimModal && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">You are claiming:</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">${claimModal.prize.toFixed(2)}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">From: {claimModal.match}</p>
            <button onClick={handleClaim} disabled={claiming}
              className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm">
              {claiming ? 'Processing…' : 'Confirm Claim'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
