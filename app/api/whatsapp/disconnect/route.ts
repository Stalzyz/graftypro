import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Completely remove the account to allow a fresh reconnection
        await prisma.whatsAppAccount.deleteMany({
            where: { workspace_id: user.workspaceId }
        });

        return NextResponse.json({ success: true, message: "Integration deactivated" });

    } catch (e: any) {
        console.error("Disconnect Error:", e);
        return NextResponse.json({ error: e?.message || String(e) || "Failed to deactivate integration" }, { status: 500 });
    }
}
