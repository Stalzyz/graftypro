import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export async function GET(req: NextRequest) {
    try {
        await requireSuperAdmin();

        let config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        if (!config) {
            config = await prisma.systemConfig.create({
                data: { id: "global" }
            });
        }

        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireSuperAdmin();
        const body = await req.json();

        // White-list fields to prevent unintended overrides
        const allowedFields = [
            "rev_base_platform_cost",
            "rev_min_selling_price",
            "rev_default_wallet_margin",
            "rev_tier_threshold_1",
            "rev_tier_bonus_1",
            "rev_tier_threshold_2",
            "rev_tier_bonus_2",
            "rev_enable_tier_bonus",
            "rev_enable_wallet_margin",
            "rev_lock_pricing_floor"
        ];

        const updateData: any = {};
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        const config = await prisma.systemConfig.update({
            where: { id: "global" },
            data: updateData
        });

        // --- AUDIT LOG ---
        await prisma.auditLog.create({
            data: {
                admin_id: "system", // Should be actual admin id from session
                admin_email: "admin@grafty.pro",
                action_type: "UPDATE_REVENUE_ENGINE",
                target_type: "SYSTEM_CONFIG",
                target_id: "global",
                reason: "Manual updates to revenue sharing protocol",
                after_value: updateData
            }
        });

        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
