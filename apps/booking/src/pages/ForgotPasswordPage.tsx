import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Using window.location.origin to redirect back to the app's update-password page
        const redirectUrl = `${window.location.origin}/update-password`;

        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (authError) {
            setError(authError.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold mb-4 text-center text-primary">Reset Password</h2>
            <p className="text-center text-sm text-slate-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 font-medium text-sm rounded">Check your email for the password reset link.</div>}

            <form onSubmit={handleReset} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                />

                <Button type="submit" className="w-full" isLoading={loading} disabled={success}>
                    Send Reset Link
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Remembered it? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
        </div>
    );
};
