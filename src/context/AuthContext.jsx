import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fashion_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fashion_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('fashion_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('fashion_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('fashion_token', newToken);
    localStorage.setItem('fashion_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fashion_token', newToken);
    localStorage.setItem('fashion_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fashion_token');
    localStorage.removeItem('fashion_user');
  };

  const updateUserProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data);
    localStorage.setItem('fashion_user', JSON.stringify(res.data));
    return res.data;
  };

  const updateUserBio = async (bio) => {
    const res = await api.patch('/users/me/bio', { bio });
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, ...res.data };
      localStorage.setItem('fashion_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('fashion_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Refresh user error:', err.message);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserBio,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
