"use client";

import Link from "next/link";
import { MessageCircle, CreditCard, Settings, Wallet, Shield, Users, Bell, LifeBuoy, Zap, Mail, MapPin, BookOpen } from "lucide-react";
import { useBranding } from "../../../hooks/use-branding";

export default function SettingsPage() {
    const { branding } = useBranding();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your workspace configuration and integrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Profile */}
                <SettingCard
                    href="/dashboard/settings/profile"
                    title="Company Profile"
                    desc="Update your name, job title, and personalization preferences."
                    icon={<Users size={24} />}
                    color="text-[#042F94]"
                    bg="bg-[#042F94]/10"
                    borderColor="hover:border-[#042F94]/30"
                />

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

                {/* Support Desk (Custom Detailed Card) */}
                <div className="soft-card p-6 h-full flex flex-col justify-between border-purple-200 bg-purple-50/30">
                    <div>
                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <LifeBuoy size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Help & Support</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                            Need help? Reach out to our team via WhatsApp or Email.
                        </p>
                        <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
                            <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400" /> support@grafty.pro</div>
                            <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> India</div>
                            <Link href="/dashboard/credits/help" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                                <BookOpen size={16} /> Credit System Guide &rarr;
                            </Link>
                        </div>
                    </div>
                    <a href="https://wa.me/919789359407" target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1DA851] transition-colors shadow-md shadow-green-500/20">
                        <MessageCircle size={18} /> WhatsApp Support
                    </a>
                </div>

                {/* Security */}
                <SettingCard
                    href="/dashboard/settings/api"
                    title="Security & API"
                    desc="Manage API keys, webhooks, and security preferences."
                    icon={<Shield size={24} />}
                    color="text-red-600"
                    bg="bg-red-50"
                    borderColor="hover:border-red-300"
                />

                {/* Team */}
                <SettingCard
                    href="/dashboard/settings/team"
                    title="Team Members"
                    desc="Invite agents and manage roles for shared inbox access."
                    icon={<Users size={24} />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    borderColor="hover:border-indigo-300"
                />

                {/* Integrations */}
                <SettingCard
                    href="/dashboard/settings/integrations"
                    title="Integrations"
                    desc="Connect Google Calendar, Zapier, and other 3rd-party tools."
                    icon={<Zap size={24} />}
                    color="text-fuchsia-600"
                    bg="bg-fuchsia-100"
                    borderColor="hover:border-fuchsia-300"
                />

                {/* SMTP / Email Settings */}
                <SettingCard
                    href="/dashboard/marketing/email/settings"
                    title="Email (SMTP)"
                    desc="Configure your SMTP server to send email notifications from flows and automations."
                    icon={<Mail size={24} />}
                    color="text-sky-600"
                    bg="bg-sky-50"
                    borderColor="hover:border-sky-300"
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
