import { useState } from 'react';
import { FiDollarSign, FiArrowDownCircle, FiArrowUpCircle, FiClock, FiCheckCircle, FiXCircle, FiCopy, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { walletTransactions } from '../../data/mockData';

const TX_ICONS = {
  deposit:         { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  prize_payout:    { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  manual_credit:   { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  ticket_purchase: { icon: FiArrowUpCircle,   color: 'text-[#1A4D8F]', bg: 'bg-blue-50'   },
  withdrawal:      { icon: FiArrowUpCircle,   color: 'text-orange-500', bg: 'bg-orange-50' },
  manual_debit:    { icon: FiArrowUpCircle,   color: 'text-red-500',    bg: 'bg-red-50'    },
  refund:          { icon: FiArrowDownCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
};

const STATUS_ICON = {
  completed: <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />,
  pending:   <FiClock       className="w-3.5 h-3.5 text-orange-400" />,
  failed:    <FiXCircle     className="w-3.5 h-3.5 text-red-400" />,
};

const TX_LABELS = {
  deposit:         'Deposit',
  prize_payout:    'Prize',
  ticket_purchase: 'Ticket',
  withdrawal:      'Withdrawal',
  manual_credit:   'Credit',
  manual_debit:    'Debit',
  refund:          'Refund',
};

const filters = ['All', 'Deposits', 'Withdrawals', 'Tickets', 'Prizes'];

function DepositModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const presets = [5, 10, 20, 50];

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 1) return;
    setLoading(true);
    // Simulated delay — in production this calls POST /api/transactions/deposit/init
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <h3 className="font-black text-[#1A1A2E] text-lg mb-1">Redirecting to Payment</h3>
      <p className="text-gray-400 text-sm mb-6">You'll be taken to Flutterwave to complete your deposit of <strong>${amount}</strong>.</p>
      <button onClick={onClose} className="bg-[#1A4D8F] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">Done</button>
    </div>
  );

  return (
    <div>
      <h3 className="font-black text-[#1A1A2E] text-lg mb-1">Add Funds</h3>
      <p className="text-gray-400 text-sm mb-5">Funds are added instantly after payment confirmation.</p>

      {/* Quick presets */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {presets.map(p => (
          <button key={p} onClick={() => setAmount(String(p))}
            className={`py-2 rounded-xl text-sm font-bold border transition-all ${
              amount === String(p)
                ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]'
                : 'border-gray-200 text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}>
            ${p}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
        <input
          type="number"
          min="1"
          placeholder="Custom amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
        />
      </div>

      <button
        onClick={handleDeposit}
        disabled={!amount || isNaN(amount) || Number(amount) < 1 || loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />Processing...</> : 'Proceed to Payment'}
      </button>
    </div>
  );
}

function WithdrawModal({ balance, onClose }) {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const valid = amount && Number(amount) >= 5 && Number(amount) <= balance / 100 && bank && account && name;

  const handleWithdraw = async () => {
    if (!valid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <h3 className="font-black text-[#1A1A2E] text-lg mb-1">Withdrawal Submitted</h3>
      <p className="text-gray-400 text-sm mb-6">Your withdrawal of <strong>${amount}</strong> is being processed. Allow 1–3 business days.</p>
      <button onClick={onClose} className="bg-[#1A4D8F] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">Close</button>
    </div>
  );

  return (
    <div>
      <h3 className="font-black text-[#1A1A2E] text-lg mb-1">Withdraw Funds</h3>
      <p className="text-gray-400 text-sm mb-5">Minimum withdrawal is $5.00. Available: <strong className="text-[#1A4D8F]">${(balance / 100).toFixed(2)}</strong></p>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
          <input type="number" min="5" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
        </div>
        <input type="text" placeholder="Bank name / code" value={bank} onChange={e => setBank(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
        <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
        <input type="text" placeholder="Account holder name" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
      </div>

      <button onClick={handleWithdraw} disabled={!valid || loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />Processing...</> : 'Submit Withdrawal'}
      </button>
    </div>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | null
  const [copied, setCopied] = useState(false);

  // Mock balance in cents
  const balanceCents = user?.walletBalance ?? 7443;

  const filtered = walletTransactions.filter(tx => {
    if (filter === 'Deposits')    return ['deposit', 'manual_credit', 'prize_payout', 'refund'].includes(tx.type);
    if (filter === 'Withdrawals') return tx.type === 'withdrawal';
    if (filter === 'Tickets')     return tx.type === 'ticket_purchase';
    if (filter === 'Prizes')      return tx.type === 'prize_payout';
    return true;
  });

  const handleCopyRef = (ref) => {
    navigator.clipboard.writeText(ref).catch(() => {});
    setCopied(ref);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E]">My Wallet</h1>
        <p className="text-gray-400 text-sm">Manage your balance, deposits and withdrawals</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-[#F5C518]/10 rounded-full" />
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
        <p className="text-4xl font-black mb-5">${(balanceCents / 100).toFixed(2)}</p>

        <div className="flex gap-3">
          <button onClick={() => setModal('deposit')}
            className="flex-1 bg-[#F5C518] text-[#1A1A2E] font-black py-2.5 rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <FiArrowDownCircle className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => setModal('withdraw')}
            className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <FiArrowUpCircle className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Deposited', value: '$70.00', color: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-400' },
          { label: 'Total Won',       value: '$59.40', color: 'text-[#F5C518]', bg: 'bg-yellow-50', border: 'border-l-yellow-400' },
          { label: 'Total Spent',     value: '$4.95',  color: 'text-[#1A4D8F]', bg: 'bg-blue-50', border: 'border-l-[#1A4D8F]' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-3 border-l-4 ${s.border}`}>
            <p className={`text-base font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1A1A2E]">Transaction History</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-50 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-9 h-9 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(tx => {
              const conf = TX_ICONS[tx.type] || TX_ICONS.deposit;
              const Icon = conf.icon;
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${conf.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${conf.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{tx.date}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                        {TX_LABELS[tx.type] || tx.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        {STATUS_ICON[tx.status]}{tx.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleCopyRef(tx.reference)}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                      title="Copy reference">
                      {copied === tx.reference ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
                    </button>
                    <span className={`text-sm font-black ${isCredit ? 'text-green-600' : 'text-[#1A4D8F]'}`}>
                      {isCredit ? '+' : ''}${Math.abs(tx.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal backdrop */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold leading-none">
              &times;
            </button>
            {modal === 'deposit'  && <DepositModal  onClose={() => setModal(null)} />}
            {modal === 'withdraw' && <WithdrawModal balance={balanceCents} onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}
