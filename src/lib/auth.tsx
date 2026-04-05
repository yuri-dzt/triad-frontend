import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { authApi } from './api';

function decodeJwtPayload(token: string): { userId: string; organizationId: string; role: string } {
  const base64 = token.split('.')[1]!;
  const json = atob(base64);
  return JSON.parse(json);
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; organizationName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const tokensStr = localStorage.getItem('triad_tokens');
      if (tokensStr) {
        try {
          const tokens: AuthTokens = JSON.parse(tokensStr);
          const payload = decodeJwtPayload(tokens.accessToken);
          setUser({
            id: payload.userId,
            name: '',
            email: '',
            organizationId: payload.organizationId
          });
        } catch {
          localStorage.removeItem('triad_tokens');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const tokens: AuthTokens = await authApi.login(credentials);
    localStorage.setItem('triad_tokens', JSON.stringify(tokens));
    const payload = decodeJwtPayload(tokens.accessToken);
    setUser({
      id: payload.userId,
      name: '',
      email: credentials.email,
      organizationId: payload.organizationId
    });
  };

  const register = async (data: { name: string; email: string; password: string; organizationName: string }) => {
    const tokens: AuthTokens = await authApi.register(data);
    localStorage.setItem('triad_tokens', JSON.stringify(tokens));
    const payload = decodeJwtPayload(tokens.accessToken);
    setUser({
      id: payload.userId,
      name: data.name,
      email: data.email,
      organizationId: payload.organizationId
    });
  };

  const logout = () => {
    localStorage.removeItem('triad_tokens');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
