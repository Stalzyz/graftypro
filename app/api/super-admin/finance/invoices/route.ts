
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || "");
        const year = parseInt(searchParams.get("year") || "");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        const where: any = {};
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            where.created_at = { gte: start, lte: end };
        }

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
                include: {
                    workspace: {
                        select: { name: true }
                    }
                }
            }),
            prisma.invoice.count({ where })
        ]);

        return NextResponse.json({
            data: invoices,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
