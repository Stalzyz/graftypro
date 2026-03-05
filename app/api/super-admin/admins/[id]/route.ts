
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { hash } from "bcryptjs";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, role } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (password) {
            updateData.password_hash = await hash(password, 10);
        }

        const admin = await prisma.adminUser.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: admin });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Prevent self-deletion
        if (params.id === session.userId) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await prisma.adminUser.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
