
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const orders = await prisma.order.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: 'desc' },
            include: {
                contact: true,
                items: {
                    include: { product: true }
                }
            }
        });

        return NextResponse.json({ data: orders });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
    }
}
