"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { CheckCircle2, ChevronRight, Play, Server, ShieldCheck, Key, Globe, Smartphone, HelpCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AcademyPage() {
    return (
        <main className="g-body">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
                <div className="hero-gradient" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
                    <div className="flex items-center gap-3 text-brand-light font-black uppercase tracking-[4px] text-xs mb-8" style={{ color: 'var(--brand-light)' }}>
                        <BookOpen size={16} /> Technical Directives v2.0
                    </div>
                    <h1 className="g-h1 mb-8 max-w-5xl">
                        The Master Guide to <br />
                        <span className="text-gradient">WhatsApp Infrastructure.</span>
                    </h1>
                    <p className="g-p text-xl mb-12 max-w-3xl">
                        A comprehensive, nuclear-level technical manual covering everything from Meta Business verification to advanced flow logic and API orchestration.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#verification" className="g-btn-primary px-8 py-4">Meta Verification</a>
                        <a href="#api" className="g-btn-outline px-8 py-4">API Handshake</a>
                        <a href="#modules" className="g-btn-outline px-8 py-4">Module Architecture</a>
                    </div>
                </div>
            </section>

            {/* Chapter 1: Meta Verification */}
            <section id="verification" className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="animate-up">
                            <span className="text-[10px] font-black uppercase tracking-[5px] mb-4 block" style={{ color: 'var(--brand-light)' }}>Chapter 01</span>
                            <h2 className="g-h2 mb-10">Meta Business <br />Governance.</h2>
                            <div className="prose prose-slate max-w-none space-y-8">
                                <p className="g-p font-medium text-slate-900 border-l-4 pl-6 py-2" style={{ borderLeftColor: 'var(--brand-light)' }}>
                                    Before you can use the WhatsApp Business API (WABA), your entity must be recognized by Meta Platforms, Inc. as a legitimate business.
                                </p>

                                <DocSection title="1.1 Meta Business Manager (BM)">
                                    <p>The BM is the centralized control panel for all your Meta assets. You must own a verified BM to access high-volume messaging tiers. Verification requires providing legal proof of your organization's existence.</p>
                                </DocSection>

                                <DocSection title="1.2 Display Name Rules">
                                    <p>Your WhatsApp Display Name must have a clear relationship to your business. Meta enforces strict branding guidelines. For example, "Grafty Support" is acceptable if your business is registered as "Grafty", but "WhatsApp Bot 123" likely isn't.</p>
                                </DocSection>

                                <DocSection title="1.3 Legal Documentation Checklist">
                                    <ul className="space-y-4 mt-4">
                                        <li className="flex items-start gap-3"><CheckCircle2 style={{ color: 'var(--brand-light)' }} className="mt-1 shrink-0" size={18} /> <strong>GSTIN / Certificate of Incorporation:</strong> Proof of legal registration.</li>
                                        <li className="flex items-start gap-3"><CheckCircle2 style={{ color: 'var(--brand-light)' }} className="mt-1 shrink-0" size={18} /> <strong>Utility Bill / Bank Statement:</strong> Must display the exact business name and address.</li>
                                        <li className="flex items-start gap-3"><CheckCircle2 style={{ color: 'var(--brand-light)' }} className="mt-1 shrink-0" size={18} /> <strong>Domain Ownership:</strong> Your BM email should match your website domain.</li>
                                    </ul>
                                </DocSection>
                            </div>
                        </div>
                        <div className="animate-up sticky top-32">
                            <div className="g-card bg-white p-2">
                                <img src="https://app.chatbasha.com/assets/docs/images/broadcast/dashborad.png" alt="Meta Verification UI" className="rounded-xl w-full shadow-lg" />
                                <div className="p-8">
                                    <h4 className="font-bold mb-4">Verification Status: Approved</h4>
                                    <p className="text-sm text-slate-500 mb-6">Once verified, your WABA can reach up to 100,000 unique customers per day (Tier 3).</p>
                                    <Link href="/register" className="font-bold text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--brand-light)' }}>View Technical Requirements <ChevronRight size={16} /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 2: The API Handshake */}
            <section id="api" className="section-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-24 text-center max-w-3xl mx-auto">
                        <span className="text-[10px] font-black uppercase tracking-[5px] mb-4 block" style={{ color: 'var(--brand-light)' }}>Chapter 02</span>
                        <h2 className="g-h2 mb-8">Technical Handshake <br />& Orchestration.</h2>
                        <p className="g-p">Connecting Grafty to Meta requires a precise sequence of technical steps. Follow this protocol strictly.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <HandshakeStep
                            icon={<Server />}
                            num="Step 2.1"
                            title="Permanent Tokens"
                            desc="Don't use User Access Tokens (which expire). You must create a System User in Meta BM and generate a Permanent Access Token."
                        />
                        <HandshakeStep
                            icon={<Key />}
                            num="Step 2.2"
                            title="Identifier Matching"
                            desc="The WABA ID, Phone Number ID, and App ID must all originate from the same App container in Meta Developers portal."
                        />
                        <HandshakeStep
                            icon={<Smartphone />}
                            num="Step 2.3"
                            title="Webhook Validation"
                            desc="Grafty requires a valid Webhook handshake. Enter the Grafty Callback URL and Verify Token in your Meta App settings."
                        />
                    </div>

                    <div className="mt-20 p-12 bg-slate-900 rounded-[32px] text-white animate-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-white/5 font-black text-6xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">API V3.0</div>
                        <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                            <div className="lg:w-1/2">
                                <h3 className="text-2xl font-bold mb-6">System Integration Panel</h3>
                                <p className="text-slate-400 mb-8 font-medium">Inside Grafty, you will provide these credentials to boot your node. Our system automatically validates the handshake before enabling outbound messaging.</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 uppercase tracking-widest text-[10px] font-black">WABA ID Check</div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 uppercase tracking-widest text-[10px] font-black">Token Life: Permanent</div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 uppercase tracking-widest text-[10px] font-black">Webhook: Active</div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 uppercase tracking-widest text-[10px] font-black">Latency: &lt; 200ms</div>
                                </div>
                            </div>
                            <div className="lg:w-1/2">
                                <img src="https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png" alt="API Config Console" className="rounded-2xl shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 3: In-Depth Module Logic */}
            <section id="modules" className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[5px] mb-4 block" style={{ color: 'var(--brand-light)' }}>Chapter 03</span>
                        <h2 className="g-h2">Module Architecture.</h2>
                        <p className="g-p mt-4">Deep exploration into Grafty's operational engine.</p>
                    </div>

                    <div className="space-y-32">
                        <ModuleSpec
                            title="3.1 Flow Builder (The Brain)"
                            desc="The Flow Builder is a non-linear logic engine. Each 'Node' represents an interaction point. Nodes can be Text, Media, Buttons (Quick Reply), or List Menus."
                            featureList={[
                                "Visual Drag & Drop Canvas",
                                "Variable Injection (e.g. {{first_name}})",
                                "External API Webhook calls inside flows",
                                "Automatic conversion event tracking"
                            ]}
                            img="https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png"
                        />

                        <ModuleSpec
                            title="3.2 Broadcast & Drip Engine"
                            desc="Broadcasts are one-time campaigns based on approved Meta Templates. The Drip Engine, however, uses schedule-based triggers."
                            featureList={[
                                "Scheduled dispatching",
                                "Segment-based audience selection",
                                "Real-time cost per campaign tracker",
                                "Automatic retry logic for failed deliveries"
                            ]}
                            img="https://app.chatbasha.com/assets/docs/images/broadcast/dashborad.png"
                            reverse
                        />

                        <ModuleSpec
                            title="3.3 Wallet & Ledger System"
                            desc="Operational costs in Grafty are handled via a pre-paid Wallet system. Every conversation has a specific cost determined by Meta."
                            featureList={[
                                "Conversation-based accounting",
                                "Automated Payout/Partner splits",
                                "Immutable transaction history",
                                "Low balance alerts & auto-recharge"
                            ]}
                            img="https://mintcdn.com/cashfreepayments-d00050e9/WsfwdPcC6FOfYy04/static/payouts/payouts/dashboard/all-funds-dash.png"
                        />
                    </div>
                </div>
            </section>

            {/* Chapter 4: Troubleshooting FAQ */}
            <section className="section-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20 animate-up">
                        <span className="text-[10px] font-black uppercase tracking-[5px] mb-4 block" style={{ color: 'var(--brand-light)' }}>Chapter 04</span>
                        <h2 className="g-h2">The Technical Hub.</h2>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Why are my messages not being delivered?"
                            answer="Check your WABA health status in Meta Events Manager. Possible causes: (1) Token expired, (2) Blocked number, (3) Tier limit reached."
                        />
                        <FaqItem
                            question="What are 'Conversation Categories'?"
                            answer="Meta categorizes messages into Marketing, Utility, Authentication, and Service. Each category has a different price."
                        />
                    </div>

                    <div className="mt-20 p-12 rounded-[32px] flex flex-col md:flex-row items-center gap-10 animate-up" style={{ backgroundColor: 'rgba(34, 133, 87, 0.05)', borderColor: 'rgba(34, 133, 87, 0.1)', borderStyle: 'solid', borderWidth: '1px' }}>
                        <div className="w-20 h-20 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: 'var(--brand-gradient)' }}>
                            <HelpCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Need a Technical Engineer?</h3>
                            <p className="text-slate-600 font-medium mb-6">If your setup requires enterprise-level consultation, our technical team is available for assistance.</p>
                            <Link href="/register" className="g-btn-primary py-3 px-8 text-sm">Open Support Ticket</Link>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-12">
            <h3 className="text-xl font-bold mb-4 text-slate-900 uppercase tracking-tighter italic">{title}</h3>
            <div className="text-slate-600 font-medium leading-relaxed italic">{children}</div>
        </div>
    );
}

function HandshakeStep({ icon, num, title, desc }: { icon: React.ReactNode; num: string; title: string; desc: string }) {
    return (
        <div className="g-card animate-up">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-8 shadow-sm" style={{ color: 'var(--brand-light)' }}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[4px] mb-4" style={{ color: 'var(--brand-light)' }}>{num}</p>
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter italic">{title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">{desc}</p>
        </div>
    );
}

function ModuleSpec({ title, desc, featureList, img, reverse }: { title: string; desc: string; featureList: string[]; img: string; reverse?: boolean }) {
    return (
        <div className={`flex flex-col lg:flex-row gap-20 items-start ${reverse ? 'lg:flex-row-reverse' : ''} animate-up`}>
            <div className="lg:w-1/2">
                <h3 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">{title}</h3>
                <p className="g-p text-lg mb-10 italic">{desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {featureList.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-light)' }} /> {f}
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:w-1/2 w-full">
                <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-100">
                    <img src={img} alt={title} className="rounded-[32px] w-full" />
                </div>
            </div>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div className="g-card !p-8 animate-up">
            <h4 className="text-lg font-bold mb-4 flex gap-3 text-slate-800 italic">
                <span style={{ color: 'var(--brand-light)' }} className="font-black">Q.</span> {question}
            </h4>
            <p className="text-slate-500 font-medium leading-relaxed text-sm italic">
                <span className="text-slate-400 font-black">A.</span> {answer}
            </p>
        </div>
    );
}
