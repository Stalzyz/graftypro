
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const partners = await prisma.partner.findMany({
            orderBy: { created_at: "desc" },
            include: {
                _count: {
                    select: { referred_workspaces: true }
                }
            }
        });

        return NextResponse.json({
            partners: partners.map(p => ({
                ...p,
                referral_count: p._count.referred_workspaces
            }))
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, email, phone, commission_pct, password } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const partner = await prisma.partner.create({
            data: {
                name,
                email,
                phone,
                commission_pct: parseFloat(commission_pct || "20"),
                password_hash: hashedPassword,
                status: "ACTIVE"
            }
        });

        // Audit
        // @ts-ignore
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: "CREATE_PARTNER",
                details: { name, email }
            }
        });

        return NextResponse.json({ success: true, partner });

    } catch (e) {
        console.error("Create Partner Error", e);
        return NextResponse.json({ error: "Creation Failed (Email likely exists)" }, { status: 500 });
    }
}
