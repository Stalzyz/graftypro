import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "./encryption";

export type CommercePlatform = "WOOCOMMERCE" | "SHOPIFY";

export class CommerceService {
    /**
     * PHASE 2: Connect Store
     * Validates credentials and stores them encrypted.
     */
    static async connectStore(workspaceId: string, platform: CommercePlatform, credentials: any) {
        // 1. Validate based on platform
        if (platform === "WOOCOMMERCE") {
            await this.validateWooCommerce(credentials);
        } else if (platform === "SHOPIFY") {
            await this.validateShopify(credentials);
        }

        // 2. Encrypt sensitive parts
        const encryptedData = encrypt(JSON.stringify(credentials));

        // 3. Upsert Store Configuration
        return await prisma.commerceStore.upsert({
            where: {
                // We'll use a unique constraint on workspace and platform for simple demo, 
                // but schema supports multi-store by UUID. 
                // Let's find first if it exists.
                id: (await prisma.commerceStore.findFirst({
                    where: { workspace_id: workspaceId, platform }
                }))?.id || "new-uuid"
            },
            update: {
                encrypted_credentials: { data: encryptedData },
                status: "ACTIVE",
                updated_at: new Date()
            },
            create: {
                workspace_id: workspaceId,
                platform: platform,
                encrypted_credentials: { data: encryptedData },
                status: "ACTIVE"
            }
        });
    }

    private static async validateWooCommerce(creds: any) {
        const { url, consumerKey, consumerSecret } = creds;
        if (!url || !consumerKey || !consumerSecret) throw new Error("Missing WooCommerce credentials");

        const response = await fetch(`${url}/wp-json/wc/v3/products?per_page=1`, {
            headers: {
                Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
            }
        });

        if (!response.ok) {
            throw new Error(`WooCommerce connection failed: ${response.statusText}`);
        }
    }

    private static async validateShopify(creds: any) {
        const { shop, accessToken } = creds;
        if (!shop || !accessToken) throw new Error("Missing Shopify credentials");

        const response = await fetch(`https://${shop}.myshopify.com/admin/api/2024-01/shop.json`, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Shopify connection failed: ${response.statusText}`);
        }
    }

    /**
     * PHASE 3: Product Sync Engine
     * Fetches products from external platform and upserts to local cache.
     */
    static async syncProducts(storeId: string) {
        const store = await prisma.commerceStore.findUnique({ where: { id: storeId } });
        if (!store) throw new Error("Store not found");

        const creds = await this.getCredentials(storeId);
        let products: any[] = [];

        if (store.platform === "WOOCOMMERCE") {
            products = await this.fetchWooCommerceProducts(creds);
        } else if (store.platform === "SHOPIFY") {
            products = await this.fetchShopifyProducts(creds);
        }

        // Upsert all products
        for (const p of products) {
            await prisma.commerceProduct.upsert({
                where: {
                    store_id_external_id: {
                        store_id: storeId,
                        external_id: String(p.id)
                    }
                },
                update: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    currency: p.currency || "INR",
                    stock: p.stock || 0,
                    image_urls: p.image_urls,
                    category: p.category,
                    updated_at: new Date()
                },
                create: {
                    store_id: storeId,
                    external_id: String(p.id),
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    currency: p.currency || "INR",
                    stock: p.stock || 0,
                    image_urls: p.image_urls,
                    category: p.category
                }
            });
        }

        await prisma.commerceStore.update({
            where: { id: storeId },
            data: { last_sync_at: new Date() }
        });

        return products.length;
    }

    private static async fetchWooCommerceProducts(creds: any) {
        const { url, consumerKey, consumerSecret } = creds;
        const res = await fetch(`${url}/wp-json/wc/v3/products?per_page=100`, {
            headers: { Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64") }
        });
        const data = await res.json();
        return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description.replace(/<[^>]*>?/gm, ''), // Strip HTML
            price: parseFloat(p.price || "0"),
            currency: "INR", // Woo settings might vary
            stock: p.stock_quantity || 0,
            image_urls: p.images.map((img: any) => img.src),
            category: p.categories[0]?.name || "Uncategorized"
        }));
    }

    private static async fetchShopifyProducts(creds: any) {
        const { shop, accessToken } = creds;
        const res = await fetch(`https://${shop}.myshopify.com/admin/api/2024-01/products.json?limit=250`, {
            headers: { "X-Shopify-Access-Token": accessToken }
        });
        const data = await res.json();
        return data.products.map((p: any) => ({
            id: p.id,
            name: p.title,
            description: p.body_html.replace(/<[^>]*>?/gm, ''),
            price: parseFloat(p.variants[0]?.price || "0"),
            currency: "INR",
            stock: p.variants.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0),
            image_urls: p.images.map((img: any) => img.src),
            category: p.product_type || "General"
        }));
    }

    /**
     * PHASE 4: Webhook Event Processor
     * Processes incoming order events safely with idempotency checks.
     */
    static async processWebhook(platform: CommercePlatform, payload: any, headers: any) {
        // 1. Resolve Store (Simplified domain lookup for demo)
        // In prod, use specific webhook secret per store.
        const externalId = platform === "SHOPIFY" ? payload.id : payload.id;
        const store = await prisma.commerceStore.findFirst({
            where: { platform } // Filter by platform for now
        });

        if (!store) throw new Error(`Active store not found for ${platform}`);

        // 2. Map Payload to Local Order Data
        const orderData = platform === "SHOPIFY"
            ? this.mapShopifyOrder(payload)
            : this.mapWooOrder(payload);

        // 3. Upsert Order (Idempotency)
        const order = await prisma.commerceOrder.upsert({
            where: {
                store_id_external_id: {
                    store_id: store.id,
                    external_id: String(orderData.external_id)
                }
            },
            update: {
                status: orderData.status,
                total_amount: orderData.total_amount,
                synced_at: new Date()
            },
            create: {
                store_id: store.id,
                external_id: String(orderData.external_id),
                customer_phone: orderData.customer_phone,
                total_amount: orderData.total_amount,
                status: orderData.status
            }
        });

        // 4. Record Processed Event
        await prisma.commerceEvent.create({
            data: {
                order_id: order.id,
                event_type: `order.${orderData.status.toLowerCase()}`,
                processed_status: "COMPLETED",
                payload: payload
            }
        });

        // PHASE 8: Abandoned Cart Automation
        if (platform === "SHOPIFY" && payload.event_type === "checkouts/create") {
            const { automationQueue } = require("@/lib/queue");
            await automationQueue.add(
                "abandoned-cart-recovery",
                { workspaceId: store.workspace_id, orderId: order.id },
                { delay: 30 * 60 * 1000 } // 30 minutes
            );
            console.log(`⏳ Scheduled Abandoned Checkout Recovery for ${order.id}`);
        }

        // 5. PHASE 5: Trigger Engine (Automation)
        if (orderData.customer_phone) {
            await this.triggerAutomation(store.workspace_id, orderData);
        }

        return order;
    }

    private static async triggerAutomation(workspaceId: string, orderData: any) {
        try {
            // A. Ensure Contact Exists
            const contact = await prisma.contact.upsert({
                where: {
                    workspace_id_phone: { workspace_id: workspaceId, phone: orderData.customer_phone }
                },
                update: { last_active_at: new Date() },
                create: {
                    workspace_id: workspaceId,
                    phone: orderData.customer_phone,
                    name: "Customer"
                }
            });

            // B. Resolve Flow for this event (e.g. "Order Placed Notification")
            const eventFlow = await prisma.flow.findFirst({
                where: {
                    workspace_id: workspaceId,
                    name: { contains: orderData.status, mode: 'insensitive' }
                }
            });

            if (eventFlow) {
                const { FlowRunner } = require("../engine/flow-runner");
                await FlowRunner.startFlow(workspaceId, contact.id, eventFlow.id);
                console.log(`🚀 Triggered Flow: ${eventFlow.name} for Order ${orderData.external_id}`);
            }
        } catch (err) {
            console.error("Automation Trigger Error:", err);
        }
    }

    private static mapShopifyOrder(p: any) {
        return {
            external_id: p.id,
            customer_phone: p.phone || p.customer?.phone || "",
            total_amount: parseFloat(p.total_price),
            status: p.financial_status === "paid" ? "PAID" : "PLACED"
        };
    }

    private static mapWooOrder(p: any) {
        return {
            external_id: p.id,
            customer_phone: p.billing?.phone || "",
            total_amount: parseFloat(p.total),
            status: p.status === "processing" || p.status === "completed" ? "PAID" : "PLACED"
        };
    }

    /**
     * Helper to get decrypted credentials
     */
    static async getCredentials(storeId: string) {
        const store = await prisma.commerceStore.findUnique({ where: { id: storeId } });
        if (!store) throw new Error("Store not found");

        const credsJson = (store.encrypted_credentials as any).data;
        return JSON.parse(decrypt(credsJson));
    }
}
