
import Razorpay from "razorpay";

// Initialize properly with Environment Variables
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

export const saasRazorpay = new Razorpay({
    key_id: key_id || "test_key", // Fallback for build
    key_secret: key_secret || "test_secret"
});

// Alias for backward compatibility
export const razorpay = saasRazorpay;

export const PLANS = {
    PRIME_STARTER: {
        id: "plan_starter_default",
        name: "PRIME STARTER",
        price: 1999,
        limits: { contacts: 1000, campaigns: 5, messages: 2500 }
    },
    ACCELERATOR_PRO: {
        id: process.env.RAZORPAY_PLAN_PRO || "plan_pro_default",
        name: "ACCELERATOR PRO",
        price: 4999,
        limits: { contacts: 10000, campaigns: 25, messages: 25000 }
    },
    ULTIMATE_SCALE: {
        id: process.env.RAZORPAY_PLAN_ENTERPRISE || "plan_enterprise_default",
        name: "ULTIMATE SCALE",
        price: 12999,
        limits: { contacts: 100000, campaigns: 100, messages: 1000000 }
    }
};

export async function createCustomer(name: string, email: string, contact: string) {
    try {
        return await saasRazorpay.customers.create({
            name,
            email,
            contact
        });
    } catch (e) {
        console.error("Error creating customer", e);
        return null;
    }
}

export async function createOrder(amount: number, currency: string = "INR", notes: any = {}) {
    return await saasRazorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency,
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes
    });
}

export async function createSubscription(planId: string) {
    return await saasRazorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: 120, // 10 years
        addons: [],
        notes: {
            source: "grafty_bsp_saas"
        }
    });
}
