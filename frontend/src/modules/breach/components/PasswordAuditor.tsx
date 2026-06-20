import { useState } from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, Check, X } from 'lucide-react';

const PasswordAuditor = () => {
    const [password, setPassword] = useState('');

    const calculateStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length > 8) score += 20;
        if (pwd.length > 12) score += 10;
        if (/[A-Z]/.test(pwd)) score += 20;
        if (/[0-9]/.test(pwd)) score += 20;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 30;
        return Math.min(score, 100);
    };

    const strength = calculateStrength(password);

    const getStrengthLabel = (s: number) => {
        if (s < 40) return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
        if (s < 70) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
        return { label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
    };

    const strengthInfo = getStrengthLabel(strength);

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-950 p-8 rounded-lg border border-green-900/30 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-green-500 w-8 h-8" />
                    Password Strength Auditor
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Test Password</label>
                        <input
                            type="text" // Visible for auditing purposes usually, or toggle
                            className="w-full bg-black border border-green-900/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-white text-lg font-mono"
                            placeholder="Type a password to audit..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {password && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className={clsx("font-bold text-lg", strengthInfo.color)}>{strengthInfo.label}</span>
                                    <span className="text-gray-500 text-sm">{strength}% Secure</span>
                                </div>
                                <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={clsx("h-full transition-all duration-500 ease-out", strengthInfo.bg)}
                                        style={{ width: `${strength}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <ConditionItem met={password.length >= 8} label="Min 8 Characters" />
                                <ConditionItem met={/[A-Z]/.test(password)} label="Uppercase Letter" />
                                <ConditionItem met={/[0-9]/.test(password)} label="Number" />
                                <ConditionItem met={/[^A-Za-z0-9]/.test(password)} label="Special Character" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-zinc-950 p-8 rounded-lg border border-green-900/30 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white mb-4">Security Recommendations</h3>
                <ul className="space-y-3 text-gray-400">
                    <li className="flex gap-2"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Use a password manager to generate random passwords.</li>
                    <li className="flex gap-2"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Enable 2FA on all sensitive accounts.</li>
                    <li className="flex gap-2"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Never reuse passwords across different sites.</li>
                    <li className="flex gap-2"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Change your passwords periodically, especially after a known breach.</li>
                </ul>
            </div>
        </div>
    );
};

const ConditionItem = ({ met, label }: { met: boolean, label: string }) => (
    <div className={clsx("flex items-center gap-2", met ? "text-green-400" : "text-gray-600")}>
        {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {label}
    </div>
);

export default PasswordAuditor;
