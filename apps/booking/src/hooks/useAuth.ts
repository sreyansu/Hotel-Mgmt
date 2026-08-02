import { useEffect, useState, useCallback } from 'react';
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
  hotel_id?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

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

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (email: string, password: string, full_name?: string) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const role = user?.role || null;
  const isAdmin = role === 'super_admin' || role === 'hotel_manager';
  const isStaff = isAdmin || role === 'staff';

  return {
    user,
    profile: user, // Alias for seamless compatibility
    role,
    isAdmin,
    isStaff,
    loading,
    login,
    register,
    signOut,
    refreshProfile: fetchProfile,
  };
}
