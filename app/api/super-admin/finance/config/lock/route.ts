
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { FinanceReportService } from "../../../../../../lib/finance/finance-report-service";

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { month, year } = body;

        const config = await FinanceReportService.lockMonth(month, year);

        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
