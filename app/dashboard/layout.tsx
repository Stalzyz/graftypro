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
    Activity
} from "lucide-react";
import { useBranding } from "../../hooks/use-branding";
import { BrandProvider } from "../../components/branding/BrandProvider";
import { DynamicLogo } from "../../components/branding/DynamicLogo";
import { SetPasswordPrompt } from "../../components/auth/SetPasswordPrompt";
import { SmartPartnerLink } from "../../components/landing-new/SmartPartnerLink";
import { TrialBanner, TrialExpiredGate } from "../../components/trial/TrialGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { branding } = useBranding();
    const pathname = usePathname();

    return (
        <BrandProvider colors={branding ? { primary: branding.primary_color || "#27954D", secondary: branding.secondary_color || "#042F94" } : undefined}>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Sidebar */}
                <aside className="w-[280px] bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-screen z-50 overflow-hidden">
                    {/* Brand Identity */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-50">
                        <DynamicLogo
                            logoUrl={branding?.logo_url}
                            brandName={branding?.brand_name}
                            className="h-9 w-auto"
                        />
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} strokeWidth={1.5} />} label="Overview" pathname={pathname} />
                        <NavItem href="/dashboard/crm" icon={<Users size={20} strokeWidth={1.5} />} label="Universal CRM" pathname={pathname} />
                        <NavItem href="/dashboard/chat" icon={<MessageSquare size={20} strokeWidth={1.5} />} label="Live Chat" pathname={pathname} />
                        <NavItem href="/dashboard/contacts" icon={<Users size={20} strokeWidth={1.5} />} label="Contacts" pathname={pathname} />

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Automation</span>
                        </div>
                        {branding?.features?.flows !== false && <NavItem href="/dashboard/flows" icon={<GitBranch size={20} strokeWidth={1.5} />} label="Flow Builder" pathname={pathname} />}
                        {branding?.features?.drips !== false && <NavItem href="/dashboard/drips" icon={<Clock size={20} strokeWidth={1.5} />} label="Drip Sequences" pathname={pathname} />}
                        <NavItem href="/dashboard/responders" icon={<Zap size={20} strokeWidth={1.5} />} label="Quick Replies" pathname={pathname} />

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Monetization</span>
                        </div>
                        {branding?.features?.edu && <NavItem href="/dashboard/education" icon={<GraduationCap size={20} strokeWidth={1.5} />} label="Lead Engine" pathname={pathname} />}
                        {branding?.features?.commerce !== false && <NavItem href="/dashboard/commerce" icon={<ShoppingBag size={20} strokeWidth={1.5} />} label="E-commerce" pathname={pathname} />}

                        <div className="pt-8 pb-3 px-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Campaigns & Analytics</span>
                        </div>
                        <NavItem href="/dashboard/campaigns" icon={<Send size={20} strokeWidth={1.5} />} label="Broadcasts" pathname={pathname} />
                        <NavItem href="/dashboard/templates" icon={<LayoutTemplate size={20} strokeWidth={1.5} />} label="Templates" pathname={pathname} />
                        <NavItem href="/dashboard/analytics/messages" icon={<Activity size={20} strokeWidth={1.5} />} label="Delivery Intelligence" pathname={pathname} />
                    </nav>

                    {/* Footer Nav */}
                    <div className="p-6 border-t border-slate-100 space-y-1 bg-slate-50/30">

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
                                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                                    &copy; {new Date().getFullYear()} {branding?.brand_name || "Grafty"}. ENTERPRISE GRADE MESSAGING.
                                </p>
                                <div className="flex gap-8">
                                    <FooterLink label="Terms of Service" href="/terms" />
                                    <FooterLink label="Privacy Policy" href="/privacy" />
                                    <FooterLink label="Support" href={`mailto:${branding?.support?.email || "support@grafty.pro"}`} />
                                </div>
                            </div>
                        </footer>
                    )}
                </div>
            </div>
            <SetPasswordPrompt />
            <TrialExpiredGate />
        </BrandProvider>
    );
}

function NavItem({ href, icon, label, pathname }: { href: string; icon: React.ReactNode; label: string; pathname: string }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

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

function FooterLink({ label, href = "#" }: { label: string; href?: string }) {
    return (
        <Link href={href} className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">
            {label}
        </Link>
    );
}
