"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NotificationBell() {
    const [dueFollowUps, setDueFollowUps] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const fetchNotifications = async () => {
        try {
            // Fetch Due Followups
            const crmRes = await fetch("/api/crm/follow-ups/due");
            if (crmRes.ok) {
                const data = await crmRes.json();
                setDueFollowUps(data.data || []);
            }

            // Fetch Recent Messages
            const msgRes = await fetch("/api/notifications/messages");
            if (msgRes.ok) {
                const { data } = await msgRes.json();
                const messages = data || [];
                setRecentMessages(messages);

                // Play notification sound if new message arrived
                if (messages.length > 0 && messages[0].id !== lastMessageId && lastMessageId !== null) {
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
                    audio.play().catch(() => {}); // Browser might block if no interaction
                }
                if (messages.length > 0) setLastMessageId(messages[0].id);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for "real-time" feel
        return () => clearInterval(interval);
    }, [lastMessageId]);

    const markCompleted = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`/api/crm/follow-ups/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "COMPLETED" })
            });
            if (res.ok) {
                setDueFollowUps(prev => prev.filter(f => f.id !== id));
            }
        } catch (e) {
            console.error("Failed to complete follow up", e);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            setRecentMessages(prev => prev.filter(m => m.conversation_id !== conversationId));
            await fetch("/api/chats/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation_id: conversationId })
            });
        } catch (e) {
            console.error("Failed to mark as read", e);
        }
    };

    const totalCount = dueFollowUps.length + recentMessages.length;

    if (totalCount === 0 && !open) return null;

    return (
        <div className="fixed top-6 right-6 z-[200]">
            <button 
                onClick={() => setOpen(!open)}
                className="w-12 h-12 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center relative hover:scale-[1.05] transition-transform"
            >
                <Bell size={20} className={totalCount > 0 ? "text-rose-500 animate-pulse" : "text-slate-400"} />
                {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                        {totalCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute top-14 right-0 w-80 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <Bell size={16} /> Activity Center
                        </h3>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto w-full custom-scrollbar">
                        {totalCount === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-bold">
                                Everything is caught up!
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 w-full flex flex-col">
                                {/* Recent Messages */}
                                {recentMessages.map(msg => (
                                    <Link 
                                        key={msg.id}
                                        href={`/dashboard/chat?phone=${msg.contact?.phone}`}
                                        onClick={() => {
                                            markAsRead(msg.conversation_id);
                                            setOpen(false);
                                        }}
                                        className="p-5 hover:bg-emerald-50 transition-colors w-full group block border-l-4 border-emerald-500"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">
                                                    {msg.contact?.name || msg.contact?.phone}
                                                </p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                                                    New Message
                                                </p>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 mt-2 line-clamp-2 italic font-medium">
                                            {typeof msg.content === 'string' ? msg.content : (msg.content?.body || `[${msg.type} Attachment]`)}
                                        </div>
                                    </Link>
                                ))}

                                {/* CRM Followups */}
                                {dueFollowUps.map(followup => (
                                    <div key={followup.id} className="p-5 hover:bg-slate-50 transition-colors w-full group border-l-4 border-rose-500">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <p className="font-bold text-slate-800 text-sm truncate">
                                                    {followup.contact?.name || followup.contact?.phone}
                                                </p>
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">
                                                    Due Reminder
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(e) => markCompleted(followup.id, e)}
                                                className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors flex-shrink-0"
                                                title="Mark as Completed"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                        {followup.notes && (
                                            <div className="text-xs text-slate-500 mt-2 bg-slate-50/50 border border-slate-100 p-2 rounded-xl line-clamp-2">
                                                {followup.notes}
                                            </div>
                                        )}
                                        <Link 
                                            href={`/dashboard/chat?phone=${followup.contact?.phone}`}
                                            onClick={() => setOpen(false)}
                                            className="block w-full text-center mt-3 text-[10px] font-black uppercase tracking-widest text-[#27954D] hover:text-[#042F94] transition-colors"
                                        >
                                            Reply Now &rarr;
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
