
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const count = await prisma.subscriptionPlan.count();
        const allPlans = await prisma.subscriptionPlan.findMany({
            select: { name: true, is_active: true, is_public: true }
        });

        return NextResponse.json({
            success: true,
            count,
            plans: allPlans,
            server_time: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
