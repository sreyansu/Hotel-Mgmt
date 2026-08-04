/**
 * ==============================================================================
 * CUSTOMER LOGIN & REGISTRATION PAGE (`/login`)
 * ==============================================================================
 * Public-facing authentication page for hotel guests & customers.
 * - Sign In tab: Email + Password login
 * - Create Account tab: Full registration with avatar, name, email, password
 * - Clean, professional UI — no internal RBAC roles exposed
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Sparkles, User } from 'lucide-react';
import { AvatarPicker } from '../components/ui/AvatarPicker';
import { PasswordStrengthIndicator, isPasswordStrong } from '../components/auth/PasswordStrength';
import paradiseLogo from '../paradise_logo.png';

export const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up form fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAvatar, setSignupAvatar] = useState('avatar-1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

  // Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong(signupPassword)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(signupEmail, signupPassword, signupName, signupAvatar);
      navigate('/bookings');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img
            src={paradiseLogo}
            alt="PARADISE Palace Hotels"
            className="h-14 w-auto mx-auto mb-4 object-contain rounded-xl shadow-md"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            PARADISE Palace Hotels & Resorts
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {authMode === 'signin'
              ? 'Sign in to book luxury stays and manage your reservations.'
              : 'Join us and experience world-class hospitality across India.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          {/* Tab Switch: Sign In / Create Account */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                authMode === 'signin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                authMode === 'signup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md mt-2"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Your Avatar
                </label>
                <AvatarPicker
                  selectedId={signupAvatar}
                  onSelect={(avatarKey: string) => setSignupAvatar(avatarKey)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="sarah@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="mt-2">
                  <PasswordStrengthIndicator password={signupPassword} />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md mt-2"
                isLoading={loading}
              >
                Create Guest Account
              </Button>
            </form>
          )}
        </div>

        {/* Subtle footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms of Hospitality and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
