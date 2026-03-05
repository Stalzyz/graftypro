import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * PHASE 6: PRICING MANAGEMENT
 */
export async function GET(req: Request) {
    try {
        await requireSuperAdmin();
        const pricing = await prisma.creditPricing.findMany();
        return NextResponse.json({ success: true, data: pricing });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireSuperAdmin();
        const body = await req.json();
        const { message_type, country, country_code, meta_cost, platform_margin, reseller_margin } = body;

        // PHASE 4: MARGIN PROTECTION (Enforce Rule)
        const finalPrice = Number(meta_cost) + Number(platform_margin) + Number(reseller_margin);

        // Safety: Enforce minimum platform margin
        if (Number(platform_margin) < 0) {
            return NextResponse.json({ error: "Negative platform margin is not allowed" }, { status: 400 });
        }

        const pricing = await prisma.creditPricing.upsert({
            where: {
                message_type_country: {
                    message_type,
                    country
                }
            },
            update: {
                country_code,
                meta_cost,
                platform_margin,
                reseller_margin,
                final_vendor_price: finalPrice
            },
            create: {
                message_type,
                country,
                country_code,
                meta_cost,
                platform_margin,
                reseller_margin,
                final_vendor_price: finalPrice
            }
        });

        // Audit Log
        const admin = await requireSuperAdmin();
        await prisma.auditLog.create({
            data: {
                admin_id: admin.id,
                admin_email: admin.email || 'system',
                action_type: 'UPDATE_PRICING',
                target_type: 'PRICING',
                target_id: pricing.id,
                after_value: { message_type, country, finalPrice },
                reason: `Updating pricing for ${message_type} in ${country}`
            }
        });

        return NextResponse.json({ success: true, data: pricing });
    } catch (error: any) {
        console.error("Pricing Update Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update pricing" }, { status: 500 });
    }
}
