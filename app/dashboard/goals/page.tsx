"use client";

import { useEffect, useState } from "react";
import {
    Target,
    Plus,
    Trophy,
    ArrowRight,
    Calendar,
    CreditCard,
    ShoppingBag,
    Loader2
} from "lucide-react";

const GOAL_TYPES = [
    { id: 'BOOK_APPOINTMENT', label: 'Appointment Booking', icon: Calendar, description: 'Automate scheduling meetings with leads.' },
    { id: 'COLLECT_PAYMENT', label: 'Collect Payment', icon: CreditCard, description: 'Send payment reminders and secure links.' },
    { id: 'SELL_PRODUCT', label: 'Sell Products', icon: ShoppingBag, description: 'Showcase products and drive purchases.' },
];

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newGoal, setNewGoal] = useState({
        name: "",
        type: "BOOK_APPOINTMENT",
        config: {}
    });

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/goals");
            const data = await res.json();
            if (res.ok) {
                setGoals(data.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreate = async () => {
        if (!newGoal.name) return alert("Please enter a name");

        setIsCreating(true);
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newGoal)
            });

            if (res.ok) {
                setNewGoal({ name: "", type: "BOOK_APPOINTMENT", config: {} });
                fetchGoals();
                // We could also show a success modal
            } else {
                alert("Failed to create goal");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating goal");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Goals</h1>
                    <p className="text-gray-500 font-medium mt-1">Define success metrics and let AI optimize your flows.</p>
                </div>
            </div>

            {/* Creation Area */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="text-indigo-600" /> Create New Goal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Goal Name</label>
                            <input
                                type="text"
                                value={newGoal.name}
                                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                placeholder="e.g. Q1 Sales Drive"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Goal Type</label>
                            <div className="grid grid-cols-1 gap-3">
                                {GOAL_TYPES.map(type => (
                                    <div
                                        key={type.id}
                                        onClick={() => setNewGoal({ ...newGoal, type: type.id })}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${newGoal.type === type.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-dashed border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${newGoal.type === type.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <type.icon size={20} />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${newGoal.type === type.id ? 'text-indigo-900' : 'text-gray-600'}`}>{type.label}</div>
                                            <div className="text-xs text-gray-400">{type.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            {isCreating ? "Creating Strategy..." : "Initialize Goal"}
                        </button>
                    </div>

                    <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Trophy size={200} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black mb-2">AI-Powered Optimization</h4>
                            <p className="text-indigo-200 leading-relaxed mb-6">
                                When you create a goal, Grafty automatically generates a smart flow structure designed to convert.
                                We tracking every step and provide ROI analytics.
                            </p>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase mb-2">
                                    <Target size={12} /> Prediction
                                </div>
                                <div className="text-3xl font-black">240%</div>
                                <div className="text-xs text-indigo-300">Expected ROI Increase</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div>
                <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">Active Goals</h3>
                {loading ? (
                    <div className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">No active goals found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map(goal => (
                            <div key={goal.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {goal.status}
                                    </div>
                                </div>

                                <h4 className="text-xl font-black text-gray-900 mb-1">{goal.name}</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">{goal.type.replace('_', ' ')}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-900">{goal.metrics?.[0]?.completed_count || 0}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Conversions</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-900">₹{goal.metrics?.[0]?.revenue || 0}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Revenue</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
