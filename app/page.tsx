import Link from "next/link";
import {
    ArrowRight,
    Zap,
    MessageCircle,
    ShoppingBag,
    GitBranch,
    BarChart3,
    CheckCircle2
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Wabot BSP</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <Link href="#features" className="hover:text-gray-900">Features</Link>
                        <Link href="#solutions" className="hover:text-gray-900">Solutions</Link>
                        <Link href="#pricing" className="hover:text-gray-900">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/api/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Log in
                        </Link>
                        <Link
                            href="/dashboard" // Redirects to register/dashboard
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 border border-blue-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        v2.0 Now Available
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8">
                        automate your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            whatsapp revenue.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                        The first platform that unifies <strong>Chatbot Flows</strong>, <strong>Drip Campaigns</strong>, and <strong>Commerce</strong> into a single goal-driven engine.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition">
                            View Demo
                        </button>
                    </div>

                    {/* Dashboard Preview / Mockup */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-40">
                            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                        </div>

                        <div className="rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4">
                            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                                {/* Fake Browser Header */}
                                <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 text-center text-xs font-medium text-gray-400 ml-4 bg-white py-1 rounded-md border border-gray-200 max-w-xs mx-auto">
                                        app.wabot.com/dashboard/flows
                                    </div>
                                </div>
                                {/* Placeholder for App Screenshot */}
                                <div className="aspect-[16/9] bg-slate-50 relative flex items-center justify-center">
                                    <div className="grid grid-cols-3 gap-8 w-3/4 opacity-80">
                                        <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64">
                                            <div className="w-8 h-8 bg-blue-100 rounded mb-4"></div>
                                            <div className="h-2 w-24 bg-gray-100 rounded mb-2"></div>
                                            <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                        </div>
                                        <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64 flex flex-col items-center justify-center border-dashed border-2">
                                            <GitBranch size={48} className="text-gray-200 mb-2" />
                                            <div className="text-gray-400 font-medium">Flow Builder Canvas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50" id="features">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to scale.</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Replace your disjointed stack. Wabot combines marketing, automation, and sales into one cohesive platform.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<GitBranch />}
                            title="Visual Flow Builder"
                            desc="Drag-and-drop builder to create complex chatbots without writing a single line of code. Handle support, FAQs, and routing instantly."
                        />
                        <FeatureCard
                            icon={<MessageCircle />}
                            title="Smart Drip Campaigns"
                            desc="Nurture leads over time. Set up sequences that automatically stop when a user replies or converts."
                        />
                        <FeatureCard
                            icon={<ShoppingBag />}
                            title="Native Commerce"
                            desc="Turn WhatsApp into a storefront. create product catalogs, send carts, and collect payments directly within the chat."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-900 text-white p-1 rounded">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <span className="font-bold text-gray-900">Wabot BSP</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2024 Wabot Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}
