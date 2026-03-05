
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Fetch from Modern Commerce Engine
        const commerceProducts = await (prisma as any).commerceProduct.findMany({
            where: { store: { workspace_id: user.workspaceId } },
            orderBy: { created_at: 'desc' },
            include: { variants: true }
        });

        // 2. Fetch from Legacy/Manual Product model
        const legacyProducts = await prisma.product.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: 'desc' },
            include: { variants: true }
        });

        // 3. Merge and Map
        const allProducts = [
            ...commerceProducts.map((p: any) => ({
                ...p,
                source: 'COMMERCE',
                image_url: p.image_urls?.[0] || null
            })),
            ...legacyProducts.map((p: any) => ({
                ...p,
                source: 'MANUAL',
                price: Number(p.price) // Float to Number
            }))
        ];

        // Sort by created_at desc
        allProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ data: allProducts });
    } catch (error: any) {
        console.error("GET Products Error:", error);
        return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, price, description, sku, image_url } = body;

        if (!name || !price) {
            return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                workspace_id: user.workspaceId,
                name,
                price: parseFloat(price),
                description,
                sku,
                image_url,
                is_active: true
            }
        });

        return NextResponse.json({ data: product });

    } catch (error) {
        console.error("Product Create Error", error);
        return NextResponse.json({ error: "Error creating product" }, { status: 500 });
    }
}
