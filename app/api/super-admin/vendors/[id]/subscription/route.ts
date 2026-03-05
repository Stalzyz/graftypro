import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";

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

// PATCH: Override subscription
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
        action, // upgrade | downgrade | extend_trial | cancel | reactivate | force_renewal | set_custom_price
        plan,
        plan_id,
        trial_days,
        custom_price,
        renewal_date,
        reason
    } = body;

    const ws = await prisma.workspace.findUnique({ where: { id: params.id } });
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = {};
    let auditDetails: any = { action, reason };

    switch (action) {
        case "upgrade":
        case "downgrade":
            if (plan) updateData.plan = plan;
            if (plan_id) updateData.current_plan_id = plan_id;
            updateData.subscription_status = "active";
            auditDetails.old_plan = ws.plan;
            auditDetails.new_plan = plan;
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

    await prisma.workspace.update({ where: { id: params.id }, data: updateData });

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
}
