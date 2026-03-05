/**
 * Super Admin - GST Report Finalization API
 * 
 * POST /api/super-admin/finance/reports/[id]/finalize
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../../../lib/admin-auth";
import { GSTReportService } from "../../../../../../../lib/finance/gst-report-service";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireSuperAdmin();
        const reportId = params.id;

        const report = await prisma.gSTReport.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        if (report.status === 'FINALIZED') {
            return NextResponse.json({ error: "Report is already finalized" }, { status: 400 });
        }

        // Finalize using the service
        const finalizedReport = await GSTReportService.finalizeReport(reportId, admin.id);

        // Audit Log
        await prisma.auditLog.create({
            data: {
                admin_id: admin.id,
                admin_email: admin.email || 'system',
                action_type: 'FINALIZE_GST_REPORT',
                target_type: 'GST_REPORT',
                target_id: reportId,
                before_value: { status: 'DRAFT' },
                after_value: { status: 'FINALIZED' },
                reason: `Finalizing GST report for ${report.month}/${report.year}`
            }
        });

        return NextResponse.json({
            success: true,
            message: "Report finalized successfully",
            report: finalizedReport
        });

    } catch (error: any) {
        console.error("GST Report Finalization Error:", error);
        return NextResponse.json({ error: error.message || "Finalization failed" }, { status: 500 });
    }
}
