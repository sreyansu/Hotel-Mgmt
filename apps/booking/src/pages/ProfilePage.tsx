/**
 * ==============================================================================
 * USER PROFILE PAGE (`/profile`)
 * ==============================================================================
 * Manages user account settings with:
 * - Curated SVG Avatar Selector (6 premium choices, no external file upload required).
 * - Full name, phone, address, and date of birth updates.
 * - Role information indicator.
 */

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { AvatarPicker, UserAvatar } from '../components/ui/AvatarPicker';

interface Profile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  avatar_url: string;
}

export const ProfilePage = () => {
  const { user, isAdmin, isStaff, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    avatar_url: 'avatar-1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data?.user) {
        setUserEmail(data.user.email);
        setProfile({
          full_name: data.user.full_name || '',
          phone: data.user.phone || '',
          date_of_birth: data.user.date_of_birth || '',
          address: data.user.address || '',
          avatar_url: data.user.avatar_url || 'avatar-1',
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.put('/auth/profile', profile);
      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile.full_name && !userEmail) {
    return <div className="text-center mt-20 text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary flex items-center gap-2"
          onClick={() => (isAdmin || isStaff ? navigate('/admin') : navigate('/bookings'))}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
          <Shield className="w-3.5 h-3.5" />
          {user?.role?.replace('_', ' ') || 'Customer'}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <UserAvatar avatarId={profile.avatar_url} size="xl" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{profile.full_name || 'My Profile'}</h2>
          <p className="text-slate-500 text-sm">{userEmail || user?.email}</p>
        </div>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 text-red-600 font-medium text-sm rounded-lg">{error}</div>}
      {successMsg && (
        <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 font-medium text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Curated SVG Avatar Selector */}
        <AvatarPicker
          selectedId={profile.avatar_url}
          onSelect={(avatarId) => setProfile({ ...profile, avatar_url: avatarId })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="full_name"
            value={profile.full_name || ''}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Account Email"
            value={userEmail || user?.email || ''}
            disabled
            className="bg-slate-50 text-slate-500"
          />
          <Input
            label="Phone Number"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            placeholder="+91-98765-43210"
          />
          <Input
            label="Date of Birth"
            type="date"
            name="date_of_birth"
            value={profile.date_of_birth || ''}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={profile.address || ''}
          onChange={handleChange}
          placeholder="123 Luxury Avenue, City, Country"
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={saving} className="px-8">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
