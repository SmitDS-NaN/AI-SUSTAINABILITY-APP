import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecoledger_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          setOrganization(res.data.organization);
        } catch (err) {
          console.warn('Failed to load user token:', err);
          logout();
        }
      } else {
        // Auto demo login if no token present
        try {
          const res = await authAPI.login({ email: 'demo@ecoledger.com', password: 'password123' });
          setToken(res.data.token);
          localStorage.setItem('ecoledger_token', res.data.token);
          setUser(res.data.user);
          setOrganization(res.data.organization);
        } catch (err) {
          console.error('Demo auto-login error:', err);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, user: userData, organization: orgData } = res.data;
      setToken(newToken);
      localStorage.setItem('ecoledger_token', newToken);
      setUser(userData);
      setOrganization(orgData);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, full_name, org_name, industry) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ email, password, full_name, org_name, industry });
      const { token: newToken, user: userData, organization: orgData } = res.data;
      setToken(newToken);
      localStorage.setItem('ecoledger_token', newToken);
      setUser(userData);
      setOrganization(orgData);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('ecoledger_token');
  };

  return (
    <AuthContext.Provider value={{ user, organization, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
