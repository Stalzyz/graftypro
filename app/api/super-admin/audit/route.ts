import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = { contains: action, mode: "insensitive" };

    // @ts-ignore
    const [logs, total] = await Promise.all([
        // @ts-ignore
        prisma.adminAuditLog.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip,
            take: limit
        }),
        // @ts-ignore
        prisma.adminAuditLog.count({ where })
    ]);

    return NextResponse.json({ logs, meta: { total, page, pages: Math.ceil(total / limit) } });
}
