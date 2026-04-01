'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as api from './api';

interface AuthState {
  user: api.UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, organization?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('ecoweave_token') : null;
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      api.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginFn = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.access_token);
    setUser(result.user);
  };

  const signupFn = async (fullName: string, email: string, password: string, organization?: string) => {
    const result = await api.signup(fullName, email, password, organization);
    setToken(result.access_token);
    setUser(result.user);
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    router.push('/signin');
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login: loginFn,
        signup: signupFn,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
