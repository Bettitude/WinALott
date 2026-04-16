import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiTag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { items, removeFromCart, clearCart, cartTotal } = useCart();
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const discount = promoApplied ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount;

  const applyPromo = () => {
    if (promo.toUpperCase() === 'WINALOT10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add tickets from the Lobby to get started.</p>
        <Link to="/lobby"
          className="bg-[#1A4D8F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
          Browse Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E]">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.cartId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FiShoppingCart className="w-5 h-5 text-[#1A4D8F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1A1A2E] text-sm">{item.match}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.market}</p>
                <div className="mt-1.5 inline-flex items-center bg-blue-50 px-2 py-0.5 rounded-full">
                  <span className="text-xs text-[#1A4D8F] font-medium">Pick: {item.pick}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-black text-[#1A4D8F]">
                  {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                </span>
                <button onClick={() => removeFromCart(item.cartId)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-20">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} tickets)</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-base">
                <span className="text-[#1A1A2E]">Total</span>
                <span className="text-[#1A4D8F]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={promo}
                    onChange={e => { setPromo(e.target.value); setPromoError(''); }}
                    placeholder="Promo code"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
                  />
                </div>
                <button onClick={applyPromo} disabled={promoApplied}
                  className="px-3 py-2.5 bg-[#1A4D8F] text-white rounded-xl text-sm font-semibold hover:bg-[#0D2B5E] transition-colors disabled:opacity-40">
                  Apply
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
              {promoApplied && <p className="text-green-600 text-xs mt-1">Promo WINALOT10 applied!</p>}
              <p className="text-gray-300 text-xs mt-1">Try: WINALOT10</p>
            </div>

            <Link to="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
              Proceed to Checkout <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
