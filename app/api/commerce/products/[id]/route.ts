import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { CommerceService } from "../../../../../lib/commerce/service";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await CommerceService.deleteProduct(params.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const product = await CommerceService.upsertNativeProduct(body.store_id || body.storeId, {
            ...body,
            id: params.id
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Product Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
