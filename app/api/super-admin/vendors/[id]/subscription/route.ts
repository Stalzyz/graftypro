import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { validateAdminVendorMutation } from "../../../../../../lib/admin/guard";
import { normalizePlanEnum } from "../../../../../../lib/billing/plans";
import { revalidatePath } from "next/cache";
import { systemEmailQueue } from "../../../../../../lib/queue";

export const dynamic = "force-dynamic";

// GET: Full subscription details for a vendor
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ws = await prisma.workspace.findUnique({
        where: { id: params.id },
        select: {
            plan: true,
            current_plan_id: true,
            subscription_id: true,
            subscription_status: true,
            trial_ends_at: true,
            settings: true,
            plan_details: {
                select: { name: true, price: true, billing_cycle: true }
            }
        }
    });

    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ subscription: ws });
}

// PATCH: Override subscription (Surgical Fix)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { action, plan, plan_id, trial_days, custom_price, renewal_date, reason } = body;

        // 🛡️ SECURITY GUARD: Scope check
        const ws = await validateAdminVendorMutation(session, params.id);

        const updateData: any = {};
        let auditDetails: any = { action, reason };

        switch (action) {
            case "upgrade":
            case "downgrade":
                if (plan || plan_id) {
                    // Pull full package data if we only have the ID or Name
                    const dbPlan = await prisma.subscriptionPlan.findFirst({
                        where: plan_id ? { id: plan_id } : { name: { equals: plan, mode: 'insensitive' } }
                    });

                    if (dbPlan) {
                        updateData.current_plan_id = dbPlan.id;
                        updateData.plan = normalizePlanEnum(dbPlan.name);
                    } else if (plan) {
                        // Fallback fallback: Clear the DB ID pointer to drop Pro modules
                        updateData.plan = normalizePlanEnum(plan);
                        updateData.current_plan_id = null;
                    }
                }
                updateData.subscription_status = "active";
                auditDetails.old_plan = ws.plan;
                auditDetails.new_plan = plan || plan_id;
                
                // Enqueue Email Notification if it's a downgrade
                if (auditDetails.old_plan !== "FREE" && (auditDetails.new_plan === "FREE" || (dbPlan && dbPlan.name.toUpperCase() === "FREE"))) {
                    const owner = await prisma.user.findFirst({ where: { workspace_id: params.id, role: "OWNER" } });
                    if (owner) {
                        await systemEmailQueue?.add("send-system-email", {
                            type: "PLAN_DOWNGRADE",
                            payload: {
                                workspaceId: params.id,
                                to: owner.email,
                                vendorName: owner.first_name || "Valued Customer",
                                oldPlan: auditDetails.old_plan,
                                newPlan: updateData.plan
                            }
                        });
                    }
                }
                break;

            case "extend_trial":
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + (trial_days || 7));
                updateData.trial_ends_at = trialEnd;
                auditDetails.trial_days = trial_days;
                break;

            case "cancel":
                updateData.subscription_status = "cancelled";
                updateData.plan = "FREE";
                updateData.current_plan_id = null;
                auditDetails.old_status = ws.subscription_status;
                
                // Enqueue Email Notification for Cancel
                const cancelOwner = await prisma.user.findFirst({ where: { workspace_id: params.id, role: "OWNER" } });
                if (cancelOwner) {
                    await systemEmailQueue?.add("send-system-email", {
                        type: "PLAN_DOWNGRADE",
                        payload: {
                            workspaceId: params.id,
                            to: cancelOwner.email,
                            vendorName: cancelOwner.first_name || "Valued Customer",
                            oldPlan: ws.plan,
                            newPlan: "CANCELLED / FREE"
                        }
                    });
                }
                break;

            case "reactivate":
                updateData.subscription_status = "active";
                auditDetails.old_status = ws.subscription_status;
                break;

            case "force_renewal":
                updateData.subscription_status = "active";
                if (renewal_date) {
                    const settings: any = ws.settings || {};
                    settings.renewal_override = renewal_date;
                    updateData.settings = settings;
                }
                break;

            case "set_custom_price":
                const settings2: any = ws.settings || {};
                settings2.custom_price = custom_price;
                updateData.settings = settings2;
                auditDetails.custom_price = custom_price;
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // 🚀 DATABASE COMMIT
        await prisma.workspace.update({ where: { id: params.id }, data: updateData });

        // 🚀 CACHE BUSTER: Ensure the vendor dashboard reflects the new subscription INSTANTLY
        try {
            revalidatePath("/dashboard");
        } catch {}

        // 🛡️ FINAL AUDIT
        // @ts-ignore
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: `SUBSCRIPTION_${action.toUpperCase()}`,
                resource: params.id,
                details: auditDetails
            }
        });

        return NextResponse.json({ success: true, action });
    } catch (e: any) {
        console.error("Subscription Override Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

