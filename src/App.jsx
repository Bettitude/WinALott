import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RadioProvider } from './context/RadioContext';
import { ThemeProvider } from './context/ThemeContext';
import PageWrapper from './components/layout/PageWrapper';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import MatchDetails from './pages/MatchDetails';
import HowToPlay from './pages/HowToPlay';
import Winners from './pages/Winners';
import WALGiveaway from './pages/BTGiveaway';
import WorldCup from './pages/WorldCup';
import WorldCupMatchDetail from './pages/WorldCupMatchDetail';
import PartnerWithUs from './pages/PartnerWithUs';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import AuthCallback from './pages/auth/AuthCallback';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import MyStakes from './pages/MyStakes';
import MyHistory from './pages/dashboard/MyTickets';
import MyProfile from './pages/dashboard/MyProfile';
import MyWinnings from './pages/dashboard/MyWinnings';
import Notifications from './pages/dashboard/Notifications';
import Wallet from './pages/dashboard/Wallet';
import Referrals from './pages/dashboard/Referrals';

// Static
// New pages
import Leaderboard from './pages/Leaderboard';
import Verify from './pages/Verify';
import TicketDetail from './pages/TicketDetail';
import TeamPage from './pages/TeamPage';
import Team from './pages/Team';
import TeamHistory from './pages/TeamHistory';
import ResetPassword from './pages/auth/ResetPassword';

import About from './pages/static/About';
import Contact from './pages/static/Contact';
import TermsAndConditions from './pages/static/TermsAndConditions';
import PrivacyPolicy from './pages/static/PrivacyPolicy';
import FAQ from './pages/static/FAQ';
import ResponsibleGambling from './pages/static/ResponsibleGambling';
import SponsorshipAndAds from './pages/static/SponsorshipAndAds';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#1A4D8F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
}

// 404 page
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl font-black text-gray-100 mb-4 select-none">404</div>
      <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-6 text-sm">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="bg-[#1A4D8F] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
        Back to Home
      </a>
    </div>
  );
}

// Blocks ALL rendering until the auth state is resolved (prevents logged-out → logged-in flash)
function AuthGate({ children }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <p className="text-[#1A4D8F] text-2xl font-black tracking-tight mb-6">WinALot</p>
        <div className="w-8 h-8 border-4 border-[#1A4D8F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <PageWrapper>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/wal-giveaway" element={<WALGiveaway />} />
          <Route path="/btgiveaway" element={<Navigate to="/wal-giveaway" replace />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/worldcup/match/:fixtureId" element={<WorldCupMatchDetail />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Dashboard */}
          <Route path="/my-stakes" element={<ProtectedRoute><MyStakes /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/tickets" element={<ProtectedRoute><MyHistory /></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute><MyHistory /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/dashboard/winnings" element={<ProtectedRoute><MyWinnings /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/dashboard/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/dashboard/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

          {/* Public — new */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/ticket/:ticketNumber" element={<TicketDetail />} />
          <Route path="/team/:slug" element={<TeamPage />} />
          <Route path="/team/:teamSlug" element={<Team />} />
          <Route path="/match/:matchId/team/:side" element={<TeamHistory />} />

          {/* Static */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/responsible-gambling" element={<ResponsibleGambling />} />
          <Route path="/sponsorship" element={<SponsorshipAndAds />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageWrapper>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <CartProvider>
            <RadioProvider>
              <AppRoutes />
            </RadioProvider>
          </CartProvider>
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
