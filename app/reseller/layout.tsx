"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Globe,
    Palette,
    CreditCard,
    Wallet,
    Share2,
    Settings,
    LogOut,
    MessageCircle,
    UserCircle
} from "lucide-react";

import { Logo } from "@/components/ui/Logo";

export default function ResellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-screen z-50 overflow-hidden">
                {/* Brand Identity */}
                <div className="h-20 flex items-center px-8 border-b border-slate-50/50">
                    <Logo size={28} variant="color" />
                    <span className="ml-3 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Partner</span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <NavItem href="/reseller/dashboard" icon={<LayoutDashboard size={20} strokeWidth={1.5} />} label="Overview" pathname={pathname} />

                    <div className="pt-8 pb-3 px-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Network</span>
                    </div>
                    <NavItem href="/reseller/branding" icon={<Palette size={20} strokeWidth={1.5} />} label="Custom Branding" pathname={pathname} />
                    <NavItem href="/reseller/domains" icon={<Globe size={20} strokeWidth={1.5} />} label="White-label Domains" pathname={pathname} />
                    <NavItem href="/reseller/toolkit" icon={<Share2 size={20} strokeWidth={1.5} />} label="Marketing Kit" pathname={pathname} />

                    <div className="pt-8 pb-3 px-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Financials</span>
                    </div>
                    <NavItem href="/reseller/billing" icon={<CreditCard size={20} strokeWidth={1.5} />} label="Network Invoices" pathname={pathname} />
                    <NavItem href="/reseller/payouts" icon={<Wallet size={20} strokeWidth={1.5} />} label="Earings & Payouts" pathname={pathname} />
                </nav>

                {/* Footer Nav */}
                <div className="p-6 border-t border-slate-50 space-y-1 bg-slate-50/30">
                    <NavItem href="/reseller/account" icon={<UserCircle size={20} strokeWidth={1.5} />} label="Partner Profile" pathname={pathname} />
                    <button className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-rose-500 px-4 py-3 w-full rounded-2xl hover:bg-rose-50/50 transition-all mt-4 group">
                        <div className="bg-slate-100 group-hover:bg-rose-100 p-2 rounded-xl transition-colors">
                            <LogOut size={16} strokeWidth={2} />
                        </div>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:ml-[280px]">
                {/* Header */}
                <header className="h-20 border-b border-slate-50 flex items-center justify-between px-12 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#27954D] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Partner Network Active</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Commission Tier</p>
                            <p className="text-sm font-black text-slate-900">GOLD PARTNER (25%)</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <UserCircle className="text-white" size={20} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 lg:p-12 max-w-7xl animate-fade-in">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-10 px-12 border-t border-slate-100 bg-white shadow-[0_-1px_0_0_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                            &copy; {new Date().getFullYear()} WAVO PARTNER NETWORK. CONFIDENTIAL.
                        </p>
                        <div className="flex gap-8">
                            <FooterLink label="Partner Terms" />
                            <FooterLink label="Success Kit" />
                            <FooterLink label="Support" />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, pathname }: { href: string; icon: React.ReactNode; label: string; pathname: string }) {
    const isActive = pathname === href || (href !== "/reseller/dashboard" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${isActive
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
        >
            <div className={`transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`}>
                {icon}
            </div>
            {label}
            {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#27954D] rounded-l-full shadow-[0_0_12px_rgba(39,149,77,0.5)]" />
            )}
        </Link>
    );
}

function FooterLink({ label }: { label: string }) {
    return (
        <Link href="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">
            {label}
        </Link>
    );
}
