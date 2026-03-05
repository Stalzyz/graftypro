
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
    }
};
