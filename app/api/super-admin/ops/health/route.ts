
import { NextResponse } from "next/server";
import { HealthUtils } from "@/lib/security/health-utils";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const status = await HealthUtils.getSystemStatus();
        const riskEvents = await HealthUtils.getRecentRiskEvents();

        return NextResponse.json({
            status,
            risk_events: riskEvents
        });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
