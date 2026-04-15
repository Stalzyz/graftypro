import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const coupons = await prisma.globalCoupon.findMany({
            include: {
                _count: {
                    select: { workspaces: true }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: coupons });
    } catch (error: any) {
        console.error("[SUPER_ADMIN_COUPONS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { code, discountType, discountValue, usageLimit, validUntil, restrictions, newUsersOnly, razorpay_offer_id } = body;

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check for duplicates
        const existing = await prisma.globalCoupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await prisma.globalCoupon.create({
            data: {
                code: code.toUpperCase(),
                discount_type: discountType, // PERCENTAGE, FLAT
                discount_value: discountValue,
                usage_limit: usageLimit ? parseInt(usageLimit) : 100,
                valid_until: validUntil ? new Date(validUntil) : null,
                plan_restrictions: restrictions || [],
                new_users_only: newUsersOnly ?? true,
                razorpay_offer_id: razorpay_offer_id || null,
                is_active: true
            }
        });

        return NextResponse.json({ success: true, data: coupon });
    } catch (error: any) {
        console.error("[SUPER_ADMIN_COUPONS_POST]", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}
