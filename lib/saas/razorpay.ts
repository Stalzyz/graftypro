import Razorpay from "razorpay";
import { prisma } from "../db";

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
    LITE: {
        id: process.env.RAZORPAY_PLAN_LITE || "plan_lite_default",
        name: "LITE",
        price: 999,
        limits: { contacts: 1000, campaigns: 5, messages: 2500 }
    },
    GROWTH: {
        id: process.env.RAZORPAY_PLAN_GROWTH || "plan_growth_default",
        name: "GROWTH",
        price: 2499,
        limits: { contacts: 10000, campaigns: 25, messages: 25000 }
    },
    PRO: {
        id: process.env.RAZORPAY_PLAN_PRO || "plan_pro_default",
        name: "PRO",
        price: 4999,
        limits: { contacts: 50000, campaigns: 100, messages: 100000 }
    },
    SCALE: {
        id: process.env.RAZORPAY_PLAN_SCALE || "plan_scale_default",
        name: "SCALE",
        price: 9999,
        limits: { contacts: 200000, campaigns: 500, messages: 500000 }
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

export async function createSubscription(planIdOrRzpId: string) {
    // If it doesn't start with 'plan_', assume it's a DB ID and we need to fetch the synced ID
    let finalRzpId = planIdOrRzpId;
    
    if (!planIdOrRzpId.startsWith('plan_')) {
        const dbPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planIdOrRzpId } });
        finalRzpId = (dbPlan as any)?.razorpay_monthly_plan_id || "plan_lite_default";
    }

    return await saasRazorpay.subscriptions.create({
        plan_id: finalRzpId,
        customer_notify: 1,
        quantity: 1,
        total_count: 120, // 10 years
        addons: [],
        notes: {
            source: "grafty_bsp_saas",
            plan_id: planIdOrRzpId
        }
    });
}
