
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const products = await prisma.product.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: 'desc' },
            include: { variants: true }
        });

        return NextResponse.json({ data: products });
    } catch (error) {
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
