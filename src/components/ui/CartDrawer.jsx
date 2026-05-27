import { FiX, FiShoppingCart, FiTrash2, FiArrowRight, FiAlertTriangle, FiRadio } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatBTP } from '../../utils/btp';

function getItemExpiry(item) {
  if (item.matchStatus === 'finished') return 'ended';
  if (item.matchStatus === 'live') return 'live';
  if (item.matchDate && item.matchTime) {
    const kickoff = new Date(`${item.matchDate}T${item.matchTime}:00`).getTime();
    const now = Date.now();
    if (now > kickoff + 2 * 60 * 60 * 1000) return 'ended';   // >2h after kickoff
    if (now > kickoff - 5 * 60 * 1000) return 'live';          // within 5min of kickoff
  }
  return null;
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, cartTotal, clearCart } = useCart();

  if (!isOpen) return null;

  const payableItems = items.filter(i => !getItemExpiry(i));
  const expiredItems = items.filter(i => getItemExpiry(i));
  const payableTotal = payableItems.reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 drawer-overlay" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="w-5 h-5 text-[#1A4D8F]" />
            <h2 className="font-bold text-[#1A1A2E] dark:text-white">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-[#1A4D8F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FiShoppingCart className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Your cart is empty</p>
              <p className="text-gray-400 dark:text-slate-500 text-sm mb-4">Add tickets from the Lobby</p>
              <Link
                to="/lobby"
                onClick={() => setIsOpen(false)}
                className="bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors"
              >
                Browse Lobby
              </Link>
            </div>
          ) : (
            items.map(item => {
              const expiry = getItemExpiry(item);
              const isExpired = expiry === 'ended';
              const isItemLive = expiry === 'live';
              return (
                <div key={item.cartId} className={`rounded-2xl p-3 border ${
                  isExpired ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 opacity-70'
                  : isItemLive ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                }`}>
                  {(isExpired || isItemLive) && (
                    <div className={`flex items-center gap-1.5 mb-2 text-xs font-bold ${
                      isExpired ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {isExpired
                        ? <><FiAlertTriangle className="w-3 h-3" /> Match Ended — Cannot Stake</>
                        : <><FiRadio className="w-3 h-3" /> Match is Live — Staking Closed</>
                      }
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/match/${item.matchId}`}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-semibold hover:underline truncate block transition-colors ${
                          isExpired ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-[#1A1A2E] dark:text-white hover:text-[#1A4D8F]'
                        }`}
                      >
                        {item.match}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.market}</p>
                      <div className="mt-1.5 inline-flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        <span className="text-xs text-[#1A4D8F] dark:text-blue-400 font-medium">Pick: {item.pick}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`font-bold ${isExpired ? 'text-gray-300 dark:text-slate-600 line-through' : 'text-[#1A4D8F]'}`}>
                        {item.price === 0 ? 'FREE' : formatBTP(item.price)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
            {expiredItems.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-500">{expiredItems.length} expired item{expiredItems.length > 1 ? 's' : ''}</span>
                <button onClick={() => expiredItems.forEach(i => removeFromCart(i.cartId))}
                  className="text-red-400 hover:text-red-600 font-medium hover:underline">
                  Remove all expired
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400 text-sm">Total</span>
              <span className="font-black text-lg text-[#1A4D8F]">
                {payableTotal.toLocaleString()} BTP
              </span>
            </div>
            {payableItems.length > 0 ? (
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors"
              >
                Proceed to Checkout <FiArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="text-center text-sm text-gray-400 dark:text-slate-500 py-1">
                No valid items to checkout
              </div>
            )}
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
