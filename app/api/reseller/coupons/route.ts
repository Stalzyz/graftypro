
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const coupons = await prisma.resellerCoupon.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: coupons });
    } catch (error: any) {
        console.error("Reseller Coupons GET Error:", error);
        return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { code, discountType, discountValue, usageLimit, validUntil, restrictions, newUsersOnly } = await req.json();

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fraud prevention: Check if code already exists globally
        const existing = await prisma.resellerCoupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await prisma.resellerCoupon.create({
            data: {
                reseller_id: resellerId,
                code: code.toUpperCase(),
                discount_type: discountType,
                discount_value: discountValue,
                usage_limit: usageLimit ? parseInt(usageLimit) : 100,
                valid_until: validUntil ? new Date(validUntil) : null,
                plan_restrictions: restrictions || [],
                new_users_only: newUsersOnly ?? true
            }
        });

        return NextResponse.json({ success: true, data: coupon });
    } catch (error: any) {
        console.error("Reseller Coupons POST Error:", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}
