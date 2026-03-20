import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { ResellerService } from "../../../../lib/reseller/service";

export const dynamic = "force-dynamic";

/**
 * PHASE 11: STABILITY & MAINTENANCE CRON
 * Recalculates tiers for all resellers to ensure no one is missed.
 * Cleans up old risk logs if necessary.
 */
export async function GET(req: Request) {
    try {
        // API Secret Verification (Assuming CRON_SECRET is in env)
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("🕒 Starting Reseller Maintenance Job...");

        // 1. Recalculate Tiers for all ACTIVE resellers
        const resellers = await prisma.reseller.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });

        let upgradeCount = 0;
        for (const r of resellers) {
            await prisma.$transaction(async (tx) => {
                await ResellerService.evaluateResellerTier(r.id, tx);
            });
            upgradeCount++;
        }

        console.log(`✅ Maintenance Complete. Evaluated ${resellers.length} resellers.`);

        return NextResponse.json({
            success: true,
            processed: resellers.length,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Reseller Cron Error:", error);
        return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
    }
}
