"use client";

import { useState, useEffect } from "react";
import { X, Zap, Loader2, CheckCircle2 } from "lucide-react";

interface DripEnrollModalProps {
    contact: any;
    onClose: () => void;
}

export default function DripEnrollModal({ contact, onClose }: DripEnrollModalProps) {
    const [drips, setDrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch("/api/drips")
            .then(res => res.json())
            .then(data => {
                if (data.data) setDrips(data.data.filter((d: any) => d.status === 'ACTIVE'));
                setLoading(false);
            });
    }, []);

    const handleEnroll = async (dripId: string) => {
        setEnrolling(true);
        try {
            const res = await fetch("/api/drips/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contactId: contact.id,
                    dripId
                })
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(onClose, 2000);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to enroll");
            }
        } catch (e) {
            alert("Error enrolling contact");
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Zap size={20} fill="currentColor" /></div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Drip Automation</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Enroll {contact?.name || contact?.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 size={40} /></div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">Enrolled Successfully!</h4>
                                <p className="text-sm text-gray-400 mt-1 font-bold">The first message will be sent based on the delay settings.</p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                            <Loader2 className="animate-spin text-indigo-600" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading sequences...</span>
                        </div>
                    ) : drips.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-gray-400 font-bold">No active drip sequences found.</p>
                        </div>
                    ) : (
                        drips.map(drip => (
                            <button
                                key={drip.id}
                                onClick={() => handleEnroll(drip.id)}
                                disabled={enrolling}
                                className="w-full text-left p-4 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-2xl border border-gray-100 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform"><Zap size={60} /></div>
                                <div className="relative">
                                    <h4 className="font-bold text-sm mb-1">{drip.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{drip.steps?.length || 0} Steps</span>
                                        <span className="w-1 h-1 bg-current opacity-30 rounded-full" />
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Status: {drip.status}</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {!loading && !success && drips.length > 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Choose a sequence to start the automation lifecycle</p>
                    </div>
                )}
            </div>
        </div>
    );
}
