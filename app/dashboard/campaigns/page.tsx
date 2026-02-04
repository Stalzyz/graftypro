"use client";

import { useState, useEffect } from "react";
import { Send, Clock, RefreshCw } from "lucide-react";

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
            {activeTab === "history" && <CampaignList />}
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
    const [syncing, setSyncing] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        templateName: "",
        scheduledAt: ""
    });

    const fetchTemplates = async () => {
        const res = await fetch("/api/templates");
        const data = await res.json();
        if (data.data) setTemplates(data.data);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetch("/api/templates", { method: "POST" }); // Sync endpoint
            await fetchTemplates();
        } catch (e) {
            console.error(e);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Campaign Created!");
                setFormData({ name: "", templateName: "", scheduledAt: "" });
            } else {
                alert("Failed to create campaign");
            }
        } catch (e) {
            alert("Error creating campaign");
        } finally {
            setLoading(false);
        }
    }

    const selectedTemplate = templates.find(t => t.name === formData.templateName);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Summer Sale Announcement"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Select Template</label>
                        <button onClick={handleSync} disabled={syncing} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> Sync Meta
                        </button>
                    </div>
                    <select
                        value={formData.templateName}
                        onChange={e => setFormData({ ...formData, templateName: e.target.value })}
                        className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Select a template...</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.name}>
                                {t.name} ({t.status}) - {t.language}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer bg-blue-50 border-blue-200">
                            <input type="radio" name="audience" defaultChecked />
                            <div>
                                <div className="font-medium text-sm text-blue-900">All Opt-in Contacts</div>
                                <div className="text-xs text-blue-600">Sends to all compliant users</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-not-allowed opacity-60">
                            <input type="radio" name="audience" disabled />
                            <div>
                                <div className="font-medium text-sm">Filtered Segment (Coming Soon)</div>
                                <div className="text-xs text-gray-500">Select specific tags or attributes</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                    <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="pt-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.templateName}
                        className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Launching..." : "Launch Campaign 🚀"}
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
                <div className="w-[320px] bg-[#e5ddd5] rounded-xl shadow-xl overflow-hidden border border-gray-300">
                    <div className="bg-[#075e54] h-12 flex items-center px-4 text-white font-medium">
                        Preview
                    </div>
                    <div className="p-4 space-y-2 min-h-[400px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
                        <div className="bg-white p-2 rounded-lg rounded-tl-none shadow border border-gray-100 max-w-[85%] text-sm">
                            {selectedTemplate ? (
                                <div>
                                    <div className="font-bold text-gray-900 mb-1 capitalize">{selectedTemplate.name.replace(/_/g, ' ')}</div>
                                    <div className="text-gray-800 text-xs">
                                        {/* Extremely basic preview of body text if available */}
                                        {selectedTemplate.components?.find((c: any) => c.type === 'BODY')?.text || "Template Body..."}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400 italic">Select a template to preview</div>
                            )}
                            <div className="mt-2 text-[10px] text-gray-400 text-right">10:42 AM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CampaignList() {
    const [campaigns, setCampaigns] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/campaigns").then(r => r.json()).then(d => {
            if (d.data) setCampaigns(d.data);
        });
    }, []);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Sent / Failed</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {campaigns.map(c => (
                        <tr key={c.id}>
                            <td className="px-6 py-4 font-medium">{c.name}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        c.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {c.stats?.[0] ? `${c.stats[0].sent} / ${c.stats[0].failed}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(c.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                    {campaigns.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No campaigns yet</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
