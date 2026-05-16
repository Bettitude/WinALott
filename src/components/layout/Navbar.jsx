import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiList,
         FiBell, FiTrendingUp, FiGift, FiSun, FiMoon, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../context/ThemeContext';
import { formatBTP } from '../../utils/btp';
import Logo from '../ui/Logo';

const navLinks = [
  { to: '/lobby',         label: 'Lobby' },
  { to: '/how-to-play',   label: 'How to Play' },
  { to: '/leaderboard',   label: 'Leaderboard' },
  { to: '/winners',       label: 'Winners' },
  { to: '/btgiveaway',    label: 'BTGiveaway' },
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showBTP, setShowBTP]         = useState(() => localStorage.getItem('btp_visible') !== 'false');
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
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 transition-shadow duration-300 ${scrolled ? 'shadow-md dark:shadow-slate-800/60' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <Logo variant="full" height={36} className="dark:brightness-90" />
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#1A4D8F] bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50'
                      : 'text-[#374151] dark:text-slate-300 hover:text-[#1A4D8F] hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <FiSun className="w-5 h-5 text-[#F5C518]" />
                : <FiMoon className="w-5 h-5 text-slate-500" />
              }
            </button>

            {/* Cart icon */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open cart"
            >
              <FiShoppingCart className="w-5 h-5 text-[#1A1A2E] dark:text-slate-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F5C518] text-[#1A1A2E] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                {/* BTP balance pill with show/hide toggle */}
                <div className="hidden sm:flex items-center gap-0 bg-[#F5C518]/10 dark:bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg mr-1 overflow-hidden">
                  <Link to="/dashboard/wallet"
                    className="flex items-center gap-1.5 text-[#b89300] dark:text-[#F5C518] text-xs font-bold px-2.5 py-1.5 hover:bg-[#F5C518]/20 transition-colors">
                    <span className="font-black text-[#F5C518]">◈</span>
                    {showBTP
                      ? formatBTP(user?.balance ?? 0)
                      : <span className="tracking-widest text-[#F5C518]/60 font-black">•••••</span>
                    }
                  </Link>
                  <button onClick={toggleBTP}
                    className="px-2 py-1.5 text-[#F5C518]/70 hover:text-[#F5C518] hover:bg-[#F5C518]/20 transition-colors border-l border-[#F5C518]/20"
                    title={showBTP ? 'Hide balance' : 'Show balance'}>
                    {showBTP
                      ? <FiEyeOff className="w-3 h-3" />
                      : <FiEye className="w-3 h-3" />
                    }
                  </button>
                </div>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1A4D8F] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#1A1A2E] dark:text-slate-200 max-w-[100px] truncate">
                    {user?.username || 'User'}
                  </span>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      <FiUser className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/dashboard/wallet" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      <span className="text-[#F5C518] font-black text-base leading-none">◈</span> My Wallet
                    </Link>
                    <Link to="/dashboard/tickets" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      <FiList className="w-4 h-4" /> My Tickets
                    </Link>
                    <Link to="/dashboard/winnings" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors">
                      <FiTrendingUp className="w-4 h-4" /> My Winnings
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
            ) : (
              <Link
                to="/auth/login"
                className="hidden sm:block bg-[#1A4D8F] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0D2B5E] transition-colors"
              >
                Log In
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <FiX className="w-5 h-5 dark:text-slate-200" />
                : <FiMenu className="w-5 h-5 dark:text-slate-200" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1A4D8F] dark:text-blue-400'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Dark mode toggle in mobile menu */}
            <button
              onClick={() => { toggleTheme(); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <FiSun className="w-4 h-4 text-[#F5C518]" /> : <FiMoon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            {!isAuthenticated && (
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block bg-[#1A4D8F] text-white text-sm font-medium px-4 py-2.5 rounded-xl text-center mt-2"
              >
                Log In
              </Link>
            )}
            {isAuthenticated && (
              <>
                <hr className="border-gray-100 dark:border-slate-700 my-1" />
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Dashboard</Link>
                <Link to="/dashboard/wallet" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">My Wallet</Link>
                <Link to="/dashboard/tickets" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">My Tickets</Link>
                <Link to="/dashboard/referrals" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Referrals</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">Log Out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
