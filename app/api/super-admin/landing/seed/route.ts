import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const homeContent = {
    title: 'Frontline Experience',
    slug: 'home',
    status: 'PUBLISHED',
    banner_config: {
        text: "Launch your own WhatsApp BSP with our new White-Label Platform Engine.",
        link: "/platform-partner",
        is_active: true,
        image: ""
    },
    sections: {
        create: [
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
                    dashboardImg: "/screens/dashboard.jpg"
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
                            label: "Flow Builder",
                            image: "/screens/flow.jpg",
                            title: "Build powerful WhatsApp bots visually",
                            desc: "Drag-and-drop flow builder with 20+ node types — text, buttons, products, payments, conditions, and more.",
                            tags: ["No Code", "20+ Node Types", "E-commerce Flows", "Payment Collection"],
                        },
                        {
                            label: "Live Chat",
                            image: "/screens/chat.jpg",
                            title: "Team inbox built for WhatsApp",
                            desc: "Multi-agent live chat with labels, internal notes, follow-up scheduler, drip enrollment, and automation activity.",
                            tags: ["Multi-Agent", "Internal Notes", "Follow-up", "Drip Enroll"],
                        },
                        {
                            label: "CRM Engine",
                            image: "/screens/crm.jpg",
                            title: "Kanban CRM for lead management",
                            desc: "Visual pipeline to track leads from first contact to conversion. Chat directly from lead cards.",
                            tags: ["Kanban Pipeline", "Lead Tracking", "One-click Chat", "Revenue Tracking"],
                        },
                        {
                            label: "Delivery Intel",
                            image: "/screens/campaign.jpg",
                            title: "Smart delivery monitoring",
                            desc: "Track template performance, monitor delivery rates, detect failures before they affect your Meta account.",
                            tags: ["Delivery Rate", "Failure Detection", "Health Score", "Template Monitor"],
                        }
                    ]
                }
            },
            {
                type: 'SPLIT_LIST_V2',
                order: 4,
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
                order: 5,
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
                order: 6,
                is_active: true,
                content: {
                    styleType: 'LIGHT',
                    pretitle: "Platform Modules",
                    title: "Everything Your Business Needs",
                    subtitle: "One platform. Complete control. Every tool to grow on WhatsApp.",
                    cards: [
                        { title: "Flow Builder", desc: "Build lead qualification, booking, checkout, and payment flows. No coding required.", icon: "CheckCircle2", tags: ["Lead Flows", "No Code", "20+ Nodes", "Payments"] },
                        { title: "Broadcast Campaigns", desc: "Send targeted campaigns to segmented audiences with cost preview before sending.", icon: "Zap", tags: ["Segments", "Cost Preview", "Delivery Tracking"] },
                        { title: "Drip Sequences", desc: "Automate follow-up sequences over days and weeks. Build relationships at scale.", icon: "Receipt", tags: ["Day-1 Welcome", "Auto Follow-up", "Scheduling"] },
                        { title: "Team Inbox & CRM", desc: "Multi-agent inbox with labels, tags, follow-up reminders, and customer history.", icon: "Shield", tags: ["Multi-Agent", "Labels", "Follow-Up"] },
                        { title: "E-commerce Suite", desc: "Sell on WhatsApp with product catalogs, payment links, COD, and GST invoices.", icon: "Globe", tags: ["Product Catalog", "Payment Links", "GST Invoices"] },
                        { title: "Wallet & Billing", desc: "Credit system with real-time cost tracking, auto deductions, and full billing history.", icon: "BarChart3", tags: ["Credit Recharge", "Cost Tracking", "Invoices"] }
                    ]
                }
            },
            {
                type: 'MULTI_CARDS_V2',
                order: 7,
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
                order: 8,
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
                order: 9,
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
                order: 10,
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
                order: 11,
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
        ]
    }
};

export async function POST(req: Request) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const p = prisma as any;

        // Remove existing
        const existing = await p.landingPage.findUnique({ where: { slug: 'home' } });
        if (existing) {
            await p.landingSection.deleteMany({ where: { landing_page_id: existing.id } });
            await p.landingPage.delete({ where: { id: existing.id } });
        }

        const page = await p.landingPage.create({
            data: homeContent
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to seed page" }, { status: 500 });
    }
}
