import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiDollarSign, FiArrowDownCircle, FiArrowUpCircle, FiClock, FiCheckCircle, FiXCircle, FiCopy, FiCheck, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { matchApi } from '../../api/matchApi';

const TX_ICONS = {
  deposit:         { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  prize_payout:    { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  manual_credit:   { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  refund:          { icon: FiArrowDownCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
  ticket_purchase: { icon: FiArrowUpCircle,   color: 'text-[#1A4D8F]', bg: 'bg-blue-50'   },
  withdrawal:      { icon: FiArrowUpCircle,   color: 'text-orange-500', bg: 'bg-orange-50' },
  manual_debit:    { icon: FiArrowUpCircle,   color: 'text-red-500',    bg: 'bg-red-50'    },
};

const STATUS_ICON = {
  completed: <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />,
  pending:   <FiClock       className="w-3.5 h-3.5 text-orange-400" />,
  failed:    <FiXCircle     className="w-3.5 h-3.5 text-red-400" />,
};

const TX_LABELS = {
  deposit: 'Deposit', prize_payout: 'Prize', ticket_purchase: 'Ticket',
  withdrawal: 'Withdrawal', manual_credit: 'Credit', manual_debit: 'Debit', refund: 'Refund',
};

const TYPE_FILTERS = {
  'All':         null,
  'Deposits':    ['deposit', 'manual_credit', 'refund'],
  'Withdrawals': ['withdrawal'],
  'Tickets':     ['ticket_purchase'],
  'Prizes':      ['prize_payout'],
};

// ── Deposit Modal ─────────────────────────────────────────────────────────
function DepositModal({ onClose, onSuccess }) {
  const [amount,   setAmount]   = useState('');
  const [provider, setProvider] = useState('stripe');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const presets = [5, 10, 20, 50];

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 1) return;
    setLoading(true);
    setError('');
    try {
      const amountCents = Math.round(Number(amount) * 100);
      const redirectUrl = window.location.origin + '/dashboard/wallet';
      const res = await matchApi.initDeposit(amountCents, provider, redirectUrl);
      const payUrl = res.data?.data?.payment_url;
      if (payUrl) window.location.href = payUrl;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-1">Add Funds</h3>
      <p className="text-gray-400 dark:text-slate-500 text-sm mb-5">Funds are added instantly after payment confirmation.</p>

      {/* Provider selector */}
      <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pay with</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setProvider('stripe')}
          className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
            provider === 'stripe'
              ? 'border-[#635BFF] bg-[#635BFF]/5'
              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
          }`}
        >
          <FiCreditCard className={`w-5 h-5 ${provider === 'stripe' ? 'text-[#635BFF]' : 'text-gray-400 dark:text-slate-500'}`} />
          <div>
            <p className={`text-sm font-black ${provider === 'stripe' ? 'text-[#635BFF]' : 'text-gray-600 dark:text-slate-300'}`}>Stripe</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Debit / Credit Card</p>
          </div>
        </button>
        <button
          onClick={() => setProvider('paypal')}
          className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
            provider === 'paypal'
              ? 'border-[#003087] bg-[#003087]/5'
              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
          }`}
        >
          <span className={`text-sm font-black ${provider === 'paypal' ? 'text-[#003087]' : 'text-gray-400 dark:text-slate-500'}`}>PP</span>
          <div>
            <p className={`text-sm font-black ${provider === 'paypal' ? 'text-[#003087]' : 'text-gray-600 dark:text-slate-300'}`}>PayPal</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">PayPal account</p>
          </div>
        </button>
      </div>

      {/* Amount presets */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {presets.map(p => (
          <button key={p} onClick={() => setAmount(String(p))}
            className={`py-2 rounded-xl text-sm font-bold border transition-all ${
              amount === String(p) ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}>
            ${p}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold">$</span>
        <input
          type="number" min="1" placeholder="Custom amount"
          value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
        />
      </div>

      {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

      <button
        onClick={handleDeposit}
        disabled={!amount || isNaN(amount) || Number(amount) < 1 || loading}
        className={`w-full font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white ${
          provider === 'stripe' ? 'bg-[#635BFF] hover:bg-[#4f46e5]' : 'bg-[#003087] hover:bg-[#002070]'
        }`}
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Redirecting...</>
          : `Continue with ${provider === 'stripe' ? 'Stripe' : 'PayPal'} — $${Number(amount || 0).toFixed(2)}`
        }
      </button>
    </div>
  );
}

// ── Withdraw Modal ────────────────────────────────────────────────────────
function WithdrawModal({ balance, onClose }) {
  const [amount,  setAmount]  = useState('');
  const [method,  setMethod]  = useState('paypal');
  const [email,   setEmail]   = useState('');
  const [bank,    setBank]    = useState('');
  const [account, setAccount] = useState('');
  const [routing, setRouting] = useState('');
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const validPayPal = method === 'paypal' && email && amount && Number(amount) >= 5 && Number(amount) <= balance;
  const validBank   = method === 'bank'   && bank && account && name && amount && Number(amount) >= 5 && Number(amount) <= balance;
  const valid = validPayPal || validBank;

  const handleWithdraw = async () => {
    if (!valid) return;
    setLoading(true);
    setError('');
    try {
      const data = {
        amount:   Math.round(Number(amount) * 100),
        method,
        ...(method === 'paypal'
          ? { paypal_email: email }
          : { bank_name: bank, account_number: account, routing_number: routing, account_name: name }),
      };
      await matchApi.withdraw(data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-1">Withdrawal Submitted</h3>
      <p className="text-gray-400 dark:text-slate-500 text-sm mb-6">Your withdrawal of <strong>${amount}</strong> is being processed. Allow 1–3 business days.</p>
      <button onClick={onClose} className="bg-[#1A4D8F] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">Close</button>
    </div>
  );

  return (
    <div>
      <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-1">Withdraw Funds</h3>
      <p className="text-gray-400 dark:text-slate-500 text-sm mb-4">Minimum $5.00. Available: <strong className="text-[#1A4D8F] dark:text-blue-400">${balance.toFixed(2)}</strong></p>

      {/* Method selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[['paypal', 'PayPal', 'PayPal email'], ['bank', 'Bank Transfer', 'Account number']].map(([val, label, sub]) => (
          <button key={val} onClick={() => setMethod(val)}
            className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
              method === val ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-900/20 text-[#1A4D8F] dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500'
            }`}>
            {label}<br /><span className="font-normal opacity-70">{sub}</span>
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="relative mb-3">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold text-sm">$</span>
        <input type="number" min="5" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
      </div>

      {/* PayPal fields */}
      {method === 'paypal' && (
        <input type="email" placeholder="Your PayPal email address" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] mb-3" />
      )}

      {/* Bank fields */}
      {method === 'bank' && (
        <div className="space-y-3 mb-3">
          <input type="text" placeholder="Account holder name" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
          <input type="text" placeholder="Bank name" value={bank} onChange={e => setBank(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
          <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
          <input type="text" placeholder="Routing / Sort code (optional)" value={routing} onChange={e => setRouting(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
        </div>
      )}

      {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

      <button onClick={handleWithdraw} disabled={!valid || loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : 'Submit Withdrawal'}
      </button>
    </div>
  );
}

// ── Wallet Page ────────────────────────────────────────────────────────────
export default function Wallet() {
  const { user }  = useAuth();
  const [filter, setFilter] = useState('All');
  const [modal,  setModal]  = useState(null);
  const [copied, setCopied] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, loading, refetch } = useTransactions({ limit: 50 });
  const balance = user?.balance ?? 0;

  // Auto-verify Stripe / PayPal return after redirect
  useEffect(() => {
    const stripeSession  = searchParams.get('stripe_session');
    const paypalReturn   = searchParams.get('pp');
    const paypalOrderId  = searchParams.get('token'); // PayPal appends token=ORDER_ID

    if (!stripeSession && !paypalReturn) return;

    const verify = async () => {
      setVerifyMsg('Verifying your payment…');
      try {
        const params = stripeSession
          ? { stripe_session: stripeSession }
          : { paypal_order_id: paypalOrderId };

        await matchApi.verifyDeposit(params);
        setVerifyMsg('Payment confirmed! Your wallet has been credited.');
        refetch();
      } catch {
        setVerifyMsg('Could not verify payment automatically. Contact support if your balance was not updated.');
      } finally {
        // Clear query params from URL without full reload
        setSearchParams({}, { replace: true });
      }
    };

    verify();
  }, []); // run once on mount

  const filtered = transactions.filter(tx => {
    const types = TYPE_FILTERS[filter];
    if (!types) return true;
    return types.includes(tx.type);
  });

  const totalDeposited = transactions.filter(t => t.type === 'deposit' && t.status === 'completed' && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0) / 100;
  const totalWon   = transactions.filter(t => t.type === 'prize_payout' && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0) / 100;
  const totalSpent = Math.abs(transactions.filter(t => t.type === 'ticket_purchase' && t.amount < 0)
    .reduce((s, t) => s + t.amount, 0)) / 100;

  const handleCopyRef = (ref) => {
    navigator.clipboard.writeText(ref).catch(() => {});
    setCopied(ref);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My Wallet</h1>
        <p className="text-gray-400 dark:text-slate-500 text-sm">Manage your balance, deposits and withdrawals</p>
      </div>

      {/* Payment return banner */}
      {verifyMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          verifyMsg.includes('confirmed') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/30 text-[#1A4D8F] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        }`}>
          {verifyMsg.includes('confirmed') ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
          {verifyMsg}
        </div>
      )}

      {/* Balance card */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-[#F5C518]/10 rounded-full" />
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
        <p className="text-4xl font-black mb-5">${balance.toFixed(2)}</p>
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
          { label: 'Total Deposited', value: `$${totalDeposited.toFixed(2)}`, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/30',  border: 'border-l-green-400' },
          { label: 'Total Won',       value: `$${totalWon.toFixed(2)}`,       color: 'text-[#F5C518]',  bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-l-yellow-400' },
          { label: 'Total Spent',     value: `$${totalSpent.toFixed(2)}`,     color: 'text-[#1A4D8F] dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-900/30',   border: 'border-l-[#1A4D8F]' },
        ].map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3 border-l-4 ${s.border}`}>
            <p className={`text-base font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-[#1A1A2E] dark:text-white">Transaction History</h2>
        </div>
        <div className="flex gap-2 px-5 py-3 border-b border-gray-50 dark:border-slate-700 overflow-x-auto scrollbar-hide">
          {Object.keys(TYPE_FILTERS).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-9 h-9 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {filtered.map(tx => {
              const conf = TX_ICONS[tx.type] || TX_ICONS.deposit;
              const Icon = conf.icon;
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${conf.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${conf.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] dark:text-white truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400 dark:text-slate-500">{tx.date}</span>
                      <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-medium">
                        {TX_LABELS[tx.type] || tx.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                        {STATUS_ICON[tx.status]} {tx.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleCopyRef(tx.reference)}
                      className="text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors" title="Copy reference">
                      {copied === tx.reference ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
                    </button>
                    <span className={`text-sm font-black ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-[#1A4D8F] dark:text-blue-400'}`}>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors text-lg font-bold leading-none">&times;</button>
            {modal === 'deposit'  && <DepositModal  onClose={() => setModal(null)} />}
            {modal === 'withdraw' && <WithdrawModal balance={balance} onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}
