import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gizita_token') || null);
  const [loading, setLoading] = useState(true);

  // Inisialisasi cek status login saat awal muat
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gizita_token');
      const storedUser = localStorage.getItem('gizita_user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        try {
          // Validasi ke backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('gizita_user', JSON.stringify(res.data.data));
          }
        } catch {
          // Token invalid/expired
          localStorage.removeItem('gizita_token');
          localStorage.removeItem('gizita_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('gizita_token', receivedToken);
      localStorage.setItem('gizita_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login gagal.');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Abaikan jika token sudah invalid
    } finally {
      localStorage.removeItem('gizita_token');
      localStorage.removeItem('gizita_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('gizita_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user ? user.role : null,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

