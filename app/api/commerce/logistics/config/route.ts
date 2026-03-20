import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { encrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, email, password, provider = "SHIPROCKET" } = body;

        if (!storeId || !email || !password) {
            return NextResponse.json({ error: "Store ID, Email and Password are required" }, { status: 400 });
        }

        // 1. Verify Store Ownership
        const store = await prisma.commerceStore.findUnique({
            where: { id: storeId }
        });

        if (!store || store.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // 2. Encrypt and Save Config
        const encryptedPassword = encrypt(password);
        const shippingConfig = {
            email,
            password: encryptedPassword,
            updated_at: new Date().toISOString()
        };

        await prisma.commerceStore.update({
            where: { id: storeId },
            data: {
                shipping_provider: provider,
                shipping_config: shippingConfig
            }
        });

        return NextResponse.json({
            success: true,
            message: "Logistics configuration saved successfully"
        });

    } catch (error: any) {
        console.error("Logistics Config Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save logistics config" }, { status: 500 });
    }
}
