import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { is_active, usage_limit, valid_until, plan_restrictions, new_users_only, razorpay_offer_id } = body;

        const updated = await prisma.globalCoupon.update({
            where: { id: params.id },
            data: {
                is_active: is_active ?? undefined,
                usage_limit: usage_limit ? parseInt(usage_limit) : undefined,
                valid_until: valid_until ? new Date(valid_until) : undefined,
                plan_restrictions: plan_restrictions || undefined,
                new_users_only: new_users_only ?? undefined,
                razorpay_offer_id: razorpay_offer_id ?? undefined
            }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("[SUPER_ADMIN_COUPONS_PATCH]", error);
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if coupon has usages - if it does, we should deactive instead of hard delete
        const usageCount = await prisma.workspace.count({
            where: { global_coupon_id: params.id }
        });

        if (usageCount > 0) {
            await prisma.globalCoupon.update({
                where: { id: params.id },
                data: { is_active: false }
            });
            return NextResponse.json({ success: true, message: "Coupon has active usages. Deactivated instead of deleting." });
        }

        await prisma.globalCoupon.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error: any) {
        console.error("[SUPER_ADMIN_COUPONS_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }
}
