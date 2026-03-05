
import "../globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Grafty Super Admin",
    description: "Grafty Platform Control Tower",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="super-admin-theme min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="flex-1 w-full px-6 py-8">
                {children}
            </div>

            <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Grafty Platform Control. Restricted Access.</p>
                <div className="flex justify-center gap-4 mt-2 font-bold uppercase tracking-widest text-[10px]">
                    <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Access</Link>
                    <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Protocol</Link>
                    <Link href="mailto:support@grafty.pro" className="hover:text-slate-300 transition-colors">System Support</Link>
                </div>
            </footer>
        </div>
    );
}
