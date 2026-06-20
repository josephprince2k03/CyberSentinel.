import { useState } from 'react';
import { api, type BreachResult } from '../../services/api'; // Ensure this path is correct based on folder structure
import clsx from 'clsx';
import { ShieldAlert, Search, Lock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import PasswordAuditor from './components/PasswordAuditor.tsx';

export const BreachDashboard = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BreachResult | null>(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'search' | 'auditor'>('search');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please provide an email address');
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await api.checkBreach(email);
            setData(result);
        } catch (err) {
            setError('Breach investigation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('search')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all",
                        activeTab === 'search'
                            ? "bg-red-600/20 text-red-500 border border-red-500/50"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                >
                    <Search className="w-5 h-5" />
                    Breach Investigation
                </button>
                <button
                    onClick={() => setActiveTab('auditor')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all",
                        activeTab === 'auditor'
                            ? "bg-green-600/20 text-green-500 border border-green-500/50"
                            : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
                    )}
                >
                    <Lock className="w-5 h-5" />
                    Password Auditor
                </button>
            </div>

            {activeTab === 'auditor' ? (
                <PasswordAuditor />
            ) : (
                <>
                    {/* Search Section */}
                    <div className="bg-zinc-950 p-8 rounded-lg border border-green-900/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <ShieldAlert className="text-red-500 w-8 h-8" />
                            Breach Identification System
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-2xl">
                            Scan the dark web and improved breach databases to detect compromised credentials associated with an email address.
                        </p>

                        <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    className="w-full bg-black border border-green-900/50 rounded-lg pl-12 pr-4 py-4 focus:ring-2 focus:ring-red-500 outline-none text-white text-lg placeholder-gray-500 shadow-inner"
                                    placeholder="Enter target email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-red-500/20",
                                    loading
                                        ? "bg-gray-700 cursor-wait text-gray-400"
                                        : "bg-red-600 hover:bg-red-500 text-white"
                                )}
                            >
                                {loading ? 'Scanning Deep Web...' : 'Scan Now'}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-900/40 border border-red-500/30 rounded-lg text-red-200 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {data && (
                        <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">

                            {/* Risk Score Card */}
                            <div className="md:col-span-1 bg-zinc-950 p-6 rounded-lg border border-green-900/30 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className={clsx(
                                    "absolute inset-0 opacity-10 blur-xl",
                                    data.risk_score > 50 ? "bg-red-600" : "bg-green-600"
                                )} />
                                <h3 className="text-gray-400 uppercase tracking-widest text-sm font-semibold mb-4">Risk Level</h3>

                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" className="stroke-gray-700 fill-none stroke-[10]" />
                                        <circle
                                            cx="80" cy="80" r="70"
                                            className={clsx(
                                                "fill-none stroke-[10] transition-all duration-1000 ease-out",
                                                data.risk_score > 70 ? "stroke-red-500" : data.risk_score > 30 ? "stroke-yellow-500" : "stroke-green-500"
                                            )}
                                            strokeDasharray="440"
                                            strokeDashoffset={440 - (440 * data.risk_score) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-4xl font-bold text-white">{data.risk_score}</span>
                                        <span className="text-xs text-gray-400">/ 100</span>
                                    </div>
                                </div>

                                <div className={clsx(
                                    "mt-6 px-4 py-1 rounded-full text-sm font-bold border",
                                    data.risk_score > 70
                                        ? "text-red-400 border-red-500/50 bg-red-500/10"
                                        : data.risk_score > 30
                                            ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
                                            : "text-green-400 border-green-500/50 bg-green-500/10"
                                )}>
                                    {data.risk_score > 70 ? 'CRITICAL EXPOSURE' : data.risk_score > 30 ? 'MODERATE RISK' : 'LOW RISK'}
                                </div>
                            </div>

                            {/* Detailed Findings */}
                            <div className="md:col-span-2 space-y-6">

                                {/* Dark Web Section */}
                                <div className="bg-zinc-950 rounded-lg border border-green-900/30 overflow-hidden">
                                    <div className="bg-black/40 p-4 border-b border-gray-700 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="text-xl">🧅</span> Dark Web Mentions
                                        </h3>
                                        <span className={clsx(
                                            "text-xs px-2 py-1 rounded",
                                            data.dark_web_mentions.length > 0 ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"
                                        )}>
                                            {data.dark_web_mentions.length} Found
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {data.dark_web_mentions.length > 0 ? (
                                            data.dark_web_mentions.map((item, i) => (
                                                <div key={i} className="p-3 bg-red-950/20 border border-red-900/30 rounded-md">
                                                    <div className="flex justify-between items-start">
                                                        <a href={item.url} target="_blank" rel="noreferrer" className="text-red-400 font-medium hover:underline flex items-center gap-1">
                                                            {item.title || 'Unknown Source'} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <span className="text-xs text-gray-500">{item.source}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.snippet}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
                                                <CheckCircle className="w-8 h-8 text-green-500/50 mb-2" />
                                                No dark web mentions found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Paste/Dump Section */}
                                <div className="bg-zinc-950 rounded-lg border border-green-900/30 overflow-hidden">
                                    <div className="bg-black/40 p-4 border-b border-gray-700 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="text-xl">📋</span> Paste Sites & Dumps
                                        </h3>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{data.pastes.length + data.breaches.length} Found</span>
                                    </div>
                                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                        {[...data.pastes, ...data.breaches].length > 0 ? (
                                            [...data.pastes, ...data.breaches].map((item, i) => (
                                                <div key={i} className="p-3 bg-gray-900/30 border border-gray-700 rounded-md hover:border-gray-500 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 font-medium hover:underline text-sm flex items-center gap-1">
                                                            {item.title} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 border border-gray-700 px-1 rounded">{item.source}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 font-mono bg-black/20 p-2 rounded mt-2">{item.snippet}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                No public leaks or pastes detected.
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BreachDashboard;
