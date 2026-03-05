
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: any = {
        timestamp: new Date().toISOString(),
        database: { status: "checking" },
        tables: {}
    };

    try {
        // Test 1: Simple DB ping
        await prisma.$queryRaw`SELECT 1`;
        results.database.status = "connected";

        // Test 2: Check CRM tables
        const tableTests = [
            { name: "UniversalCrmLead", model: "universalCrmLead" },
            { name: "UniversalCrmStage", model: "universalCrmStage" },
            { name: "SystemConfig", model: "systemConfig" },
            { name: "Workspace", model: "workspace" }
        ];

        for (const test of tableTests) {
            try {
                const count = await (prisma as any)[test.model].count();
                results.tables[test.name] = { status: "exists", count };
            } catch (e: any) {
                results.tables[test.name] = { status: "missing", error: e.message };
            }
        }

    } catch (e: any) {
        results.database.status = "error";
        results.database.error = e.message;
    }

    return NextResponse.json(results);
}
