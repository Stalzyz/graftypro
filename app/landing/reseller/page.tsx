import Link from "next/link";
import {
    Users,
    Coins,
    BarChart3,
    Wallet,
    Rocket,
    ShieldCheck,
    ChevronRight,
    Zap
} from "lucide-react";
import "../landing.css";

export default function ResellerLanding() {
    return (
        <div className="landing-body min-h-screen relative">
            <div className="hero-gradient" />

            {/* Header */}
            <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
                <Link href="/" className="text-2xl font-black tracking-tighter text-white">
                    WABOT<span className="text-blue-500">.</span>
                </Link>
                <div className="hidden md:flex gap-8 items-center">
                    <Link href="#earnings" className="nav-link">Earnings</Link>
                    <Link href="#dashboard" className="nav-link">Dashboard</Link>
                    <Link href="#onboarding" className="nav-link">Onboarding</Link>
                    <Link href="/landing/white-label" className="nav-link font-bold text-white px-4 py-2 bg-white/5 rounded-lg border border-white/10">Upgrade to White label</Link>
                </div>
                <Link href="/register" className="btn-primary">Become a Partner</Link>
            </header>

            {/* Hero Section */}
            <section className="max-w-4xl mx-auto text-center px-6 pt-24 pb-32 relative z-10">
                <div className="section-tag">Earnings Opportunity 2026</div>
                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                    Build Your <span className="text-gradient-primary">WhatsApp Revenue</span> Empire
                </h1>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The ultimate companion for every reseller. Sell credits, upgrade tiers, and track your growing wallet with the industry's most powerful partner ecosystem.
                </p>
                <div className="flex flex-col md:row items-center justify-center gap-4">
                    <Link href="/register" className="btn-primary text-lg px-10 py-5">
                        Start Earning Now <ChevronRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Benefit Grid */}
            <section id="earnings" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <h2 className="text-4xl font-bold text-center mb-16 underline decoration-blue-500 decoration-4 underline-offset-8">Hybrid Earning Models</h2>
                <div className="feature-grid">
                    <div className="glass-card p-10 relative">
                        <div className="icon-box"><Coins /></div>
                        <h3 className="text-2xl font-black mb-4">Credit Markups</h3>
                        <p className="text-slate-400 leading-relaxed">Apply custom margins on every message. Your customers pay your price, you keep 100% of the markup profit instantly.</p>
                    </div>
                    <div className="glass-card p-10">
                        <div className="icon-box"><Zap /></div>
                        <h3 className="text-2xl font-black mb-4">Tier Upgrades</h3>
                        <p className="text-slate-400 leading-relaxed">Scale from Silver to Platinum. High-volume resellers unlock lower base pricing, exponentially increasing your profit margins.</p>
                    </div>
                    <div className="glass-card p-10">
                        <div className="icon-box"><Users /></div>
                        <h3 className="text-2xl font-black mb-4">Passive Commission</h3>
                        <p className="text-slate-400 leading-relaxed">Earn a percentage of every subscription your sub-vendors pay. Build a stable, recurring monthly income stream.</p>
                    </div>
                </div>
            </section>

            {/* Dashboard Showcase */}
            <section id="dashboard" className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                    <div className="section-tag bg-blue-500/10 text-blue-400">Partner Intelligence</div>
                    <h2 className="text-5xl font-black mb-8 leading-tight">Your Financial <span className="text-gradient">Cockpit</span></h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0"><Wallet /></div>
                            <div>
                                <h4 className="font-bold text-lg">Instant Wallet System</h4>
                                <p className="text-slate-400 text-sm">Real-time balance tracking with integrated payout requests to your bank account.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0"><BarChart3 /></div>
                            <div>
                                <h4 className="font-bold text-lg">Sub-Vendor Analytics</h4>
                                <p className="text-slate-400 text-sm">Deep dive into which clients are driving your message volume and commission growth.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] opacity-20 blur-2xl"></div>
                    <img
                        src="/reseller_dashboard_mockup.png"
                        alt="Reseller Dashboard"
                        className="rounded-3xl border border-white/10 shadow-2xl relative z-10"
                    />
                </div>
            </section>

            {/* Onboarding Steps */}
            <section id="onboarding" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black mb-4">Go Live in 3 Steps</h2>
                    <p className="text-slate-400">No complex contracts. No red tape. Just revenue.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Register", desc: "Create your partner account in 60 seconds." },
                        { title: "Set Margins", desc: "Define your global markups and sub-vendor pricing tiers." },
                        { title: "Invite Clients", desc: "Onboard businesses and watch your wallet balance climb." }
                    ].map((step, i) => (
                        <div key={i} className="glass-card p-10 relative overflow-hidden">
                            <div className="step-number">0{i + 1}</div>
                            <h3 className="text-2xl font-black mb-4">{step.title}</h3>
                            <p className="text-slate-400">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-32 relative z-10">
                <div className="glass-card p-16 text-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/20">
                    <h2 className="text-5xl font-black mb-8">Ready to dominate the market?</h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto">Join the 500+ partners who are scaling their businesses using our infrastructure. Clear payouts, high reliability.</p>
                    <Link href="/register" className="btn-primary text-xl px-12 py-6">
                        Get Started for Free
                    </Link>
                    <p className="text-slate-500 mt-6 text-sm flex items-center justify-center gap-2">
                        <ShieldCheck size={16} /> Secured by Platform Compliance
                    </p>
                </div>
            </section>
        </div>
    );
}
