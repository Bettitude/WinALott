import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiCreditCard, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';

const steps = ['Review', 'Payment', 'Confirmation'];

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('card');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderId] = useState(`WL-${Date.now().toString().slice(-8)}`);

  const setC = (k, v) => setCard(c => ({ ...c, [k]: v }));

  const validateCard = () => {
    const e = {};
    if (!card.name) e.name = 'Name required';
    if (!card.number || card.number.replace(/\s/g,'').length < 16) e.number = 'Valid 16-digit card number required';
    if (!card.expiry || !/\d{2}\/\d{2}/.test(card.expiry)) e.expiry = 'Format: MM/YY';
    if (!card.cvv || card.cvv.length < 3) e.cvv = 'CVV required';
    return e;
  };

  const handlePay = async () => {
    const errs = validateCard();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    clearCart();
    setStep(3);
  };

  const formatCard = (val) => {
    const raw = val.replace(/\D/g,'').slice(0,16);
    return raw.replace(/(.{4})/g,'$1 ').trim();
  };

  const formatExpiry = (val) => {
    const raw = val.replace(/\D/g,'').slice(0,4);
    if (raw.length > 2) return raw.slice(0,2) + '/' + raw.slice(2);
    return raw;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex flex-col items-center`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step > i + 1 ? 'bg-[#22C55E] text-white' :
                step === i + 1 ? 'bg-[#1A4D8F] text-white shadow-lg' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? <FiCheck className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${step === i + 1 ? 'text-[#1A4D8F]' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 mb-5 transition-all ${step > i + 1 ? 'bg-[#22C55E]' : 'bg-gray-200'}`} />
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
                {items.map(item => (
                  <div key={item.cartId} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">{item.match}</p>
                      <p className="text-xs text-gray-400">{item.market} — {item.pick}</p>
                    </div>
                    <span className="font-bold text-[#1A4D8F] text-sm">{item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-black text-lg mb-6">
                <span className="text-[#1A1A2E]">Total</span>
                <span className="text-[#1A4D8F]">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => setStep(2)}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
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
          <h2 className="text-xl font-black text-[#1A1A2E] mb-5">Payment</h2>

          {/* Method select */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{id:'card',label:'Debit/Credit Card'},{id:'flutterwave',label:'Flutterwave'}].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                  payMethod === m.id ? 'border-[#1A4D8F] bg-blue-50 text-[#1A4D8F]' : 'border-gray-200 text-gray-600'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {payMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on Card</label>
                <input value={card.name} onChange={e => setC('name', e.target.value)} placeholder="John Doe"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={card.number} onChange={e => setC('number', formatCard(e.target.value))} placeholder="1234 5678 9012 3456"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.number ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry</label>
                  <input value={card.expiry} onChange={e => setC('expiry', formatExpiry(e.target.value))} placeholder="MM/YY"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.expiry ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                  <input value={card.cvv} onChange={e => setC('cvv', e.target.value.slice(0,4))} placeholder="123"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.cvv ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {payMethod === 'flutterwave' && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <p className="text-orange-700 font-semibold text-sm">You will be redirected to Flutterwave's secure payment page.</p>
            </div>
          )}

          <button onClick={handlePay} disabled={loading}
            className="w-full mt-6 bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm">
            {loading ? 'Processing…' : `Pay $${cartTotal.toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheck className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">Your tickets are confirmed!</h2>
          <p className="text-gray-500 text-sm mb-2">Order ID: <span className="font-bold text-[#1A4D8F]">{orderId}</span></p>
          <p className="text-gray-400 text-sm mb-8">
            We've sent a confirmation to your email. Good luck with your predictions!
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/dashboard/tickets"
              className="bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors flex items-center gap-2">
              <FiShoppingBag className="w-4 h-4" /> View My Tickets
            </Link>
            <Link to="/lobby"
              className="border border-[#1A4D8F] text-[#1A4D8F] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
              Back to Lobby
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
