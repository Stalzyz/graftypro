import Link from "next/link";
import { MessageCircle, CreditCard, Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* WhatsApp Integration Card */}
                <Link href="/dashboard/settings/whatsapp" className="group block">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Connect your WhatsApp Business Account (WABA) to start sending messages.
                        </p>
                    </div>
                </Link>

                {/* Billing & Plans */}
                <Link href="/dashboard/settings/billing" className="group block">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Billing & Plans</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Manage your subscription, view invoices, and upgrade your plan.
                        </p>
                    </div>
                </Link>

                {/* Placeholder for future settings */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-60">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <Settings size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">General Settings</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Workspace preferences and team management (Coming Soon).
                    </p>
                </div>
            </div>
        </div>
    );
}
