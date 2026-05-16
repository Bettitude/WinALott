import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiCreditCard, FiShoppingBag, FiArrowLeft, FiStar, FiAward, FiZap, FiCopy,
         FiLogIn, FiShoppingCart, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatBTP } from '../utils/btp';

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

// Admin-set conversion rate: how many BTP per 1 USD
const BTP_PER_USD = 100;

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
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
    const errs = validateCard();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);

    // Generate ticket numbers for each cart item, linked to match ID
    const tickets = items.map(item => ({
      ticketNumber: generateTicketNumber(),
      matchId:      item.matchId,
      match:        item.match,
      market:       item.market,
      pick:         item.pick,
      tier:         item.tier,
      price:        item.price,
      prediction:   item.prediction,
    }));
    setConfirmedTickets(tickets);
    clearCart();
    setStep(3);
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-5">Review Your Order</h2>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Your cart is empty.</p>
              <Link to="/lobby" className="text-[#1A4D8F] font-semibold hover:underline text-sm">Browse Lobby</Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {items.map(item => {
                  const tierMeta = TIER_BADGE[item.tier];
                  return (
                    <div key={item.cartId} className="flex items-center gap-3 py-3 border-b border-gray-50">
                      {/* Tier strip */}
                      <div className={`w-1 h-12 rounded-full shrink-0 ${
                        item.tier === 'platinum' ? 'bg-purple-500'
                        : item.tier === 'gold' ? 'bg-[#F5C518]'
                        : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1A1A2E] truncate">{item.match}</p>
                          {tierMeta && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${tierMeta.cls}`}>
                              <tierMeta.Icon className="w-2.5 h-2.5" />
                              {tierMeta.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{item.market} — {item.pick}</p>
                        <p className="text-[10px] text-gray-300 font-mono mt-0.5">Match ID: {item.matchId}</p>
                      </div>
                      <span className="font-bold text-[#1A4D8F] text-sm shrink-0">
                        {item.price === 0 ? 'FREE' : formatBTP(item.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between font-black text-lg mb-2">
                <span className="text-[#1A1A2E]">Total</span>
                <span className="text-[#1A4D8F] flex items-center gap-1">
                  <span className="text-[#F5C518]">◈</span>
                  {cartTotal.toLocaleString()} BTP
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                ≈ ${(cartTotal / BTP_PER_USD).toFixed(2)} USD at current rate (1 USD = {BTP_PER_USD} BTP)
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm"
              >
                Continue to Payment
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-black text-[#1A1A2E] mb-5">Pay with BT Points</h2>

          {/* BTP Balance status */}
          <div className={`rounded-2xl p-4 mb-6 border-2 ${hasEnoughBTP ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500">Your BTP Balance</p>
              <span className={`text-base font-black flex items-center gap-1 ${hasEnoughBTP ? 'text-green-700' : 'text-red-600'}`}>
                <span className="text-[#F5C518]">◈</span>
                {balance.toLocaleString()} BTP
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500">Order Total</p>
              <span className="text-base font-black text-[#1A4D8F] flex items-center gap-1">
                <span className="text-[#F5C518]">◈</span>
                {cartTotal.toLocaleString()} BTP
              </span>
            </div>
            {hasEnoughBTP ? (
              <div className="mt-3 flex items-center gap-2 text-green-700">
                <FiCheck className="w-4 h-4 shrink-0" />
                <p className="text-xs font-semibold">
                  After payment: <strong>{(balance - cartTotal).toLocaleString()} BTP</strong> remaining
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-red-600">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-semibold">
                  You need <strong>{shortfall.toLocaleString()} more BTP</strong>
                  {' '}(≈ ${(shortfall / BTP_PER_USD).toFixed(2)} USD)
                </p>
              </div>
            )}
          </div>

          {/* Conversion rate info */}
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl px-4 py-3 mb-6 text-xs text-gray-600">
            <p className="font-bold text-[#1A1A2E] mb-1">BTP Conversion Rate</p>
            <p>1 USD = {BTP_PER_USD} BTP &nbsp;·&nbsp; 1 BTP = ${(1 / BTP_PER_USD).toFixed(4)} USD</p>
            <p className="text-gray-400 mt-0.5">Rate is set by the admin and may change at any time.</p>
          </div>

          {hasEnoughBTP ? (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-3.5 rounded-xl hover:brightness-105 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Processing…' : (
                <>
                  <span className="text-lg leading-none">◈</span>
                  Pay {cartTotal.toLocaleString()} BTP
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                <p className="text-red-600 font-bold text-sm mb-1">Insufficient BT Points</p>
                <p className="text-red-500 text-xs">
                  You need {shortfall.toLocaleString()} more BTP to complete this order.
                </p>
              </div>
              <Link
                to="/dashboard/wallet"
                className="flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-black py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm"
              >
                <FiPlusCircle className="w-4 h-4" />
                Buy BT Points
              </Link>
              <p className="text-xs text-center text-gray-400">
                Top up {shortfall.toLocaleString()} BTP (≈ ${(shortfall / BTP_PER_USD).toFixed(2)}) to continue.
              </p>
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
                        {tk.price === 0 ? 'FREE' : `$${tk.price.toFixed(2)}`}
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
