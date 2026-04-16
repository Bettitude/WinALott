import { FiX, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, cartTotal, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 drawer-overlay" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="w-5 h-5 text-[#1A4D8F]" />
            <h2 className="font-bold text-[#1A1A2E]">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-[#1A4D8F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FiShoppingCart className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
              <p className="text-gray-400 text-sm mb-4">Add tickets from the Lobby</p>
              <Link
                to="/lobby"
                onClick={() => setIsOpen(false)}
                className="bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors"
              >
                Browse Lobby
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.cartId} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{item.match}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.market}</p>
                    <div className="mt-1.5 inline-flex items-center bg-blue-50 px-2 py-0.5 rounded-full">
                      <span className="text-xs text-[#1A4D8F] font-medium">Pick: {item.pick}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-[#1A4D8F]">
                      {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="font-black text-lg text-[#1A1A2E]">${cartTotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors"
            >
              Proceed to Checkout <FiArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
