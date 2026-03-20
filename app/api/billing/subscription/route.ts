
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { saasRazorpay } from "../../../../lib/saas/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { plan: planName, cycle = "monthly" } = await req.json();

        if (!planName) return NextResponse.json({ error: "Plan name is required" }, { status: 400 });

        // 1. Find plan from DB (preferred - has Razorpay IDs synced via Super Admin)
        const dbPlan = await prisma.subscriptionPlan.findFirst({
            where: {
                name: { equals: planName, mode: "insensitive" },
                is_active: true,
            }
        });

        let razorpayPlanId: string | null = null;

        if (dbPlan) {
            razorpayPlanId = cycle === "yearly"
                ? (dbPlan as any).razorpay_yearly_plan_id
                : (dbPlan as any).razorpay_monthly_plan_id;
        }

        // 2. Fallback to env vars (legacy support)
        if (!razorpayPlanId) {
            const planKey = planName.toUpperCase();
            const envMap: Record<string, string | undefined> = {
                LITE: process.env.RAZORPAY_PLAN_LITE,
                GROWTH: process.env.RAZORPAY_PLAN_GROWTH,
                PRO: process.env.RAZORPAY_PLAN_PRO,
                SCALE: process.env.RAZORPAY_PLAN_SCALE,
                ENTERPRISE: process.env.RAZORPAY_PLAN_ENTERPRISE,
            };
            razorpayPlanId = envMap[planKey] || null;
        }

        if (!razorpayPlanId) {
            return NextResponse.json({
                error: `Plan "${planName}" has not been synced to Razorpay yet. Please go to Super Admin → Finance → Subscription Plans and click "Sync to Razorpay" for this plan.`
            }, { status: 400 });
        }

        // 3. Create Razorpay Subscription
        const sub = await saasRazorpay.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_notify: 1,
            quantity: 1,
            total_count: cycle === "yearly" ? 10 : 120,
            addons: [],
            notes: { source: "grafty_bsp_saas", plan: planName, cycle }
        });

        // 4. Update workspace with pending subscription
        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                subscription_id: sub.id,
                subscription_status: "created"
            }
        });

        return NextResponse.json({ subscriptionId: sub.id });

    } catch (error: any) {
        console.error("Subscription Error:", error);
        return NextResponse.json({
            error: error?.error?.description || error.message || "Failed to create subscription"
        }, { status: 500 });
    }
}
