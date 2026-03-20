
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();
        
        const leads = await prisma.publicToolLead.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({ success: true, leads });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
