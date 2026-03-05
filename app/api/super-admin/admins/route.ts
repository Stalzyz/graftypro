
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admins = await prisma.adminUser.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
                updated_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: admins });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Email, password and role are required" }, { status: 400 });
        }

        const existing = await prisma.adminUser.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
        }

        const passwordHash = await hash(password, 10);

        const admin = await prisma.adminUser.create({
            data: {
                name,
                email,
                password_hash: passwordHash,
                role
            }
        });

        return NextResponse.json({ success: true, data: admin });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
