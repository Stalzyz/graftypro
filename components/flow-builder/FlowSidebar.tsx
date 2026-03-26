"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MessageSquare, GitBranch, Flag, Zap, ShoppingBag, CreditCard,
    Truck, Layout, Clock, Hourglass, List, Calendar, ShoppingCart,
    FolderOpen, Play, Image, Video, FileText, Mic, Phone, Globe,
    ChevronDown, ChevronRight, Grip, BarChart3, Settings, Webhook, MapPin,
    Database, Mail, Tag, UserPlus, BellRing, Timer, FileCode, BookOpen, Lock
} from "lucide-react";
import { INDUSTRY_SCENARIOS } from "./scenarios";
import { useUser } from "@/hooks/use-user";

interface NodeGroup {
    id: string;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    nodes: { 
        type: string; 
        label: string; 
        description: string; 
        icon: React.ReactNode; 
        badge?: string; 
        actionType?: string;
        minPlan?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    }[];
}

const NODE_GROUPS: NodeGroup[] = [
    {
        id: 'message',
        label: 'Message',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        nodes: [
            { type: 'message', label: 'Text / Media', description: 'Send text, image, video, or doc', icon: <MessageSquare size={15} />, minPlan: 'STARTER' },
            { type: 'list', label: 'Interactive List', description: 'Show a menu with up to 10 options', icon: <List size={15} />, minPlan: 'STARTER' },
            { type: 'meta_template', label: 'Cloud Template', description: 'Send a Meta-approved boilerplate', icon: <FileCode size={15} />, minPlan: 'STARTER' },
        ]
    },
    {
        id: 'automation',
        label: 'Automation',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        nodes: [
            { type: 'wait', label: 'Wait / Delay', description: 'Pause flow for minutes, hours, days', icon: <Hourglass size={15} />, minPlan: 'GROWTH' },
            { type: 'time_window', label: 'Time Window', description: 'Branch by business hours', icon: <Clock size={15} />, minPlan: 'GROWTH' },
            { type: 'drip', label: 'Start Drip', description: 'Enroll contact in a drip sequence', icon: <Timer size={15} />, minPlan: 'ENTERPRISE' },
            { type: 'action', label: 'Assign Label', description: 'Tag or label a contact', icon: <Tag size={15} />, minPlan: 'STARTER' },
            { type: 'action', label: 'Add to CRM', description: 'Push contact data to CRM', icon: <UserPlus size={15} />, badge: 'GROWTH', actionType: 'save_to_crm', minPlan: 'GROWTH' },
            { type: 'action', label: 'Follow-up Reminder', description: 'Schedule a reminder for an agent', icon: <BellRing size={15} />, minPlan: 'GROWTH' },
        ]
    },
    {
        id: 'commerce',
        label: 'Commerce',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        nodes: [
            { type: 'payment', label: 'Payment Request', description: 'Send Razorpay / Stripe link', icon: <CreditCard size={15} />, minPlan: 'GROWTH' },
            { type: 'catalog', label: 'Product Catalog', description: 'Show a product from your store', icon: <ShoppingBag size={15} />, minPlan: 'GROWTH' },
            { type: 'order_summary', label: 'Order Summary', description: 'Show pending cart summary', icon: <ShoppingCart size={15} />, minPlan: 'GROWTH' },
            { type: 'order_tracking', label: 'Order Tracking', description: 'Live tracking status update', icon: <Truck size={15} />, minPlan: 'GROWTH' },
            { type: 'appointment', label: 'Book Appointment', description: 'Show available slots', icon: <Calendar size={15} />, minPlan: 'GROWTH' },
        ]
    },
    {
        id: 'logic',
        label: 'Logic',
        color: 'text-violet-700',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        nodes: [
            { type: 'start', label: 'Start Trigger', description: 'Entry keyword that starts this flow', icon: <Zap size={15} />, minPlan: 'STARTER' },
            { type: 'location', label: 'LocationPin', description: 'Request or send GPS location', icon: <MapPin size={15} />, minPlan: 'GROWTH' },
            { type: 'condition', label: 'Condition (Yes/No)', description: 'Branch based on user input', icon: <GitBranch size={15} />, minPlan: 'GROWTH' },
            { type: 'meta_flow', label: 'Meta Form / Flow', description: 'Native WhatsApp form', icon: <Layout size={15} />, minPlan: 'ENTERPRISE' },
            { type: 'end', label: 'End Flow', description: 'Terminate the conversation flow', icon: <Flag size={15} />, minPlan: 'STARTER' },
        ]
    },
    {
        id: 'integrations',
        label: 'Integrations',
        color: 'text-slate-700',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        nodes: [
            { type: 'action', label: 'Webhook', description: 'POST data to any external URL', icon: <Webhook size={15} />, badge: 'ENTERPRISE', actionType: 'webhook', minPlan: 'ENTERPRISE' },
            { type: 'action', label: 'API Call', description: 'Fetch data from external APIs', icon: <Globe size={15} />, badge: 'ENTERPRISE', minPlan: 'ENTERPRISE' },
            { type: 'action', label: 'Google Sheets', description: 'Append row to a spreadsheet', icon: <Database size={15} />, badge: 'ENTERPRISE', actionType: 'google_sheet', minPlan: 'ENTERPRISE' },
            { type: 'action', label: 'Send Email', description: 'Trigger an email notification', icon: <Mail size={15} />, badge: 'ENTERPRISE', actionType: 'send_email', minPlan: 'ENTERPRISE' },
        ]
    }
];

interface FlowSidebarProps {
    onUseScenario?: (flowData: any) => void;
    nodeCount?: number;
}

export default function FlowSidebar({ onUseScenario, nodeCount = 0 }: FlowSidebarProps) {
    const [activeTab, setActiveTab] = useState<'NODES' | 'SCENARIOS' | 'STATS'>('NODES');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['message', 'logic']));

    const onDragStart = (event: React.DragEvent, nodeType: string, actionType?: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (actionType) {
            event.dataTransfer.setData('application/action-type', actionType);
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const { user } = useUser();
    const currentPlan = user?.workspace?.plan?.name?.toUpperCase() || 'STARTER';

    const getIsLocked = (minPlan?: string) => {
        if (!minPlan || minPlan === 'STARTER') return false;
        if (currentPlan === 'ENTERPRISE') return false;
        if (currentPlan === 'GROWTH' && minPlan === 'GROWTH') return false;
        return true;
    };

    return (
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full z-10 select-none">
            {/* ... tab bar code already there ... */}

            {/* Tab Bar */}
            <div className="flex border-b border-gray-100 px-1 pt-2 shrink-0">
                {[
                    { id: 'NODES', label: 'Nodes', icon: <Grip size={13} /> },
                    { id: 'SCENARIOS', label: 'Templates', icon: <FolderOpen size={13} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-t-lg ${activeTab === tab.id
                            ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Nodes Tab */}
            {activeTab === 'NODES' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-1 no-scrollbar">
                    {/* Hint */}
                    <p className="text-[10px] text-gray-400 font-medium text-center pb-2">
                        Drag any node onto the canvas →
                    </p>

                    {NODE_GROUPS.map(group => (
                        <div key={group.id}>
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`text-[9px] font-black uppercase tracking-widest ${group.color}`}>
                                        {group.label}
                                    </div>
                                    <div className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${group.bgColor} ${group.color}`}>
                                        {group.nodes.length}
                                    </div>
                                </div>
                                {expandedGroups.has(group.id)
                                    ? <ChevronDown size={12} className="text-gray-400" />
                                    : <ChevronRight size={12} className="text-gray-400" />
                                }
                            </button>

                            {/* Group Nodes */}
                            {expandedGroups.has(group.id) && (
                                <div className="px-3 pb-2 space-y-1">
                                    {group.nodes.map((node, idx) => (
                                        <DraggableNode
                                            key={`${node.type}-${idx}`}
                                            type={node.type}
                                            label={node.label}
                                            description={node.description}
                                            icon={node.icon}
                                            badge={node.badge}
                                            color={group.color}
                                            bgColor={group.bgColor}
                                            actionType={node.actionType}
                                            onDragStart={onDragStart}
                                            locked={getIsLocked(node.minPlan)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="h-4" />
                </div>
            )}

            {/* Scenarios / Templates Tab */}
            {activeTab === 'SCENARIOS' && (
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-3 no-scrollbar">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100 mb-2">
                        <p className="text-[11px] font-black text-indigo-800 mb-1">⚡ Ready-to-use Templates</p>
                        <p className="text-[10px] text-indigo-600 leading-relaxed">
                            Click "Use Template" to load a complete flow onto the canvas instantly.
                        </p>
                    </div>

                    {INDUSTRY_SCENARIOS.map((scenario) => (
                        <div
                            key={scenario.id}
                            className="bg-white border border-gray-100 rounded-xl p-3 hover:border-indigo-200 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-[12px] font-black text-gray-900 leading-tight">{scenario.title}</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{scenario.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {scenario.modulesUsed.slice(0, 3).map((mod, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[8px] font-black uppercase tracking-wider"
                                    >
                                        {mod}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => onUseScenario?.(scenario.flowData)}
                                className="w-full flex justify-center items-center gap-1.5 py-2 bg-gray-900 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Play size={10} fill="currentColor" /> Use Template
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Guide Button */}
            <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                <Link
                    href="https://grafty.pro/how-to-use/flow-builder"
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                    <BookOpen size={14} /> Ultimate Guide
                </Link>
            </div>

            {/* Bottom Status Bar */}
            <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between shrink-0 bg-gray-50">
                <div className="text-[10px] text-gray-400 font-bold">{nodeCount} nodes on canvas</div>
                <div className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                </div>
            </div>
        </aside>
    );
}

function DraggableNode({ type, label, description, icon, badge, color, bgColor, actionType, onDragStart, locked = false }: any) {
    return (
        <div
            className={`flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-100 rounded-xl transition-all group overflow-hidden relative ${
                locked 
                ? 'opacity-60 grayscale cursor-not-allowed bg-slate-50' 
                : 'cursor-grab hover:border-gray-300 hover:shadow-sm active:scale-95 active:opacity-70'
            }`}
            onDragStart={(event) => !locked && onDragStart(event, type, actionType)}
            draggable={!locked}
            onClick={() => {
                if (locked) {
                    alert(`🚀 Upgrade Required\n\nThe "${label}" node requires a higher-tier plan.\n\nVisit the Billing page to unlock advanced automation!`);
                }
            }}
        >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgColor} ${color} ${!locked && 'group-hover:scale-110 transition-transform'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`text-[11px] font-black truncate ${locked ? 'text-slate-400' : 'text-gray-800'}`}>{label}</p>
                    {locked ? (
                        <Lock size={10} className="text-slate-400 shrink-0" />
                    ) : badge && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider shrink-0">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-[9px] text-gray-400 truncate font-medium">{description}</p>
            </div>
            {!locked && <Grip size={12} className="text-gray-300 group-hover:text-gray-400 shrink-0" />}
            
            {/* Lock overlay for premium nodes */}
            {locked && (
                <div className="absolute inset-0 bg-transparent" />
            )}
        </div>
    );
}
