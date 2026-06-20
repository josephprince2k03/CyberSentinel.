import { useState } from 'react';
import { api } from '../../services/api';
import clsx from 'clsx';

export const PersonDashboard = () => {
    const [searchParams, setSearchParams] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchParams.name && !searchParams.email && !searchParams.phone) {
            setError('Please provide at least one search criterion');
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await api.searchPerson(searchParams);
            setData(result);
        } catch (err) {
            setError('Investigation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-950 p-6 rounded-lg border border-green-900/30 shadow-xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-6">
                    <span className="mr-2">⚡</span> Target Investigation
                </h2>

                <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Target Name</label>
                        <input
                            type="text"
                            className="w-full bg-black border border-green-900/50 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-white placeholder-gray-600"
                            placeholder="Ghost"
                            value={searchParams.name}
                            onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-black border border-green-900/50 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-white placeholder-gray-600"
                            placeholder="Ghost@example.com"
                            value={searchParams.email}
                            onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full bg-black border border-green-900/50 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-white placeholder-gray-600"
                            placeholder="+91 7050XXXXXX"
                            value={searchParams.phone}
                            onChange={(e) => setSearchParams({ ...searchParams, phone: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "px-8 py-3 rounded-md font-bold transition-all transform hover:scale-105",
                                loading ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20"
                            )}
                        >
                            {loading ? 'Analyzing Target...' : 'Initiate Scan'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded text-red-200">
                        {error}
                    </div>
                )}
            </div>

            {data && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Identity Card */}
                    <div className="bg-zinc-950 p-6 rounded-lg border border-green-900/30 h-full">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <span className="text-2xl mr-2">🆔</span> Identity Profile
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Full Name</span>
                                <span className="text-white font-mono">{data.identity.full_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Age Range estimated</span>
                                <span className="text-white font-mono">{data.identity.age_range}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-1">Possible Aliases</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.identity.possible_aliases.length > 0 ? (
                                        data.identity.possible_aliases.map((alias: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-green-900/20 rounded text-xs text-green-300 border border-green-500/20">
                                                {alias}
                                            </span>
                                        ))
                                    ) : <span className="text-gray-500 text-sm">No aliases found</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-zinc-950 p-6 rounded-lg border border-green-900/30 h-full relative overflow-hidden">
                        <div className={clsx(
                            "absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20",
                            data.risk_assessment.level === 'CRITICAL' || data.risk_assessment.level === 'HIGH' ? "bg-red-500" : "bg-green-500"
                        )} />
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <span className="text-2xl mr-2">🛡️</span> Threat Assessment
                        </h3>
                        <div className="text-center mb-6">
                            <div className={clsx(
                                "inline-block text-4xl font-bold px-6 py-2 rounded-full border-2 mb-2",
                                data.risk_assessment.level === 'CRITICAL' || data.risk_assessment.level === 'HIGH'
                                    ? "text-red-400 border-red-500 bg-red-500/10"
                                    : "text-green-400 border-green-500 bg-green-500/10"
                            )}>
                                {data.risk_assessment.level}
                            </div>
                            <p className="text-gray-400 text-sm">Risk Score: {data.risk_assessment.score}/100</p>
                        </div>
                        {data.risk_assessment.flags.length > 0 && (
                            <div className="space-y-2">
                                {data.risk_assessment.flags.map((flag: string, i: number) => (
                                    <div key={i} className="flex items-start text-sm text-red-300 bg-red-900/20 p-2 rounded">
                                        <span className="mr-2">⚠️</span> {flag}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Social Footprint */}
                    <div className="md:col-span-2 bg-zinc-950 p-6 rounded-lg border border-green-900/30">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <span className="text-2xl mr-2">🌐</span> Digital Footprint
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.social_footprint.map((social: any, i: number) => (
                                <a
                                    key={i}
                                    href={social.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center p-3 bg-black rounded border border-green-900/30 hover:border-green-500/50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mr-3 group-hover:bg-zinc-800">
                                        {social.platform[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-medium text-gray-200">{social.platform}</div>
                                        <div className="text-xs text-gray-500 truncate">{social.username || social.status}</div>
                                    </div>
                                    {social.url && (
                                        <span className="ml-auto text-gray-600 group-hover:text-teal-400 text-sm">↗</span>
                                    )}
                                </a>
                            ))}
                            {data.social_footprint.length === 0 && (
                                <div className="text-gray-500 col-span-full text-center py-4">No Digital Footprint detected.</div>
                            )}
                        </div>
                    </div>


                    {/* Contact Intel */}
                    <div className="md:col-span-2 bg-zinc-950 p-6 rounded-lg border border-green-900/30">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <span className="text-2xl mr-2">📞</span> Contact Intelligence
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-gray-500 block mb-2 uppercase text-xs tracking-wider">Email Addresses</span>
                                <div className="space-y-1">
                                    {data.contact_info.emails.map((e: string, i: number) => (
                                        <div key={i} className="font-mono text-teal-300">{e}</div>
                                    ))}
                                    {data.contact_info.emails.length === 0 && <span className="text-gray-600">-</span>}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-2 uppercase text-xs tracking-wider">Phone Numbers</span>
                                <div className="space-y-1">
                                    {data.contact_info.phones.map((p: string, i: number) => (
                                        <div key={i} className="font-mono text-teal-300">{p}</div>
                                    ))}
                                    {data.contact_info.phones.length === 0 && <span className="text-gray-600">-</span>}
                                </div>
                            </div>
                            {data.contact_info.carrier && (
                                <div className="md:col-span-2 pt-4 border-t border-gray-700 mt-2 flex gap-6">
                                    <div>
                                        <span className="text-gray-500 text-xs">Carrier</span>
                                        <div className="text-white">{data.contact_info.carrier}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs">Approx Location</span>
                                        <div className="text-white">{data.contact_info.location}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Web Intelligence */}
                    {data.web_results && data.web_results.length > 0 && (
                        <div className="md:col-span-2 bg-zinc-950 p-6 rounded-lg border border-green-900/30">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">🕸️</span> Web Intelligence
                            </h3>
                            <div className="space-y-4">
                                {data.web_results.map((res: any, i: number) => (
                                    <div key={i} className="p-3 bg-black/50 border border-green-900/30 rounded hover:border-green-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <a href={res.url} target="_blank" rel="noreferrer" className="text-green-400 font-medium hover:underline text-sm truncate pr-4 block">
                                                {res.title}
                                            </a>
                                            <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-800 px-2 py-0.5 rounded">{res.source}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-1">{res.description}</p>
                                        <div className="text-[10px] text-gray-600 truncate">{res.url}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
