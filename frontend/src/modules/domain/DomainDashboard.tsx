import React, { useState } from 'react';
import { domainService, type DomainAnalysisResult } from '../../services/api';
import { Search, Globe, Shield, Server, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const DomainDashboard: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DomainAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await domainService.analyze(domain);
            setData(result);
        } catch (err: any) {
            console.error(err);
            setError('Failed to analyze domain. Ensure Backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto text-white">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div
                    className="p-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-400"
                >
                    <Globe className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                    Domain Intelligence
                </h1>
                <p className="text-gray-400 max-w-md">
                    Deep dive into domain infrastructure, WHOIS data, and DNS records.
                </p>
            </div>

            <form
                onSubmit={handleAnalyze}
                className="flex gap-4 max-w-2xl mx-auto p-2 rounded-xl border border-green-900/30 bg-zinc-950"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Enter domain (e.g., google.com)"
                        className="w-full bg-transparent border-none pl-10 pr-4 py-3 focus:ring-0 text-lg placeholder:text-gray-600 text-white outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Analyze <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>

            {error && (
                <div
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 max-w-2xl mx-auto"
                >
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {data && (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* WHOIS Card */}
                    <div className="bg-zinc-950 p-6 rounded-xl space-y-4 border border-green-900/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-semibold">WHOIS Data</h3>
                        </div>

                        <div className="space-y-3 font-mono text-sm text-gray-300">
                            <InfoRow label="Registrar" value={data.whois.registrar} />
                            <InfoRow label="Creation Date" value={formatDate(data.whois.creation_date)} />
                            <InfoRow label="Expiration Date" value={formatDate(data.whois.expiration_date)} />
                            <InfoRow label="Emails" value={Array.isArray(data.whois.emails) ? data.whois.emails.join(', ') : data.whois.emails} />
                            <InfoRow label="Org" value={data.whois.org} />
                        </div>
                    </div>

                    {/* DNS Card */}
                    <div className="bg-zinc-950 p-6 rounded-xl space-y-4 border border-green-900/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                                <Server className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-semibold">DNS Logic</h3>
                        </div>

                        <div className="space-y-4 font-mono text-xs overflow-hidden text-gray-300">
                            <DnsSection label="A Records (IPs)" data={data.dns.A} />
                            <DnsSection label="MX Records (Mail)" data={data.dns.MX} />
                            <DnsSection label="NS Records (Nameservers)" data={data.dns.NS} />
                            <DnsSection label="TXT Records" data={data.dns.TXT} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string, value: any }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start border-b border-gray-800 pb-2 last:border-0 last:pb-0">
            <span className="text-gray-500">{label}:</span>
            <span className="text-right text-sky-100 break-all max-w-[60%]">{String(value)}</span>
        </div>
    )
}

const DnsSection = ({ label, data }: { label: string, data?: string[] }) => {
    if (!data || data.length === 0) return null;
    return (
        <div>
            <div className="text-gray-500 mb-1">{label}</div>
            <div className="bg-black/30 p-2 rounded border border-gray-800 space-y-1">
                {data.map((item, i) => (
                    <div key={i} className="break-all">{item}</div>
                ))}
            </div>
        </div>
    )
}

function formatDate(date: any) {
    if (!date) return 'N/A';
    if (Array.isArray(date)) return new Date(date[0]).toLocaleDateString();
    return new Date(date).toLocaleDateString();
}

export default DomainDashboard;
