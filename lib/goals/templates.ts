
// This file defines the blueprints for generating flows based on Goals.

export interface FlowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: any;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: string;
}

export const GOAL_TEMPLATES = {
    BOOK_APPOINTMENT: {
        name: "Standard Appointment Booking",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: '1',
                        type: 'message',
                        position: { x: 250, y: 0 },
                        data: { text: `Hello! 👋 Welcome to our business. Would you like to book an appointment with us?` }
                    },
                    {
                        id: '2',
                        type: 'option_buttons',
                        position: { x: 250, y: 150 },
                        data: {
                            text: "Please select an option:",
                            options: ["Book Now", "View Services", "Talk to Human"]
                        }
                    },
                    {
                        id: '3',
                        type: 'message',
                        position: { x: 0, y: 300 },
                        data: { text: "Great! Please select a preferred date below." }
                    }
                ] as FlowNode[],
                edges: [
                    { id: 'e1-2', source: '1', target: '2' },
                    { id: 'e2-3', source: '2', target: '3', label: 'Book Now' }
                ] as FlowEdge[]
            }
        }
    },

    COLLECT_PAYMENT: {
        name: "Payment Collection Reminder",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: '1',
                        type: 'message',
                        position: { x: 250, y: 0 },
                        data: { text: `Hi, this is a gentle reminder that your payment of $${config.amount} is pending.` }
                    },
                    {
                        id: '2',
                        type: 'payment_cta',
                        position: { x: 250, y: 150 },
                        data: { amount: config.amount, link: config.link, buttonText: "Pay Now" }
                    }
                ],
                edges: [
                    { id: 'e1-2', source: '1', target: '2' }
                ]
            }
        }
    },

    SELL_PRODUCT: {
        name: "Sell Products (Commerce)",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: '1',
                        type: 'message',
                        position: { x: 250, y: 0 },
                        data: { text: "Check out our latest collection! 👇" }
                    },
                    {
                        id: '2',
                        type: 'product_list',
                        position: { x: 250, y: 150 },
                        data: {
                            header: "Featured Products",
                            items: [
                                { id: "p1", title: "Premium Watch", description: "$150", actionId: "buy_p1" },
                                { id: "p2", title: "Sunglasses", description: "$50", actionId: "buy_p2" }
                            ]
                        }
                    },
                    {
                        id: '3',
                        type: 'message',
                        position: { x: 250, y: 300 },
                        data: { text: "Excellent choice! Here is your secure payment link: https://pay.link/demo" }
                    }
                ],
                edges: [
                    { id: 'e1-2', source: '1', target: '2' },
                    { id: 'e2-3', source: '2', target: '3' }
                ]
            }
        }
    },

    VENDOR_ONBOARDING: {
        name: "Vendor Onboarding Flow",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: 'start',
                        type: 'start',
                        position: { x: 400, y: 0 },
                        data: { label: "Start Onboarding" }
                    },
                    {
                        id: 'welcome',
                        type: 'message',
                        position: { x: 400, y: 100 },
                        data: { 
                            text: "Welcome to our BSP Platform! 🚀\n\nI'm here to help you get your WhatsApp Business API set up and ready to go.",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_features', title: 'Explore Features 🌟' } },
                                { type: 'reply', reply: { id: 'btn_onboard', title: 'Start Onboarding 📝' } },
                                { type: 'reply', reply: { id: 'btn_support', title: 'Talk to Support 🎧' } }
                            ]
                        }
                    },
                    {
                        id: 'features',
                        type: 'message',
                        position: { x: 100, y: 300 },
                        data: { 
                            text: "Our platform offers:\n\n✅ Visual Flow Builder\n✅ Broadcast Campaigns\n✅ CRM Integration\n✅ Automated Drip Sequences\n✅ Native Payments\n\nWould you like to start your 7-day free trial?",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_onboard', title: 'Yes, Start Trial! 🚀' } },
                                { type: 'reply', reply: { id: 'btn_back', title: 'Main Menu ⬅️' } }
                            ]
                        }
                    },
                    {
                        id: 'collect_name',
                        type: 'message',
                        position: { x: 400, y: 300 },
                        data: { text: "Great! Let's get started. What is your Business Name?" }
                    },
                    {
                        id: 'save_lead',
                        type: 'action',
                        position: { x: 400, y: 450 },
                        data: { 
                            actionType: 'save_to_crm',
                            label: "Sync to CRM"
                        }
                    },
                    {
                        id: 'onboarding_info',
                        type: 'message',
                        position: { x: 400, y: 550 },
                        data: { 
                            text: "Business Name Captured! ✅\n\nTo complete your setup, we need to verify your WABA (WhatsApp Business Account).\n\nPlease have your Business Manager ID ready.",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_docs', title: 'View Guide 📖' } },
                                { type: 'reply', reply: { id: 'btn_ready', title: 'I am Ready! ✅' } }
                            ]
                        }
                    },
                    {
                        id: 'support_node',
                        type: 'action',
                        position: { x: 700, y: 300 },
                        data: { 
                            actionType: 'send_email',
                            emailSubject: "Vendor Support Request",
                            emailAddress: "admin@grafty.pro",
                            label: "Notify Admin"
                        }
                    },
                    {
                        id: 'support_msg',
                        type: 'message',
                        position: { x: 700, y: 450 },
                        data: { text: "I've notified our support team. An agent will reach out to you on this number shortly! 🙏" }
                    }
                ],
                edges: [
                    { id: 'e-s-w', source: 'start', target: 'welcome' },
                    { id: 'e-w-f', source: 'welcome', target: 'features', label: 'Explore Features 🌟' },
                    { id: 'e-w-o', source: 'welcome', target: 'collect_name', label: 'Start Onboarding 📝' },
                    { id: 'e-w-s', source: 'welcome', target: 'support_node', label: 'Talk to Support 🎧' },
                    { id: 'e-f-o', source: 'features', target: 'collect_name', label: 'Yes, Start Trial! 🚀' },
                    { id: 'e-f-b', source: 'features', target: 'welcome', label: 'Main Menu ⬅️' },
                    { id: 'e-c-s', source: 'collect_name', target: 'save_lead' },
                    { id: 'e-s-i', source: 'save_lead', target: 'onboarding_info' },
                    { id: 'e-sn-sm', source: 'support_node', target: 'support_msg' }
                ]
            }
        }
    },

    AFFILIATE_PARTNER: {
        name: "Affiliate Partner Dashboard Flow",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: 'start',
                        type: 'start',
                        position: { x: 400, y: 0 },
                        data: { label: "Partner Access" }
                    },
                    {
                        id: 'welcome',
                        type: 'message',
                        position: { x: 400, y: 100 },
                        data: { 
                            text: "Hello Partner! 👋 Ready to scale your earnings today?\n\nSelect an option below to manage your affiliate account.",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_earnings', title: 'My Earnings 💰' } },
                                { type: 'reply', reply: { id: 'btn_link', title: 'Referral Link 🔗' } },
                                { type: 'reply', reply: { id: 'btn_upgrade', title: 'Scale to Platform 🚀' } }
                            ]
                        }
                    },
                    {
                        id: 'earnings_msg',
                        type: 'message',
                        position: { x: 100, y: 300 },
                        data: { 
                            text: "📊 *Your Performance Snapshot*\n\nTotal Referrals: 12\nPending Commission: ₹4,500\nTotal Withdrawn: ₹12,000\n\nWithdrawals are processed every Friday. ✅",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_back', title: 'Back to Menu ⬅️' } }
                            ]
                        }
                    },
                    {
                        id: 'link_msg',
                        type: 'message',
                        position: { x: 400, y: 300 },
                        data: { 
                            text: "🔗 *Your Unique Referral Link*\n\nhttps://grafty.pro/register?ref={{referral_code}}\n\nShare this link with potential vendors. You get 20% lifetime commission on every successful subscription! 💸"
                        }
                    },
                    {
                        id: 'upgrade_info',
                        type: 'message',
                        position: { x: 700, y: 300 },
                        data: { 
                            text: "🚀 *Scale to Platform Partner*\n\nGet your own white-labeled dashboard, custom domain, and the ability to set your own markup.\n\nRequirement: 10+ active vendors.\n\nWould you like to request an upgrade?",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_req_upgrade', title: 'Request Upgrade' } },
                                { type: 'reply', reply: { id: 'btn_back', title: 'Main Menu ⬅️' } }
                            ]
                        }
                    },
                    {
                        id: 'req_upgrade_node',
                        type: 'action',
                        position: { x: 700, y: 450 },
                        data: { 
                            actionType: 'webhook',
                            label: "Notify Admin"
                        }
                    },
                    {
                        id: 'upgrade_done',
                        type: 'message',
                        position: { x: 700, y: 550 },
                        data: { text: "Upgrade request sent! 🚀 Our team will review your account performance and get back to you within 24 hours." }
                    }
                ],
                edges: [
                    { id: 'e-s-w', source: 'start', target: 'welcome' },
                    { id: 'e-w-e', source: 'welcome', target: 'earnings_msg', label: 'My Earnings 💰' },
                    { id: 'e-w-l', source: 'welcome', target: 'link_msg', label: 'Referral Link 🔗' },
                    { id: 'e-w-u', source: 'welcome', target: 'upgrade_info', label: 'Scale to Platform 🚀' },
                    { id: 'e-e-b', source: 'earnings_msg', target: 'welcome', label: 'Back to Menu ⬅️' },
                    { id: 'e-u-b', source: 'upgrade_info', target: 'welcome', label: 'Main Menu ⬅️' },
                    { id: 'e-r-d', source: 'req_upgrade_node', target: 'upgrade_done' }
                ]
            }
        }
    },
    LEAD_GEN_META: {
        name: "Monster Lead Gen (Meta Flow)",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: 'start',
                        type: 'start',
                        position: { x: 400, y: 0 },
                        data: { label: "Lead Gen Trigger" }
                    },
                    {
                        id: 'intro',
                        type: 'message',
                        position: { x: 400, y: 100 },
                        data: { 
                            text: "Hi! 👋 We'd love to learn more about your needs. Could you spare 30 seconds to fill out this quick form?",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_start_flow', title: 'Start Form 📝' } }
                            ]
                        }
                    },
                    {
                        id: 'meta_flow_node',
                        type: 'meta_flow',
                        position: { x: 400, y: 300 },
                        data: {
                            flowId: config.flowId || "1234567890", // Default or user-provided
                            flowCTA: "Fill Details",
                            text: "Please tap the button below to provide your business information. It's safe and native! 🛡️",
                            flowHeader: "Business Inquiry",
                            flowFooter: "Powered by Grafty"
                        }
                    },
                    {
                        id: 'success_msg',
                        type: 'message',
                        position: { x: 400, y: 500 },
                        data: { text: "Thank you! Check your WhatsApp — we've captured your details. Our agent will call you shortly. ✅" }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'intro' },
                    { id: 'e2', source: 'intro', target: 'meta_flow_node', label: 'Start Form 📝' },
                    { id: 'e3', source: 'meta_flow_node', target: 'success_msg' }
                ]
            }
        }
    },
    BOOKING_META: {
        name: "Monster Appointment Booking (Meta Flow)",
        generate: (workspaceId: string, config: any) => {
            return {
                nodes: [
                    {
                        id: 'start',
                        type: 'start',
                        position: { x: 400, y: 0 },
                        data: { label: "Booking Trigger" }
                    },
                    {
                        id: 'intro',
                        type: 'message',
                        position: { x: 400, y: 100 },
                        data: { 
                            text: "Ready to schedule your visit? 📅\n\nPlease use the interactive form below to select your service and preferred time.",
                            buttons: [
                                { type: 'reply', reply: { id: 'btn_open_booking', title: 'Open Booking Form' } }
                            ]
                        }
                    },
                    {
                        id: 'booking_flow',
                        type: 'meta_flow',
                        position: { x: 400, y: 300 },
                        data: {
                            flowId: config.flowId || "booking_flow_id",
                            flowCTA: "Select Time Slot",
                            text: "Our calendar is synced! Tap below to see real-time availability.",
                            flowHeader: "Schedule Appointment",
                        }
                    },
                    {
                        id: 'save_data',
                        type: 'action',
                        position: { x: 400, y: 450 },
                        data: { actionType: 'save_to_crm', label: "Sync Booking Data" }
                    },
                    {
                        id: 'confirmation',
                        type: 'message',
                        position: { x: 400, y: 600 },
                        data: { text: "✅ *Appointment Received!*\n\nWe have received your request for {{service}} on {{date}}. You will receive a confirmation message once our team approves it." }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'intro' },
                    { id: 'e2', source: 'intro', target: 'booking_flow' },
                    { id: 'e3', source: 'booking_flow', target: 'save_data' },
                    { id: 'e4', source: 'save_data', target: 'confirmation' }
                ]
            }
        }
    }
};

export const SIMPLE_FLOW_TEMPLATES = [
    {
        id: 'BSP_SUPPORT',
        name: 'BSP Master Support',
        description: 'Automated triage & ticketing for platform clients.',
        iconColor: 'text-green-500',
        script: {
            name: "BSP Support Desk",
            trigger_keyword: "support",
            steps: [
                { id: "welcome", text: "Welcome to BSP Support! How can we help you today?", options: [{ label: "Technical Issue", next: "tech" }, { label: "Billing", next: "bill" }, { label: "Talk to Agent", next: "human" }] },
                { id: "tech", text: "Please describe your technical issue briefly, and our engineers will review it." },
                { id: "bill", text: "For billing inquiries, please check your dashboard or reply with your invoice number.", actionType: "sync_data", config: { url: "https://api.grafty.pro/billing/status", method: "GET", syncKey: "billing_status" } },
                { id: "human", text: "Transferring you to a live agent. Please hold... 🎧" }
            ]
        }
    },
    {
        id: 'VENDOR_ONBOARDING',
        name: 'Vendor Onboarding',
        description: 'Automated signup & CRM lead capture for new vendors.',
        iconColor: 'text-blue-500',
        script: {
            name: "Vendor Onboarding (Quick)",
            trigger_keyword: "start",
            steps: [
                { id: "welcome", text: "Welcome! Are you ready to start your vendor onboarding?", options: [{ label: "Yes", next: "info" }, { label: "Support", next: "help" }] },
                { id: "info", text: "Great! What is your business name?" },
                { id: "help", text: "Notified admin! Someone will call you." }
            ]
        }
    },
    {
        id: 'AFFILIATE_PARTNER',
        name: 'Affiliate Portal',
        description: 'Self-service dashboard for affiliate partners.',
        iconColor: 'text-purple-500',
        script: {
            name: "Affiliate Portal (Quick)",
            trigger_keyword: "partner",
            steps: [
                { id: "menu", text: "Partner Menu: \n1. Earnings \n2. Links", options: [{ label: "Earnings", next: "earn" }, { label: "Link", next: "link" }] },
                { id: "earn", text: "Your pending balance: ₹4,500" },
                { id: "link", text: "Your link: https://grafty.pro/ref/{{contact_id}}" }
            ]
        }
    }
];
