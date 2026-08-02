import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await login(email, password);
            if (res.user?.role === 'super_admin' || res.user?.role === 'hotel_manager') {
                navigate('/admin');
            } else {
                navigate(from);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign In</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}

            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Demo Credentials:</p>
                <p>👑 <span className="font-mono">admin@grandpalace.com</span> / <span className="font-mono">admin123</span> (Admin)</p>
                <p>👤 <span className="font-mono">customer@example.com</span> / <span className="font-mono">customer123</span> (Customer)</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full" isLoading={loading}>
                    Sign In
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </p>
        </div>
    );
};
