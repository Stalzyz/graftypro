
import Link from "next/link";
import {
    GitMerge,
    Droplets,
    ShoppingBag,
    Send,
    CreditCard,
    Users,
    ChevronDown,
    PlayCircle,
    BookOpen,
    HelpCircle
} from "lucide-react";
import "../../landing/landing.css";
import { Logo } from "../../../components/ui/Logo";

export default function ModulesDocumentation() {
    const modules = [
        {
            id: "flow-builder",
            icon: <GitMerge />,
            title: "Visual Flow Builder",
            description: "Design automated conversation paths without a single line of code.",
            steps: [
                "Navigate to 'Flows' in your dashboard.",
                "Click 'Create New Flow' and enter a trigger keyword (e.g., 'Hello').",
                "Drag and drop nodes (Message, Condition, Action) from the sidebar.",
                "Connect nodes by dragging lines between their ports.",
                "Click 'Publish' to make your flow live on WhatsApp."
            ],
            tip: "Use 'Condition' nodes to branch conversations based on user replies."
        },
        {
            id: "drip-campaigns",
            icon: <Droplets />,
            title: "Drip Messaging",
            description: "Schedule recurring follow-ups to keep your audience engaged over time.",
            steps: [
                "Go to 'Drips' and click 'New Campaign'.",
                "Define your series of messages (Step 1, Step 2, etc.).",
                "Set the delay for each step (e.g., 24 hours after the previous step).",
                "Enroll contacts manually or via a Flow's 'Start Drip' action.",
                "Track open rates and engagement for each step in real-time."
            ],
            tip: "Personalize messages using {{contact_name}} variables for better conversion."
        },
        {
            id: "commerce",
            icon: <ShoppingBag />,
            title: "WhatsApp Commerce",
            description: "Sync your store products and recover abandoned carts automatically.",
            steps: [
                "Visit 'Commerce' and click 'Connect Store'.",
                "Enter your Shopify/WooCommerce API credentials.",
                "Wait for the initial product sync to complete.",
                "Configure 'Abandoned Cart Recovery' in the automation settings.",
                "Send product carousels directly within chat flows."
            ],
            tip: "Enable 'Auto-Sync' to keep your stock and pricing updated every hour."
        },
        {
            id: "broadcast",
            icon: <Send />,
            title: "Bulk Broadcast",
            description: "Send high-volume updates to your entire customer base safely.",
            steps: [
                "Go to 'Campaigns' > 'Create New'.",
                "Select a pre-approved Meta Template or a custom flow.",
                "Filter your audience using the 'Segments' tool.",
                "Choose 'Send Now' or schedule for a specific date/time.",
                "Monitor the 'Delivery Report' to see sent, delivered, and read status."
            ],
            tip: "Use 'Segments' to target only active customers and avoid spam reports."
        },
        {
            id: "credits",
            icon: <CreditCard />,
            title: "Credit Management",
            description: "Understand how your messages are billed and top up your wallet.",
            steps: [
                "Open 'Billing' to see your current credit balance.",
                "Click 'Add Credits' to select a top-up package.",
                "Complete the payment via the integrated gateway (Razorpay).",
                "View the 'Ledger' to see atomic deductions for every message.",
                "Set 'Low Balance' alerts to never stop your automations."
            ]
        },
        {
            id: "reseller",
            icon: <Users />,
            title: "Partner Controls",
            description: "Manage your sub-vendors and track your commission growth.",
            steps: [
                "Switch to the 'Partner Panel' from the sidebar.",
                "Go to 'Sub-Vendors' and click 'Invite' to onboard a client.",
                "Set custom markups in 'Pricing' for different message categories.",
                "View your 'Wallet' to see accumulated profit and markup gains.",
                "Request a payout when you reach the minimum withdrawal threshold."
            ]
        }
    ];

    return (
        <div className="landing-body min-h-screen bg-white">
            <style dangerouslySetInnerHTML={{
                __html: `
                .landing-body { background: #f8fafc !important; color: #1e293b !important; }
                .glass-card { background: white !important; border: 1px solid #e2e8f0 !important; color: #1e293b !important; }
                .text-slate-400 { color: #64748b !important; }
                .nav-link { color: #64748b !important; }
                .nav-link:hover { color: #2563eb !important; }
            `}} />

            {/* Nav */}
            <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/">
                        <Logo size={40} variant="dark" />
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-blue-600">Back to Home</Link>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl font-black mb-6 tracking-tight">Master the <span className="text-blue-600">Platform</span></h1>
                <p className="text-lg text-slate-500 leading-relaxed">
                    Everything you need to know about setting up your WhatsApp business engine. No technical degree required.
                </p>
            </header>

            {/* Module Anchor Nav */}
            <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-wrap gap-3 justify-center">
                {modules.map(mod => (
                    <Link key={mod.id} href={`#${mod.id}`} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2">
                        {mod.icon} {mod.title}
                    </Link>
                ))}
            </div>

            {/* Content Section */}
            <main className="max-w-5xl mx-auto px-6 pb-32 space-y-24">
                {modules.map((mod, i) => (
                    <section key={mod.id} id={mod.id} className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                {mod.icon}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black">{mod.title}</h2>
                                <p className="text-slate-500 font-medium">{mod.description}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div className="glass-card p-8 rounded-[32px]">
                                    <h4 className="font-bold mb-6 flex items-center gap-2 text-blue-600">
                                        <PlayCircle size={18} /> Step-by-Step Instructions
                                    </h4>
                                    <div className="space-y-6">
                                        {mod.steps.map((step, si) => (
                                            <div key={si} className="flex gap-4 group">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {si + 1}
                                                </div>
                                                <p className="text-slate-700 leading-relaxed pt-1 font-medium">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[24px]">
                                    <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                        <BookOpen size={16} /> Pro Tip
                                    </h5>
                                    <p className="text-blue-700 text-sm leading-relaxed italic">
                                        "{mod.tip || "Monitor your analytics daily to optimize your response times and conversion rates."}"
                                    </p>
                                </div>
                                <div className="glass-card p-6 border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-bold">Need Help?</span>
                                    <button className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2">
                                        <HelpCircle size={16} /> Ask Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 py-32 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-6">Still have questions?</h2>
                    <p className="text-slate-400 mb-10">Our success managers are available 24/7 to help you onboard your clients.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/contact" className="btn-primary">Book an Onboarding Call</Link>
                        <button className="px-8 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/10">View API Docs</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
