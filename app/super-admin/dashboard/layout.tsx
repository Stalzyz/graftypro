"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../../../components/ui/Logo";
import { 
  BarChart3, 
  Users, 
  Settings, 
  Package, 
  CreditCard, 
  Mail, 
  Bot, 
  ShieldCheck, 
  Globe, 
  Layout, 
  Palette, 
  Truck, 
  Zap, 
  LogOut,
  Search,
  Activity,
  UserCheck,
  Building,
  Lock,
  MessageSquare,
  FileText,
  Clock,
  ShieldAlert,
  Server,
  Facebook
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="flex min-h-screen bg-[#FAFAFA]"></div>;

    const safePath = pathname || "";

    return (
        <div className="flex min-h-screen bg-[#FAFAFA] text-slate-900">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col fixed h-screen z-50">
                <div className="h-20 flex items-center px-8 border-b border-slate-50">
                    <Logo size={40} variant="color" />
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavLink href="/super-admin/dashboard" icon={<BarChart3 size={18} />} label="Dashboard" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Revenue</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/crm" icon={<Users size={18} />} label="Sales" />
                    <NavLink href="/super-admin/dashboard/growth" icon={<Zap size={18} />} label="Growth" />
                    <NavLink href="/super-admin/dashboard/finance" icon={<CreditCard size={18} />} label="Finance" />
                    <NavLink href="/super-admin/dashboard/proposals" icon={<FileText size={18} />} label="Proposals" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">System</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/settings/rbac" icon={<ShieldCheck size={18} />} label="Permissions" />
                    <NavLink href="/super-admin/dashboard/branding" icon={<Palette size={18} />} label="Branding" />
                    <NavLink href="/super-admin/dashboard/packages" icon={<Package size={18} />} label="Packages" />
                    <NavLink href="/super-admin/dashboard/landing-page" icon={<Globe size={18} />} label="Landing Page" />
                     <NavLink href="/super-admin/dashboard/settings/smtp" icon={<Mail size={18} />} label="SMTP" />
                    <NavLink href="/super-admin/dashboard/meta" icon={<Facebook size={18} />} label="Meta Onboarding" />
                    <NavLink href="/super-admin/dashboard/infra" icon={<Server size={18} />} label="Infrastructure" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Management</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/vendors" icon={<UserCheck size={18} />} label="Vendors" />
                    <NavLink href="/super-admin/dashboard/partners" icon={<Handshake size={18} />} label="Partners" />
                    <NavLink href="/super-admin/dashboard/white-label" icon={<Building size={18} />} label="White-label" />

                    <div className="pt-6 pb-2 px-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Audit</span>
                    </div>
                    <NavLink href="/super-admin/dashboard/settings/retention" icon={<Clock size={18} />} label="Logs" />
                    <NavLink href="/super-admin/dashboard/risk" icon={<ShieldAlert size={18} />} label="Security" />
                    <NavLink href="/super-admin/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <Link href="/super-admin/dashboard/account" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                            <span className="text-[10px] font-black text-white">SA</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[11px] font-bold text-slate-900 truncate">Admin</div>
                        </div>
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await fetch("/api/super-admin/auth/logout", { method: "POST" });
                                window.location.href = "/super-admin/login";
                            }}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[280px]">
                <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4 w-[400px]">
                        <Search size={18} className="text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-transparent border-none py-3 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</span>
                            <span className="text-[11px] font-bold text-slate-900 uppercase">Production</span>
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-50">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                </header>

                <div className="p-10 animate-fade-in max-w-[1400px]">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Fixed Handshake import issue by manually checking
const Handshake = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2 6-6"/><path d="m18 14 2.5 2.5a3.37 3.37 0 0 1 0 4.75 3.37 3.37 0 0 1-4.75 0L13.5 19"/><path d="m9.9 14.2-6.4 6.4a2.2 2.2 0 0 1-3.1 0 2.2 2.2 0 0 1 0-3.1l6.4-6.4"/><path d="M12.5 12.5a2.12 2.12 0 0 1 3 3L12 19l-3-3 3.5-3.5Z"/><path d="m14 7 3 3"/><path d="M9.4 10.6 19 1l3 3-9.6 9.6"/></svg>
);

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const safePath = pathname || "";
    const isActive = safePath === href || (href !== "/super-admin/dashboard" && safePath.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${isActive
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
        >
            <div className={`transition-colors duration-200 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-900"}`}>
                {icon}
            </div>
            {label}
        </Link>
    );
}
