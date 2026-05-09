'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'volunteer' | 'admin';
  organization?: string;
  phone?: string;
  avatar?: string;
  stats?: Record<string, number>;
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  organization?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('foodloop_token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      fetchMe(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (tkn: string) => {
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('foodloop_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token: tkn, user: usr } = res.data;
    setToken(tkn);
    setUser(usr);
    localStorage.setItem('foodloop_token', tkn);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
  };

  const register = async (data: RegisterData) => {
    const res = await axios.post(`${API}/auth/register`, data);
    const { token: tkn, user: usr } = res.data;
    setToken(tkn);
    setUser(usr);
    localStorage.setItem('foodloop_token', tkn);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foodloop_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
