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
        let products = [];
        try {
            const res = await axios.get(`${BASE}/${store.catalog_id}/products`, {
                params: { 
                    fields: "id,name,description,price,currency,image_url,retailer_id,availability,condition", 
                    access_token: token,
                    limit: 100 // Handle pagination if necessary later, just keeping it simple for now
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

        // Upsert products into Grafty database
        let syncedCount = 0;
        for (const mp of products) {
            const retailerId = mp.retailer_id || mp.id; // Fallback to id if retailer_id is somehow missing
            
            // Format price: Meta returns price as a string like "100.00 INR", we need the numeric part
            let numericPrice = 0;
            if (mp.price) {
                const match = mp.price.match(/[\d\.]+/);
                if (match) numericPrice = parseFloat(match[0]);
            }

            await (prisma as any).commerceProduct.upsert({
                where: { 
                    // Using retailer_id and store_id as a composite key if possible, but since we might not have a unique constraint,
                    // we'll try to find first or create.
                    id: mp.id // Meta product ID is unique globally
                },
                update: {
                    name: mp.name,
                    description: mp.description || "",
                    price: numericPrice,
                    currency: mp.currency || "INR",
                    image_urls: mp.image_url ? [mp.image_url] : [],
                    retailer_id: retailerId,
                    status: mp.availability === "in stock" ? "ACTIVE" : "DRAFT"
                },
                create: {
                    id: mp.id, // Force ID to be the Meta Product ID to avoid duplicates across syncs
                    store_id: store.id,
                    name: mp.name,
                    description: mp.description || "",
                    price: numericPrice,
                    currency: mp.currency || "INR",
                    image_urls: mp.image_url ? [mp.image_url] : [],
                    retailer_id: retailerId,
                    status: mp.availability === "in stock" ? "ACTIVE" : "DRAFT"
                }
            });
            syncedCount++;
        }

        return NextResponse.json({ message: `Successfully synced ${syncedCount} products from Meta.`, count: syncedCount });

    } catch (error: any) {
        console.error("[CatalogSync] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
