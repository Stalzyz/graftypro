
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { FinanceReportService } from "../../../../../lib/finance/finance-report-service";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN" && session.role !== "FINANCE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // B2B, B2C, HSN
        const month = parseInt(searchParams.get("month") || "");
        const year = parseInt(searchParams.get("year") || "");

        if (!type || !month || !year) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        let csv = "";
        let filename = "";

        switch (type) {
            case "B2B":
                csv = await FinanceReportService.generateB2BReport(month, year);
                filename = `GSTR1_B2B_${month}_${year}.csv`;
                break;
            case "B2C":
                csv = await FinanceReportService.generateB2CReport(month, year);
                filename = `GSTR1_B2C_${month}_${year}.csv`;
                break;
            case "HSN":
                csv = await FinanceReportService.generateHSNSummary(month, year);
                filename = `GSTR1_HSN_${month}_${year}.csv`;
                break;
            default:
                return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
        }

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=${filename}`
            }
        });
    } catch (error: any) {
        console.error("Report Export Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
