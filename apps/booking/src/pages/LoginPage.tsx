import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign In</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}

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
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
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
