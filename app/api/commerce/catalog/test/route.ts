import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { decrypt } from "../../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

const META_API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * GET /api/commerce/catalog/test
 * Validates the stored catalog_id + WABA token without syncing any products.
 * Returns a detailed diagnostic result.
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const store = await prisma.commerceStore.findFirst({
            where: { workspace_id: user.workspaceId },
            select: { id: true, name: true, catalog_id: true }
        });

        if (!store) {
            return NextResponse.json({ ok: false, step: "store", message: "No store found for this workspace." }, { status: 404 });
        }

        if (!store.catalog_id) {
            return NextResponse.json({
                ok: false,
                step: "catalog_id",
                message: "No Meta Catalog ID is configured yet.",
                fix: "Edit your store in Commerce and add the Catalog ID from Meta Commerce Manager."
            });
        }

        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId },
            select: { access_token: true, phone_number_id: true }
        });

        if (!waba) {
            return NextResponse.json({
                ok: false,
                step: "token",
                message: "WhatsApp account is not connected.",
                fix: "Connect your WhatsApp Business account in Settings → WhatsApp."
            });
        }

        let token: string;
        try {
            token = decrypt(waba.access_token);
        } catch {
            return NextResponse.json({
                ok: false,
                step: "token",
                message: "Could not decrypt your access token. It may be corrupted.",
                fix: "Re-enter your WhatsApp System User token in Settings → WhatsApp Integration."
            });
        }

        // ── Test 1: Validate the catalog_id is real and accessible ──
        let catalogName = "";
        let productCountInMeta = 0;
        try {
            const res = await axios.get(`${BASE}/${store.catalog_id}`, {
                params: { fields: "id,name,product_count", access_token: token }
            });
            catalogName = res.data.name || "";
            productCountInMeta = res.data.product_count ?? 0;
        } catch (err: any) {
            const code = err.response?.data?.error?.code;
            const msg  = err.response?.data?.error?.message || err.message;

            if (code === 100 || msg?.includes("does not exist")) {
                return NextResponse.json({
                    ok: false,
                    step: "catalog_id",
                    catalogId: store.catalog_id,
                    message: `Catalog ID "${store.catalog_id}" was NOT found in Meta.`,
                    metaError: msg,
                    fix: [
                        "1. Open business.facebook.com → Commerce Manager",
                        "2. Select your catalog → Settings tab",
                        "3. Copy the Catalog ID (15-16 digit number at the top)",
                        "4. Paste it in Grafty → Commerce → Edit Store → Catalog ID",
                        "⚠️ This must be the Product Catalog ID, NOT your Business ID or WABA ID."
                    ]
                });
            }

            if (code === 200 || code === 190 || msg?.includes("permission") || msg?.includes("OAuthException")) {
                return NextResponse.json({
                    ok: false,
                    step: "token_permissions",
                    catalogId: store.catalog_id,
                    message: "Your access token does not have 'catalog_management' permission for this catalog.",
                    metaError: msg,
                    fix: [
                        "1. Go to Meta Business Manager → System Users",
                        "2. Click your system user → 'Add Assets' → Catalogs → select your catalog",
                        "3. Set permission to 'Manage catalog'",
                        "4. Generate a New Token with these scopes: catalog_management, business_management, whatsapp_business_management",
                        "5. Paste the new token in Grafty → Settings → WhatsApp Integration"
                    ]
                });
            }

            return NextResponse.json({
                ok: false,
                step: "catalog_id",
                catalogId: store.catalog_id,
                message: `Meta API returned an error: ${msg}`,
                metaError: msg,
                metaCode: code,
                fix: ["Check your Catalog ID and token, then try again."]
            });
        }

        // ── Test 2: Verify token also has whatsapp_business_management ──
        let tokenScopes: string[] = [];
        try {
            const tokenRes = await axios.get(`${BASE}/me/permissions`, {
                params: { access_token: token }
            });
            tokenScopes = (tokenRes.data?.data || [])
                .filter((p: any) => p.status === "granted")
                .map((p: any) => p.permission);
        } catch {
            // Non-fatal — some token types don't expose /me/permissions
        }

        const hasCatalogPerm = tokenScopes.length === 0 || tokenScopes.includes("catalog_management");
        const missingScopes = ["catalog_management", "business_management"].filter(
            s => tokenScopes.length > 0 && !tokenScopes.includes(s)
        );

        return NextResponse.json({
            ok: true,
            catalogId: store.catalog_id,
            catalogName,
            productCountInMeta,
            tokenScopes: tokenScopes.length > 0 ? tokenScopes : ["(System User token — scopes not listed via /me/permissions)"],
            hasCatalogPerm,
            missingScopes,
            message: missingScopes.length > 0
                ? `⚠️ Catalog found but token may be missing scopes: ${missingScopes.join(", ")}`
                : `✅ Catalog "${catalogName}" is accessible. Ready to sync!`,
            readyToSync: missingScopes.length === 0
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
