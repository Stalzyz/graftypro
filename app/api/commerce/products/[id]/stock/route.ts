import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../../lib/auth";
import { CommerceService } from "../../../../../../lib/commerce/service";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const delta = Number(body.delta);
        const exactStock = body.stock !== undefined ? Number(body.stock) : null;
        const reason = body.reason || "ADJUSTMENT";

        if (isNaN(delta) && exactStock === null) {
            return NextResponse.json({ error: "Delta or exact stock is required" }, { status: 400 });
        }

        let updated;
        if (exactStock !== null && !isNaN(exactStock)) {
            const current = await CommerceService.adjustStock(params.id, 0, "INSPECT");
            const change = exactStock - current.stock;
            updated = await CommerceService.adjustStock(params.id, change, reason, user.userId);
        } else {
            updated = await CommerceService.adjustStock(params.id, delta, reason, user.userId);
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("Stock Adjust Error:", error);
        return NextResponse.json({ error: error.message || "Failed to adjust stock" }, { status: 500 });
    }
}
