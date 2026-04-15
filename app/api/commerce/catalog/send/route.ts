import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { CatalogEngine } from "../../../../../lib/commerce/catalog-engine";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

/**
 * POST /api/commerce/catalog/send
 * Send product catalog to a specific contact via WhatsApp.
 * 
 * Body: { contactId: string, productId?: string, category?: string }
 * - If productId is provided → sends Single Product Message
 * - If category is provided → sends filtered Multi-Product Message
 * - Otherwise → sends full catalog
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspaceId = user.workspaceId;
        const body = await req.json();
        const { contactId, productId, category } = body;

        if (!contactId) {
            return NextResponse.json({ error: "contactId is required" }, { status: 400 });
        }

        // Load contact and WABA
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId },
            select: { phone_number_id: true, access_token: true }
        });
        if (!waba) {
            return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });
        }

        const token = decrypt(waba.access_token);
        let result;

        if (productId) {
            // Send Single Product
            result = await CatalogEngine.sendSingleProduct(
                waba.phone_number_id, token, contact.phone,
                productId, workspaceId
            );
        } else {
            // Send Full/Filtered Catalog
            result = await CatalogEngine.sendProductCatalog(
                waba.phone_number_id, token, contact.phone,
                workspaceId, category
            );
        }

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("[CatalogSend API] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
