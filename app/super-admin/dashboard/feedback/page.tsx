
"use client";
import React, { useState, useEffect } from 'react';
import {
    Check,
    X,
    Trash2,
    MessageSquare,
    ArrowLeft,
    Clock,
    User,
    Star
} from 'lucide-react';
import Link from 'next/link';

export default function FeedbackModeration() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/super-admin/feedback');
            const data = await res.json();
            setFeedbacks(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        try {
            const res = await fetch('/api/super-admin/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    approve: action === 'approve',
                    delete: action === 'delete'
                })
            });
            if (res.ok) {
                fetchFeedbacks();
            }
        } catch (e) {
            alert("Action failed");
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/super-admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Feedback Moderation</h1>
                    <p className="text-gray-500 text-sm">Review and approve vendor/reseller testimonials.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">No feedback submissions yet</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {feedbacks.map((f) => (
                        <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{f.name}</h4>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${f.role === 'VENDOR' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {f.role}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(f.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star key={idx} size={12} className={idx < f.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                                    ))}
                                </div>

                                <p className="text-sm text-gray-600 italic leading-relaxed">"{f.content}"</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {!f.is_approved ? (
                                    <button
                                        onClick={() => handleAction(f.id, 'approve')}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAction(f.id, 'reject')}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all"
                                    >
                                        <X size={16} /> Unapprove
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(f.id, 'delete')}
                                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {f.is_approved && (
                                    <span className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-200 animate-pulse-soft">
                                        <Check size={12} />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
