import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import {
  getToken, setToken,
  getStoredUser, setStoredUser,
  clearSession, isRemembered,
} from '../utils/tokenStorage';

export const AuthContext = createContext(null);

function normalizeUser(u) {
  return {
    id:            u.id,
    name:          u.full_name  || u.name     || '',
    username:      u.username   || '',
    email:         u.email      || '',
    avatar:        u.avatar_url || u.avatar   || null,
    balance:       u.wallet_balance ?? 0,
    role:          u.role       || 'user',
    totalWinnings: 0,
    winRate:       0,
    activeTickets: 0,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount — honours remember-me (localStorage) vs session-only (sessionStorage)
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(res => {
        const u = res.data?.data?.user || res.data?.user || res.data;
        if (u?.id) setUser(normalizeUser(u));
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  // remember=true  → localStorage  (survives browser close)
  // remember=false → sessionStorage (cleared when tab closes)
  const login = async (email, password, remember = true) => {
    const res   = await authApi.login(email, password);
    const token = res.data?.data?.token || res.data?.token;
    const u     = res.data?.data?.user  || res.data?.user;
    if (!token || !u) throw new Error('Invalid response from server');
    setToken(token, remember);
    const normalized = normalizeUser(u);
    setStoredUser(normalized, remember);
    setUser(normalized);
    return { success: true };
  };

  // Called after Google OAuth callback — always remembered (browser redirect = deliberate action)
  const loginWithToken = useCallback((token, user) => {
    const normalized = normalizeUser(user);
    setToken(token, true);
    setStoredUser(normalized, true);
    setUser(normalized);
    return { success: true };
  }, []);

  // Redirects browser to backend Google OAuth initiation endpoint
  const loginWithGoogle = useCallback(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiBase}/auth/google`;
  }, []);

  const signup = async (data) => {
    const payload = {
      username:       data.username || data.email.split('@')[0],
      full_name:      data.fullName || data.name || '',
      email:          data.email,
      password:       data.password,
      phone:          data.phone          || undefined,
      terms_accepted: data.terms_accepted ?? false,
      age_confirmed:  data.age_confirmed  ?? false,
    };
    const res   = await authApi.register(payload);
    const token = res.data?.data?.token || res.data?.token;
    const u     = res.data?.data?.user  || res.data?.user;
    if (!token || !u) throw new Error('Invalid response from server');
    // New signups are always remembered — they just created an account
    setToken(token, true);
    const normalized = normalizeUser(u);
    setStoredUser(normalized, true);
    setUser(normalized);
    return { success: true };
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    clearSession();
  };

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated    = { ...prev, ...updates };
      const remembered = isRemembered();
      setStoredUser(updated, remembered);
      return updated;
    });
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await authApi.me();
      const u = res.data?.data?.user || res.data?.user || res.data;
      if (u?.id) {
        const normalized = normalizeUser(u);
        setUser(normalized);
        setStoredUser(normalized, isRemembered());
      }
    } catch { /* keep current state */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      loginWithToken,
      loginWithGoogle,
      logout,
      signup,
      updateUser,
      updateProfile: updateUser,
      refreshBalance,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
