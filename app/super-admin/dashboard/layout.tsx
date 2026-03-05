"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    ShieldAlert,
    LogOut,
    Activity,
    Server,
    Search,
    Handshake,
    MessageSquare,
    Package,
    Palette,
    Settings2,
    FileText,
    Globe,
    Mail,
    Box,
    BarChart3,
    Settings,
    ShieldCheck,
    PenTool,
    Coins,
    GraduationCap,
    Target,
    Zap,
    Shield
} from "lucide-react";
import { Logo } from "../../../components/ui/Logo";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="flex min-h-screen bg-[#FAFAFA]">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col fixed h-screen z-50 overflow-hidden">
                <div className="h-20 flex items-center px-8 border-b border-slate-50">
                    <Logo size={32} variant="color" />
                    <span className="ml-3 text-xs font-black tracking-[0.3em] text-slate-400 uppercase">Console</span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <NavLink href="/super-admin/dashboard" icon={<LayoutDashboard size={18} strokeWidth={1.5} />} label="Operational Hub" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block">Revenue Engine</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/crm" icon={<Target size={18} strokeWidth={1.5} />} label="Sales War Room" />
                    <NavLink href="/super-admin/dashboard/finance" icon={<BarChart3 size={18} strokeWidth={1.5} />} label="Financial Ledger" />
                    <NavLink href="/super-admin/dashboard/finance/settings" icon={<Settings2 size={18} strokeWidth={1.5} />} label="HSN/GST Settings" />
                    <NavLink href="/super-admin/dashboard/proposals" icon={<PenTool size={18} strokeWidth={1.5} />} label="Client Proposals" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block">Governance</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/settings/rbac" icon={<ShieldCheck size={18} strokeWidth={1.5} />} label="RBAC Configuration" />
                    <NavLink href="/super-admin/dashboard/branding" icon={<Palette size={18} strokeWidth={1.5} />} label="Branding Control" />
                    <NavLink href="/super-admin/dashboard/packages" icon={<Package size={18} strokeWidth={1.5} />} label="Packages & Pricing" />
                    <NavLink href="/super-admin/dashboard/theme" icon={<Box size={18} strokeWidth={1.5} />} label="Theme Control" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block">Infrastructure</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/landing-page" icon={<Globe size={18} strokeWidth={1.5} />} label="Landing Page" />
                    <NavLink href="/super-admin/dashboard/settings/smtp" icon={<Mail size={18} strokeWidth={1.5} />} label="SMTP Relay Matrix" />
                    <NavLink href="/super-admin/dashboard/settings/meta" icon={<Activity size={18} strokeWidth={1.5} />} label="Meta Architecture" />
                    <NavLink href="/super-admin/dashboard/settings/automation" icon={<Zap size={18} strokeWidth={1.5} />} label="Automation Engine" />
                    <NavLink href="/super-admin/dashboard/infra" icon={<Server size={18} strokeWidth={1.5} />} label="System Instance" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block">Entities</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/vendors" icon={<Users size={18} strokeWidth={1.5} />} label="Vendor Registry" />
                    <NavLink href="/super-admin/dashboard/partners" icon={<Handshake size={18} strokeWidth={1.5} />} label="Affiliate Network" />
                    <NavLink href="/super-admin/dashboard/white-label" icon={<ShieldCheck size={18} strokeWidth={1.5} />} label="Platform Partner" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block">Monitoring</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/settings/retention" icon={<Activity size={18} strokeWidth={1.5} />} label="Audit & Retention" />
                    <NavLink href="/super-admin/dashboard/audit" icon={<Shield size={18} strokeWidth={1.5} />} label="Audit Trail" />
                    <NavLink href="/super-admin/dashboard/risk" icon={<ShieldAlert size={18} strokeWidth={1.5} />} label="Security & Risk" />
                    <NavLink href="/super-admin/dashboard/settings" icon={<Settings size={18} strokeWidth={1.5} />} label="Global Settings" />
                </nav>

                <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                    <Link href="/super-admin/dashboard/account" className="flex items-center gap-4 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md group">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-xs font-black text-white">SA</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate">Root Admin</div>
                            <div className="text-[10px] font-bold text-[#27954D] uppercase tracking-wider">System Master</div>
                        </div>
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                await fetch("/api/super-admin/auth/logout", { method: "POST" });
                                window.location.href = "/super-admin/login";
                            }}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-2 z-10"
                        >
                            <LogOut size={16} />
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[280px]">
                {/* Header */}
                <header className="h-20 border-b border-slate-100 flex items-center justify-between px-12 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-6 w-[400px]">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Universal Command Search..."
                                className="w-full bg-slate-50 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 transition-all placeholder:text-slate-500 font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</span>
                            <span className="text-xs font-bold text-slate-900">PRODUCTION CLUSTER</span>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#27954D]/10 border border-[#27954D]/20">
                            <div className="h-2 w-2 rounded-full bg-[#27954D] animate-pulse" />
                        </div>
                    </div>
                </header>

                {pathname.startsWith('/super-admin/dashboard/landing-page/') && pathname.split('/').length > 5 ? (
                    children
                ) : (
                    <div className="p-12 animate-fade-in max-w-[1600px]">
                        {children}
                    </div>
                )}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/super-admin/dashboard" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden ${isActive
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
        >
            <div className={`transition-colors duration-300 ${isActive ? "text-white" : "text-slate-300 group-hover:text-slate-900"}`}>
                {icon}
            </div>
            {label}
            {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#27954D] rounded-l-full shadow-[0_0_15px_rgba(39,149,77,0.6)]" />
            )}
        </Link>
    );
}
