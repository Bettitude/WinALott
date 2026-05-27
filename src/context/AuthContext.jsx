import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

// Handles both Bettitude SSO response shape and legacy WinALot shape
function normalizeUser(u) {
  return {
    id:            u.id,
    name:          u.name       || u.full_name  || '',
    username:      u.username   || '',
    email:         u.email      || '',
    avatar:        u.avatar     || u.avatar_url || null,
    country:       u.country    || '',
    // Wallet balance: stored in cents by WinALot backend; Bettitude may send raw float
    balance:       u.bt_points != null
                     ? Number(u.bt_points)
                     : (u.wallet_balance || 0) / 100,
    totalWinnings: 0,
    winRate:       0,
    activeTickets: 0,
    role:          u.role       || u.user_type  || 'user',
    userType:      u.user_type  || 'website',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('winalott_token');
    if (!token) { setLoading(false); return; }

    // Restore demo sessions without hitting the API
    if (token.startsWith('demo_token_')) {
      try {
        const stored = localStorage.getItem('winalott_user');
        if (stored) setUser(JSON.parse(stored));
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }

    authApi.me()
      .then(res => {
        // Node.js: { success, data: { user } }  — fallback: user object directly
        const u = res.data?.data?.user || res.data?.user || res.data;
        if (u?.id) setUser(normalizeUser(u));
      })
      .catch(() => {
        localStorage.removeItem('winalott_token');
        localStorage.removeItem('winalott_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // ── Dummy / demo accounts (no backend required) ─────────────────────────
    const DEMO_ACCOUNTS = [
      { email: 'demo@winalott.com', password: 'Demo1234', user: {
          id: 'demo-user-001', username: 'demo_user', full_name: 'Demo User',
          email: 'demo@winalott.com', role: 'user', wallet_balance: 50000, // $500
        },
      },
      { email: 'test@example.com', password: 'test1234', user: {
          id: 'demo-user-002', username: 'test_player', full_name: 'Test Player',
          email: 'test@example.com', role: 'user', wallet_balance: 12500, // $125
        },
      },
    ];
    const demo = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (demo) {
      const normalized = normalizeUser(demo.user);
      localStorage.setItem('winalott_token', 'demo_token_' + demo.user.id);
      localStorage.setItem('winalott_user', JSON.stringify(normalized));
      setUser(normalized);
      return { success: true };
    }
    // ── Real API login ────────────────────────────────────────────────────────
    const res = await authApi.login(email, password);
    // Node.js backend: { success, data: { user, token } }
    // Laravel shape kept as fallback: { token, user } or { data: { session: { access_token } } }
    const token = res.data?.data?.token || res.data?.token || res.data?.data?.session?.access_token;
    const u     = res.data?.data?.user  || res.data?.user;
    if (!token || !u) throw new Error('Invalid response from server');
    localStorage.setItem('winalott_token', token);
    const normalized = normalizeUser(u);
    setUser(normalized);
    localStorage.setItem('winalott_user', JSON.stringify(normalized));
    return { success: true };
  };

  const signup = async (data) => {
    const payload = {
      username:  data.username  || data.fullName?.toLowerCase().replace(/\s+/g, '_'),
      full_name: data.fullName  || data.name || '',
      email:     data.email,
      password:  data.password,
      phone:     data.phone     || undefined,
    };
    const res   = await authApi.register(payload);
    // Node.js: { success, data: { user, token } }
    const token = res.data?.data?.token || res.data?.token || res.data?.data?.session?.access_token;
    const u     = res.data?.data?.user  || res.data?.user;
    if (!token || !u) throw new Error('Invalid response from server');
    localStorage.setItem('winalott_token', token);
    const normalized = normalizeUser({ ...u, username: data.username || u.username || u.name });
    setUser(normalized);
    localStorage.setItem('winalott_user', JSON.stringify(normalized));
    return { success: true };
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore network errors on logout */ }
    setUser(null);
    localStorage.removeItem('winalott_token');
    localStorage.removeItem('winalott_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('winalott_user', JSON.stringify(updated));
  };

  const isDemo = typeof window !== 'undefined' &&
    !!localStorage.getItem('winalott_token')?.startsWith('demo_token_');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isDemo,
      login,
      logout,
      signup,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
