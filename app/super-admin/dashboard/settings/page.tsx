
"use client";

import React from "react";
import {
    Settings,
    Shield,
    Bell,
    Code,
    History,
    Key,
    Mail,
    Workflow,
    ChevronRight,
    CircleDot,
    Palette,
    Facebook
} from "lucide-react";

export default function SystemSettingsPage() {
    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Settings size={14} />
                        Global Configuration
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">System Settings</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage core protocols and platform-wide security policies.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm text-xs font-bold text-slate-600 transition-all flex items-center gap-2">
                        Diagnostics
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <SettingsGroup title="Governance & Access">
                        <SettingsItem
                            icon={<Shield className="text-blue-500" />}
                            title="RBAC Configuration"
                            description="Configure role-based access control and custom permission matrices."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/rbac'}
                        />
                        <SettingsItem
                            icon={<Key className="text-amber-500" />}
                            title="Authentication Hooks"
                            description="SAML, OAuth2, and Custom JWT provider integration settings."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/auth'}
                        />
                        <SettingsItem
                            icon={<History className="text-zinc-500" />}
                            title="Retention Policy"
                            description="Define global data archival and log retention schedules."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/retention'}
                        />
                    </SettingsGroup>

                    <SettingsGroup title="Intelligence & Comms">
                        <SettingsItem
                            icon={<Workflow className="text-emerald-500" />}
                            title="Automation Engine"
                            description="Configure system-wide triggers and scheduled workflow tasks."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/automation'}
                        />
                        <SettingsItem
                            icon={<Mail className="text-rose-500" />}
                            title="SMTP Relay Matrix"
                            description="Global email dispatch settings and provider fallback logic."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/smtp'}
                        />
                    </SettingsGroup>

                    <SettingsGroup title="Developer Ecosystem">
                        <SettingsItem
                            icon={<Code className="text-indigo-500" />}
                            title="System API Keys"
                            description="Manage master API keys for global infrastructure integration."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/api-keys'}
                        />
                        <SettingsItem
                            icon={<Facebook className="text-blue-600" />}
                            title="Meta Application Master"
                            description="Configure Meta Tech Provider App IDs and Embedded Signup tokens."
                            onClick={() => window.location.href = '/super-admin/dashboard/meta'}
                        />
                        <SettingsItem
                            icon={<History className="text-zinc-500" />}
                            title="Audit Retention"
                            description="Define global data archival and log retention schedules."
                            onClick={() => window.location.href = '/super-admin/dashboard/settings/retention'}
                        />
                    </SettingsGroup>

                    <SettingsGroup title="Visual Identity & Experience">
                        <SettingsItem
                            icon={<Palette className="text-pink-500" />}
                            title="Theme Control"
                            description="Design and deploy the platform's global aesthetic system."
                            onClick={() => window.location.href = '/super-admin/dashboard/theme'}
                        />
                        <SettingsItem
                            icon={<Workflow className="text-cyan-500" />}
                            title="White-Label Module"
                            description="Configure default branding protocols for new reseller instances."
                            onClick={() => window.location.href = '/super-admin/dashboard/branding'}
                        />
                    </SettingsGroup>
                </div>

                <div className="space-y-8">
                    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-[#27954D]/10 flex items-center justify-center text-[#27954D]">
                                <CircleDot size={20} className="animate-pulse" />
                            </div>
                            <h3 className="font-bold text-slate-800 italic uppercase tracking-widest text-xs">Environment Meta</h3>
                        </div>

                        <div className="space-y-4">
                            <MetaRow label="Version" value="v4.2.0-stable" />
                            <MetaRow label="Branch" value="master" />
                            <MetaRow label="Database" value="PostgreSQL 15" />
                            <MetaRow label="Node" value="v20.10.0" />
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <button className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#042f94] transition-all">
                                Force Global Reload
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-200/50">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Security Advisory</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium italic">
                            All configuration changes are logged into the immutable audit trail. Ensure you verify the impacts on active vendor instances before deploying changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsGroup({ title, children }: any) {
    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 italic">{title}</h3>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm divide-y divide-slate-50">
                {children}
            </div>
        </div>
    );
}

function SettingsItem({ icon, title, description, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110">
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-800 group-hover:text-[#042f94] transition-colors">{title}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{description}</div>
                </div>
            </div>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
        </div>
    );
}

function MetaRow({ label, value }: any) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-bold text-slate-700 italic">{value}</span>
        </div>
    );
}
