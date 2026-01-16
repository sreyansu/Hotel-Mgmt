import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthIndicator, isPasswordStrong } from '../components/auth/PasswordStrength';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isPasswordStrong(password)) {
            setError('Password does not meet strength requirements.');
            return;
        }

        setLoading(true);

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            // Assuming email confirmation logic or auto-login
            alert('Registration successful! Please check your email to confirm your account.');
            navigate('/login');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Create Account</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
                <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                />
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                />
                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <PasswordStrengthIndicator password={password} />
                </div>

                <Button type="submit" className="w-full mt-4" isLoading={loading}>
                    Register
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
        </div>
    );
};
