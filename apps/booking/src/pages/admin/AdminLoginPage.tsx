/**
 * ==============================================================================
 * INTERNAL STAFF LOGIN PORTAL (`/admin/login`)
 * ==============================================================================
 * Hidden internal authentication page for hotel staff, managers, and super admins.
 * - NOT linked anywhere in the public-facing UI
 * - Staff access this page directly via URL: /admin/login
 * - Features role selection cards with demo credential auto-fill for interviews
 * - Only shows 3 management roles: Super Admin, Hotel Manager, Front Desk Staff
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Shield,
} from 'lucide-react';
import paradiseLogo from '../../paradise_logo.png';

type RoleType = 'super_admin' | 'hotel_manager' | 'staff';

interface RoleConfig {
  id: RoleType;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  demoEmail: string;
  demoPassword: string;
}

const ADMIN_ROLES_CONFIG: RoleConfig[] = [
  {
    id: 'super_admin',
    title: 'Super Admin',
    subtitle: 'Full Portfolio Command Center',
    badge: 'Multi-Hotel HQ',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
    description: 'Global portfolio oversight, multi-property room inventory, promotional coupon campaigns, and RBAC team access.',
    demoEmail: 'admin@paradisepalace.com',
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
    demoEmail: 'manager@paradisepalace.com',
    demoPassword: 'manager@123',
  },
  {
    id: 'staff',
    title: 'Front Desk Staff',
    subtitle: 'Daily Guest Operations & Rooms',
    badge: 'Front Desk',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
    description: 'Real-time room occupancy grid (101-304), guest express check-in/check-out, housekeeping status toggles.',
    demoEmail: 'staff@gmail.com',
    demoPassword: 'staff@123',
  },
];

export const AdminLoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSelectRole = (role: RoleConfig) => {
    setSelectedRole(role);
    setError(null);
    setEmail(role.demoEmail);
    setPassword(role.demoPassword);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10 px-4 sm:px-6 lg:px-8">
      {/* ===================================================================== */}
      {/* STEP 1: ROLE SELECTION CARDS */}
      {/* ===================================================================== */}
      {!selectedRole && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto">
            <img
              src={paradiseLogo}
              alt="PARADISE Palace Hotels"
              className="h-16 w-auto mx-auto mb-4 object-contain rounded-xl shadow-md"
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-amber-400 border border-slate-700 mb-3">
              <Shield className="w-3.5 h-3.5" />
              Internal Staff Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Management Access Portal
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Select your role to access hotel operations, property controls, or platform administration.
            </p>
          </div>

          {/* 3 Role Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
            {ADMIN_ROLES_CONFIG.map((role) => (
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

                {/* Demo Credential Preview */}
                <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Demo Credentials</p>
                  <p className="text-xs text-slate-600 font-mono">{role.demoEmail}</p>
                  <p className="text-xs text-slate-400 font-mono">{role.demoPassword}</p>
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

      {/* ===================================================================== */}
      {/* STEP 2: SIGN IN FORM FOR SELECTED ROLE */}
      {/* ===================================================================== */}
      {selectedRole && (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Back Button */}
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

          {/* Auth Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
            {/* Role Header */}
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

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Sign In Form */}
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
                    placeholder="name@paradisepalace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
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
          </div>
        </div>
      )}
    </div>
  );
};
