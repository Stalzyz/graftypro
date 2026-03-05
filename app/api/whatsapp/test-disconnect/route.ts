import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const waba = await prisma.whatsAppAccount.findFirst();
        if (!waba) return NextResponse.json({ error: "No WABA found" });

        await prisma.whatsAppAccount.delete({
            where: { id: waba.id }
        });

        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (e: any) {
        return NextResponse.json({
            error: "Failed",
            message: e?.message || String(e),
            name: e?.name,
            code: e?.code
        });
    }
}
