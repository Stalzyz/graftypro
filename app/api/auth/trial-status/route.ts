
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: {
                trial_ends_at: true,
                subscription_status: true,
                current_plan_id: true,
            }
        });

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        const now = new Date();
        const trialEnd = workspace.trial_ends_at;
        const hasPaidPlan = workspace.current_plan_id && workspace.subscription_status === "active";

        // If they have an active paid plan, trial is irrelevant
        if (hasPaidPlan) {
            return NextResponse.json({ status: "paid", trial_expired: false });
        }

        if (!trialEnd) {
            // No trial set — treat as trial_expired to prompt upgrade
            return NextResponse.json({ status: "no_trial", trial_expired: true, days_left: 0 });
        }

        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const expired = trialEnd < now;

        return NextResponse.json({
            status: expired ? "expired" : "trial",
            trial_expired: expired,
            trial_ends_at: trialEnd.toISOString(),
            days_left: Math.max(0, daysLeft),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
