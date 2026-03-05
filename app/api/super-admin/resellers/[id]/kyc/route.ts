
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../../lib/admin-auth";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        const { status, notes } = await req.json();

        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const data: any = { kyc_status: status };
        if (notes) data.kyc_notes = notes;
        if (status === 'VERIFIED') {
            data.kyc_verified_at = new Date();
            data.status = 'ACTIVE';
        }

        const reseller = await prisma.reseller.update({
            where: { id: params.id },
            data
        });

        return NextResponse.json({ success: true, data: reseller });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
