
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string, sectionId: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        const body = await req.json();
        const { content, is_active } = body;

        const updateData: any = {};
        if (content !== undefined) updateData.content = content;
        if (is_active !== undefined) updateData.is_active = is_active;

        const section = await p.landingSection.update({
            where: { id: params.sectionId },
            data: updateData
        });

        // Set page to draft when edited
        await p.landingPage.update({
            where: { id: params.id },
            data: { status: 'DRAFT' }
        });

        return NextResponse.json({ success: true, data: section });
    } catch (error) {
        console.error("[SECTION_PATCH] Error:", error);
        return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string, sectionId: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        await p.landingSection.delete({
            where: { id: params.sectionId }
        });

        // Set page to draft
        await p.landingPage.update({
            where: { id: params.id },
            data: { status: 'DRAFT' }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SECTION_DELETE] Error:", error);
        return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
    }
}
