import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const homePageData = {
    title: 'Frontline Experience',
    slug: 'home',
    status: 'PUBLISHED',
    banner_config: {
        text: "Launch your own WhatsApp BSP with our new White-Label Platform Engine.",
        link: "/platform-partner",
        is_active: true,
        image: ""
    }
};

const homeSections = [
    {
                type: 'HERO_V2',
                order: 0,
                is_active: true,
                content: {
                    badgeText: "Official WhatsApp Business API Platform",
                    headline: "Stop Losing Customers<br/>to <span class='relative inline-block'><span class='bg-gradient-to-r from-[#27954D] via-[#0EA5E9] to-[#042F94] bg-clip-text text-transparent'>Slow Replies</span><svg class='absolute -bottom-2 left-0 w-full' viewBox='0 0 300 12' fill='none'><path d='M2 8 Q75 2 150 8 Q225 14 298 8' stroke='#27954D' stroke-width='3' stroke-linecap='round' opacity='0.4'></path></svg></span>",
                    subText: "Grafty automates your WhatsApp — so every lead is captured, every customer is followed up, and every sale closes faster. <strong class='text-slate-700'>Zero manual work.</strong>",
                    statsText: "Used by 500+ businesses across India · Powered by Meta Official API",
                    primaryBtnText: "Start Free — 1,000 Credits Included",
                    primaryBtnLink: "/register",
                    secondaryBtnText: "Watch Demo",
                    secondaryBtnLink: "/how-to-use",
                    socialProofInitials: ["RM", "PS", "AN", "KV", "SR"],
                    socialProofText: "500+ businesses trust Grafty",
                    dashboardImg: "/screens/dashboard.jpg",
                    useAnimation: true
                }
            },
            {
                type: 'TICKER_V2',
                order: 1,
                is_active: true,
                content: {
                    items: [
                        "🚀 Flow Builder — Build no-code WhatsApp bots",
                        "📢 Broadcast Campaigns — Send to 10K+ contacts",
                        "💬 Live Chat Inbox — Multi-agent team support",
                        "🛒 E-commerce — Sell directly on WhatsApp",
                        "🤖 AI Automation — Smart drip sequences",
                        "📊 CRM Engine — Kanban lead management",
                        "💳 Credit Wallet — Pay-as-you-go billing",
                        "📋 GST Invoicing — Auto-generated invoices",
                        "🔗 Shopify Connect — Sync your store",
                        "📈 Delivery Intelligence — Real-time analytics"
                    ]
                }
            },
            {
                type: 'STATS_STRIP_V2',
                order: 2,
                is_active: true,
                content: {
                    stats: [
                        { value: "10M+", label: "Messages Delivered" },
                        { value: "500+", label: "Active Businesses" },
                        { value: "99.9%", label: "Uptime SLA" },
                        { value: "4 min", label: "Avg Setup Time" }
                    ]
                }
            },
            {
                type: 'PRODUCT_TABS_V2',
                order: 3,
                is_active: true,
                content: {
                    pretitle: "The Platform",
                    title: "See Grafty in Action",
                    subtitle: "Real screenshots from the live platform — not mockups.",
                    tabs: [
                        {
                            label: "Dashboard",
                            image: "/screens/dashboard.jpg",
                            title: "Everything at a glance",
                            desc: "Real-time stats, message funnels, revenue potential, and onboarding checklist — all on one screen.",
                            tags: ["Live Stats", "Revenue Potential", "Message Funnel", "Onboarding Guide"],
                        },
                        {
                            label: "AI Autopilot",
                            image: "/screens/ai.jpg",
                            title: "Train your AI salesperson",
                            desc: "Upload PDFs, Docs, or URLs to create a domain-expert AI. Automate lead qualification and FAQ handling with 100% accuracy.",
                            tags: ["Knowledge Engine", "PDF Training", "Auto-Qualify", "GPT-4 Support"],
                        },
                        {
                            label: "Email Hub",
                            image: "/screens/email.jpg",
                            title: "Omni-channel Orchestration",
                            desc: "Don't just message on WhatsApp. Build flows that send professional Email proposals as fallbacks or follow-ups automatically.",
                            tags: ["WA + Email", "SMTP Connect", "Unified Inbox", "Smart Fallbacks"],
                        },
                        {
                            label: "Flow Builder",
                            image: "/screens/flow.jpg",
                            title: "Build powerful WhatsApp bots visually",
                            desc: "Drag-and-drop flow builder with 20+ node types — text, buttons, products, payments, conditions, and more.",
                            tags: ["No Code", "20+ Node Types", "E-commerce Flows", "Payment Collection"],
                        },
                        {
                            label: "Live Chat",
                            image: "/screens/chat.jpg",
                            title: "Team inbox with 1-click Video Meet",
                            desc: "Multi-agent live chat with a built-in Google Meet generator. Close deals faster with instant video consultations.",
                            tags: ["Google Meet", "Multi-Agent", "Internal Notes", "Live Meet"],
                        }
                    ]
                }
            },
            {
                type: 'NEURAL_KNOWLEDGE_V3',
                order: 4,
                is_active: true,
                content: {
                    pretitle: "Neural Intelligence",
                    title: "AI Knowledge Engine",
                    subtitle: "Train your AI on PDFs, URLs, and Docs in seconds.",
                    knowledgeSources: ["Company PDFs", "Product URLs", "Support Docs", "Policy Manuals"],
                    learningStatusText: "Active Neural Learning...",
                    resultHeadline: "100% Accuracy. 0% Delay.",
                    resultDesc: "Your AI salesperson knows every detail of your business, answering complex queries instantly on WhatsApp.",
                    demoImage: "/screens/ai.jpg",
                    primaryBtnText: "Train Your AI Now",
                    primaryBtnLink: "/register"
                }
            },
            {
                type: 'OMNI_HUB_V3',
                order: 5,
                is_active: true,
                content: {
                    pretitle: "Cross-Channel Authority",
                    title: "Omni-channel Synergy",
                    subtitle: "WhatsApp for speed. Email for Authority. Master both seamlessly.",
                    waFeatureTitle: "Personalized WhatsApp",
                    waFeatureDesc: "High engagement messaging with instant AI replies.",
                    emailFeatureTitle: "Automated Email Hub",
                    emailFeatureDesc: "Professional proposals and follow-ups sent via your own SMTP.",
                    synergyLogic: "If WhatsApp not opened within 2 hrs -> Auto-send Email proposal.",
                    demoImage: "/screens/email.jpg",
                    ctaText: "Explore Omni-channel",
                    ctaLink: "/register"
                }
            },
            {
                type: 'AUTOPILOT_V3',
                order: 6,
                is_active: true,
                content: {
                    pretitle: "Autonomous Sales",
                    title: "AI Autopilot Engine",
                    subtitle: "Zero manual intervention. Let AI qualify, nurture, and close leads on WhatsApp 24/7.",
                    stats: [
                        { label: "Uptime", value: "100%", sub: "Always Online" },
                        { label: "Latency", value: "< 2s", sub: "Instant Neural Reply" },
                        { label: "Accuracy", value: "99.9%", sub: "Hallucination-Free" },
                        { label: "Scaling", value: "Unlimited", sub: "Concurrent Chats" }
                    ],
                    autopilotImage: "/screens/ai.jpg",
                    ctaText: "Launch Autopilot",
                    ctaLink: "/register"
                }
            },
            {
                type: 'SPLIT_LIST_V2',
                order: 7,
                is_active: true,
                content: {
                    pretitle: "The Problem",
                    title: "Most businesses use WhatsApp <span class='text-red-500'>manually.</span>",
                    leftItems: [
                        "Leads ask questions. No one replies for hours.",
                        "Follow-ups are forgotten. Customers move on.",
                        "Payment collection is awkward and manual.",
                        "No data. No analytics. No growth visibility."
                    ],
                    pretitleRight: "✨ With Grafty:",
                    rightTitle: "",
                    rightItems: [
                        "Leads auto-captured", "Instant bot replies", "Payments on WhatsApp",
                        "Full customer history", "Bulk broadcasts", "Team inbox",
                        "GST invoices auto-sent", "Real-time analytics"
                    ],
                    bottomText: "Everything from one dashboard."
                }
            },
            {
                type: 'GROWTH_STEPS_V2',
                order: 8,
                is_active: true,
                content: {
                    pretitle: "Growth Engine",
                    title: "How Grafty Helps You Scale",
                    steps: [
                        { title: "Capture Every Lead", desc: "Automatically collect customer details through WhatsApp forms and flows. Never miss an enquiry again.", color: "text-green-500" },
                        { title: "Automate Conversations", desc: "Send automatic replies, follow-ups, and reminders without manual effort. Reduce workload. Increase speed.", color: "text-blue-500" },
                        { title: "Convert Customers Faster", desc: "Send payment links, offers, and product catalogs directly inside WhatsApp. Customers buy faster.", color: "text-violet-500" },
                        { title: "Track Business Growth", desc: "Monitor leads, sales, campaign performance, message costs, and revenue. Make decisions based on data.", color: "text-amber-500" },
                    ]
                }
            },
            {
                type: 'MULTI_CARDS_V2',
                order: 9,
                is_active: true,
                content: {
                    styleType: 'LIGHT',
                    pretitle: "Platform Modules",
                    title: "Everything Your Business Needs",
                    subtitle: "One platform. Complete control. Every tool to grow on WhatsApp.",
                    cards: [
                        { title: "AI Knowledge Engine", desc: "Train AI on your business data. Handle complex customer queries automatically using GPT-4 and your own PDFs.", icon: "Sparkles", tags: ["Knowledge Base", "AI Autopilot", "PDF Training"] },
                        { title: "Email Hub & Fallback", desc: "Connect SMTP and send professional emails alongside WhatsApp flows for a true omni-channel experience.", icon: "Mail", tags: ["SMTP Integration", "Email Flows", "WA+Email Sync"] },
                        { title: "Google Meet Integration", desc: "Generate 1-click individual meeting links for leads. Close high-ticket deals through instant consultations.", icon: "Video", tags: ["1-Click Meet", "Auto Links", "CSR Video"] },
                        { title: "Flow Builder", desc: "Build lead qualification, booking, checkout, and payment flows. No coding required.", icon: "CheckCircle2", tags: ["Lead Flows", "No Code", "20+ Nodes"] },
                        { title: "Team Inbox & CRM", desc: "Multi-agent inbox with labels, tags, follow-up reminders, customer history, and 1-click Meet.", icon: "Shield", tags: ["Multi-Agent", "Labels", "CRM Pipeline"] },
                        { title: "E-commerce Suite", desc: "Sell on WhatsApp with product catalogs, payment links, COD, and GST invoices.", icon: "Globe", tags: ["Product Catalog", "Payment Links", "GST Invoices"] }
                    ]
                }
            },
            {
                type: 'MULTI_CARDS_V2',
                order: 10,
                is_active: true,
                content: {
                    styleType: 'DARK',
                    pretitle: "Simple Setup",
                    title: "Get Live in 4 Minutes",
                    subtitle: "",
                    cards: [
                        { title: "Create Account", desc: "Sign up free. Takes under 2 minutes. No credit card required." },
                        { title: "Connect WhatsApp", desc: "Add your WhatsApp API credentials with guided step-by-step setup." },
                        { title: "Build Your Flow", desc: "Use prebuilt templates or drag-and-drop your own automation." },
                        { title: "Start Growing", desc: "Launch campaigns and automate conversations. Watch leads convert." }
                    ]
                }
            },
            {
                type: 'TESTIMONIALS',
                order: 11,
                is_active: true,
                content: {
                    title: "Businesses That Grew With Grafty",
                    subtitle: "Customer Stories",
                    testimonials: [
                        { name: "Rajan Mehta", role: "Founder, EduTech India", text: "We moved from manual WhatsApp replies to fully automated lead qualification. Our response time dropped from 4 hours to under 2 minutes. Grafty is the backbone of our admissions process.", avatar: "" },
                        { name: "Priya Sharma", role: "E-commerce Owner, FashionKart", text: "The flow builder is insane. We send product carousels, collect Razorpay payments, and confirm orders — all inside WhatsApp. Our conversion rate jumped 34% in the first month.", avatar: "" },
                        { name: "Arjun Nair", role: "Digital Marketing Agency", text: "I white-labeled Grafty for 12 of my clients. The platform partner program is a goldmine. I'm earning recurring revenue while my clients get enterprise WhatsApp automation.", avatar: "" }
                    ]
                }
            },
            {
                type: 'PRICING',
                order: 12,
                is_active: true,
                content: {
                    title: "Plans For Every Business",
                    subtitle: "Simple Pricing",
                    autoSync: true,
                    manualPlans: []
                }
            },
            {
                type: 'FAQ',
                order: 13,
                is_active: true,
                content: {
                    title: "Frequently Asked Questions",
                    subtitle: "Common Questions",
                    faqs: [
                        { question: "Do I need WhatsApp API to use Grafty?", answer: "Yes. Grafty works with WhatsApp Business API. Our Academy section explains how to set it up step by step — it takes about 4 minutes." },
                        { question: "How much does WhatsApp API cost?", answer: "Meta charges per conversation. Costs vary by country and message type. Grafty shows exact costs before sending so there are zero surprises. Marketing messages in India cost ~₹0.88, utility ₹0.13." },
                        { question: "Can I send bulk messages?", answer: "Yes. Broadcast campaigns allow targeted bulk messaging with delivery tracking and performance analytics. You can segment by behavior, tags, or custom filters." },
                        { question: "Can I run e-commerce on WhatsApp?", answer: "Yes. You can sell products, collect payments via Razorpay, manage orders, send COD confirmations, and generate GST invoices — all inside WhatsApp." },
                        { question: "Is there a free trial?", answer: "Yes. Sign up and explore all modules before upgrading to a paid plan. You get 1,000 welcome credits to start." },
                        { question: "What prerequisites does WhatsApp API need?", answer: "Meta Business Manager account, business verification documents, a dedicated phone number, and a business email. GST registration and a business website are recommended for faster approval." }
                    ]
                }
            },
            {
                type: 'FINAL_CTA_V2',
                order: 14,
                is_active: true,
                content: {
                    topLabel: "Grafty is not just a WhatsApp tool. It is scalable business infrastructure.",
                    title: "Ready to Automate Your<br />WhatsApp Business?",
                    subtitle: "Join 500+ businesses, agencies, institutes, and ecommerce brands growing on Grafty.",
                    primaryBtnText: "Start Free — 1,000 Credits Included",
                    primaryBtnLink: "/register",
                    secondaryBtnText: "View Pricing",
                    secondaryBtnLink: "/pricing",
                    bottomLabel: "Meta-Compliant · GST-Ready · Enterprise Infrastructure · No Credit Card Required"
                }
            }
];

export async function POST(req: Request) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const p = prisma as any;

        // --- STEP 1: ATOMIC PURGE (Outside main build transaction to ensure commit) ---
        console.log("SURGICAL_SEED: Starting Atomic Purge...");
        const existing = await p.landingPage.findUnique({ where: { slug: 'home' } });
        if (existing) {
            console.log(`SURGICAL_SEED: Purging existing page [${existing.id}]...`);
            // Explicitly clear all blocking relations
            await p.landingSection.deleteMany({ where: { page_id: existing.id } });
            await p.landingVersion.deleteMany({ where: { page_id: existing.id } });
            await p.landingPage.delete({ where: { id: existing.id } });
            console.log("SURGICAL_SEED: Purge Complete.");
        }

        // --- STEP 2: SLUG CONFLICT VERIFICATION ---
        const collision = await p.landingPage.findUnique({ where: { slug: 'home' } });
        if (collision) {
            throw new Error(`CRITICAL_CONFLICT: Slug 'home' still exists in DB despite purge [ID: ${collision.id}]. Database index might be out of sync.`);
        }

        // --- STEP 3: RESILIENT REBUILD ---
        console.log("SURGICAL_SEED: Starting Resilient Rebuild...");
        const result = await p.$transaction(async (tx: any) => {
            // 1. Create Page Identity
            console.log("SURGICAL_SEED: Creating Page Identity...");
            const page = await tx.landingPage.create({
                data: homePageData
            });

            // 2. Inject Sections Sequentially with Traceability
            console.log("SURGICAL_SEED: Injecting Sections...");
            for (const section of homeSections) {
                try {
                    console.log(`SURGICAL_SEED: -> Injecting ${section.type}`);
                    await tx.landingSection.create({
                        data: {
                            ...section,
                            page_id: page.id
                        }
                    });
                } catch (secErr: any) {
                    throw new Error(`SECTION_FAILURE [${section.type}]: ${secErr.message}`);
                }
            }

            return page;
        }, {
            timeout: 25000 // 25s for high-latency VPS environments
        });

        console.log("SURGICAL_SEED: SUCCESS.");
        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("SURGICAL_SEED_FAILURE_FATAL:", error);
        return NextResponse.json({ 
            error: "Failed to seed page",
            details: error.message || String(error),
            code: error.code,
            meta: error.meta,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
