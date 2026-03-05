import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();
        const config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        // Return features or default set
        return NextResponse.json({
            data: config?.features || {
                commerce: true,
                flows: true,
                drips: true,
                edu: false,
                api: true
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireSuperAdmin();
        const body = await req.json(); // Expected: { features: { ... } }

        const config = await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: { features: body.features },
            create: {
                id: "global",
                features: body.features
            }
        });

        return NextResponse.json({ success: true, data: config.features });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
