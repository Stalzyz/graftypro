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
            select: { id: true, trial_ends_at: true, subscription_status: true, current_plan_id: true, plan: true, created_at: true, plan_details: { select: { name: true } } }
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
        
        // Correctly check if the linked SubscriptionPlan is actually 'Free'
        // If they have plan_details, use its name. Otherwise fallback to the legacy enum 'plan'
        const planName = (workspace.plan_details?.name || workspace.plan || '').toUpperCase();
        const isFreePlanId = planName === 'FREE';
        
        const isNegativeStatus = workspace.subscription_status && ['halted', 'cancelled', 'expired', 'past_due', 'inactive'].includes(workspace.subscription_status.toLowerCase());
        
        const hasPaidPlan = ((!!workspace.current_plan_id && !isFreePlanId) || (!isFreePlanId)) && !isNegativeStatus;
        
        console.log(`[TRIAL_DEBUG] workspaceId=${workspace.id}, current_plan_id=${workspace.current_plan_id}, planName=${planName}, isFreePlanId=${isFreePlanId}, hasPaidPlan=${hasPaidPlan}`);

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
import { SubscriptionNotificationService } from "../../../../lib/services/subscription-notification";

        const subInfo = SubscriptionNotificationService.getSubscriptionInfo(workspace);

        if (subInfo.is_expiring_soon || subInfo.is_expired) {
            SubscriptionNotificationService.checkAndSendExpiryEmail(user.workspaceId).catch(err => {
                console.error("[TRIAL_STATUS] Async email notification error:", err);
            });
        }

        const headers = { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" };
        
        if (hasPaidPlan) {
            return NextResponse.json({ 
                status: subInfo.is_expired ? "expired" : "paid", 
                trial_expired: subInfo.is_expired, 
                plan: workspace.plan_details?.name || workspace.plan,
                days_left: subInfo.days_left,
                subscription_ends_at: subInfo.subscription_ends_at,
                is_expiring_soon: subInfo.is_expiring_soon,
                server_time: now.toISOString()
            }, { headers });
        }
        if (!trialEnd) return NextResponse.json({ status: "no_trial", trial_expired: true, days_left: 0 }, { headers });
        
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const expired = trialEnd < now;

        return NextResponse.json({ 
            status: expired ? "expired" : "trial", 
            trial_expired: expired, 
            trial_ends_at: trialEnd.toISOString(), 
            subscription_ends_at: subInfo.subscription_ends_at,
            days_left: Math.max(0, daysLeft),
            is_expiring_soon: daysLeft <= 7,
            server_time: now.toISOString()
        }, { headers });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
