
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wallet,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col">
                <div className="p-6">
                    <Link href="/partner/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tighter uppercase italic">Partner</span>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest -mt-1">Console</div>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem href="/partner/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/partner/dashboard"} />
                    <NavItem href="/partner/vendors" icon={<Users size={20} />} label="My Vendors" active={pathname === "/partner/vendors"} />
                    <NavItem href="/partner/payouts" icon={<Wallet size={20} />} label="Payouts" active={pathname === "/partner/payouts"} />
                    <NavItem href="/partner/ledger" icon={<FileText size={20} />} label="Financials" active={pathname === "/partner/ledger"} />
                    <NavItem href="/partner/settings" icon={<Settings size={20} />} label="Branding" active={pathname === "/partner/settings"} />
                </nav>

                <div className="p-4 border-t border-zinc-900">
                    <button
                        onClick={async () => {
                            await fetch("/api/reseller/auth/logout", { method: "POST" });
                            window.location.href = "/partner/login";
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-red-400 font-bold text-sm transition-colors rounded-xl hover:bg-red-500/5"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64">
                <header className="h-16 border-b border-zinc-900 bg-black/50 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
                    <div className="text-xs text-zinc-500 font-bold flex items-center gap-2 uppercase tracking-widest">
                        Partner <ChevronRight size={14} /> <span className="text-zinc-300">Overview</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase rounded-full border border-green-500/20">
                            Active Partner
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                ? 'bg-zinc-900 text-white shadow-lg'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
