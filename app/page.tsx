
"use client";
import Link from "next/link";
import {
    GitMerge,
    Droplets,
    ShoppingBag,
    Send,
    CreditCard,
    Shield,
    PieChart,
    Users,
    ChevronRight,
    Star,
    CheckCircle
} from "lucide-react";
import "./landing/landing.css";
import { Logo } from "@/components/ui/Logo";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";
import SimulatedChatPreview from "@/components/landing/SimulatedChatPreview";

// New Content Components
import Industries from "@/components/landing/Industries";
import SalesROI from "@/components/landing/SalesROI";
import PricingCalculators from "@/components/landing/PricingCalculators";
import FAQ from "@/components/landing/FAQ";
import DetailedFooter from "@/components/landing/DetailedFooter";
import InteractiveWidgets from "@/components/landing/InteractiveWidgets";
import Integrations from "@/components/landing/Integrations";
import Testimonials from "@/components/landing/Testimonials";
import SetupGuide from "@/components/landing/SetupGuide";
import PricingTable from "@/components/landing/PricingTable";

export default function HomePage() {
    return (
        <main className="landing-body min-h-screen relative">
            <div className="hero-gradient" />

            {/* Nav */}
            <nav className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between relative z-10">
                <Link href="/">
                    <Logo size={70} variant="light" />
                </Link>
                <div className="hidden lg:flex gap-10 items-center">
                    <Link href="/how-to-use" className="nav-link">How to Use</Link>
                    <Link href="/reseller-program" className="nav-link">Resellers</Link>
                    <Link href="/white-label" className="nav-link">White-Label</Link>
                    <Link href="#pricing-packages" className="nav-link">Pricing</Link>
                    <Link href="https://wa.me/919789359407" target="_blank" className="nav-link font-black text-wa-green">Book Demo</Link>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="nav-link">Login</Link>
                    <Link href="/join" className="btn-primary">
                        Get Started <ChevronRight size={18} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <div className="section-tag animate-fade-in">Powered by Meta Cloud API</div>
                    <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.1] animate-fade-in">
                        Start Growing Your <br />
                        <span className="text-gradient">WhatsApp Revenue</span> <br />
                        Today.
                    </h1>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 flex items-center gap-2 text-emerald-400 font-bold text-xs mb-8">
                        <CheckCircle size={14} /> Claim Your 7-Day FREE Trial Pack
                    </div>
                    <p className="text-xl text-slate-400 mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Automate your sales, recover 25% more carts, and scale your business with WAVO, the world's most powerful WhatsApp engine.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <Link href="/join" className="btn-primary px-10 py-5 text-lg">
                            Get Your WhatsApp Growth Plan
                        </Link>
                        <div className="flex items-center gap-4 text-slate-500 font-bold px-6">
                            <CheckCircle className="text-wa-green" size={20} /> Starting at ₹3,999/mo
                        </div>
                    </div>

                    <div className="mt-20 flex gap-8 items-center text-slate-500 text-sm font-bold opacity-60 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <span>TRUSTED BY 2,000+ BRANDS</span>
                        <div className="flex gap-4">
                            <Star size={16} fill="currentColor" stroke="none" className="text-amber-500" />
                            <Star size={16} fill="currentColor" stroke="none" className="text-amber-500" />
                            <Star size={16} fill="currentColor" stroke="none" className="text-amber-500" />
                            <Star size={16} fill="currentColor" stroke="none" className="text-amber-500" />
                            <Star size={16} fill="currentColor" stroke="none" className="text-amber-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Industries Section (NEW) */}
            <Industries />

            {/* Core Modules */}
            <section id="modules" className="py-24 bg-black/40 backdrop-blur-sm relative border-y border-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 px-2 lg:px-0">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Built for <span className="text-gradient">Modern Commerce</span></h2>
                        <p className="text-slate-400 text-lg">Every module you need to dominate WhatsApp marketing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ModuleCard
                            icon={<Send size={32} />}
                            title="Official Broadcasts"
                            desc="Send thousands of messages without getting banned. Official API power."
                        />
                        <ModuleCard
                            icon={<GitMerge size={32} />}
                            title="Visual Flow Builder"
                            desc="Design complex 24/7 automation workflows without a single line of code."
                        />
                        <ModuleCard
                            icon={<ShoppingBag size={32} />}
                            title="WhatsApp Commerce"
                            desc="Native cart recovery and ordering right inside the chat window."
                        />
                        <ModuleCard
                            icon={<Droplets size={32} />}
                            title="Drip Campaigns"
                            desc="Nurture leads over time with personalized follow-up sequences."
                        />
                        <ModuleCard
                            icon={<PieChart size={32} />}
                            title="Deep Analytics"
                            desc="Track delivery, read rates, and conversion ROI in real-time."
                        />
                        <ModuleCard
                            icon={<Shield size={32} />}
                            title="Green Tick Support"
                            desc="We help your brand get the official Meta Verified Green Badge."
                        />
                    </div>
                </div>
            </section>

            {/* Sales & ROI Section (NEW) */}
            <SalesROI />

            {/* Simulated Chat Preview */}
            <section className="py-24 overflow-hidden bg-slate-900/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                                Talk to Customers <br />
                                <span className="text-wa-green">In Their Language</span>
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                Our platform supports multi-language templates, interactive buttons, and native lists to make every interaction feel local and personal.
                            </p>
                            <div className="flex gap-12">
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">99%</div>
                                    <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Read Rate</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">45%</div>
                                    <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Click Through</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full" />
                            <SimulatedChatPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Packages (NEW) */}
            <PricingTable />

            {/* Pricing & Calculators (NEW) */}
            <PricingCalculators />

            {/* Integrations Section (NEW) */}
            <Integrations />

            {/* Testimonials (NEW) */}
            <Testimonials />

            {/* Setup Guide / Academy (NEW) */}
            <section id="setup">
                <SetupGuide />
            </section>

            {/* FAQ (NEW) */}
            <FAQ />

            {/* Detailed Footer (NEW) */}
            <DetailedFooter />

            {/* Interactive Widgets (NEW) */}
            <InteractiveWidgets />

            <ExitIntentPopup />
        </main>
    );
}

function ModuleCard({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) {
    return (
        <div className="glass-card p-10 group hover:bg-slate-800/50 transition-all border border-slate-900">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-wa-green mb-8 border border-slate-800 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}
