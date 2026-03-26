
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";
import { hash } from "bcryptjs";
import { getAbsoluteMediaUrl } from "../../../../lib/utils/url";

export const dynamic = "force-dynamic";

const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export async function POST(req: Request) {
    try {
        await requireSuperAdmin();
        const body = await req.json();
        const { name, email, business_name, password } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        const existing = await prisma.reseller.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ error: "Reseller with this email already exists" }, { status: 409 });
        }

        const passwordHash = await hash(password || "Password@123", 10);
        const referralCode = generateReferralCode();

        const reseller = await prisma.reseller.create({
            data: {
                name,
                email,
                business_name,
                password_hash: passwordHash,
                referral_code: referralCode,
                status: "ACTIVE",
                kyc_status: "VERIFIED",
                email_verified: true,
                tier_id: body.tier_id,
                role: body.role || "AFFILIATE"
            }
        });

        return NextResponse.json({
            success: true,
            data: reseller
        });

    } catch (error: any) {
        console.error("Create Reseller Error:", error);
        return NextResponse.json({ error: "Failed to create reseller" }, { status: 500 });
    }
}

/**
 * PHASE 8: ADMIN RESELLER LIST (Paginated)
 */
export async function GET(req: Request) {
    try {
        await requireSuperAdmin();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

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

        const [resellers, total] = await Promise.all([
            prisma.reseller.findMany({
                where,
                include: {
                    tier: true,
                    _count: {
                        select: { vendor_mappings: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma.reseller.count({ where })
        ]);

        const normalizedResellers = resellers.map(r => ({
            ...r,
            logo_url: getAbsoluteMediaUrl(r.logo_url, req),
            favicon_url: getAbsoluteMediaUrl(r.favicon_url, req)
        }));

        return NextResponse.json({
            success: true,
            data: normalizedResellers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to list resellers" }, { status: 500 });
    }
}
