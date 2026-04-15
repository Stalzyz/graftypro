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
    STARTER: {
        id: process.env.RAZORPAY_PLAN_STARTER || "plan_starter_default",
        name: "STARTER",
        price: 999,
        limits: { contacts: 2000, campaigns: 10, messages: 5000 }
    },
    GROWTH: {
        id: process.env.RAZORPAY_PLAN_GROWTH || "plan_growth_default",
        name: "GROWTH",
        price: 2499,
        limits: { contacts: 15000, campaigns: 50, messages: 35000 }
    },
    ENTERPRISE: {
        id: process.env.RAZORPAY_PLAN_ENTERPRISE || "plan_enterprise_default",
        name: "ENTERPRISE",
        price: 14999,
        limits: { contacts: 500000, campaigns: 1000, messages: 1000000 }
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

export async function createTopupLink(workspaceId: string, amount: number, billingDetails?: any) {
    const expiredAt = Math.floor(Date.now() / 1000) + (48 * 60 * 60); // 48 Hours

    return await saasRazorpay.paymentLink.create({
        amount: amount * 100,
        currency: "INR",
        accept_partial: false,
        expire_by: expiredAt,
        reference_id: `TOPUP_${workspaceId}_${Date.now()}`,
        description: `WhatsApp Credits Top-up (₹${amount})`,
        customer: {
            name: billingDetails?.name || "Grafty Vendor",
            email: billingDetails?.email || "",
            contact: billingDetails?.phone || ""
        },
        notify: {
            sms: true,
            email: true
        },
        reminder_enable: true,
        notes: {
            source: "SMART_TOPUP",
            workspace_id: workspaceId,
            topup_amount: amount.toString()
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?status=success`,
        callback_method: "get"
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
