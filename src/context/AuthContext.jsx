import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('winalot_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Stub: simulate API call
    await new Promise(r => setTimeout(r, 800));
    const mockUser = {
      id: 'u1',
      name: 'John Doe',
      username: 'johndoe88',
      email,
      avatar: null,
      balance: 42.50,
      totalWinnings: 54.60,
      winRate: 63,
      activeTickets: 3,
    };
    setUser(mockUser);
    localStorage.setItem('winalot_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const signup = async (data) => {
    await new Promise(r => setTimeout(r, 1000));
    const mockUser = {
      id: 'u2',
      name: data.fullName,
      username: data.username,
      email: data.email,
      avatar: null,
      balance: 0,
      totalWinnings: 0,
      winRate: 0,
      activeTickets: 0,
    };
    setUser(mockUser);
    localStorage.setItem('winalot_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('winalot_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('winalot_user', JSON.stringify(updated));
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
