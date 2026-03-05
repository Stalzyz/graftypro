import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Ensure store belongs to user's workspace
        const store = await prisma.commerceStore.findFirst({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        await prisma.commerceStore.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Store Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
