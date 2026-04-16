import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('winalot_cart');
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
  }, []);

  const persist = (newItems) => {
    setItems(newItems);
    localStorage.setItem('winalot_cart', JSON.stringify(newItems));
  };

  const addToCart = (ticket) => {
    setItems(prev => {
      const exists = prev.find(i => i.cartId === ticket.cartId);
      if (exists) return prev;
      const updated = [...prev, ticket];
      localStorage.setItem('winalot_cart', JSON.stringify(updated));
      return updated;
    });
    setIsOpen(true);
  };

  const removeFromCart = (cartId) => {
    persist(items.filter(i => i.cartId !== cartId));
  };

  const clearCart = () => {
    persist([]);
  };

  const cartCount = items.length;
  const cartTotal = items.reduce((sum, i) => sum + (i.price || 0.99), 0);

  return (
    <CartContext.Provider value={{
      items,
      cartCount,
      cartTotal,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}
