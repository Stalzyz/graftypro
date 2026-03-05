"use client";

import { useState } from "react";
import { X, Calendar, Loader2, CheckCircle2, Clock, AlignLeft } from "lucide-react";

interface FollowUpModalProps {
    contact: any;
    onClose: () => void;
}

export default function FollowUpModal({ contact, onClose }: FollowUpModalProps) {
    const [scheduledAt, setScheduledAt] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduledAt) return;

        setSaving(true);
        try {
            const res = await fetch("/api/crm/follow-ups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contactId: contact.id,
                    scheduledAt,
                    notes
                })
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(onClose, 2000);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to schedule");
            }
        } catch (e) {
            alert("Error scheduling follow-up");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm"><Calendar size={24} /></div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Schedule Follow Up</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Contact: {contact?.name || contact?.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 size={40} /></div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">Scheduled!</h4>
                                <p className="text-sm text-gray-400 mt-1 font-bold">You will receive a notification on the set date.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Clock size={12} /> Reminder Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className="w-full bg-gray-50 border-gray-100 focus:bg-white focus:border-green-600/30 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <AlignLeft size={12} /> Reason / Internal Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Ex: Call to confirm proposal..."
                                    className="w-full bg-gray-50 border-gray-100 focus:bg-white focus:border-green-600/30 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all shadow-inner resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving || !scheduledAt}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-green-100 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                                {saving ? "Scheduling..." : "Confirm Schedule"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
