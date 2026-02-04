"use client";

import { useState } from "react";
import { Send, Clock } from "lucide-react";

export default function CampaignsPage() {
    const [activeTab, setActiveTab] = useState("new");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
                    <p className="text-gray-500">Launch mass messaging campaigns.</p>
                </div>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <TabButton active={activeTab === "new"} onClick={() => setActiveTab("new")}>New Campaign</TabButton>
                <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>History</TabButton>
            </div>

            {activeTab === "new" && <NewCampaignForm />}
        </div>
    );
}

function TabButton({ active, children, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
            {children}
        </button>
    )
}

function NewCampaignForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        // Call API here...
        setTimeout(() => setLoading(false), 2000);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input type="text" className="w-full border rounded-lg p-2" placeholder="e.g. Summer Sale Announcement" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                    <select className="w-full border rounded-lg p-2 bg-white">
                        <option>marketing_offer_v1 (Marketing)</option>
                        <option>appointment_reminder (Utility)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Only approved templates can be sent.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="audience" defaultChecked />
                            <div>
                                <div className="font-medium text-sm">All Contacts</div>
                                <div className="text-xs text-gray-500">1,280 Recipients</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="audience" />
                            <div>
                                <div className="font-medium text-sm">Filtered Segment</div>
                                <div className="text-xs text-gray-500">Select specific tags or attributes</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <div className="flex gap-4">
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-blue-600 bg-blue-50 text-blue-700 p-2 rounded-lg text-sm font-medium">
                            <Send size={16} /> Send Now
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
                            <Clock size={16} /> Schedule Later
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {loading ? "Launching Rocket..." : "Launch Campaign 🚀"}
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
                <div className="w-[320px] bg-[#e5ddd5] rounded-xl shadow-xl overflow-hidden border border-gray-300">
                    <div className="bg-[#075e54] h-12 flex items-center px-4 text-white font-medium">
                        Wabot Demo
                    </div>
                    <div className="p-4 space-y-2 min-h-[400px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
                        <div className="bg-white p-2 rounded-lg rounded-tl-none shadow border border-gray-100 max-w-[85%] text-sm">
                            <div className="font-bold text-gray-900 mb-1">Summer Sale! ☀️</div>
                            <p className="text-gray-800">Hey undefined, get 50% off on all items this weekend.</p>
                            <div className="mt-2 text-[10px] text-gray-400 text-right">10:42 AM</div>
                        </div>
                        <div className="bg-white p-2 text-center text-blue-500 font-medium text-sm rounded cursor-pointer shadow-sm">
                            Shop Now
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
