import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiChevronDown, FiUser, FiLogOut, FiList,
         FiBell, FiTrendingUp, FiGift, FiSun, FiMoon, FiEye, FiEyeOff,
         FiHome, FiGrid, FiTag, FiDollarSign, FiTarget } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';

const navLinks = [
  { to: '/worldcup',      label: 'World Cup 2026', highlight: true },
  { to: '/lobby',         label: 'Lobby' },
  { to: '/how-to-play',   label: 'How to Play' },
  { to: '/leaderboard',   label: 'Leaderboard' },
  { to: '/winners',       label: 'Winners' },
  { to: '/wal-giveaway',  label: 'WAL Giveaway' },
];

const bottomNavItems = [
  { to: '/',          Icon: FiHome,       label: 'Home',     end: true  },
  { to: '/worldcup',  Icon: FiGrid,       label: 'World Cup', end: false },
  { to: '/my-stakes', Icon: FiTarget,     label: 'Stakes',   end: false },
  { to: '/dashboard/wallet', Icon: FiDollarSign, label: 'Wallet', end: false },
  { to: '/dashboard', Icon: FiUser,       label: 'Profile',  end: true },
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showBTP, setShowBTP]           = useState(() => localStorage.getItem('btp_visible') !== 'false');
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount, setIsOpen } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleBTP = (e) => {
    e.preventDefault();
    setShowBTP(v => {
      localStorage.setItem('btp_visible', String(!v));
      return !v;
    });
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 transition-shadow duration-300 ${scrolled ? 'shadow-md dark:shadow-slate-800/60' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="shrink-0">
              <Logo variant="full" height={46} className="dark:brightness-90" />
            </Link>

            {/* Center nav links — desktop only */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    link.highlight
                      ? `px-4 py-2 rounded-lg text-sm font-black transition-colors flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#F5C518] text-[#1A1A2E]'
                            : 'bg-[#F5C518]/15 text-[#b89300] dark:text-[#F5C518] hover:bg-[#F5C518]/30 border border-[#F5C518]/40'
                        }`
                      : `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-[#1A4D8F] bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50'
                            : 'text-[#374151] dark:text-slate-300 hover:text-[#1A4D8F] hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/50'
                        }`
                  }
                >
                  {link.highlight && <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse" />}
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark
                  ? <FiSun className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5C518]" />
                  : <FiMoon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                }
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open cart"
              >
                <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A2E] dark:text-slate-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F5C518] text-[#1A1A2E] text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Auth section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1">

                  {/* BTP balance pill — always visible on all screen sizes */}
                  <div className="flex items-center gap-0 bg-[#F5C518]/10 dark:bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg overflow-hidden">
                    <Link
                      to="/dashboard/wallet"
                      className="flex items-center gap-1 whitespace-nowrap text-[#b89300] dark:text-[#F5C518] text-xs font-bold px-2 py-1.5 hover:bg-[#F5C518]/20 transition-colors"
                    >
                      <span className="text-[10px] font-black text-[#F5C518] leading-none">WALP</span>
                      {showBTP
                        ? <span className="tabular-nums">{(user?.balance ?? 0).toLocaleString()}</span>
                        : <span className="tracking-widest text-[#F5C518]/60 font-black text-[10px]">•••</span>
                      }
                    </Link>
                    <button
                      onClick={toggleBTP}
                      className="px-1.5 py-1.5 text-[#F5C518]/70 hover:text-[#F5C518] hover:bg-[#F5C518]/20 transition-colors border-l border-[#F5C518]/20"
                      title={showBTP ? 'Hide balance' : 'Show balance'}
                    >
                      {showBTP
                        ? <FiEyeOff className="w-3 h-3" />
                        : <FiEye className="w-3 h-3" />
                      }
                    </button>
                  </div>

                  {/* User dropdown trigger */}
                  <div className="relative" ref={dropRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A4D8F] flex items-center justify-center text-white font-semibold text-xs sm:text-sm shrink-0">
                        {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-[#1A1A2E] dark:text-slate-200 max-w-[80px] truncate">
                        {user?.username || 'User'}
                      </span>
                      <FiChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 mb-1">
                          <p className="text-sm font-bold text-[#1A1A2E] dark:text-white truncate">{user?.username || 'User'}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiUser className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/my-stakes" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiTarget className="w-4 h-4" /> My Stakes
                        </Link>
                        <Link to="/my-stakes?tab=history&filter=wins" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiTrendingUp className="w-4 h-4" /> My Wins
                        </Link>
                        <Link to="/dashboard/wallet" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiDollarSign className="w-4 h-4" /> My Wallet
                        </Link>
                        <Link to="/dashboard/tickets" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiList className="w-4 h-4" /> My Tickets
                        </Link>
                        <Link to="/dashboard/referrals" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiGift className="w-4 h-4" /> Referrals
                        </Link>
                        <Link to="/dashboard/notifications" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                          <FiBell className="w-4 h-4" /> Notifications
                        </Link>
                        <hr className="my-1 border-gray-100 dark:border-slate-700" />
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors">
                          <FiLogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="bg-[#1A4D8F] text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#0D2B5E] transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Bottom navigation — mobile only ────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch h-16">
          {bottomNavItems.map(({ to, Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#1A4D8F] dark:text-blue-400'
                    : 'text-gray-400 dark:text-slate-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
