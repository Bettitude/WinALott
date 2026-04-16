import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import LiveTicker from '../ui/LiveTicker';

// Pages where the ticker shouldn't show (auth, static)
const NO_TICKER = ['/auth/', '/verify'];

export default function PageWrapper({ children }) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const showTicker = !NO_TICKER.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />
      {showTicker && <LiveTicker />}
      <main className={`flex-1 page-fade ${showTicker ? 'pt-16' : 'pt-16'}`}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
