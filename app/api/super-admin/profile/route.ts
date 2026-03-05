
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await prisma.adminUser.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar_url: true,
                bio: true
            }
        });

        return NextResponse.json(admin);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, avatar_url, bio, password } = body;

        const updateData: any = {
            name,
            avatar_url,
            bio
        };

        if (password) {
            const { hash } = await import("bcryptjs");
            updateData.password_hash = await hash(password, 10);
        }

        const updated = await prisma.adminUser.update({
            where: { id: session.id },
            data: updateData
        });

        // Audit the change
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: "UPDATE_PROFILE",
                resource: session.id,
                details: { ...body, password: password ? "[REDACTED]" : undefined }
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
