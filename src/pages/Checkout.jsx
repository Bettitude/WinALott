import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiCheckCircle, FiShoppingBag, FiArrowLeft, FiStar, FiAward, FiZap, FiCopy,
         FiLogIn, FiShoppingCart, FiAlertCircle, FiPlusCircle, FiTrendingUp } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { matchApi } from '../api/matchApi';
import { formatBTP } from '../utils/btp';
import PayPalHostedButton from '../components/ui/PayPalHostedButton';

const steps = ['Review', 'Payment', 'Confirmation'];

const TIER_BADGE = {
  silver:   { Icon: FiStar,  cls: 'bg-gray-100 text-gray-600 border border-gray-300',      label: 'Silver' },
  gold:     { Icon: FiAward, cls: 'bg-yellow-50 text-yellow-700 border border-yellow-300', label: 'Gold' },
  platinum: { Icon: FiZap,   cls: 'bg-purple-50 text-purple-700 border border-purple-300', label: 'Platinum' },
};

function generateTicketNumber() {
  const now   = new Date();
  const date  = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const seq   = String(Math.floor(Math.random() * 99999) + 1).padStart(5,'0');
  return `WAL-${date}-${seq}`;
}

// 1 WALP = $1 USD
const BTP_PER_USD = 1;

export default function Checkout() {
  const { items, cartTotal, cartPotentialWin, clearCart } = useCart();
  const { isAuthenticated, user, updateUser } = useAuth();
  const balance = user?.balance ?? 0;
  const hasEnoughBTP = balance >= cartTotal;
  const shortfall = cartTotal - balance;

  const [step, setStep]         = useState(1);
  const [payMethod, setPayMethod] = useState('btp');
  const [card, setCard]         = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [confirmedTickets, setConfirmedTickets] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const setC = (k, v) => setCard(c => ({ ...c, [k]: v }));

  const validateCard = () => {
    const e = {};
    if (!card.name)                                          e.name   = 'Name required';
    if (!card.number || card.number.replace(/\s/g,'').length < 16) e.number = 'Valid 16-digit card number required';
    if (!card.expiry || !/\d{2}\/\d{2}/.test(card.expiry)) e.expiry = 'Format: MM/YY';
    if (!card.cvv    || card.cvv.length < 3)                e.cvv    = 'CVV required';
    return e;
  };

  const handlePay = async () => {
    if (!hasEnoughBTP) {
      setErrors({ general: 'Insufficient BTP balance. Please deposit more to continue.' });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const purchased = [];

      for (const item of items) {
        let ticketNumber;

        try {
          const res = await matchApi.purchaseTicket(item.marketId, item.matchId, item.prediction);
          const ticket = res.data?.data?.ticket || res.data?.ticket;
          ticketNumber = ticket?.ticket_number || generateTicketNumber();
        } catch (apiErr) {
          // Only allow fallback if it's a network/unavailable error, not a 4xx
          if (apiErr?.response?.status >= 400) throw apiErr;
          ticketNumber = generateTicketNumber();
        }

        purchased.push({
          ticketNumber,
          matchId:   item.matchId,
          match:     item.match,
          market:    item.market,
          pick:      item.pick,
          tier:      item.tier,
          price:     item.price,
          prediction: item.prediction,
        });
      }

      // Optimistically deduct BTP from local user state
      if (updateUser) updateUser({ balance: balance - cartTotal });

      // Persist to localStorage so My Stakes page can show them (mock/offline mode)
      const userId = user?.id || 'guest';
      const lsKey  = `winalot_stakes_${userId}`;
      const existing = (() => { try { return JSON.parse(localStorage.getItem(lsKey) || '[]'); } catch { return []; } })();
      const newStakes = purchased.map(tk => ({
        id:           `local-${tk.matchId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ticketNumber: tk.ticketNumber,
        match:        tk.match,
        market:       tk.market,
        myPick:       tk.pick,
        adminPick:    '—',
        entryFee:     tk.price,
        prize:        0,
        status:       'pending',
        date:         new Date().toLocaleDateString(),
        _raw:         { tier: tk.tier },
      }));
      localStorage.setItem(lsKey, JSON.stringify([...existing, ...newStakes]));

      setConfirmedTickets(purchased);
      clearCart();
      setStep(3);
    } catch (err) {
      setErrors({ general: err.message || 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyTicket = (num) => {
    navigator.clipboard.writeText(num).catch(() => {});
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatCard   = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v) => { const r = v.replace(/\D/g,'').slice(0,4); return r.length > 2 ? r.slice(0,2)+'/'+r.slice(2) : r; };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <FiShoppingCart className="w-8 h-8 text-[#1A4D8F]" />
        </div>
        <h2 className="text-xl font-black text-[#1A1A2E] dark:text-white mb-2">Log in to checkout</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Your cart is saved — log in to complete your purchase and receive your tickets.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 bg-[#1A4D8F] text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors"
        >
          <FiLogIn className="w-4 h-4" /> Log In to Continue
        </Link>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-[#1A4D8F] dark:text-blue-400 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step > i + 1  ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-[#1A4D8F] text-white shadow-lg' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? <FiCheck className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${step === i + 1 ? 'text-[#1A4D8F]' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 mb-5 transition-all ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Review */}
      {step === 1 && (
        <div>
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-10 text-center">
              <p className="text-gray-400 mb-4">Your cart is empty.</p>
              <Link to="/lobby" className="text-[#1A4D8F] font-semibold hover:underline text-sm">Browse Lobby</Link>
            </div>
          ) : (
            <div className="space-y-4">

              {/* ── Bet slip ──────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-black text-[#1A1A2E]">Your Selections</h2>
                  <span className="text-xs text-gray-400 font-medium">{items.length} prediction{items.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="divide-y divide-gray-50">
                  {items.map(item => {
                    const tierMeta = TIER_BADGE[item.tier];
                    const potentialWin = item.prizePool > 0
                      ? (item.prizePool / (item.maxWinners || 1))
                      : 0;
                    return (
                      <div key={item.cartId} className="flex gap-3 px-6 py-4">
                        {/* Tier bar */}
                        <div className={`w-1 rounded-full shrink-0 self-stretch ${
                          item.tier === 'platinum' ? 'bg-purple-500'
                          : item.tier === 'gold'   ? 'bg-[#F5C518]'
                          : 'bg-gray-300'
                        }`} />

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{item.match}</p>
                            {tierMeta && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${tierMeta.cls}`}>
                                <tierMeta.Icon className="w-2.5 h-2.5" />
                                {tierMeta.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{item.market}</p>
                          <p className="text-xs font-bold text-[#1A4D8F]">Pick: {item.pick}</p>
                        </div>

                        {/* Right column: entry + potential win */}
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black text-[#1A1A2E]">
                            {item.price === 0 ? 'FREE' : `$${(item.price ?? 0).toFixed(2)}`}
                          </p>
                          {potentialWin > 0 ? (
                            <p className="text-[11px] font-black text-green-600 mt-0.5">
                              win up to <span className="text-green-700">${potentialWin.toFixed(2)}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-400 mt-0.5">draw entry</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Potential Winnings hero card ───────────────────────── */}
              {cartPotentialWin > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-lg border border-green-200">
                  {/* Header */}
                  <div className="bg-[#0D2B5E] px-5 py-3 flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-[#F5C518]" />
                    <p className="text-xs font-black text-[#F5C518] uppercase tracking-widest">Potential Winnings</p>
                  </div>
                  {/* Body */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-5 py-5">
                    {/* Per-game rows */}
                    {items.filter(i => i.prizePool > 0).map(item => {
                      const pw = item.prizePool / (item.maxWinners || 1);
                      return (
                        <div key={item.cartId} className="flex justify-between items-center py-1.5 border-b border-green-100 last:border-0">
                          <p className="text-xs text-gray-600 truncate max-w-[60%]">{item.match}</p>
                          <p className="text-sm font-black text-green-700">${pw.toFixed(2)}</p>
                        </div>
                      );
                    })}

                    {/* Total */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-green-200">
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Total possible win</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">If correct predictions win their draw</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-green-700 leading-none">${cartPotentialWin.toFixed(2)}</p>
                        <p className="text-[10px] text-green-500 mt-0.5 font-semibold">
                          {((cartPotentialWin / Math.max(cartTotal, 0.01)) * 100).toFixed(0)}× your entry
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Order summary + pay ────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
                {/* Cost vs Win side-by-side */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Your Entry</p>
                    <p className="text-lg font-black text-[#1A4D8F]">${cartTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">{cartTotal.toLocaleString()} WALP</p>
                  </div>
                  {cartPotentialWin > 0 && (
                    <>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-[#F5C518] flex items-center justify-center">
                          <FiTrendingUp className="w-3.5 h-3.5 text-[#1A1A2E]" />
                        </div>
                      </div>
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-wider mb-1">You Could Win</p>
                        <p className="text-lg font-black text-green-700">${cartPotentialWin.toFixed(2)}</p>
                        <p className="text-[10px] text-green-500">if all correct</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Balance status */}
                {hasEnoughBTP ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-700">Balance ready</p>
                        <p className="text-xs text-green-600">{balance.toLocaleString()} WALP available</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-green-700">{(balance - cartTotal).toLocaleString()} remaining</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 mb-4">
                    <FiAlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-orange-700">Insufficient balance</p>
                      <p className="text-xs text-orange-600">Need {shortfall.toLocaleString()} more WALP (≈ ${shortfall.toFixed(2)})</p>
                    </div>
                  </div>
                )}

                {errors.general && (
                  <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-xs">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.general}
                  </div>
                )}

                {hasEnoughBTP ? (
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-4 rounded-xl hover:brightness-105 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-[#1A1A2E] border-t-transparent rounded-full animate-spin" />Processing…</>
                      : <>Confirm &amp; Pay {cartTotal.toLocaleString()} WALP</>}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#1A4D8F] text-white font-bold py-4 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm"
                  >
                    Top Up &amp; Pay
                  </button>
                )}

                <p className="text-center text-[10px] text-gray-400 mt-3">
                  1 WALP = $1.00 USD &nbsp;·&nbsp; Winnings credited to your wallet instantly
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-black text-[#1A1A2E] mb-5">Pay with WALP</h2>

          {/* WALP Balance status */}
          <div className={`rounded-2xl p-4 mb-6 border-2 ${hasEnoughBTP ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500">Your WALP Balance</p>
              <span className={`text-base font-black ${hasEnoughBTP ? 'text-green-700' : 'text-red-600'}`}>
                {balance.toLocaleString()} WALP
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500">Order Total</p>
              <span className="text-base font-black text-[#1A4D8F]">
                {cartTotal.toLocaleString()} WALP
              </span>
            </div>
            {hasEnoughBTP ? (
              <div className="mt-3 flex items-center gap-2 text-green-700">
                <FiCheck className="w-4 h-4 shrink-0" />
                <p className="text-xs font-semibold">
                  After payment: <strong>{(balance - cartTotal).toLocaleString()} WALP</strong> remaining
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-red-600">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-semibold">
                  You need <strong>{shortfall.toLocaleString()} more WALP</strong>
                  {' '}(≈ ${shortfall.toFixed(2)} USD)
                </p>
              </div>
            )}
          </div>

          {/* Conversion rate info */}
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl px-4 py-3 mb-6 text-xs text-gray-600">
            <p className="font-bold text-[#1A1A2E] mb-1">WALP Value</p>
            <p>1 WALP = $1.00 USD &nbsp;·&nbsp; What you see is what you pay</p>
            <p className="text-gray-400 mt-0.5">WALP is the platform currency used to enter all markets.</p>
          </div>

          {errors.general && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              {errors.general}
            </div>
          )}

          {hasEnoughBTP ? (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-3.5 rounded-xl hover:brightness-105 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Processing…' : `Pay ${cartTotal.toLocaleString()} WALP`}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                <p className="text-red-600 font-bold text-sm mb-1">Insufficient WALP Balance</p>
                <p className="text-red-500 text-xs">
                  You need {shortfall.toLocaleString()} more WALP (≈ ${shortfall.toFixed(2)}) to complete this order.
                </p>
              </div>

              {/* Buy WALP directly with PayPal */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Top Up WALP with PayPal</p>
                <PayPalHostedButton />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-100" />
                <span>or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <Link
                to="/dashboard/wallet?deposit=1"
                onClick={() => localStorage.setItem('redirect_after_topup', '/checkout')}
                className="flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-black py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm"
              >
                <FiPlusCircle className="w-4 h-4" />
                Deposit Funds
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">Your tickets are confirmed!</h2>
            <p className="text-gray-400 text-sm">
              We've sent a confirmation to your email. Good luck with your predictions!
            </p>
          </div>

          {/* Ticket list */}
          <div className="space-y-3 mb-6">
            {confirmedTickets.map(tk => {
              const tierMeta = TIER_BADGE[tk.tier];
              return (
                <div
                  key={tk.ticketNumber}
                  className="border border-gray-100 rounded-2xl p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{tk.match}</p>
                        {tierMeta && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${tierMeta.cls}`}>
                            <tierMeta.Icon className="w-2.5 h-2.5" />
                            {tierMeta.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{tk.market} — {tk.pick}</p>

                      {/* Ticket number */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1A4D8F] bg-blue-50 px-2.5 py-1 rounded-lg tracking-wide">
                          {tk.ticketNumber}
                        </span>
                        <button
                          onClick={() => copyTicket(tk.ticketNumber)}
                          className="p-1 text-gray-400 hover:text-[#1A4D8F] transition-colors"
                          title="Copy ticket number"
                        >
                          {copiedId === tk.ticketNumber
                            ? <FiCheck className="w-3.5 h-3.5 text-green-500" />
                            : <FiCopy className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-black text-[#1A4D8F]">
                        {!tk.price ? 'FREE' : `$${(tk.price ?? 0).toFixed(2)}`}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {tk.matchId}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/dashboard/tickets"
              className="bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors flex items-center gap-2"
            >
              <FiShoppingBag className="w-4 h-4" /> View My Tickets
            </Link>
            <Link
              to="/lobby"
              className="border border-[#1A4D8F] text-[#1A4D8F] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
            >
              Back to Lobby
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
