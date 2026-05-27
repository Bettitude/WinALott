import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiArrowDownCircle, FiArrowUpCircle, FiClock, FiCheckCircle, FiXCircle,
  FiCopy, FiCheck, FiPlus, FiTrash2, FiStar, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { matchApi } from '../../api/matchApi';
import PayPalHostedButton from '../../components/ui/PayPalHostedButton';

const TX_ICONS = {
  deposit:         { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/30'   },
  prize_payout:    { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/30'   },
  manual_credit:   { icon: FiArrowDownCircle, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/30'   },
  refund:          { icon: FiArrowDownCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  ticket_purchase: { icon: FiArrowUpCircle,   color: 'text-[#1A4D8F]', bg: 'bg-blue-50 dark:bg-blue-900/30'    },
  withdrawal:      { icon: FiArrowUpCircle,   color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  manual_debit:    { icon: FiArrowUpCircle,   color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/30'      },
};
const TX_LABELS = {
  deposit: 'Deposit', prize_payout: 'Prize', ticket_purchase: 'Ticket',
  withdrawal: 'Withdrawal', manual_credit: 'Credit', manual_debit: 'Debit', refund: 'Refund',
};
const STATUS_ICON = {
  completed:  <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />,
  successful: <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />,
  pending:    <FiClock       className="w-3.5 h-3.5 text-orange-400" />,
  processing: <FiClock       className="w-3.5 h-3.5 text-blue-400" />,
  failed:     <FiXCircle     className="w-3.5 h-3.5 text-red-400" />,
};
const TYPE_FILTERS = {
  'All': null,
  'Deposits': ['deposit', 'manual_credit', 'refund'],
  'Withdrawals': ['withdrawal'],
  'Tickets': ['ticket_purchase'],
  'Prizes': ['prize_payout'],
};

// ── DepositModal ──────────────────────────────────────────────────────────
function DepositModal({ onClose, onSuccess }) {
  const { user, isDemo } = useAuth();
  const [amount,   setAmount]   = useState('');
  const [provider, setProvider] = useState('paystack');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const presets = [5, 10, 20, 50, 100];

  const handleDeposit = async () => {
    const n = Number(amount);
    if (!n || n < 1) { setError('Enter a valid amount (min $1)'); return; }
    setLoading(true);
    setError('');
    try {
      const amountCents = Math.round(n * 100);

      // Demo accounts can't hit the real payment gateway — simulate instantly
      if (isDemo) {
        await new Promise(r => setTimeout(r, 800));
        onSuccess?.(`$${n.toFixed(2)} added to your demo wallet!`, amountCents);
        return;
      }

      const res = await matchApi.initDeposit(amountCents, provider,
        `${window.location.origin}/dashboard/wallet?verify=1&provider=${provider}`);
      const d = res.data?.data;

      // Backend mock mode — no real payment keys configured
      if (d?.mock) {
        await matchApi.verifyDeposit({ mock: true, amount: amountCents });
        onSuccess?.(`$${n.toFixed(2)} added to your wallet (test mode)`, amountCents);
        return;
      }

      if (d?.payment_url) {
        window.location.href = d.payment_url;
      } else {
        setError('No payment URL returned. Check your payment configuration.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment init failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-1">Add Funds</h3>
      <p className="text-gray-400 dark:text-slate-500 text-sm mb-5">Credited instantly after payment confirmation.</p>

      <p className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pay with</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { id: 'flutterwave',      name: 'Flutterwave',   sub: 'Card / USSD',   color: '#F5A623' },
          { id: 'flutterwave_bank', name: 'Bank Transfer', sub: 'Direct Bank',   color: '#27AE60' },
          { id: 'paystack',         name: 'Paystack',      sub: 'Card / Bank',   color: '#00c3f7' },
        ].map(p => (
          <button key={p.id} onClick={() => setProvider(p.id)}
            className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 transition-all"
            style={provider === p.id ? { borderColor: p.color, background: `${p.color}12` } : { borderColor: '#e5e7eb' }}
          >
            <span className="text-xs font-black text-center leading-tight" style={{ color: provider === p.id ? p.color : '#6b7280' }}>{p.name}</span>
            <span className="text-[9px] text-gray-400 dark:text-slate-500 text-center">{p.sub}</span>
          </button>
        ))}
      </div>

      {provider === 'paypal' ? (
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 leading-relaxed">
            Click the button below to complete your WAP purchase securely via PayPal.
            WAP will be credited to your wallet once payment is confirmed.
          </p>
          <PayPalHostedButton className="mb-2" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(String(p))}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                  amount === String(p) ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                }`}>
                ${p}
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input type="number" min="1" placeholder="Custom amount" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
          </div>

          {error && <p className="text-red-500 text-xs mb-3 flex items-center gap-1"><FiAlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>}

          <button onClick={handleDeposit} disabled={!amount || isNaN(amount) || Number(amount) < 1 || loading}
            className="w-full font-bold py-3 rounded-xl text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-[#1A4D8F] hover:bg-[#0D2B5E]">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Redirecting…</>
              : `Deposit $${Number(amount || 0).toFixed(2)} via ${provider === 'flutterwave_bank' ? 'Bank Transfer' : provider === 'flutterwave' ? 'Flutterwave' : 'Paystack'}`
            }
          </button>
        </>
      )}
    </div>
  );
}

// ── WithdrawModal ─────────────────────────────────────────────────────────
function WithdrawModal({ balance, savedMethods, onClose, onSuccess }) {
  const [step,     setStep]     = useState('form');   // form | confirm | done
  const [amount,   setAmount]   = useState('');
  const [method,   setMethod]   = useState('bank');
  const [selSaved, setSelSaved] = useState(null);
  const [addNew,   setAddNew]   = useState(false);
  // new method fields
  const [email,    setEmail]    = useState('');
  const [accName,  setAccName]  = useState('');
  const [bankName, setBankName] = useState('');
  const [accNum,   setAccNum]   = useState('');
  const [routing,  setRouting]  = useState('');
  const [saveMe,   setSaveMe]   = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [result,   setResult]   = useState(null);

  const paypalSaved = savedMethods.filter(m => m.type === 'paypal');
  const bankSaved   = savedMethods.filter(m => m.type === 'bank');
  const currentSaved = method === 'paypal' ? paypalSaved : bankSaved;

  useEffect(() => {
    const def = currentSaved.find(m => m.is_default) || currentSaved[0];
    setSelSaved(def?.id || null);
    setAddNew(!def);
  }, [method]);

  const selectedMethod = currentSaved.find(m => m.id === selSaved);
  const amtNum = Number(amount);
  const isValid = amtNum >= 5 && amtNum <= balance / 100 && (
    selSaved
      ? !!selectedMethod
      : method === 'paypal' ? !!email : (!!accName && !!bankName && !!accNum)
  );

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      let payload = { amount: Math.round(amtNum * 100), method };
      if (selSaved && selectedMethod) {
        const d = selectedMethod.details;
        if (method === 'paypal') payload.paypal_email = d.paypal_email;
        else { payload.account_number = d.account_number; payload.bank_code = d.bank_code; payload.bank_name = d.bank_name; payload.account_name = d.account_name; }
      } else {
        if (method === 'paypal') payload.paypal_email = email;
        else { payload.account_name = accName; payload.bank_name = bankName; payload.account_number = accNum; payload.routing_number = routing; }
        if (saveMe) {
          await matchApi.savePaymentMethod({
            type: method,
            label: method === 'paypal' ? email : `${bankName} ···${accNum.slice(-4)}`,
            details: method === 'paypal' ? { paypal_email: email } : { account_name: accName, bank_name: bankName, account_number: accNum, routing_number: routing },
          });
        }
      }
      const res = await matchApi.withdraw(payload);
      setResult(res.data?.data);
      setStep('done');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]";

  if (step === 'done') return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-1">Withdrawal Submitted</h3>
      <p className="text-gray-400 dark:text-slate-500 text-sm mb-2">
        {result?.auto
          ? 'Your withdrawal is being processed automatically and should arrive shortly.'
          : `$${amtNum.toFixed(2)} withdrawal received. Admin processes within 1–3 business days.`}
      </p>
      {result?.reference && (
        <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mb-6">Ref: {result.reference}</p>
      )}
      <button onClick={onClose} className="bg-[#1A4D8F] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">Close</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-black text-[#1A1A2E] dark:text-white text-lg mb-0.5">Withdraw Funds</h3>
        <p className="text-gray-400 dark:text-slate-500 text-xs">Min $5.00 · Available: <strong className="text-[#1A4D8F] dark:text-blue-400">${(balance / 100).toFixed(2)}</strong></p>
      </div>

      {/* Method tabs */}
      <div className="grid grid-cols-2 gap-2">
        {[['bank', 'Bank Transfer'], ['paypal', 'PayPal']].map(([val, lbl]) => (
          <button key={val} onClick={() => setMethod(val)}
            className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
              method === val ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-900/20 text-[#1A4D8F] dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400'
            }`}>{lbl}</button>
        ))}
      </div>

      {/* Amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
        <input type="number" min="5" step="0.01" placeholder="Amount (min $5)" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputCls} pl-8`} />
      </div>

      {/* Saved methods */}
      {currentSaved.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Saved accounts</p>
          {currentSaved.map(m => (
            <button key={m.id} onClick={() => { setSelSaved(m.id); setAddNew(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                selSaved === m.id && !addNew
                  ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selSaved === m.id && !addNew ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                {m.is_default ? <FiStar className="w-4 h-4" /> : <FiDollarSign className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate">{m.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500">{m.type === 'paypal' ? m.details.paypal_email : `${m.details.bank_name} · ···${(m.details.account_number || '').slice(-4)}`}</p>
              </div>
              {selSaved === m.id && !addNew && <FiCheckCircle className="w-4 h-4 text-[#1A4D8F] shrink-0" />}
            </button>
          ))}
          <button onClick={() => { setSelSaved(null); setAddNew(true); }}
            className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
              addNew ? 'border-[#1A4D8F] bg-blue-50 dark:bg-blue-900/20 text-[#1A4D8F]' : 'border-dashed border-gray-200 dark:border-slate-600 text-gray-400 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
            }`}>
            <FiPlus className="w-3.5 h-3.5" /> Use a different account
          </button>
        </div>
      )}

      {/* New method fields */}
      {(addNew || currentSaved.length === 0) && (
        <div className="space-y-3">
          {method === 'paypal' ? (
            <input type="email" placeholder="PayPal email address" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          ) : (
            <>
              <input type="text" placeholder="Account holder name" value={accName} onChange={e => setAccName(e.target.value)} className={inputCls} />
              <input type="text" placeholder="Bank name" value={bankName} onChange={e => setBankName(e.target.value)} className={inputCls} />
              <input type="text" placeholder="Account number" value={accNum} onChange={e => setAccNum(e.target.value)} className={inputCls} />
              <input type="text" placeholder="Routing / BSB / Sort code (optional)" value={routing} onChange={e => setRouting(e.target.value)} className={inputCls} />
            </>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={saveMe} onChange={e => setSaveMe(e.target.checked)} className="accent-[#1A4D8F] w-4 h-4" />
            <span className="text-xs text-gray-500 dark:text-slate-400">Save for future withdrawals</span>
          </label>
        </div>
      )}

      {error && <p className="text-red-500 text-xs flex items-center gap-1"><FiAlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>}

      <button onClick={handleSubmit} disabled={!isValid || loading}
        className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : `Withdraw $${Number(amount||0).toFixed(2)}`}
      </button>
    </div>
  );
}

// ── Main Wallet page ───────────────────────────────────────────────────────
export default function Wallet() {
  const { user, updateUser, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter]     = useState('All');
  const [modal,  setModal]      = useState(null);
  const [copied, setCopied]     = useState(false);
  const [banner, setBanner]     = useState('');
  const [bannerOk, setBannerOk] = useState(true);
  const [savedMethods, setSavedMethods] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, loading, refetch } = useTransactions({ limit: 50 });
  const balance = user?.balance ?? 0;

  // Load saved payment methods
  const loadMethods = useCallback(async () => {
    try {
      const res = await matchApi.getPaymentMethods();
      setSavedMethods(res.data?.data?.methods || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadMethods(); }, [loadMethods]);

  // Auto-open deposit modal when redirected with ?deposit=1 (e.g. from StakeModal low-balance)
  useEffect(() => {
    if (searchParams.get('deposit') === '1') {
      setModal('deposit');
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Handle redirect back after Paystack / PayPal
  useEffect(() => {
    const provider    = searchParams.get('provider');
    const psRef       = searchParams.get('reference') || searchParams.get('trxref');
    const fwRef       = searchParams.get('tx_ref');   // Flutterwave redirect param
    const ppToken     = searchParams.get('token');
    const ppReturn    = searchParams.get('pp');
    const verifyFlag  = searchParams.get('verify');
    if (!verifyFlag && !ppReturn) return;

    const verify = async () => {
      setBannerOk(true);
      setBanner('Verifying payment…');
      try {
        const params = ppReturn || provider === 'paypal'
          ? { paypal_order_id: ppToken }
          : provider?.startsWith('flutterwave') || fwRef
          ? { reference: fwRef || psRef }
          : { reference: psRef };
        const res = await matchApi.verifyDeposit(params);
        const credited = res.data?.data?.amount_credited;
        // Update balance: for real DB users this reflects the server credit;
        // for mock/no-DB, we apply it locally so the UI shows the new amount.
        if (credited) updateUser({ balance: (user?.balance ?? 0) + credited });
        // Also pull fresh data from the server (no-op for demo tokens)
        refreshBalance();
        setBanner('Payment confirmed. Your wallet has been credited.');
        refetch();
      } catch {
        setBannerOk(false);
        setBanner('Could not verify payment automatically. Contact support if your balance was not updated.');
      } finally {
        setSearchParams({}, { replace: true });
      }
    };
    verify();
  }, []);

  const showBanner = (msg, ok = true) => {
    setBannerOk(ok);
    setBanner(msg);
    setTimeout(() => setBanner(''), 5000);
  };

  const filtered = transactions.filter(tx => {
    const types = TYPE_FILTERS[filter];
    return !types || types.includes(tx.type);
  });

  const totalDeposited = transactions.filter(t => ['deposit','manual_credit'].includes(t.type) && t.amount > 0).reduce((s, t) => s + t.amount, 0) / 100;
  const totalWon       = transactions.filter(t => t.type === 'prize_payout' && t.amount > 0).reduce((s, t) => s + t.amount, 0) / 100;
  const totalSpent     = Math.abs(transactions.filter(t => t.type === 'ticket_purchase' && t.amount < 0).reduce((s, t) => s + t.amount, 0)) / 100;

  const deleteSaved = async (id) => {
    await matchApi.deletePaymentMethod(id).catch(() => {});
    setSavedMethods(m => m.filter(x => x.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white">My Wallet</h1>
        <p className="text-gray-400 dark:text-slate-500 text-sm">Balance, deposits, withdrawals and saved accounts</p>
      </div>

      {/* Verification banner */}
      {banner && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          bannerOk
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {bannerOk ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <FiAlertCircle className="w-4 h-4 shrink-0" />}
          {banner}
        </div>
      )}

      {/* Balance card */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-5 sm:p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-[#F5C518]/10 rounded-full" />
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
        <p className="text-4xl font-black mb-5 tabular-nums">${(balance / 100).toFixed(2)}</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        {[
          { label: 'Total Deposited', value: `$${totalDeposited.toFixed(2)}`, color: 'text-green-600 dark:text-green-400',  border: 'border-l-green-400' },
          { label: 'Total Won',       value: `$${totalWon.toFixed(2)}`,       color: 'text-[#F5C518]',                       border: 'border-l-yellow-400' },
          { label: 'Total Spent',     value: `$${totalSpent.toFixed(2)}`,     color: 'text-[#1A4D8F] dark:text-blue-400',    border: 'border-l-[#1A4D8F]' },
        ].map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-3 border-l-4 ${s.border}`}>
            <p className={`text-sm sm:text-base font-black ${s.color} tabular-nums`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Saved payment methods */}
      {savedMethods.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#1A1A2E] dark:text-white text-sm">Saved Accounts</h2>
            <button onClick={() => setModal('withdraw')}
              className="text-xs text-[#1A4D8F] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
              <FiPlus className="w-3 h-3" /> Add new
            </button>
          </div>
          <div className="space-y-2">
            {savedMethods.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-[#1A4D8F]/10 flex items-center justify-center shrink-0">
                  <FiDollarSign className="w-4 h-4 text-[#1A4D8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A2E] dark:text-white truncate">{m.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">
                    {m.type === 'paypal' ? m.details.paypal_email : `${m.details.bank_name} · ···${(m.details.account_number || '').slice(-4)}`}
                    {m.is_default && <span className="ml-1 text-[#F5C518]">· Default</span>}
                  </p>
                </div>
                <button onClick={() => deleteSaved(m.id)}
                  className="text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors p-1 shrink-0">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-[#1A1A2E] dark:text-white">Transaction History</h2>
        </div>
        <div className="flex gap-2 px-5 py-3 border-b border-gray-50 dark:border-slate-700 overflow-x-auto scrollbar-hide">
          {Object.keys(TYPE_FILTERS).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}>{f}</button>
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
                <div key={tx.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${conf.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${conf.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] dark:text-white truncate">{tx.description || TX_LABELS[tx.type] || tx.type}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400 dark:text-slate-500">{tx.date}</span>
                      <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-medium">{TX_LABELS[tx.type] || tx.type}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">{STATUS_ICON[tx.status]} {tx.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { navigator.clipboard.writeText(tx.reference).catch(()=>{}); setCopied(tx.reference); setTimeout(()=>setCopied(false),1500); }}
                      className="text-gray-300 dark:text-slate-600 hover:text-gray-500 transition-colors" title="Copy reference">
                      {copied === tx.reference ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
                    </button>
                    <span className={`text-sm font-black ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-[#1A4D8F] dark:text-blue-400'}`}>
                      {isCredit ? '+' : '-'}${Math.abs(tx.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-xl font-bold leading-none">&times;</button>
            {modal === 'deposit' && (
              <DepositModal
                onClose={() => setModal(null)}
                onSuccess={(msg, amountBTP) => {
                  setModal(null);
                  showBanner(msg || 'Deposit successful!');
                  if (amountBTP) updateUser({ balance: (user?.balance ?? 0) + amountBTP });
                  refetch();
                  // Redirect back if this deposit was triggered by a low-balance flow
                  const returnUrl = localStorage.getItem('redirect_after_topup');
                  if (returnUrl) {
                    localStorage.removeItem('redirect_after_topup');
                    setTimeout(() => navigate(returnUrl), 600);
                  }
                }}
              />
            )}
            {modal === 'withdraw' && (
              <WithdrawModal
                balance={balance}
                savedMethods={savedMethods}
                onClose={() => setModal(null)}
                onSuccess={() => {
                  setModal(null);
                  showBanner('Withdrawal submitted.');
                  refreshBalance();
                  refetch();
                  loadMethods();
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
