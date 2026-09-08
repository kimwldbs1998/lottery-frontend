import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cenlottery.auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setToken(saved.token);
        setUser(saved.user);
        setAuthToken(saved.token);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await api.post('/auth/login', { username, password }, { auth: false });
    persist(result.token, result.user);
    return result.user;
  }, [persist]);

  const register = useCallback(async (username, password) => {
    const result = await api.post('/auth/register', { username, password }, { auth: false });
    persist(result.token, result.user);
    return result.user;
  }, [persist]);

  const logout = useCallback((reason) => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    if (reason === 'expired') {
      sessionStorage.setItem('cenlottery.flash', '세션이 만료되어 로그아웃되었습니다. 다시 로그인해 주세요.');
    }
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await api.get('/auth/me');
      setUser(me);
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, token, user: me }));
    } catch (e) {
      if (e.status === 401) logout('expired');
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, logout, refreshMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
