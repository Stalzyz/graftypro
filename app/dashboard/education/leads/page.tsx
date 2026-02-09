"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    MessageSquare,
    Phone,
    Calendar,
    CheckCircle2,
    Lock,
    ArrowRight,
    UserCircle,
    HandCoins
} from "lucide-react";

export default function LeadPipeline() {
    const statuses = [
        { id: "NEW", label: "New Leads", color: "bg-blue-500" },
        { id: "CONTACTED", label: "Contacted", color: "bg-purple-500" },
        { id: "DEMO_SCHEDULED", label: "Demo Class", color: "bg-indigo-500" },
        { id: "PAYMENT_PENDING", label: "Pending Pay", color: "bg-amber-500" },
        { id: "ENROLLED", label: "Enrolled ✅", color: "bg-green-500" }
    ];

    const [leads, setLeads] = useState<any[]>([
        { id: "1", student_name: "Rahul Sharma", parent_name: "Sanjay", status: "NEW", course: "Class 10 Intensive", phone: "919876543210", revenue: 15000 },
        { id: "2", student_name: "Priya Das", parent_name: "Anita", status: "DEMO_SCHEDULED", course: "Neet Prep", phone: "918877665544", revenue: 45000 },
        { id: "3", student_name: "Amit Kumar", parent_name: "Rajesh", status: "PAYMENT_PENDING", course: "JEE Advanced", phone: "917766554433", revenue: 85000 },
    ]);

    const handleCollectPayment = async (leadId: string) => {
        try {
            const res = await fetch(`/api/edu/leads/${leadId}/payment`, { method: "POST" });
            const data = await res.json();

            if (data.url) {
                window.open(data.url, "_blank");
                alert("Payment Link Generated & Opened!");
            } else {
                alert("Error: " + (data.error || "Failed to generate link"));
            }
        } catch (e) {
            alert("Connection error");
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lead Pipeline Management</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Student..."
                            className="pl-12 pr-6 py-2.5 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600">
                        <Filter size={18} />
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-200">
                        Add Single Lead
                    </button>
                </div>
            </div>

            {/* PIPELINE VIEW */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {statuses.map(status => (
                    <div key={status.id} className="min-w-[320px] flex-shrink-0 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{status.label}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {leads.filter(l => l.status === status.id).length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {leads.filter(l => l.status === status.id).map(lead => (
                                <LeadCard key={lead.id} lead={lead} onCollectPayment={handleCollectPayment} />
                            ))}

                            {leads.filter(l => l.status === status.id).length === 0 && (
                                <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Leads Here</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeadCard({ lead, onCollectPayment }: { lead: any, onCollectPayment: (id: string) => void }) {
    return (
        <div className="glass-card p-5 group hover:border-blue-500/30 transition-all cursor-move shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <UserCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800">{lead.student_name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Class: {lead.course}</p>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><HandCoins size={12} className="text-green-600" /> ₹{lead.revenue.toLocaleString()}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} className="text-blue-500" /> 2 Follow-ups</span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button
                    onClick={() => onCollectPayment(lead.id)}
                    className="flex-1 py-2 bg-amber-50 rounded-lg text-[10px] font-black uppercase text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all">
                    <HandCoins size={12} /> Collect Payment
                </button>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-slate-200 transition-all">
                    <MessageSquare size={14} />
                </button>
            </div>
        </div>
    );
}
