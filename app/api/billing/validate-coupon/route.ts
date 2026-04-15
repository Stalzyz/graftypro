import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth"; // Assuming global auth for vendors

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await req.json();
        if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

        const workspace = await prisma.workspace.findUnique({
            where: { id: session.workspaceId },
            select: { reseller_id: true, created_at: true }
        });

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        // 1. Check Global Coupons first
        const globalCoupon = await prisma.globalCoupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (globalCoupon) {
            // Validation Logic
            if (!globalCoupon.is_active) return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });
            if (globalCoupon.usage_count >= (globalCoupon.usage_limit || 999999)) return NextResponse.json({ error: "Usage limit reached" }, { status: 400 });
            if (globalCoupon.valid_until && new Date() > new Date(globalCoupon.valid_until)) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
            
            // New Users Only check (Simplified: check if they have a plan? No, check if they used a coupon before?)
            // For now, let's just return the discount info
            return NextResponse.json({
                success: true,
                type: 'GLOBAL',
                id: globalCoupon.id,
                discount_type: globalCoupon.discount_type,
                discount_value: globalCoupon.discount_value
            });
        }

        // 2. Check Reseller Coupons second (if workspace belongs to a reseller)
        if (workspace.reseller_id) {
            const resellerCoupon = await prisma.resellerCoupon.findFirst({
                where: { 
                    code: code.toUpperCase(),
                    reseller_id: workspace.reseller_id,
                    is_active: true
                }
            });

            if (resellerCoupon) {
                if (resellerCoupon.usage_count >= (resellerCoupon.usage_limit || 999999)) return NextResponse.json({ error: "Usage limit reached" }, { status: 400 });
                if (resellerCoupon.valid_until && new Date() > new Date(resellerCoupon.valid_until)) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });

                return NextResponse.json({
                    success: true,
                    type: 'RESELLER',
                    id: resellerCoupon.id,
                    discount_type: resellerCoupon.discount_type,
                    discount_value: resellerCoupon.discount_value
                });
            }
        }

        return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    } catch (error: any) {
        console.error("[VALIDATE_COUPON_POST]", error);
        return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }
}
