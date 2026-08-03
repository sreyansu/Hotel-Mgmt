/**
 * ==============================================================================
 * NAVBAR COMPONENT - PARADISE PALACE HOTELS
 * ==============================================================================
 * Responsive Navigation Bar with reactive RBAC state:
 * - Customers: Browse Hotels, My Bookings, Profile, Logout
 * - Staff / Manager / Super Admin: Direct navigation to Admin Dashboard, Logout
 * - Anonymous Visitors: Browse Hotels, Login, Sign Up
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { User, LogOut, Menu, X, Shield, Building, UserCheck } from 'lucide-react';
import paradiseLogo from '../../paradise_logo.png';

export const Navbar = () => {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const role = user?.role;
    const isCustomer = role === 'customer';
    const isStaffOrAdmin = role === 'super_admin' || role === 'hotel_manager' || role === 'staff';

    const handleLogout = () => {
        signOut();
        navigate('/');
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                {/* Brand Logo & Name */}
                <Link
                    to={isStaffOrAdmin ? '/admin' : '/'}
                    className="flex items-center gap-3 group"
                >
                    <img
                        src={paradiseLogo}
                        alt="PARADISE Palace Hotels"
                        className="h-10 w-auto object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                            PARADISE
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 leading-none">
                            Palace Hotels
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Only show Browse Hotels to Customers and Anonymous users */}
                    {(!user || isCustomer) && (
                        <Link to="/hotels" className="text-slate-600 hover:text-primary font-medium transition-colors">
                            Browse Hotels
                        </Link>
                    )}

                    {user ? (
                        <>
                            {/* Customer Links */}
                            {isCustomer && (
                                <Link to="/bookings" className="text-slate-600 hover:text-primary font-medium transition-colors">
                                    My Bookings
                                </Link>
                            )}

                            {/* Staff / Manager / Super Admin Dashboard Direct Link */}
                            {isStaffOrAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                                >
                                    {role === 'super_admin' ? (
                                        <Shield className="h-4 w-4 text-amber-400" />
                                    ) : role === 'hotel_manager' ? (
                                        <Building className="h-4 w-4 text-blue-400" />
                                    ) : (
                                        <UserCheck className="h-4 w-4 text-emerald-400" />
                                    )}
                                    <span>{user.full_name || (role === 'super_admin' ? 'Super Admin' : role === 'hotel_manager' ? 'Manager Portal' : 'Front Desk')}</span>
                                </Link>
                            )}

                            {/* Profile link for customers */}
                            {isCustomer && (
                                <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium transition-colors">
                                    <User className="h-4 w-4" />
                                    <span>{user.full_name || 'Profile'}</span>
                                </Link>
                            )}

                            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" className="text-slate-600 hover:text-primary">Login</Button>
                            </Link>
                            <Link to="/login">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 shadow-lg absolute w-full left-0 top-16 flex flex-col gap-4 animate-in slide-in-from-top-4">
                    {(!user || isCustomer) && (
                        <Link to="/hotels" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                            Browse Hotels
                        </Link>
                    )}

                    {user ? (
                        <>
                            {isCustomer && (
                                <>
                                    <Link to="/bookings" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                        My Bookings
                                    </Link>
                                    <Link to="/profile" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                        Profile
                                    </Link>
                                </>
                            )}
                            {isStaffOrAdmin && (
                                <Link to="/admin" className="text-slate-900 font-bold py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span>Management Dashboard</span>
                                </Link>
                            )}
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-600 font-medium py-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 mt-2">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};
