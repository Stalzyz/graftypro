import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: list all plans with razorpay sync status
export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { sort_order: "asc" }
        });

        return NextResponse.json({ success: true, plans });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Update plan details
export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id, monthly_price, yearly_price, description, max_contacts, max_messages, max_flows, max_campaigns, max_users } = body;

        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...(monthly_price !== undefined && { monthly_price }),
                ...(yearly_price !== undefined && { yearly_price }),
                ...(description !== undefined && { description }),
                ...(max_contacts !== undefined && { max_contacts }),
                ...(max_messages !== undefined && { max_messages }),
                ...(max_flows !== undefined && { max_flows }),
                ...(max_campaigns !== undefined && { max_campaigns }),
                ...(max_users !== undefined && { max_users }),
            }
        });

        return NextResponse.json({ success: true, plan });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE: Disconnect (clear) a Razorpay plan ID from DB
export async function DELETE(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, cycle } = await req.json();

        if (!id || !cycle) {
            return NextResponse.json({ error: "id and cycle are required" }, { status: 400 });
        }

        const updateData = cycle === "monthly"
            ? { razorpay_monthly_plan_id: null }
            : { razorpay_yearly_plan_id: null };

        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, message: `Razorpay ${cycle} plan disconnected.`, plan });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
