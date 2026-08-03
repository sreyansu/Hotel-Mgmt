/**
 * ==============================================================================
 * AUTHENTICATION & ROLE CONTEXT PROVIDER (`useAuth`)
 * ==============================================================================
 * React Context for managing global user authentication state, tokens, and roles.
 * Shares reactive state across all components (Navbar, Login, Admin, Checkout).
 * Provides:
 * - `user` & `role`: Current logged-in user details and RBAC role.
 * - `isAdmin`: Boolean helper (true for 'super_admin' and 'hotel_manager').
 * - `isStaff`: Boolean helper (true for admin and staff roles).
 * - `login`, `register`, `signOut`, `refreshProfile` action methods.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: 'customer' | 'super_admin' | 'hotel_manager' | 'staff' | string;
  full_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  avatar_url?: string;
  hotel_id?: any;
}

export interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: string | null;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, full_name?: string, avatar_url?: string) => Promise<any>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize and validate session with backend /api/auth/me
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Login handler - updates global shared state immediately
  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  // Register handler - updates global shared state immediately
  const register = async (email: string, password: string, full_name?: string, avatar_url?: string) => {
    const res = await api.post('/auth/register', { email, password, full_name, avatar_url });
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  // Sign out handler - resets global shared state immediately
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Role checks for RBAC
  const role = user?.role || null;
  const isAdmin = role === 'super_admin' || role === 'hotel_manager';
  const isStaff = isAdmin || role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        role,
        isAdmin,
        isStaff,
        loading,
        login,
        register,
        signOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
