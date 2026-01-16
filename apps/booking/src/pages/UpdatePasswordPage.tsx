import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthIndicator, isPasswordStrong } from '../components/auth/PasswordStrength';
import { useNavigate } from 'react-router-dom';

export const UpdatePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Ideally redirect or show warning
            }
        });
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isPasswordStrong(password)) {
            setError('Password does not meet strength requirements.');
            return;
        }

        setLoading(true);

        const { error: authError } = await supabase.auth.updateUser({
            password: password
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            alert('Password updated successfully! Redirecting to home.');
            navigate('/');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Set New Password</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                    <Input
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <PasswordStrengthIndicator password={password} />
                </div>

                <Button type="submit" className="w-full mt-4" isLoading={loading}>
                    Update Password
                </Button>
            </form>
        </div>
    );
};
