import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiList,
         FiDollarSign, FiBell, FiTrendingUp, FiGift } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const navLinks = [
  { to: '/lobby',         label: 'Lobby' },
  { to: '/how-to-play',   label: 'How to Play' },
  { to: '/leaderboard',   label: 'Leaderboard' },
  { to: '/winners',       label: 'Winners' },
  { to: '/btgiveaway',    label: 'BTGiveaway' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount, setIsOpen } = useCart();
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

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-black tracking-tight select-none">
              <span className="text-[#F5C518]">b</span>
              <span className="text-[#0D2B5E]">WinAL</span>
              <span className="text-[#F5C518] font-black">OTT</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5C518] mt-1 -ml-0.5" />
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
                      ? 'text-[#1A4D8F] bg-blue-50'
                      : 'text-[#374151] hover:text-[#1A4D8F] hover:bg-blue-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open cart"
            >
              <FiShoppingCart className="w-5 h-5 text-[#1A1A2E]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F5C518] text-[#1A1A2E] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                {/* Wallet balance chip */}
                <Link to="/dashboard/wallet"
                  className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors mr-1">
                  <FiDollarSign className="w-3 h-3" />
                  {((user?.walletBalance ?? 7443) / 100).toFixed(2)}
                </Link>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1A4D8F] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#1A1A2E] max-w-[100px] truncate">
                    {user?.username || 'User'}
                  </span>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiUser className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/dashboard/wallet" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiDollarSign className="w-4 h-4" /> My Wallet
                    </Link>
                    <Link to="/dashboard/tickets" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiList className="w-4 h-4" /> My Tickets
                    </Link>
                    <Link to="/dashboard/winnings" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiTrendingUp className="w-4 h-4" /> My Winnings
                    </Link>
                    <Link to="/dashboard/referrals" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiGift className="w-4 h-4" /> Referrals
                    </Link>
                    <Link to="/dashboard/notifications" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1A4D8F] transition-colors">
                      <FiBell className="w-4 h-4" /> Notifications
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors">
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-[#1A4D8F]' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
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
                <hr className="border-gray-100 my-1" />
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                <Link to="/dashboard/wallet" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">My Wallet</Link>
                <Link to="/dashboard/tickets" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">My Tickets</Link>
                <Link to="/dashboard/referrals" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Referrals</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50">Log Out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
