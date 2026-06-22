import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import LiveTicker from '../ui/LiveTicker';
import RadioPlayer from '../ui/RadioPlayer';
import LiveMatchIndicator from '../ui/LiveMatchIndicator';
import CookieConsent from '../ui/CookieConsent';
import SubscribeModal from '../ui/SubscribeModal';
import PotentialWinBanner from '../ui/PotentialWinBanner';
import { useRadio } from '../../context/RadioContext';

const NO_TICKER = ['/auth/', '/verify'];
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function Inner({ children }) {
  const { pathname } = useLocation();
  const { isOpen: radioOpen } = useRadio();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    fetch(`${API}/analytics/page-view`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  const showTicker = !NO_TICKER.some(p => pathname.startsWith(p));

  return (
    <div className={`min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-slate-900 ${radioOpen ? 'pb-14' : ''}`}>
      <Navbar />
      {showTicker && <LiveTicker />}
      <main className="flex-1 page-fade pt-14 sm:pt-16 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <PotentialWinBanner />
      <LiveMatchIndicator />
      <RadioPlayer />
      <CookieConsent />
      <SubscribeModal />
    </div>
  );
}

export default function PageWrapper({ children }) {
  return <Inner>{children}</Inner>;
}
