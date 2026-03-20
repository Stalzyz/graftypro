
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (params.id === "legacy") {
            await prisma.reseller.update({
                where: { id: session.userId },
                data: { custom_domain: null, domain_verified: false }
            });
            return NextResponse.json({ success: true, message: "Legacy domain removed" });
        }

        // Ensure owner
        const domain = await prisma.partnerDomain.findUnique({
            where: { id: params.id }
        });

        if (!domain || domain.reseller_id !== session.userId) {
            return NextResponse.json({ error: "Domain not found or unauthorized" }, { status: 404 });
        }

        await prisma.partnerDomain.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: "Domain removed" });

    } catch (error) {
        console.error("DELETE Domain Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
