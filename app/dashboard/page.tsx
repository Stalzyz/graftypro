import {
    Users,
    MessageCircle,
    TrendingUp,
    Zap
} from "lucide-react";

export default function DashboardPage() {
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
                    value="1,280"
                    trend="+12%"
                    icon={<Users className="text-blue-600" size={24} />}
                />
                <StatCard
                    title="Messages Sent"
                    value="45,320"
                    trend="+5%"
                    icon={<MessageCircle className="text-indigo-600" size={24} />}
                />
                <StatCard
                    title="Active Flows"
                    value="8"
                    icon={<Zap className="text-yellow-600" size={24} />}
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.2%"
                    trend="+0.4%"
                    icon={<TrendingUp className="text-green-600" size={24} />}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Campaigns */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Broadcasts</h3>
                    <div className="space-y-4">
                        <CampaignRow name="Black Friday Sale" status="Completed" sent={5000} date="2 hours ago" />
                        <CampaignRow name="Weekly Newsletter" status="Processing" sent={120} date="Just now" />
                        <CampaignRow name="Welcome Series" status="Active" sent={850} date="Ongoing" />
                    </div>
                </div>

                {/* System Health / Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            + New Broadcast
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            + Create Automation Flow
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors">
                            Manage Templates
                        </button>
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
                    ${status === 'Completed' ? 'bg-green-100 text-green-700' :
                        status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {status}
                </div>
                <div className="text-xs text-gray-500">{sent} sent</div>
            </div>
        </div>
    )
}
