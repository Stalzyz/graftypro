import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/super-admin/billing/sync-razorpay
 * Syncs a SubscriptionPlan to Razorpay - creates the recurring plan via API
 * and stores the plan_id back into the DB.
 */
export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { plan_id, cycle, manual_rzp_id } = await req.json(); // cycle: "monthly" | "yearly"

        if (!plan_id || !cycle) {
            return NextResponse.json({ error: "plan_id and cycle are required" }, { status: 400 });
        }

        // Load plan from DB
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: plan_id } });
        if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

        let razorpayPlanId = manual_rzp_id;

        if (!razorpayPlanId) {
            // Priority 1: Check Global System Settings for Razorpay Keys
            const systemConfig = await prisma.systemConfig.findFirst({
                where: { id: "global" }
            });

            let finalKeyId = process.env.RAZORPAY_KEY_ID;
            let finalKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (systemConfig?.payment_gateways) {
                const gateways = typeof systemConfig.payment_gateways === 'string'
                    ? JSON.parse(systemConfig.payment_gateways as string)
                    : systemConfig.payment_gateways as any[];

                const rzpConfig = Array.isArray(gateways)
                    ? gateways.find((g: any) => g.provider === "Razorpay")
                    : null;

                if (rzpConfig?.key_id && rzpConfig?.key_secret) {
                    finalKeyId = rzpConfig.key_id;
                    finalKeySecret = rzpConfig.key_secret;
                    console.log("[RAZORPAY_SYNC] Using keys from Super Admin Panel...");
                }
            }

            if (!finalKeyId || !finalKeySecret) {
                return NextResponse.json({ error: "Razorpay credentials not configured in system settings or environment variables." }, { status: 400 });
            }

            const razorpay = new Razorpay({
                key_id: finalKeyId!,
                key_secret: finalKeySecret!,
            });

            const priceInPaise = cycle === "monthly"
                ? Math.round(Number(plan.monthly_price) * 100)
                : Math.round(Number(plan.yearly_price) * 100);

            if (priceInPaise <= 0) {
                return NextResponse.json({ error: "Plan price must be greater than 0" }, { status: 400 });
            }

            // Create plan in Razorpay
            const rzpPlan = await (razorpay.plans as any).create({
                period: cycle === "monthly" ? "monthly" : "yearly",
                interval: 1,
                item: {
                    name: `${plan.name} - ${cycle === "monthly" ? "Monthly" : "Yearly"}`,
                    amount: priceInPaise,
                    currency: "INR",
                    description: plan.description || `Grafty ${plan.name} Plan`,
                },
                notes: {
                    plan_db_id: plan_id,
                    plan_name: plan.name,
                    cycle,
                }
            });
            razorpayPlanId = rzpPlan.id;
        }

        // Store the Razorpay Plan ID back in DB
        const updateData: any = cycle === "monthly"
            ? { razorpay_monthly_plan_id: razorpayPlanId }
            : { razorpay_yearly_plan_id: razorpayPlanId };

        const updated = await prisma.subscriptionPlan.update({
            where: { id: plan_id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            razorpay_plan_id: razorpayPlanId,
            plan: updated,
        });

    } catch (e: any) {
        console.error("Razorpay Sync Error:", e);
        return NextResponse.json({ error: e.error?.description || e.message || "Sync failed" }, { status: 500 });
    }
}
