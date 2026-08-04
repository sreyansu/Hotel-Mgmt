/**
 * ==============================================================================
 * PROTECTED ROUTE COMPONENT (Client-Side RBAC Guard)
 * ==============================================================================
 * Wraps protected views (e.g. `/admin`, `/bookings`).
 * 1. Checks if the user is authenticated; redirects to `/login` if not.
 * 2. Checks if the user's role satisfies `allowedRoles`; renders 403 screen if unauthorized.
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'staff' | 'hotel_manager' | 'super_admin' | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while determining auth state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If unauthenticated, redirect to the appropriate login page
  if (!user) {
    // If this protected route requires admin roles, redirect to admin login
    const isAdminRoute = allowedRoles && allowedRoles.some(r => ['super_admin', 'hotel_manager', 'staff'].includes(r));
    const loginPath = isAdminRoute ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If specific roles are required, verify user's role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-red-100 rounded-xl shadow-sm text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied (403)</h2>
        <p className="text-sm text-slate-600 mb-6">
          Your account role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have permission to access this administrative area.
        </p>
        <Link to="/">
          <Button variant="outline" className="w-full">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
