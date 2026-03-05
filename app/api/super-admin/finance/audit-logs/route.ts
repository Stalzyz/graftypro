/**
 * Super Admin - Audit Logs API
 * 
 * GET /api/super-admin/finance/audit-logs
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await requireSuperAdmin();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const actionType = searchParams.get('actionType');
        const adminId = searchParams.get('adminId');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (actionType) where.action_type = actionType;
        if (adminId) where.admin_id = adminId;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.auditLog.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Audit Logs Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
    }
}
