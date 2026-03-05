import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { CommerceService } from "../../../../lib/commerce/service";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { storeId } = await req.json();
        if (!storeId) return NextResponse.json({ error: "Store ID is required" }, { status: 400 });

        const count = await CommerceService.syncProducts(storeId);

        return NextResponse.json({ success: true, syncedCount: count });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
