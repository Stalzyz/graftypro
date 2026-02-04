import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Send,
    GitBranch,
    Settings,
    LogOut
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Wabot BSP
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <NavItem href="/dashboard/contacts" icon={<Users size={20} />} label="Contacts" />
                    <NavItem href="/dashboard/chat" icon={<MessageSquare size={20} />} label="Live Chat" />
                    <NavItem href="/dashboard/campaigns" icon={<Send size={20} />} label="Broadcasts" />
                    <NavItem href="/dashboard/flows/create" icon={<GitBranch size={20} />} label="Automation" />
                    <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-red-600 px-2 py-2 w-full rounded-md hover:bg-red-50 transition-colors">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header (Hidden on Desktop) */}
                <header className="h-16 bg-white border-b border-gray-200 md:hidden flex items-center px-4">
                    <span className="font-bold">Wabot</span>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: any) {
    const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
    const activeClass = active
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
        <Link href={href} className={`${baseClass} ${activeClass}`}>
            {icon}
            {label}
        </Link>
    )
}
