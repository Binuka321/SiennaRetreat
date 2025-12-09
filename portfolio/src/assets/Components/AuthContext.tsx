import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type User = {
  id?: string;
  username?: string | null;
  email?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setIsAdmin: (b: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAdmin: false,
  setUser: () => {},
  setToken: () => {},
  setIsAdmin: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    const t = localStorage.getItem('token');
    const at = localStorage.getItem('adminToken');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    }
    if (t) setToken(t);
    if (at) setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (isAdmin) localStorage.setItem('adminToken', localStorage.getItem('adminToken') || 'true');
    else localStorage.removeItem('adminToken');
  }, [isAdmin]);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, setUser, setToken, setIsAdmin } as any}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
