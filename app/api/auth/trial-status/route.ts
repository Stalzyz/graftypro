import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { id: true, trial_ends_at: true, subscription_status: true, current_plan_id: true, plan: true, created_at: true }
        });
        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        const now = new Date();
        
        // --- Fail-Proof Security Logic ---
        // Fetch full user record to acquire email (headers omit it for edge compatibility)
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { email: true }
        });

        if (!dbUser?.email) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        const userEmail = AuthSecurityService.normalizeEmail(dbUser.email);
        const isFreePlanId = workspace.current_plan_id && workspace.plan === 'FREE';
        const hasPaidPlan = (!!workspace.current_plan_id && !isFreePlanId) || (workspace.plan && workspace.plan !== 'FREE');
        
        let trialEnd = workspace.trial_ends_at;

        if (!hasPaidPlan) {
            // Force verify against TrialLock to prevent bypassing trial limits
            const lockedRecord = await prisma.trialLock.findUnique({
                where: { email: userEmail }
            });

            if (lockedRecord) {
                trialEnd = lockedRecord.trial_ends_at;
                // If the workspace date differs from the lock, update the workspace (Self-Healing)
                if (!workspace.trial_ends_at || workspace.trial_ends_at.getTime() !== trialEnd.getTime()) {
                    await prisma.workspace.update({
                        where: { id: workspace.id },
                        data: { trial_ends_at: trialEnd }
                    });
                    console.log(`[Trial Security] Corrected workspace ${workspace.id} trial from lock table.`);
                }
            } else if (!trialEnd) {
                // Fallback (Should rarely happen with new registration flow)
                trialEnd = new Date(workspace.created_at.getTime() + 7 * 24 * 60 * 60 * 1000);
                try {
                    await prisma.trialLock.upsert({
                        where: { email: userEmail },
                        update: {},
                        create: { email: userEmail, trial_ends_at: trialEnd }
                    });
                } catch (err) {
                    console.error("[Trial Security] Failed to upsert trial lock:", err);
                }
            }
        }
        const headers = { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" };
        
        if (hasPaidPlan) return NextResponse.json({ 
            status: "paid", 
            trial_expired: false,
            _debug: { plan: workspace.plan, current_plan_id: workspace.current_plan_id, isFreePlanId }
        }, { headers });
        if (!trialEnd) return NextResponse.json({ status: "no_trial", trial_expired: true, days_left: 0 }, { headers });
        
        // Calculate dynamic precision: if less than 24 hours left, we might want to show hours,
        // but for now we stick to days.
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const expired = trialEnd < now;

        return NextResponse.json({ 
            status: expired ? "expired" : "trial", 
            trial_expired: expired, 
            trial_ends_at: trialEnd.toISOString(), 
            days_left: Math.max(0, daysLeft),
            server_time: now.toISOString()
        }, { headers });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
