
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { createSubscription, PLANS } from "../../../../lib/saas/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { plan } = await req.json();

        // 1. Map Plan Name to ID
        let planId = "";
        if (plan === "PRO") planId = PLANS.PRO.id;
        else if (plan === "ENTERPRISE") planId = PLANS.ENTERPRISE.id;
        else return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });

        // 2. Create Subscription
        // Note: You must replace 'plan_PqCXXXexample' in lib/saas/razorpay.ts with a REAL Plan ID from Razorpay Dashboard
        const sub = await createSubscription(planId);

        // 3. Update Workspace with pending subscription
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
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}
