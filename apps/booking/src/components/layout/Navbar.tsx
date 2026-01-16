import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import { User, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check initial user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Grand Palace
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/hotels" className="text-slate-600 hover:text-primary font-medium transition-colors">
                        Browse Hotels
                    </Link>

                    {user ? (
                        <>
                            <Link to="/bookings" className="text-slate-600 hover:text-primary font-medium transition-colors">
                                My Bookings
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium transition-colors">
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </Link>
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
                            <Link to="/register">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 shadow-lg absolute w-full left-0 top-16 flex flex-col gap-4 animate-in slide-in-from-top-4">
                    <Link to="/hotels" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                        Browse Hotels
                    </Link>

                    {user ? (
                        <>
                            <Link to="/bookings" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                My Bookings
                            </Link>
                            <Link to="/profile" className="text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                Profile
                            </Link>
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-600 font-medium py-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 mt-2">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};
