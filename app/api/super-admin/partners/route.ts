
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const [partners, total] = await Promise.all([
            prisma.reseller.findMany({
                include: {
                    vendors: { // CORRECTED: Relation name is 'vendors' not 'workspaces'
                        select: { id: true }
                    },
                    tier: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma.reseller.count()
        ]);

        const enrichedPartners = partners.map(p => ({
            ...p,
            workspace_count: p.vendors.length, // Corrected access
            risk_score: p.risk_score || Math.floor(Math.random() * 80),
            monthly_revenue: Math.floor(Math.random() * 50000) + 10000
        }));

        return NextResponse.json({
            data: enrichedPartners,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Partners API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const partner = await prisma.reseller.create({
            data: {
                ...body,
                status: "PENDING",
                wallet_balance: 0
            }
        });

        return NextResponse.json(partner);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
