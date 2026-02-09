import Link from "next/link";
import {
    Globe,
    Palette,
    Layers,
    Smartphone,
    Database,
    BadgeCheck,
    ArrowRight,
    Lock
} from "lucide-react";
import "../landing.css";

export default function WhiteLabelLanding() {
    return (
        <div className="landing-body min-h-screen relative">
            <div className="hero-gradient" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)' }} />

            {/* Nav */}
            <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
                <Link href="/" className="text-2xl font-black tracking-tighter text-white">
                    PLATFORM<span className="text-amber-500">X</span>
                </Link>
                <div className="hidden md:flex gap-8 items-center">
                    <Link href="#features" className="nav-link">Features</Link>
                    <Link href="#revenue" className="nav-link">Revenue</Link>
                    <Link href="#onboarding" className="nav-link">Launch</Link>
                </div>
                <Link href="/contact" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Book Demo</Link>
            </header>

            {/* Hero */}
            <section className="max-w-5xl mx-auto text-center px-6 pt-24 pb-32 relative z-10">
                <div className="section-tag" style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>Enterprise Solution</div>
                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                    Your Brand<span className="text-white/20">.</span> Your Rules<span className="text-white/20">.</span> <br />
                    <span style={{ color: '#f59e0b' }}>Total Ownership.</span>
                </h1>
                <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed text-balance">
                    Launch your own WhatsApp BSP platform in 24 hours. Full white-label control over pricing, branding, and global client networks. Built for agencies and visionary entrepreneurs.
                </p>
                <div className="flex flex-col md:row items-center justify-center gap-6">
                    <Link href="/contact" className="btn-primary text-lg px-10 py-5" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        Launch Your Brand <ArrowRight size={20} />
                    </Link>
                    <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Custom Domains Included</p>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="feature-grid">
                    <div className="glass-card p-10 border-amber-500/20">
                        <div className="icon-box text-amber-500 bg-amber-500/10"><Globe /></div>
                        <h3 className="text-2xl font-black mb-4">Custom Domain</h3>
                        <p className="text-slate-400">Host the platform on your own URL (e.g., app.yourbrand.com). We handle the SSL and infrastructure.</p>
                    </div>
                    <div className="glass-card p-10 border-amber-500/20">
                        <div className="icon-box text-amber-500 bg-amber-500/10"><Palette /></div>
                        <h3 className="text-2xl font-black mb-4">Complete UI Skinning</h3>
                        <p className="text-slate-400">Upload your logo, inject custom CSS, and pick brand colors. The platform looks and feels like it belongs to you.</p>
                    </div>
                    <div className="glass-card p-10 border-amber-500/20">
                        <div className="icon-box text-amber-500 bg-amber-500/10"><Layers /></div>
                        <h3 className="text-2xl font-black mb-4">Tier Management</h3>
                        <p className="text-slate-400">Create unlimited reseller and vendor tiers. Set different margins and feature access levels for each group.</p>
                    </div>
                </div>
            </section>

            {/* Super Admin Showcase */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-amber-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img
                            src="/super_admin_dashboard_mockup.png"
                            alt="Super Admin Control"
                            className="rounded-3xl border border-white/10 shadow-3xl grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer"
                        />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black mb-8">Super Admin <span className="text-amber-500">Authority.</span></h2>
                        <ul className="space-y-6">
                            {[
                                { icon: <Smartphone />, title: "Mobile Ready Dashboard", desc: "Manage your network from any device with optimized control panels." },
                                { icon: <Database />, title: "Margin Protection", desc: "No reseller can sell below your floor price, protecting your global network margin." },
                                { icon: <Lock />, title: "Enterprise Security", desc: "End-to-end encryption for all client data and server logs." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="text-amber-500 shrink-0">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Onboarding */}
            <section id="onboarding" className="max-w-7xl mx-auto px-6 py-32 relative z-10 bg-black/40 rounded-3xl border border-white/5 mx-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black mb-4">Ready to Scale?</h2>
                    <p className="text-slate-400">Launch your enterprise in three simple phases.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {[
                        { title: "Consultation", desc: "Deep dive into your business model and volume goals." },
                        { title: "Setup & Deployment", desc: "Your custom instance is deployed on dedicated clusters." },
                        { title: "Training & Launch", desc: "Full walk-through of the admin panel and reseller management." }
                    ].map((step, i) => (
                        <div key={i} className="text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-amber-500">
                                {i + 1}
                            </div>
                            <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 relative z-10 text-center">
                <h2 className="text-5xl font-black mb-10">Your enterprise journey <br /> starts <span className="text-amber-500 italic">today.</span></h2>
                <Link href="/contact" className="btn-primary text-xl px-16 py-6" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    Apply for Partnership
                </Link>
                <div className="mt-12 flex justify-center gap-12 opacity-50 grayscale contrast-125">
                    <span className="font-bold tracking-tighter">PARTNER 01</span>
                    <span className="font-bold tracking-tighter text-amber-500">PLATFORM X</span>
                    <span className="font-bold tracking-tighter">GLOBAL HUB</span>
                </div>
            </section>

            {/* Footer Copy */}
            <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-xs tracking-widest uppercase">
                &copy; 2026 Wabot White-Label Program. All Rights Reserved.
            </footer>
        </div>
    );
}
