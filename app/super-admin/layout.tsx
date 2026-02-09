
import "../globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Grekam Super Admin",
    description: "Grekam Platform Control Tower",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="super-admin-theme min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
                {children}
            </div>

            <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Grekam Wabot Platform Control. Restricted Access.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <Link href="#" className="hover:text-slate-300 transition-colors">Audit Logs</Link>
                    <Link href="#" className="hover:text-slate-300 transition-colors">Server Status</Link>
                </div>
            </footer>
        </div>
    );
}
