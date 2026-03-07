"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MessageSquare, Play, List, SplitSquareVertical, Clock, Calendar,
    CreditCard, ShoppingBag, Send, ArrowRightCircle, FileText,
    MessageCircle, Tag, Truck, CheckCircle2, ChevronRight, Hash,
    Info, BookOpen, Lightbulb, Workflow, ArrowLeft, Settings,
    Zap, MousePointer2, LayoutList
} from 'lucide-react';
import { Logo } from "../../../components/ui/Logo";

const FLOW_NODES = [
    {
        id: 'start', name: 'Start Node', icon: <Zap size={18} fill="currentColor" />, color: 'bg-orange-500',
        desc: 'The Entry Point', imageUrl: '/guide-start.png',
        overview: 'Every flow must begin with a Start Node. It defines the specific keyword or trigger event that enrolls a customer into this automation sequence.',
        config: ['Drag the "Start" node onto the canvas.', 'Click it to open the Properties Panel.', 'Set the EXACT keyword (e.g., "HELLO", "SUPPORT", "BUY").', 'Connect its output edge to the next action.'],
        caseStudy: 'A restaurant sets their Start trigger to "MENU". When a customer WhatsApps the word "MENU" to their official number, the flow immediately fires and sends back the Catalog node.',
        technical: 'The engine performs a case-insensitive regex match on incoming WhatsApp textual webhooks to find the keyword.'
    },
    {
        id: 'message', name: 'Message Node', icon: <MousePointer2 size={18} />, color: 'bg-green-500',
        desc: 'Text & Media', imageUrl: '/guide-message.png',
        overview: 'The fundamental building block for communication. Use it to send text, images, videos, documents, and up to 3 interactive Reply/URL buttons.',
        config: ['Add node to canvas and connect incoming edge.', 'Enter message body (supports *bold*, _italic_, ~strikethrough~).', 'Optionally paste a public URL for Header Media (Image/Video/Doc).', 'Add up to 3 Buttons. Assign "Reply" for flow choices, or "URL" to link outbound.'],
        caseStudy: 'An eCommerce brand sends a "Welcome Message" text with an Image header of their storefront. They include two Reply buttons: "Shop Now" and "Talk to Agent".',
        technical: 'Compiles into Meta standard Text, Media, or Interactive Button payloads based on attachments.'
    },
    {
        id: 'list', name: 'List Node', icon: <LayoutList size={18} />, color: 'bg-fuchsia-500',
        desc: 'Multi-Option Menu', imageUrl: '/guide-list.png',
        overview: 'When you need to offer the user more than 3 options. WhatsApp List messages allow up to 10 choices organized into distinct sections.',
        config: ['Add the node to the canvas.', 'Enter the prompt text (e.g., "Please select a department:").', 'Enter the Button Text (e.g., "View Menu").', 'Add Items. Each item becomes an independent outgoing edge on the node.'],
        caseStudy: 'A hospital uses a List Node for appointment booking options: "Cardiology", "Neurology", "Pediatrics", "General", "Dental", "Orthopedics". The user taps the menu and selects their desired department, branching the flow perfectly.',
        technical: 'Uses the `interactive: { type: "list" }` Meta object payload. Max 10 rows. List items cannot contain emojis in their IDs.'
    },
    {
        id: 'condition', name: 'Condition Node', icon: <SplitSquareVertical size={18} />, color: 'bg-purple-500',
        desc: 'Logic Branching', imageUrl: '/guide-condition.png',
        overview: 'The brain of your flow. It evaluates the user interface choice (or incoming data) and splits the automation down different paths (Yes/No, Option A/B).',
        config: ['Place the node AFTER an interactive node (like Message with Buttons or List).', 'Connect the specific button output edge to the Condition node.', 'Ensure the incoming edge matches the explicit condition you want to build logic for.'],
        caseStudy: 'After asking the user "Are you over 18?", the "Yes" reply button edge hits a Condition node that proceeds to adult-content flow. The "No" reply button hits a separate branch that sends an "Underage" rejection message.',
        technical: 'Conditions visually map JSON edges from source handles (like `button-123` or `item-456`) to target nodes.'
    },
    {
        id: 'wait', name: 'Wait / Delay', icon: <Clock size={18} />, color: 'bg-amber-500',
        desc: 'Pause Execution', imageUrl: '/guide-wait.png',
        overview: 'Intentionally stalls the flow execution for a specified duration before proceeding to the next node. Crucial for creating natural-feeling conversational pacing.',
        config: ['Insert the Wait node between two existing nodes.', 'Open properties and specify the Time value.', 'Set the Unit (Minutes, Hours, or Days).'],
        caseStudy: 'A SaaS company sends an e-book via a Document Message node. They immediately attach a "Wait Node" for 24 Hours, followed by a Message Node asking "Did you enjoy the e-book?". This creates an automated 1-day follow-up.',
        technical: 'Session state is suspended and saved. A cron worker job (`queue-processor`) wakes up the session precisely after the timestamp expires and resumes execution.'
    },
    {
        id: 'time_window', name: 'Time Window', icon: <Calendar size={18} />, color: 'bg-orange-500',
        desc: 'Business Hours Routing', imageUrl: '/guide-timewindow.png',
        overview: 'Evaluates the current clock time against your defined business hours, splitting the flow into "Within Hours" or "Outside Hours" paths.',
        config: ['Add node and define your weekly operating schedule (e.g., Mon-Fri 09:00 to 17:00).', 'Choose the correct Timezone.', 'Connect the "Within" edge to normal staff routing.', 'Connect the "Outside" edge to an "Away Message" or fallback node.'],
        caseStudy: 'If a customer messages "Support" at 2 AM on Sunday, the Time Window node instantly catches it, routes down the "Outside" path, and sends: "Our office is currently closed. We will reply Monday at 9 AM."',
        technical: 'Performs realtime server-side `luxon` datetime evaluation against the configured tz database zone.'
    },
    {
        id: 'payment', name: 'Payment Request', icon: <CreditCard size={18} />, color: 'bg-indigo-500',
        desc: 'Secure Checkout', imageUrl: '/guide-payment.png',
        overview: 'Dynamically generates a secure Razorpay or PhonePe payment link specific to the user, amounts, and currency defined, accelerating in-chat conversions.',
        config: ['Ensure your Workspace Billing Settings possess active Gateway API Keys.', 'Drop node into canvas.', 'Set Amount (e.g., 999).', 'Set Order Title and Currency.', 'Select Gateway Provider (Razorpay/PhonePe).'],
        caseStudy: 'A user completes their course registration flow. The final step is a Payment Node hardcoded to ₹4999. The user clicks the natively generated WhatsApp URL CTA button, pays via UPI, and the system records the transaction.',
        technical: 'Invokes provider APIs (`POST /v1/payment_links`) synchronously. Halts immediately if the amount is invalid or zero.'
    },
    {
        id: 'catalog', name: 'Product Catalog', icon: <ShoppingBag size={18} />, color: 'bg-pink-500',
        desc: 'E-Commerce native', imageUrl: '/guide-catalog.png',
        overview: 'Seamlessly displays full native WhatsApp Catalogs or single product items. Users can construct shopping carts without ever leaving the chat interface.',
        config: ['(Requires active Meta Commerce Catalog bound to WABA).', 'Place the node and set the Body text.', 'Choose either "Single Product" or "Multi-Product" array.', 'Wait for the user to submit an intent edge.'],
        caseStudy: 'A clothing brand sends their "Summer Collection" Catalog via the node. The user browses the native UI, adds 3 T-shirts to the WhatsApp cart, and hits "Send to Business".',
        technical: 'Sends an `interactive: { type: "catalog_message" }` or `product_list`. Requires advanced Meta UI synchronization.'
    },
    {
        id: 'meta_flow', name: 'Meta Flow (Forms)', icon: <HashtagIcon />, color: 'bg-emerald-600',
        desc: 'Native WhatsApp Webviews', imageUrl: '/guide-metaflow.png',
        overview: 'Triggers a native WhatsApp Form (Flow) overlay. Perfect for capturing structured data like Lead Gen forms, Surveys, or complex inputs WITHOUT clunky back-and-forth texting.',
        config: ['Build a WhatsApp Flow inside Meta Business Manager.', 'Copy the generated Flow ID.', 'Paste the Flow ID into the node properties.', 'Set the CTA generic button text (e.g., "Fill Form").'],
        caseStudy: 'An insurance company uses the Meta Flow node to pop up a 5-step native native form asking for vehicle details, age, and ID upload. The user submits it instantly.',
        technical: 'Dispatches `interactive: { type: "flow" }` payload. Halts execution until the `flow_completion` incoming webhook is detected.'
    },
    {
        id: 'appointment', name: 'Appointment Routing', icon: <Calendar size={18} />, color: 'bg-cyan-500',
        desc: 'Link Scheduling Apps', imageUrl: '/guide-appointment.png',
        overview: 'Generates customized link routing for calendar systems (like Cal.com or Calendly) natively bundled into an interactive button.',
        config: ['Add the Node.', 'Input the exact Calendly / Cal.com link (e.g., `https://cal.com/user/15min`).', 'Add a personalized message overlay.'],
        caseStudy: 'A real estate broker sends the Appointment Node. The lead clicks "Book Viewing" inside WhatsApp, the in-app browser opens Cal.com, they pick a slot, and close the modal.',
        technical: 'Generates a masked `cta_url` interactive payload to ensure highest CTR in chat.'
    },
    {
        id: 'order_summary', name: 'Order Summary', icon: <FileText size={18} />, color: 'bg-rose-500',
        desc: 'Receipt visualization', imageUrl: '/guide-ordersummary.png',
        overview: 'Provides a clean, itemized receipt breakdown for goods purchased or carts assembled, complete with total calculations.',
        config: ['Usually placed AFTER a User Cart Submission or Payment completion.', 'Will dynamically read session loop variables (if configured) to construct the view.'],
        caseStudy: 'User buys an item. The Order Summary spits out a beautiful receipt: "1x Shoes ($50), 1x Hat ($20). Total: $70".',
        technical: 'Formats text explicitly into WhatsApp monospace / tabulated receipt formats.'
    },
    {
        id: 'meta_template', name: 'Meta Template', icon: <MessageCircle size={18} />, color: 'bg-green-600',
        desc: 'Approved Outbound', imageUrl: '/guide-metatemplate.png',
        overview: 'Sends a pre-approved Meta Template message. Essential if you are trying to restart a 24-hour conversation window or send an official notification.',
        config: ['Select an approved template from the drop-down list.', 'Ensure the language code exactly matches Meta\'s approval.', 'Map variable placeholders (if applicable).'],
        caseStudy: 'The flow detects a user hasn\'t replied in 25 hours. The standard Message Node would fail. Instead, it hits a Meta Template node sending a "Re-engagement" approved template.',
        technical: 'Leverages the `template` API endpoint. Circumvents standard 24-hour restrictions if template is Utility/Marketing.'
    },
    {
        id: 'drip', name: 'Drip Sequence', icon: <ArrowRightCircle size={18} />, color: 'bg-violet-500',
        desc: 'Campaign Enrollment', imageUrl: '/guide-drip.png',
        overview: 'A powerful background engine node. Instantly enrolls the current user into a pre-configured Marketing Drip Campaign.',
        config: ['Ensure you have created a Drip Campaign in the main dashboard.', 'Select the target Drip Campaign from the dropdown.', 'Execution passes through immediately (does NOT halt flow).'],
        caseStudy: 'A user downloads an SEO playbook via the flow. The very next node is the "SEO Welcome Drip", which automatically adds them to an 8-day automated sequence sending daily tips.',
        technical: 'Creates a `DripEnrollment` record in the database. The cron scheduler takes over subsequent timed deliveries.'
    },
    {
        id: 'action', name: 'Action (Tags/Vars)', icon: <Tag size={18} />, color: 'bg-yellow-500',
        desc: 'Modify CRM Data', imageUrl: '/guide-action.png',
        overview: 'An invisible backend node. It modifies the contact\'s CRM profile, adds tags, changes stages, or injects variables without sending any visible message to the user.',
        config: ['Set the Action Type (e.g., "Add Tag", "Remove Tag", "Update Field").', 'Input the specific Tag string or variable name.', 'Execution passes through instantly.'],
        caseStudy: 'A user clicks the "VIP Support" button. The flow routes through an Action node that attaches the "VIP" tag to their CRM contact, then continues to the human handover message.',
        technical: 'Executes Prisma `update` queries on the `Contact` model silently.'
    },
    {
        id: 'order_tracking', name: 'Order Tracking', icon: <Truck size={18} />, color: 'bg-sky-500',
        desc: 'Shipment Status', imageUrl: '/guide-ordertracking.png',
        overview: 'Dynamically fetches and formats shipping status updates for users querying their physical deliveries.',
        config: ['Requires integration with a shipping provider logic or local tracking DB.', 'User inputs Order ID.', 'Node resolves and spits out tracking link/status.'],
        caseStudy: 'Customer types "Where is my order". The flow asks for the Tracking ID. Upon input, this node fetches the AWB and outputs "Your item is Out For Delivery".',
        technical: 'Custom endpoint wrapper for tracking integrations.'
    },
    {
        id: 'end', name: 'End Session', icon: <CheckCircle2 size={18} />, color: 'bg-slate-400',
        desc: 'Terminator', imageUrl: '/guide-end.png',
        overview: 'Explicitly terminates the current Flow Execution Session. Clears all memory context and resets the user for new keyword triggers.',
        config: ['Place at the absolute end of any branch.', 'No outgoing edges permitted.'],
        caseStudy: 'Customer resolves their support query. The final message says "Thanks!". The End node silently wraps up the session, ensuring their next message doesn\'t get confused.',
        technical: 'Marks `FlowSession.status = COMPLETED` and archives memory state.'
    }
];

// Helper Icon for standardizing
function HashtagIcon() {
    return <Hash size={18} />;
}

export default function FlowBuilderGuide() {
    const [selectedNodeId, setSelectedNodeId] = useState('start');
    const selectedNode = FLOW_NODES.find(n => n.id === selectedNodeId) || FLOW_NODES[0];

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 sticky top-0 z-50 shadow-sm shrink-0">
                <div className="flex flex-1 items-center gap-4">
                    <Link href="/how-to-use" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-900">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="h-4 w-px bg-slate-200" />
                    <Link href="/">
                        <Logo size={24} variant="color" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-400" />
                        <Link href="/how-to-use" className="text-xs font-bold text-slate-500 hover:text-slate-900 mt-0.5">ACADEMY</Link>
                        <ChevronRight size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">Flow Builder Ultimate Guide</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Visual Navigation Sidebar */}
                <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
                    <div className="p-6 pb-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Node Framework (16)</h2>
                        <div className="space-y-1.5">
                            {FLOW_NODES.map((node) => {
                                const isActive = selectedNodeId === node.id;
                                return (
                                    <button
                                        key={node.id}
                                        onClick={() => setSelectedNodeId(node.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left border ${isActive
                                            ? 'bg-white border-[#27954D] shadow-md shadow-[#27954D]/10'
                                            : 'bg-transparent border-transparent hover:bg-white hover:shadow-sm hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${node.color} ${isActive ? 'shadow-inner' : 'opacity-80'}`}>
                                                {node.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {node.name}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    {node.desc}
                                                </span>
                                            </div>
                                        </div>
                                        {isActive && <ChevronRight size={16} className="text-[#27954D]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-white">
                    <div className="max-w-4xl mx-auto p-12">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${selectedNode.color} shadow-xl shadow-${selectedNode.color.replace('bg-', '')}/20`}>
                                        {React.cloneElement(selectedNode.icon as React.ReactElement, { size: 32 })}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{selectedNode.name}</h1>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full mt-2">
                                            <Workflow size={12} className="text-slate-500" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Flow Engine Class: {selectedNode.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image / Graphic Display */}
                        {selectedNode.imageUrl && (
                            <div className="mb-10 w-full h-80 rounded-[32px] bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                                {/* Provide a solid fallback text for users before images are actually uploaded */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <div className={`w-20 h-20 rounded-full ${selectedNode.color} text-white flex items-center justify-center mb-4 opacity-20`}>
                                        {React.cloneElement(selectedNode.icon as React.ReactElement, { size: 40 })}
                                    </div>
                                    <span className="text-sm font-bold tracking-widest uppercase">[{selectedNode.name} Screenshot Asset Missing]</span>
                                    <span className="text-xs text-slate-400 mt-2">Upload image to public folder as `{selectedNode.imageUrl}`</span>
                                </div>
                                <img
                                    src={selectedNode.imageUrl}
                                    alt={`${selectedNode.name} Example`}
                                    className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-500 hover:scale-105"
                                    onLoad={(e) => (e.currentTarget as HTMLImageElement).classList.remove('opacity-0')}
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}

                        {/* Content Grid */}
                        <div className="space-y-10">

                            {/* Overview Box */}
                            <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info size={18} className="text-[#27954D]" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Node Overview</h3>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {selectedNode.overview}
                                </p>
                            </section>

                            {/* Configuration Steps */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <Settings size={18} className="text-blue-500" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Step-by-Step Configuration</h3>
                                </div>
                                <div className="space-y-4 ml-2">
                                    {selectedNode.config.map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-black text-blue-600">{idx + 1}</span>
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-slate-700 font-medium">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Case Study */}
                            <section className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb size={18} className="text-amber-600" />
                                    <h3 className="text-lg font-black text-amber-900 tracking-tight">Real-World Case Study</h3>
                                </div>
                                <p className="text-amber-800 leading-relaxed font-medium italic">
                                    "{selectedNode.caseStudy}"
                                </p>
                            </section>

                            {/* Meta & Technical Details */}
                            <section className="border-t border-slate-100 pt-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen size={18} className="text-purple-500" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Engine Details</h3>
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm text-green-400">
                                    <span className="text-slate-400 select-none">$&gt; </span>{selectedNode.technical}
                                </div>
                            </section>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
