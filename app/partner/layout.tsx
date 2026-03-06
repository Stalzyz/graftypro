"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, Wallet, FileText, Settings,
    LogOut, ChevronRight, Ticket, Target,
    Receipt, Globe, Mail, Zap, Activity, Shield, CreditCard
} from 'lucide-react';
import { Logo } from "../../components/ui/Logo";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [partner, setPartner] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("/api/reseller/me")
            .then(res => res.json())
            .then(data => { setPartner(data.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Force light mode — partner dashboard is light-only
    React.useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    const isPlatform = partner?.role === "PLATFORM";
    const isAuthPage = pathname === "/partner/login" || pathname === "/partner/register" || pathname === "/partner/forgot-password";
    if (isAuthPage) return <>{children}</>;

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-[#27954D] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 flex selection:bg-[#27954D]/10 selection:text-[#27954D]">

            {/* Ultra-Premium Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 z-50 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)]">

                {/* Brand Identity */}
                <div className="h-24 flex items-center px-8 gap-4">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm group hover:border-[#27954D]/20 transition-all">
                        <Logo size={24} brandName={partner?.brand_name || "Nexus"} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic tracking-tighter text-slate-900 leading-none uppercase">{partner?.brand_name || "Nexus Console"}</h2>
                        <span className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase mt-1 block">
                            {isPlatform ? "Platform Nodes" : "Network Partner"}
                        </span>
                    </div>
                </div>

                {/* Navigation Stream */}
                <nav className="flex-1 px-6 py-4 overflow-y-auto space-y-8 scroll-smooth scrollbar-hide">

                    <div className="space-y-1">
                        <SectionHeader label="Overview" />
                        <NavItem href="/partner/dashboard" icon={<Activity size={18} />} label="Overview" pathname={pathname} />
                        {isPlatform && (
                            <>
                                <NavItem href="/partner/vendors" icon={<Users size={18} />} label="My Vendors" pathname={pathname} />
                                <NavItem href="/partner/subscriptions" icon={<Ticket size={18} />} label="Plans" pathname={pathname} />
                            </>
                        )}
                        <NavItem href="/partner/payouts" icon={<Wallet size={18} />} label="Payouts" pathname={pathname} />
                    </div>

                    <div className="space-y-1">
                        <SectionHeader label="Sales" />
                        <NavItem href="/partner/leads" icon={<Target size={18} />} label="Leads" pathname={pathname} />
                        <NavItem href="/partner/coupons" icon={<Zap size={18} />} label="Coupons" pathname={pathname} />
                        {!isPlatform && <NavItem href="/partner/referrals" icon={<Users size={18} />} label="Referrals" pathname={pathname} />}
                        <NavItem href="/partner/proposals" icon={<FileText size={18} />} label="Proposals" pathname={pathname} />
                    </div>

                    <div className="space-y-1">
                        <SectionHeader label="Finance" />
                        <NavItem href="/partner/ledger" icon={<Receipt size={18} />} label="Ledger" pathname={pathname} />
                        <NavItem href="/partner/invoices" icon={<FileText size={18} />} label="Invoices" pathname={pathname} />
                    </div>

                    {isPlatform && (
                        <div className="space-y-1">
                            <SectionHeader label="Settings" />
                            <NavItem href="/partner/settings" icon={<Settings size={18} />} label="Branding" pathname={pathname} />
                            <NavItem href="/partner/domain" icon={<Globe size={18} />} label="Domain & DNS" pathname={pathname} />
                            <NavItem href="/partner/email" icon={<Mail size={18} />} label="SMTP Config" pathname={pathname} />
                        </div>
                    )}

                    {!isPlatform && (
                        <div className="space-y-1">
                            <SectionHeader label="Settings" />
                            <NavItem href="/partner/settings/billing" icon={<CreditCard size={18} />} label="Payment Gateway" pathname={pathname} />
                        </div>
                    )}

                    {/* Add back Payment Gateway to Admin Settings as well */}
                    {isPlatform && (
                        <div className="space-y-1 mt-0">
                            <NavItem href="/partner/settings/billing" icon={<CreditCard size={18} />} label="Payment Gateway" pathname={pathname} />
                        </div>
                    )}
                </nav>

                {/* System Status / User Action */}
                <div className="p-6 border-t border-slate-50 space-y-4 bg-slate-50/30">
                    {!isPlatform && (
                        <button
                            onClick={() => window.location.href = '/partner/upgrade'}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                        >
                            <Shield size={14} className="group-hover:text-emerald-400 transition-colors" />
                            Upgrade to Platform
                        </button>
                    )}

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-black text-[10px] shadow-sm italic">
                                {partner?.name?.charAt(0) || "P"}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 leading-none uppercase italic truncate max-w-[100px]">{partner?.name?.split(' ')[0] || "Partner"}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">V 4.0.2 LIVE</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await fetch("/api/reseller/auth/logout", { method: "POST" });
                                window.location.href = "/partner/login";
                            }}
                            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                            title="De-authenticate Console"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Fluid Layout */}
            <div className="flex-1 flex flex-col pl-72">

                {/* Executive Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between px-10">
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] italic">Protocol</div>
                        <ChevronRight size={14} className="text-slate-200" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic leading-none">{pathname.split('/').pop()?.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden xl:flex flex-col items-end">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Network Load</p>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tighter italic">Operational</p>
                        </div>
                        <div className="h-6 w-px bg-slate-100" />
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 leading-none uppercase italic">{partner?.name || "Nexus Partner"}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{isPlatform ? "Platform Admin" : "Affiliate Node"}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black italic shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
                                {(partner?.name || "P").charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 max-w-7xl w-full mx-auto">
                    {children}
                </main>

                <footer className="border-t border-slate-50 py-10 px-10 bg-white/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white border border-slate-100 rounded-xl">
                                <Logo size={18} brandName="Nexus" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NEXUS PARTNER NETWORK</p>
                                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-0.5">Automated Intelligence Protocol</p>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <FooterLink label="Protocol Terms" href="/terms" />
                            <FooterLink label="Privacy Shield" href="/privacy" />
                            <FooterLink label="Core Support" href="mailto:support@matrix.pro" />
                        </div>
                        <div className="text-[10px] font-black text-slate-300 italic uppercase">
                            &copy; {new Date().getFullYear()} Grid Operations
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em] px-4 pt-6 pb-2 italic">
            {label}
        </div>
    );
}

function NavItem({ href, icon, label, pathname }: { href: string; icon: React.ReactNode; label: string; pathname: string }) {
    const isActive = pathname === href || (href !== "/partner/dashboard" && pathname.startsWith(href));
    return (
        <Link
            href={href}
            className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all relative ${isActive
                ? 'bg-slate-900 text-white shadow-xl shadow-black/10'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center gap-4 relative z-10">
                <span className={`transition-all duration-500 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'}`}>
                    {icon}
                </span>
                <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'italic' : ''}`}>{label}</span>
            </div>
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl pointer-events-none" />
            )}
            <ChevronRight size={14} className={`transition-all duration-500 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
        </Link>
    );
}

function FooterLink({ label, href }: { label: string; href: string }) {
    return (
        <Link href={href} className="text-[10px] text-slate-300 hover:text-slate-900 transition-colors font-black uppercase tracking-widest italic">
            {label}
        </Link>
    );
}
