
import Razorpay from "razorpay";

// Initialize properly with Environment Variables
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

export const saasRazorpay = new Razorpay({
    key_id: key_id || "test_key", // Fallback for build
    key_secret: key_secret || "test_secret"
});

export const PLANS = {
    FREE: {
        id: "free",
        name: "Free Plan",
        price: 0,
        limits: { contacts: 100, campaigns: 1 }
    },
    PRO: {
        id: "plan_PqCXXXexample", // Replace with real Razorpay Plan ID
        name: "Pro Plan",
        price: 2999, // INR
        limits: { contacts: 10000, campaigns: 100 }
    },
    ENTERPRISE: {
        id: "plan_EntXXXexample",
        name: "Enterprise",
        price: 9999, // INR
        limits: { contacts: 100000, campaigns: 1000 }
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

export async function createSubscription(planId: string) {
    return await saasRazorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: 120, // 10 years
        addons: [],
        notes: {
            source: "wabot_bsp_saas"
        }
    });
}
