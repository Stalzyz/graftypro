import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-auth";

/**
 * PHASE 8: ADMIN RESELLER LIST
 */
export async function GET(req: Request) {
    try {
        await requireSuperAdmin();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const is_frozen = searchParams.get('frozen');

        const where: any = {};
        if (status) where.status = status;
        if (is_frozen) where.is_frozen = is_frozen === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { business_name: { contains: search, mode: 'insensitive' } },
                { referral_code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const resellers = await prisma.reseller.findMany({
            where,
            include: {
                tier: true,
                _count: {
                    select: { vendor_mappings: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: resellers
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to list resellers" }, { status: 500 });
    }
}
