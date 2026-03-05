import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { CommerceService } from "../../../../lib/commerce/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const stores = await CommerceService.getStores(user.workspaceId);
        return NextResponse.json(stores);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
