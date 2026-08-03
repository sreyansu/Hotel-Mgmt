/**
 * ==============================================================================
 * STEP-BASED ROLE SELECTION & AUTHENTICATION PORTAL (`/login`)
 * ==============================================================================
 * PARADISE Palace Hotels Authentication & Access Portal
 * 1. Step 1 (Role Selector): Presents 4 distinct role access cards (Super Admin, Manager, Staff, Customer).
 * 2. Step 2 (Role-Specific Portal): Clicking a role reveals its dedicated authentication/registration view.
 * 3. Enforces Customer-only self registration, with team provisioning notes on management roles.
 * 4. Includes one-click demo credentials autofill within each role portal for interview evaluation.
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Sparkles
} from 'lucide-react';
import { AvatarPicker } from '../components/ui/AvatarPicker';
import { PasswordStrengthIndicator, isPasswordStrong } from '../components/auth/PasswordStrength';
import paradiseLogo from '../paradise_logo.png';

type RoleType = 'super_admin' | 'hotel_manager' | 'staff' | 'customer';

interface RoleConfig {
  id: RoleType;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  destination: string;
  demoEmail?: string;
  demoPassword?: string;
}

const ROLES_CONFIG: RoleConfig[] = [
  {
    id: 'super_admin',
    title: 'Super Admin',
    subtitle: 'Full Portfolio Command Center',
    badge: 'Multi-Hotel HQ',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
    description: 'Global portfolio oversight, multi-property room inventory, promotional coupon campaigns, and RBAC team access.',
    destination: '/admin',
    demoEmail: 'admin@grandhotels.com',
    demoPassword: 'admin@123',
  },
  {
    id: 'hotel_manager',
    title: 'Hotel Manager',
    subtitle: 'Property Operations & Strategy',
    badge: 'Single Property',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Building2 className="w-6 h-6 text-blue-600" />,
    description: 'Property occupancy rate %, Total Revenue & ADR KPIs, dynamic surge pricing (±₹500), and capacity controls.',
    destination: '/admin',
    demoEmail: 'manager@grandhotels.com',
    demoPassword: 'manager@123',
  },
  {
    id: 'staff',
    title: 'Front Desk Staff',
    subtitle: 'Daily Guest Operations & Rooms',
    badge: 'Front Desk Desk',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
    description: 'Real-time room occupancy grid (101-304), guest express check-in/check-out, housekeeping status toggles.',
    destination: '/admin',
    demoEmail: 'staff@gmail.com',
    demoPassword: 'staff@123',
  },
  {
    id: 'customer',
    title: 'Guest / Customer',
    subtitle: 'Luxury Stay Booking & Reservations',
    badge: 'Guest Portal',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <User className="w-6 h-6 text-purple-600" />,
    description: 'Search destinations, browse room tiers, apply promotional discount codes, book royal stays with Razorpay checkout.',
    destination: '/bookings',
    demoEmail: 'customer@gmail.com',
    demoPassword: 'customer@123',
  },
];

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up form fields (Customer only)
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

  // When user clicks a role card, initialize form state
  const handleSelectRole = (role: RoleConfig) => {
    setSelectedRole(role);
    setAuthMode('signin');
    setError(null);
    if (role.demoEmail && role.demoPassword) {
      setEmail(role.demoEmail);
      setPassword(role.demoPassword);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  // Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Route appropriately based on chosen role or return-to path
      if (from) {
        navigate(from, { replace: true });
      } else if (selectedRole) {
        navigate(selectedRole.destination);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submission (Customer Only)
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
    <div className="max-w-7xl mx-auto my-10 px-4 sm:px-6 lg:px-8">
      {/* ========================================================================= */}
      {/* STEP 1: INITIAL ROLE SELECTION SCREEN (ONE ROW 4-COLUMN LAYOUT) */}
      {/* ========================================================================= */}
      {!selectedRole && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto">
            <img
              src={paradiseLogo}
              alt="PARADISE Palace Hotels"
              className="h-16 w-auto mx-auto mb-4 object-contain rounded-xl shadow-md"
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              PARADISE Palace Hotels & Resorts
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Select Your Access Portal
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Choose your persona to access management operations, property controls, front desk, or guest reservations.
            </p>
          </div>

          {/* 4 Roles in ONE Single Row on desktop screens (lg:grid-cols-4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {ROLES_CONFIG.map((role) => (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                      {role.icon}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mb-2">{role.subtitle}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {role.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                  <span>Continue to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DEDICATED AUTHENTICATION VIEW FOR CHOSEN ROLE */}
      {/* ========================================================================= */}
      {selectedRole && (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Back to Role Selection Button */}
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedRole(null);
              setError(null);
            }}
            className="mb-6 pl-0 hover:bg-transparent hover:text-primary flex items-center gap-2 text-slate-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> ← Back to Role Selection
          </Button>

          {/* Role Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl">
                {selectedRole.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedRole.title}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedRole.badgeColor}`}>
                    {selectedRole.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedRole.subtitle}</p>
              </div>
            </div>

            {/* Tab switch for Customer (Sign In vs Sign Up) */}
            {selectedRole.id === 'customer' && (
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
                  Sign In to Account
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
                  Create Guest Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* SIGN IN FORM (All 4 roles) */}
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
                      placeholder="name@example.com"
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
                    <a
                      href="/forgot-password"
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Forgot password?
                    </a>
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
                  Sign In as {selectedRole.title}
                </Button>
              </form>
            )}

            {/* SIGN UP FORM (Customers only) */}
            {authMode === 'signup' && selectedRole.id === 'customer' && (
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
                  <Input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="sarah@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Password
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="h-11"
                  />
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
        </div>
      )}
    </div>
  );
};
