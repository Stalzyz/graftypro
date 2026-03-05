import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { CommerceService } from "../../../../lib/commerce/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Use safe include and error logging
        const products = await (prisma as any).commerceProduct.findMany({
            where: { store: { workspace_id: user.workspaceId } },
            include: { variants: true, category: true },
            orderBy: { created_at: "desc" }
        });

        // Map commerceProduct to the format expected by the frontend if necessary
        const mappedProducts = products.map((p: any) => ({
            ...p,
            image_url: p.image_urls?.[0] || null // Flow builder expects image_url
        }));

        return NextResponse.json({ data: mappedProducts });
    } catch (error: any) {
        console.error("GET Products Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const storeId = body.storeId || body.store_id;
        const { ...productData } = body;

        if (!storeId) return NextResponse.json({ error: "Store ID is required" }, { status: 400 });

        const product = await CommerceService.upsertNativeProduct(storeId, productData);

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Product Create Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
