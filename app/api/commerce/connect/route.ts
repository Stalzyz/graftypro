import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { CommerceService } from "../../../../lib/commerce/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { platform, credentials, storeId } = body;

        if (!platform || !credentials) {
            return NextResponse.json({ error: "Platform and credentials are required" }, { status: 400 });
        }

        const store = await CommerceService.connectStore(user.workspaceId, platform, credentials, storeId);

        return NextResponse.json({
            success: true,
            message: `${platform} store connected successfully`,
            storeId: store.id
        });

    } catch (error: any) {
        console.error("Commerce Connect Error:", error);
        return NextResponse.json({ error: error.message || "Failed to connect store" }, { status: 500 });
    }
}
