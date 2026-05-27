import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

// Handles both Bettitude SSO response shape and legacy WinALot shape.
// Balance is kept in BTP (= cents at 100 BTP per $1). Do NOT divide here —
// the display layer divides by 100 to show dollars.
function normalizeUser(u) {
  return {
    id:            u.id,
    name:          u.name       || u.full_name  || '',
    username:      u.username   || '',
    email:         u.email      || '',
    avatar:        u.avatar     || u.avatar_url || null,
    country:       u.country    || '',
    balance:       u.bt_points  != null
                     ? Math.round(Number(u.bt_points) * 100)   // BTP SSO → cents
                     : (u.wallet_balance || 0),                 // DB/demo already in cents
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
    const DEMO_ACCOUNTS = [
      { email: 'demo@winalott.com', password: 'Demo1234', user: {
          id: 'demo-user-001', username: 'demo_user', full_name: 'Demo User',
          email: 'demo@winalott.com', role: 'user', wallet_balance: 0,
        },
      },
      { email: 'test@example.com', password: 'test1234', user: {
          id: 'demo-user-002', username: 'test_player', full_name: 'Test Player',
          email: 'test@example.com', role: 'user', wallet_balance: 0,
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
    const res = await authApi.login(email, password);
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
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('winalott_token');
    localStorage.removeItem('winalott_user');
  };

  // Update local user state + localStorage (works for both demo and real users)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('winalott_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Re-fetch balance from the server (for real users after confirmed deposit)
  const refreshBalance = useCallback(async () => {
    const token = localStorage.getItem('winalott_token');
    // Demo users never hit the server — their balance lives in localStorage
    if (token?.startsWith('demo_token_')) return;
    try {
      const res = await authApi.me();
      const u = res.data?.data?.user || res.data?.user || res.data;
      if (u?.id) {
        const normalized = normalizeUser(u);
        setUser(normalized);
        localStorage.setItem('winalott_user', JSON.stringify(normalized));
      }
    } catch { /* ignore — keep current state */ }
  }, []);

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
      updateUser,
      updateProfile: updateUser,  // alias so Profile pages keep working
      refreshBalance,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
