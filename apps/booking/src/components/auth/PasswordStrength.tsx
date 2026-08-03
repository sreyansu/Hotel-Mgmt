import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password }) => {
    const criteria = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains a number', met: /\d/.test(password) },
        { label: 'Contains a symbol', met: /[^A-Za-z0-9]/.test(password) },
    ];

    const metCount = criteria.filter((c) => c.met).length;
    const strength = metCount === 5 ? 'Strong' : metCount >= 3 ? 'Medium' : 'Weak';
    const color = strength === 'Strong' ? 'text-green-600' : strength === 'Medium' ? 'text-yellow-600' : 'text-red-500';

    return (
        <div className="space-y-2 mt-2">
            <div className="flex justify-between text-xs">
                <span>Password Strength: <span className={`font-bold ${color}`}>{strength}</span></span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${strength === 'Strong' ? 'bg-green-500' : strength === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${(metCount / 5) * 100}%` }}
                />
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-slate-600">
                {criteria.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        {c.met ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-slate-400" />}
                        <span className={c.met ? 'text-slate-800' : ''}>{c.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const isPasswordStrong = (password: string): boolean => {
    return password.length >= 6;
}
