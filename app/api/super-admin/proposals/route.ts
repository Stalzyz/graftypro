
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await requireSuperAdmin();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const [proposals, total] = await Promise.all([
            prisma.proposal.findMany({
                orderBy: { created_at: "desc" },
                skip,
                take: limit
            }),
            prisma.proposal.count()
        ]);

        return NextResponse.json({
            success: true,
            data: proposals,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireSuperAdmin();
        const body = await req.json();
        const { client_name, client_company, amount, items, notes } = body;

        // Generate Protocol ID
        const count = await prisma.proposal.count();
        const year = new Date().getFullYear();
        const protocol_id = `PROP-${year}-${(count + 1).toString().padStart(3, '0')}`;

        const proposal = await prisma.proposal.create({
            data: {
                protocol_id,
                client_name,
                client_company,
                amount: parseFloat(amount) || 0,
                items: items || [],
                notes,
                status: "SENT"
            }
        });

        return NextResponse.json({ success: true, data: proposal });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }
}
