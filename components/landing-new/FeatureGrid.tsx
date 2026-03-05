"use client";
import React from "react";

interface Feature {
    title: string;
    desc: string;
    image: string;
}

interface FeatureGridProps {
    title?: string;
    subtitle?: string;
    features?: Feature[];
}

export default function FeatureGrid({
    title = "What Grafty Actually Does.",
    subtitle = "Most businesses use WhatsApp manually. Grafty turns WhatsApp into a scalable sales engine.",
    features = [
        {
            title: "1. Flow Builder",
            desc: "Build intelligent automation with conditions, buttons, payments, tracking, and CRM sync.",
            image: "https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png"
        },
        {
            title: "2. Broadcast Engine",
            desc: "Send segmented campaigns with real-time cost estimation and delivery tracking.",
            image: "https://app.chatbasha.com/assets/docs/images/broadcast/dashborad.png"
        },
        {
            title: "3. Drip Campaigns",
            desc: "Nurture leads automatically based on time or behavior.",
            image: "https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/48179224816/original/0s24US3LCvhVYQt3E9XEctFypBiJu_OYag.png?1642190032="
        },
        {
            title: "4. Template Creator",
            desc: "Create Meta-approved templates with media, buttons, and dynamic variables.",
            image: "https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/48179220627/original/r-cGcDfoBT7XnC_abUKNm_Ow2VnD_kVv6A.png?1642188595="
        },
        {
            title: "5. Wallet & Credits",
            desc: "Recharge once. Auto-deduct per conversation. GST-ready invoices generated automatically.",
            image: "/images/dashboard-wallet.png"
        },
        {
            title: "6. Analytics & Growth Metrics",
            desc: "Track conversion rate, revenue, response time, and cost per lead.",
            image: "https://www.inetsoft.com/images/screenshots/hr_management_dashboard.png"
        }
    ]
}: FeatureGridProps) {
    return (
        <section id="features" className="section-gray">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 animate-up">
                    <h2 className="g-h2 mb-6" dangerouslySetInnerHTML={{ __html: title }} />
                    <p className="g-p text-xl max-w-2xl">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {features.map((f, i) => (
                        <div key={i} className="g-card flex flex-col h-full animate-up" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="aspect-video bg-slate-50 rounded-lg mb-8 overflow-hidden border border-slate-100">
                                <img src={f.image} alt={f.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
