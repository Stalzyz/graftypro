import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { decrypt } from "../../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

const META_API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const storeId = body.storeId;
        
        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
        }

        const store = await prisma.commerceStore.findFirst({
            where: { id: storeId, workspace_id: user.workspaceId },
            select: { id: true, name: true, catalog_id: true }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        if (!store.catalog_id) {
            return NextResponse.json({ error: "No Meta Catalog ID is configured for this store." }, { status: 400 });
        }

        // Trim whitespace that may have been entered accidentally when saving the catalog ID
        const catalogId = store.catalog_id.trim();

        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId },
            select: { access_token: true }
        });

        if (!waba) {
            return NextResponse.json({ error: "WhatsApp account is not connected." }, { status: 400 });
        }

        let token: string;
        try {
            token = decrypt(waba.access_token);
        } catch {
            return NextResponse.json({ error: "Could not decrypt your access token." }, { status: 400 });
        }

        // Fetch products from Meta Catalog API
        let products: any[] = [];
        try {
            const res = await axios.get(`${BASE}/${catalogId}/products`, {
                params: { 
                    fields: "id,name,description,price,currency,image_url,retailer_id,availability,condition", 
                    access_token: token,
                    limit: 100
                }
            });
            products = res.data?.data || [];
        } catch (err: any) {
            const msg  = err.response?.data?.error?.message || err.message;
            console.error(`[CatalogSync] Failed to fetch products: ${msg}`);
            return NextResponse.json({ error: `Failed to fetch from Meta: ${msg}` }, { status: 500 });
        }

        if (products.length === 0) {
            return NextResponse.json({ message: "No products found in Meta Catalog.", count: 0 });
        }

        // Upsert products into Grafty database using the @@unique([store_id, external_id]) constraint
        let syncedCount = 0;
        for (const mp of products) {
            const retailerId = mp.retailer_id || mp.id;
            const externalId = mp.id; // Meta's global product ID

            // Format price: Meta returns price as a string like "100.00 INR", we need the numeric part
            let numericPrice = 0;
            if (mp.price) {
                const match = mp.price.match(/[\d\.]+/);
                if (match) numericPrice = parseFloat(match[0]);
            }

            try {
                await (prisma as any).commerceProduct.upsert({
                    where: { 
                        // Use the composite unique key defined in schema: @@unique([store_id, external_id])
                        store_id_external_id: {
                            store_id: store.id,
                            external_id: externalId,
                        }
                    },
                    update: {
                        name: mp.name || "Unnamed Product",
                        description: mp.description || "",
                        price: numericPrice || 0,
                        image_urls: mp.image_url ? [mp.image_url] : [],
                        retailer_id: retailerId,
                        external_id: externalId,
                        is_active: mp.availability === "in stock",
                    },
                    create: {
                        store_id: store.id,
                        name: mp.name || "Unnamed Product",
                        description: mp.description || "",
                        price: numericPrice || 0,
                        image_urls: mp.image_url ? [mp.image_url] : [],
                        retailer_id: retailerId,
                        external_id: externalId,
                        is_active: mp.availability === "in stock",
                    }
                });
                syncedCount++;
            } catch (upsertErr: any) {
                console.error(`[CatalogSync] Failed to upsert product ${externalId}:`, upsertErr.message);
                // Continue syncing other products even if one fails
            }
        }

        return NextResponse.json({ 
            message: `Successfully synced ${syncedCount} of ${products.length} products from Meta.`, 
            count: syncedCount 
        });

    } catch (error: any) {
        console.error("[CatalogSync] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
