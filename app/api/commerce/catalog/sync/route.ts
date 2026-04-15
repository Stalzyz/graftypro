import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { CatalogEngine } from "../../../../../lib/commerce/catalog-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/commerce/catalog/sync
 * Trigger catalog sync from vendor dashboard → push products to Meta Commerce.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await CatalogEngine.syncCatalogToMeta(user.workspaceId);

        return NextResponse.json({
            success: true,
            synced: result.synced,
            errors: result.errors
        });
    } catch (error: any) {
        console.error("[CatalogSync API] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
