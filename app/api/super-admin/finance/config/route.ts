import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { SystemConfigService } from "@/lib/services/system-config-service";
import { FinanceReportService } from "@/lib/finance/finance-report-service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await SystemConfigService.getConfig();
        const lastLocked = await FinanceReportService.getLastLockedMonth();

        return NextResponse.json({
            config: {
                ...config,
                last_locked_month: lastLocked?.last_locked_month,
                last_locked_year: lastLocked?.last_locked_year
            }
        });
    } catch (error: any) {
        console.error("Finance Config Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
