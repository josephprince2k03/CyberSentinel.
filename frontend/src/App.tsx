import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DomainDashboard from './modules/domain/DomainDashboard';
import { PersonDashboard } from './modules/person/PersonDashboard';
import { LayoutDashboard, Globe, ShieldAlert, FileText, Menu, X, UserSearch } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import BreachDashboard from './modules/breach/BreachDashboard';

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Domain Intelligence', icon: Globe },
        { path: '/person', label: 'Person Investigation', icon: UserSearch },
        { path: '/breach', label: 'Breach Check', icon: ShieldAlert },
        { path: '/cases', label: 'Case Management', icon: FileText },
    ];

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            {sidebarOpen && (
                <aside className="fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-green-900/30 flex flex-col bg-black border-r border-green-900/20">
                    <div className="p-6 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-lg text-white">RakHack OSINT</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                        isActive ? "bg-green-600/20 text-green-400 border border-green-500/20" : "text-gray-400 hover:text-green-300 hover:bg-green-900/10"
                                    )}
                                >
                                    <Icon className={clsx("w-5 h-5 relative z-10")} />
                                    <span className="relative z-10 font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/10 text-xs text-muted-foreground text-center text-gray-500">
                        <div>Secure Environment</div>
                        <div className="text-[10px] opacity-50">v1.0.0 • React + Python</div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className={clsx(
                "flex-1 relative transition-all duration-300 flex flex-col h-screen overflow-y-auto bg-black text-white",
                sidebarOpen ? "ml-64" : "ml-0"
            )}>
                {/* Topbar */}
                <header className="sticky top-0 z-40 w-full h-16 glass-panel border-b border-green-900/30 px-6 flex items-center justify-between border-b border-green-900/20 bg-black/80 backdrop-blur">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <div className="text-sm text-gray-400">
                            OSINT Investigation Toolkit &gt; <span className="text-white">Workspace</span>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <Routes>
                        <Route path="/" element={<DomainDashboard />} />
                        <Route path="/person" element={<PersonDashboard />} />
                        <Route path="/breach" element={<BreachDashboard />} />
                        <Route path="/cases" element={<div className="p-10 text-center text-gray-500">Case Management Placeholder</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;
