"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Send,
    GitBranch,
    Settings,
    Clock,
    LogOut,
    CreditCard,
    ShoppingBag,
    LayoutTemplate,
    Zap,
    GraduationCap,
    Coins,
    Activity,
    LayoutGrid,
    MessageCircle,
    Monitor as MonitorPlay,
    Store,
    Gift,
    BadgeCheck,
    Lock
} from "lucide-react";
import { useUser } from "../../hooks/use-user";
import { useBranding } from "../../hooks/use-branding";
import { BrandProvider } from "../../components/branding/BrandProvider";
import { DynamicLogo } from "../../components/branding/DynamicLogo";
import { SetPasswordPrompt } from "../../components/auth/SetPasswordPrompt";
import { SmartPartnerLink } from "../../components/landing-new/SmartPartnerLink";
import { TrialBanner, TrialExpiredGate } from "../../components/trial/TrialGate";
import { NotificationBell } from "../../components/crm/NotificationBell";
import { ResellerAnnouncement } from "../../components/branding/ResellerAnnouncement";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { branding } = useBranding();
    const { user, loading: userLoading } = useUser();
    const pathname = usePathname();

    // ⛔ Suspension Gate: If workspace is suspended, block the entire UI
    if (user?.workspace?.status === "SUSPENDED") {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
                    <div className="w-24 h-24 bg-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse">
                        <Lock size={48} className="text-rose-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Account Paused</h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Your workspace access has been restricted by the platform administrator. 
                            This is usually due to missing compliance details, pending payments, or terms of service review.
                        </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                        <button 
                            onClick={() => window.location.href = `mailto:support@grafty.pro`}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
                        >
                            Appeal via Support
                        </button>
                        <button 
                            onClick={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/login";
                            }}
                            className="w-full py-4 bg-transparent text-slate-500 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                            Sign Out Account
                        </button>
                    </div>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">SECURE ACCESS CONTROL</div>
                </div>
            </div>
        );
    }

    return (
        <BrandProvider colors={branding ? { primary: branding.primary_color || "#27954D", secondary: branding.secondary_color || "#042F94" } : undefined}>
            <ResellerAnnouncement banner={branding?.broadcast?.banner} link={branding?.broadcast?.link} />
            <div className="min-h-screen bg-slate-50 flex">
                {/* Sidebar */}
                <aside className="w-[280px] bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-screen z-50 overflow-hidden">
                    {/* Brand Identity */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-50 justify-between">
                        <DynamicLogo
                            logoUrl={branding?.logo_url}
                            brandName={branding?.brand_name || "Grafty"}
                            showText={true}
                            className="h-9 w-auto"
                        />
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2 py-1 rounded-lg border border-emerald-100">v1.0.1</span>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} strokeWidth={1.5} />} label="Overview" pathname={pathname} />
                        <NavItem icon={<Zap size={20} />} label="Quick Replies" href="/dashboard/responders" pathname={pathname} />
                        <NavItem icon={<LayoutGrid size={20} />} label="CRM" href="/dashboard/crm" pathname={pathname} />
                        <NavItem icon={<MessageCircle size={20} />} label="Live Chat" href="/dashboard/chat" pathname={pathname} />
                        <NavItem icon={<Users size={20} />} label="Contacts" href="/dashboard/contacts" pathname={pathname} />

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Automation</span>
                        </div>
                        <NavItem 
                            href="/dashboard/flows" 
                            icon={<GitBranch size={20} strokeWidth={1.5} />} 
                            label="Flow Builder" 
                            pathname={pathname}
                        />
                        <NavItem 
                            href="/dashboard/drips" 
                            icon={<Clock size={20} strokeWidth={1.5} />} 
                            label="Drip Sequences" 
                            pathname={pathname}
                            locked={user?.workspace?.plan?.name !== "ENTERPRISE"} 
                        />

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Monetization</span>
                        </div>
                        <NavItem 
                            icon={<MonitorPlay size={20} />} 
                            label="Academy CRM" 
                            href="/dashboard/education" 
                            pathname={pathname} 
                            locked={!user?.workspace?.plan?.module_academy && user?.workspace?.plan?.name !== "ENTERPRISE"} 
                        />
                        <NavItem 
                            icon={<Store size={20} />} 
                            label="E-Commerce" 
                            href="/dashboard/commerce" 
                            pathname={pathname} 
                            locked={!user?.workspace?.plan?.module_ecommerce && user?.workspace?.plan?.name !== "ENTERPRISE"} 
                        />
                        <NavItem icon={<Gift size={20} />} label="Refer & Earn" href="/dashboard/referrals" pathname={pathname} />

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Campaigns & Analytics</span>
                        </div>
                        <NavItem href="/dashboard/campaigns" icon={<Send size={20} strokeWidth={1.5} />} label="Broadcasts" pathname={pathname} />
                        <NavItem href="/dashboard/templates" icon={<LayoutTemplate size={20} strokeWidth={1.5} />} label="Templates" pathname={pathname} />
                        <NavItem 
                            href="/dashboard/analytics/messages" 
                            icon={<Activity size={20} strokeWidth={1.5} />} 
                            label="Delivery Intelligence" 
                            pathname={pathname} 
                            locked={user?.workspace?.plan?.name === "STARTER"} 
                        />
                    </nav>

                    {/* Footer Nav */}
                    <div className="p-6 border-t border-slate-100 space-y-1 bg-slate-50/30">
                        {/* Simplified Vendor Profile - Resolved Crashing Issues */}
                        <div className="mb-6 mx-2 p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg">
                                    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "V"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">
                                        {user?.first_name || user?.email?.split('@')[0] || "Vendor"}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                                        {user?.workspace?.name || "Active Workspace"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <NavItem href="/dashboard/credits" icon={<Coins size={20} strokeWidth={1.5} />} label="Credits" pathname={pathname} />
                        <NavItem href="/dashboard/settings" icon={<Settings size={20} strokeWidth={1.5} />} label="Preferences" pathname={pathname} />
                        <NavItem href="/dashboard/settings/billing" icon={<CreditCard size={20} strokeWidth={1.5} />} label="Billing" pathname={pathname} />
                        <button
                            onClick={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/login";
                            }}
                            className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-rose-500 px-4 py-3 w-full rounded-2xl hover:bg-rose-50/50 transition-all mt-4 group"
                        >
                            <div className="bg-slate-100 group-hover:bg-rose-100 p-2 rounded-xl transition-colors">
                                <LogOut size={16} strokeWidth={2} />
                            </div>
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 flex flex-col lg:ml-[280px]">
                    <TrialBanner />
                    <main className={`flex-1 ${pathname.startsWith('/dashboard/chat') ? 'p-0 h-screen w-full fixed left-0 lg:left-[280px] lg:w-[calc(100vw-280px)] top-0 z-[100] bg-white overflow-hidden' : 'p-8 lg:p-12 max-w-7xl'}`}>
                        {children}
                    </main>

                    {!pathname.startsWith('/dashboard/chat') && (
                        <footer className="py-10 px-12 border-t border-slate-100 bg-white shadow-[0_-1px_0_0_rgba(0,0,0,0.02)]">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <h3 className="text-sm font-black text-slate-900 mb-0.5 tracking-tighter">{branding?.brand_name || "Grafty"} Console</h3>
                                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                                    &copy; {new Date().getFullYear()} {branding?.brand_name || "Grafty"}. ENTERPRISE GRADE MESSAGING.
                                </p>
                                <div className="flex gap-8">
                                    <FooterLink label="Terms of Service" href="/terms" />
                                    <FooterLink label="Privacy Policy" href="/privacy" />
                                    <FooterLink label="Support" href={`mailto:${branding?.support?.email || "support@" + (process.env.NEXT_PUBLIC_APP_URL || "grafty.pro").replace(/https?:\/\//, '')}`} />
                                </div>
                            </div>
                        </footer>
                    )}
                </div>
            </div>
            <SetPasswordPrompt />
            <TrialExpiredGate />
            <NotificationBell />
        </BrandProvider>
    );
}

function NavItem({ href, icon, label, pathname, locked = false }: { href: string; icon: React.ReactNode; label: string; pathname: string; locked?: boolean }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    return (
        <Link
            href={locked ? "/dashboard/settings/billing" : href}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[12px] font-black uppercase tracking-tight transition-all duration-500 relative group overflow-hidden ${isActive
                ? "bg-gradient-to-r from-[#27954D] to-[#1e7a3d] text-white shadow-xl shadow-emerald-200/50 scale-[1.02]"
                : locked 
                    ? "text-slate-300 cursor-not-allowed opacity-50" 
                    : "text-slate-500 hover:text-[#27954D] hover:bg-emerald-50/50"
                }`}
        >
            {/* Glassmorphism Shine Effect on Hover */}
            {!locked && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer duration-1000" />
            )}

            <div className={`transition-all duration-500 ${isActive ? "text-white scale-110 drop-shadow-md" : locked ? "text-slate-200" : "text-slate-400 group-hover:text-[#27954D] group-hover:scale-110"}`}>
                {icon}
            </div>
            
            <span className="flex-1 transition-transform duration-500 group-hover:translate-x-1">{label}</span>
            
            {locked && <Lock size={12} className="text-slate-300" />}
            
            {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
            )}
        </Link>
    );
}

function FooterLink({ label, href = "#" }: { label: string; href?: string }) {
    return (
        <Link href={href} className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">
            {label}
        </Link>
    );
}
