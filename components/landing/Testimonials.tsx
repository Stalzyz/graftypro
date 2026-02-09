
"use client";
import React, { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle, User, MessageSquarePlus } from 'lucide-react';

export default function Testimonials() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: 'VENDOR', content: '', rating: 5 });

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/feedback');
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                setFeedbacks(data.data);
            } else {
                // Fallback to defaults if no approved feedback exists
                setFeedbacks([
                    { name: "Suresh Kumar", role: "Digital Agency Owner", content: "WAVO has completely transformed how we handle client retention. The 24/7 automation is flawless.", rating: 5 },
                    { name: "Priya Sharma", role: "E-commerce Founder", content: "Best WhatsApp marketing tool in India. ROI is easily 5x within the first month.", rating: 5 },
                    { name: "Rahul Verma", role: "Reseller Partner", content: "The reseller dashboard is so intuitive. My vendors love the green tick support!", rating: 4 }
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Feedback submitted! It will appear after admin approval.");
                setFormData({ name: '', role: 'VENDOR', content: '', rating: 5 });
                setShowForm(false);
            } else {
                alert("Failed to submit feedback");
            }
        } catch (e) {
            alert("Error submitting feedback");
        }
    };

    return (
        <section className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-2xl">
                        <div className="section-tag mb-6">User Stories</div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            Trusted by <span className="text-gradient">Forward-Thinking</span> Businesses.
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            See how businesses and resellers are scaling their WhatsApp operations with WAVO's enterprise-grade engine.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-8 py-4 bg-wa-green/10 border border-wa-green/20 text-wa-green rounded-2xl font-bold hover:bg-wa-green/20 transition-all uppercase text-xs tracking-widest shrink-0"
                    >
                        <MessageSquarePlus size={18} /> {showForm ? "View Feedbacks" : "Post Feedback"}
                    </button>
                </div>

                {showForm ? (
                    <div className="max-w-xl mx-auto animate-fade-in">
                        <form onSubmit={handleSubmit} className="glass-card p-10 space-y-6">
                            <h3 className="text-2xl font-bold mb-4">Submit Your Experience</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-wa-green outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-wa-green outline-none appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="VENDOR">Vendor</option>
                                        <option value="RESELLER">Reseller</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Feedback Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-wa-green outline-none"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-4 bg-wa-green text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-wa-green/20">
                                Submit for Approval
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {feedbacks.map((f, i) => (
                            <div key={i} className="glass-card p-10 relative group hover:border-wa-green/30 transition-all flex flex-col">
                                <Quote className="absolute top-8 right-8 text-wa-green/10 group-hover:text-wa-green/20 transition-colors" size={48} />

                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star key={idx} size={14} className={idx < f.rating ? "text-amber-500 fill-amber-500" : "text-slate-800"} />
                                    ))}
                                </div>

                                <p className="text-white text-lg font-medium leading-relaxed mb-8 flex-1 italic">
                                    "{f.content}"
                                </p>

                                <div className="flex items-center gap-4 border-t border-slate-900 pt-8">
                                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-bold">{f.name}</h4>
                                            <CheckCircle size={14} className="text-blue-500" fill="currentColor" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{f.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
