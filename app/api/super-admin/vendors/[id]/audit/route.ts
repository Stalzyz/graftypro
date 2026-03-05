import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: Audit logs for a specific vendor
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // @ts-ignore
    const [logs, total] = await Promise.all([
        // @ts-ignore
        prisma.adminAuditLog.findMany({
            where: { resource: params.id },
            orderBy: { created_at: "desc" },
            skip,
            take: limit
        }),
        // @ts-ignore
        prisma.adminAuditLog.count({ where: { resource: params.id } })
    ]);

    return NextResponse.json({ logs, meta: { total, page, pages: Math.ceil(total / limit) } });
}
