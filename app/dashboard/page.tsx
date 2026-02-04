"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    Users,
    MessageCircle,
    TrendingUp,
    Zap
} from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        contactsCount: 0,
        messagesSent: 0,
        activeFlows: 0,
        recentCampaigns: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch dash stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back to your comprehensive overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Contacts"
                    value={stats.contactsCount}
                    icon={<Users className="text-blue-600" size={24} />}
                />
                <StatCard
                    title="Messages Sent"
                    value={stats.messagesSent}
                    icon={<MessageCircle className="text-indigo-600" size={24} />}
                />
                <StatCard
                    title="Active Flows"
                    value={stats.activeFlows}
                    icon={<Zap className="text-yellow-600" size={24} />}
                />
                <StatCard
                    title="Campaigns"
                    value={stats.recentCampaigns.length}
                    icon={<TrendingUp className="text-green-600" size={24} />}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Campaigns */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Broadcasts</h3>
                    <div className="space-y-4">
                        {stats.recentCampaigns.length === 0 ? (
                            <div className="text-gray-400 text-sm">No recent campaigns.</div>
                        ) : (
                            stats.recentCampaigns.map((c: any) => (
                                <CampaignRow
                                    key={c.id}
                                    name={c.name}
                                    status={c.status}
                                    sent={c.sent_count || 0}
                                    date={new Date(c.created_at).toLocaleDateString()}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* System Health / Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/dashboard/campaigns" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            + New Broadcast
                        </Link>
                        <Link href="/dashboard/flows/create" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            + Create Automation Flow
                        </Link>
                        <Link href="/dashboard/contacts" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            Manage Contacts
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{title}</div>
        </div>
    )
}

function CampaignRow({ name, status, sent, date }: any) {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div>
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500">{date}</div>
            </div>
            <div className="text-right">
                <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mb-1 
                    ${status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {status}
                </div>
                <div className="text-xs text-gray-500">{sent} sent</div>
            </div>
        </div>
    )
}
