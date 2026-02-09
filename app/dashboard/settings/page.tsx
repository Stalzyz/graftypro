"use client";

import Link from "next/link";
import { MessageCircle, CreditCard, Settings, Wallet, Shield, Users, Bell, LifeBuoy } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

export default function SettingsPage() {
    const { branding } = useBranding();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your workspace configuration and integrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* WhatsApp Integration Card */}
                <SettingCard
                    href="/dashboard/settings/whatsapp"
                    title="WhatsApp Channel"
                    desc="Connect WABA, manage phone numbers, and check messaging health."
                    icon={<MessageCircle size={24} />}
                    color="text-[#27954D]"
                    bg="bg-[#27954D]/10"
                    borderColor="hover:border-[#27954D]/30"
                />

                {/* Billing & Plans */}
                <SettingCard
                    href="/dashboard/settings/billing"
                    title="Billing & Usage"
                    desc="Manage subscriptions, view credits, and download invoices."
                    icon={<Wallet size={24} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    borderColor="hover:border-blue-300"
                />

                {/* Payments Integrations */}
                <SettingCard
                    href="/dashboard/settings/payments"
                    title="Payment Gateways"
                    desc="Configure Razorpay or Stripe for automated checkout in flows."
                    icon={<CreditCard size={24} />}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    borderColor="hover:border-amber-300"
                />

                {/* Support Desk (White-Labeled) */}
                <SettingCard
                    href={branding?.support?.url || `mailto:${branding?.support?.email || 'support@wabot.com'}`}
                    external={!!branding?.support?.url}
                    title="Help & Support"
                    desc={branding?.is_white_labeled
                        ? `Get assistance from the ${branding.brand_name} support team.`
                        : "Browse documentation or contact our global support team."}
                    icon={<LifeBuoy size={24} />}
                    color="text-purple-600"
                    bg="bg-purple-50"
                    borderColor="hover:border-purple-300"
                />

                {/* Security */}
                <SettingCard
                    href="#"
                    title="Security & API"
                    desc="Manage API keys, webhooks, and security preferences."
                    icon={<Shield size={24} />}
                    color="text-red-600"
                    bg="bg-red-50"
                    borderColor="hover:border-red-300"
                    disabled
                />

                {/* Team */}
                <SettingCard
                    href="#"
                    title="Team Members"
                    desc="Invite agents and manage roles for shared inbox access."
                    icon={<Users size={24} />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    borderColor="hover:border-indigo-300"
                    disabled
                />
            </div>
        </div>
    );
}

function SettingCard({ href, title, desc, icon, color, bg, borderColor, disabled = false, external = false }: any) {
    const Content = (
        <div className={`soft-card p-6 h-full transition-all group ${disabled ? 'opacity-60 cursor-not-allowed' : `cursor-pointer ${borderColor} hover:shadow-xl hover:shadow-gray-100`}`}>
            <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {desc}
            </p>
            {disabled && (
                <span className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    Coming Soon
                </span>
            )}
        </div>
    );

    if (disabled) return Content;

    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer">
                {Content}
            </a>
        );
    }

    return (
        <Link href={href}>
            {Content}
        </Link>
    );
}
