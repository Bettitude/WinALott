import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

function normalizeUser(u) {
  return {
    id:            u.id,
    name:          u.full_name  || u.name     || '',
    username:      u.username   || '',
    email:         u.email      || '',
    avatar:        u.avatar_url || null,
    balance:       (u.wallet_balance || 0) / 100,
    totalWinnings: 0,
    winRate:       0,
    activeTickets: 0,
    role:          u.role       || 'user',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('winalott_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(res => {
        const u = res.data?.data?.user;
        if (u) setUser(normalizeUser(u));
      })
      .catch(() => {
        localStorage.removeItem('winalott_token');
        localStorage.removeItem('winalott_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: u, session } = res.data?.data || {};
    if (session?.access_token) {
      localStorage.setItem('winalott_token', session.access_token);
    }
    const normalized = normalizeUser(u);
    setUser(normalized);
    localStorage.setItem('winalott_user', JSON.stringify(normalized));
    return { success: true };
  };

  const signup = async (data) => {
    const res = await authApi.register({
      full_name: data.fullName,
      username:  data.username,
      email:     data.email,
      phone:     data.phone    || '',
      password:  data.password,
    });
    const { user: u, session } = res.data?.data || {};
    if (session?.access_token) {
      localStorage.setItem('winalott_token', session.access_token);
    }
    const normalized = normalizeUser(u);
    setUser(normalized);
    localStorage.setItem('winalott_user', JSON.stringify(normalized));
    return { success: true };
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('winalott_token');
    localStorage.removeItem('winalott_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('winalott_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      signup,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
