import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../../lib/admin-auth";
import { ResellerService } from "../../../../../../lib/reseller/service";

export async function POST(req: NextRequest) {
    try {
        await requireSuperAdmin();
        const body = await req.json();

        const now = new Date();
        const month = body.month || (now.getMonth() + 1);
        const year = body.year || now.getFullYear();

        console.log(`🚀 [Admin] Manual Revenue Recalculation Triggered for ${month}/${year}`);

        const results = await ResellerService.calculateMonthEndBonuses(month, year);

        // --- AUDIT LOG ---
        await prisma.auditLog.create({
            data: {
                admin_id: "system",
                admin_email: "finance@grafty.pro",
                action_type: "RECALCULATE_BONUSES",
                target_type: "RESELLER_STATS",
                target_id: `${month}-${year}`,
                reason: "Manual bonus recalibration triggered by Super Admin",
                after_value: results
            }
        });

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Recalculation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
