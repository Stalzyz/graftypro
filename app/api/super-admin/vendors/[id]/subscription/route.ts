import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { validateAdminVendorMutation } from "../../../../../../lib/admin/guard";
import { normalizePlanEnum } from "../../../../../../lib/billing/plans";
import { revalidatePath } from "next/cache";

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
                        // Fallback fallback
                        updateData.plan = normalizePlanEnum(plan);
                    }
                }
                updateData.subscription_status = "active";
                auditDetails.old_plan = ws.plan;
                auditDetails.new_plan = plan || plan_id;
                break;

            case "extend_trial":
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + (trial_days || 7));
                updateData.trial_ends_at = trialEnd;
                auditDetails.trial_days = trial_days;
                break;

            case "cancel":
                updateData.subscription_status = "cancelled";
                auditDetails.old_status = ws.subscription_status;
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

