import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireSuperAdmin();
        const { id } = params;
        const body = await req.json();

        // Whitelist updates
        const updateData: any = {};
        if (body.subject) updateData.subject = body.subject;
        if (body.body_html) updateData.body_html = body.body_html;
        if (body.variables) updateData.variables = body.variables;
        if (body.is_active !== undefined) updateData.is_active = body.is_active;

        const updated = await prisma.emailTemplate.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireSuperAdmin();
        const { id } = params;
        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }
}
