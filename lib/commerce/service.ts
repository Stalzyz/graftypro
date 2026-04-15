import { prisma } from "../db";
import { encrypt, decrypt } from "./encryption";
import { Decimal } from "@prisma/client/runtime/library";
import { CommercePlatform } from "@prisma/client";
import { scheduleAbandonedCartRecovery } from "../email/automations";

export interface OrderPayload {
    store_id: string;
    contact_id: string;
    items: {
        product_id: string;
        variant_id?: string;
        quantity: number;
    }[];
    shipping_address?: any;
    payment_method: string;
    referral_code?: string;
    coupon_code?: string;
}

export class CommerceService {
    /**
     * Get all stores for a workspace
     */
    static async getStores(workspaceId: string) {
        return await prisma.commerceStore.findMany({
            where: { workspace_id: workspaceId },
            include: {
                _count: {
                    select: { products: true, orders: true }
                }
            },
            orderBy: { created_at: "desc" }
        });
    }

    /**
     * Connect or Create Store
     */
    static async connectStore(workspaceId: string, platform: any, credentials: any, storeId?: string) {
        const platformStr = String(platform).toUpperCase();

        if (platformStr === "WOOCOMMERCE") {
            await this.validateWooCommerce(credentials);
        } else if (platformStr === "SHOPIFY") {
            await this.validateShopify(credentials);
        }

        const storeName = credentials.name || (platformStr === "NATIVE" ? "My WhatsApp Store" : `${platformStr} Store`);
        let encryptedData = null;

        if (platformStr !== "NATIVE") {
            // Only encrypt if keys are provided (for editing, they might be blank if not changing)
            const keys: any = {};
            if (platformStr === "SHOPIFY") {
                if (credentials.shop) keys.shop = credentials.shop;
                if (credentials.accessToken) keys.accessToken = credentials.accessToken;
            } else {
                if (credentials.url) keys.url = credentials.url;
                if (credentials.consumerKey) keys.consumerKey = credentials.consumerKey;
                if (credentials.consumerSecret) keys.consumerSecret = credentials.consumerSecret;
            }

            if (Object.keys(keys).length > 0) {
                // If editing, we might need to merge with existing or just trust the new ones
                // For simplicity now, if any new key is provided, we use the provided set
                encryptedData = encrypt(JSON.stringify(keys));
            }
        }

        const data: any = {
            name: storeName,
            status: "ACTIVE",
            catalog_id: credentials.catalogId || null,
            updated_at: new Date()
        };

        if (encryptedData) {
            data.encrypted_credentials = { data: encryptedData };
        }

        if (storeId) {
            return await prisma.commerceStore.update({
                where: { id: storeId },
                data: data
            });
        } else {
            return await prisma.commerceStore.create({
                data: {
                    ...data,
                    workspace_id: workspaceId,
                    platform: platformStr as any
                }
            });
        }
    }

    private static async validateWooCommerce(creds: any) {
        const { url, consumerKey, consumerSecret } = creds;
        if (!url || !consumerKey || !consumerSecret) throw new Error("Missing WooCommerce credentials");
        const response = await fetch(`${url}/wp-json/wc/v3/products?per_page=1`, {
            headers: { Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64") }
        });
        if (!response.ok) throw new Error(`WooCommerce connection failed: ${response.statusText}`);
    }

    private static async validateShopify(creds: any) {
        let { shop, accessToken } = creds;
        if (!shop || !accessToken) throw new Error("Missing Shopify credentials (shop domain and access token required)");
        // Strip .myshopify.com if user included it, and remove https:// prefix
        shop = shop.replace(/^https?:\/\//, '').replace(/\.myshopify\.com.*$/, '').trim();
        creds.shop = shop; // save cleaned version
        const url = `https://${shop}.myshopify.com/admin/api/2024-10/shop.json`;
        console.log('[Commerce] Validating Shopify:', url);
        const response = await fetch(url, {
            headers: { "X-Shopify-Access-Token": accessToken }
        });
        if (!response.ok) {
            const body = await response.text().catch(() => '');
            throw new Error(`Shopify connection failed (${response.status}): ${response.statusText}. ${body.substring(0, 200)}`);
        }
    }

    /**
     * Native Product Management
     */
    static async upsertNativeProduct(storeId: string, data: any) {
        const { variants, category, store, id, created_at, updated_at, ...cleanData } = data;

        // Ensure numeric fields are actually numbers and handle defaults
        const productFields = {
            name: cleanData.name || "Unnamed Product",
            description: cleanData.description || "",
            price: parseFloat(cleanData.price) || 0,
            compare_at_price: cleanData.compare_at_price ? parseFloat(cleanData.compare_at_price) : null,
            stock: parseInt(cleanData.stock) || 0,
            image_urls: cleanData.image_urls || [],
            sku: cleanData.sku || null,
            store_id: storeId,
            updated_at: new Date()
        };

        return await prisma.$transaction(async (tx) => {
            const product = await (tx as any).commerceProduct.upsert({
                where: { id: id || "00000000-0000-0000-0000-000000000000" },
                update: productFields,
                create: { ...productFields }
            });

            if (variants) {
                const variantIdsToKeep = variants.filter((v: any) => v.id).map((v: any) => v.id);

                await (tx as any).commerceProductVariant.deleteMany({
                    where: {
                        product_id: product.id,
                        id: { notIn: variantIdsToKeep }
                    }
                });

                for (const v of variants) {
                    const { id: vId, product_id, ...vData } = v;
                    await (tx as any).commerceProductVariant.upsert({
                        where: { id: vId || "00000000-0000-0000-0000-000000000000" },
                        update: {
                            name: vData.name,
                            sku: vData.sku || null,
                            price: parseFloat(vData.price) || 0,
                            stock: parseInt(vData.stock) || 0
                        },
                        create: {
                            name: vData.name,
                            sku: vData.sku || null,
                            price: parseFloat(vData.price) || 0,
                            stock: parseInt(vData.stock) || 0,
                            product_id: product.id
                        }
                    });
                }
            }
            return product;
        });
    }

    static async deleteProduct(productId: string) {
        return await prisma.commerceProduct.delete({
            where: { id: productId }
        });
    }

    /**
     * Product Sync Engine (Woo/Shopify)
     */
    static async syncProducts(storeId: string) {
        const store = await (prisma as any).commerceStore.findUnique({ where: { id: storeId } });
        if (!store || String(store.platform).toUpperCase() === "NATIVE") return 0;

        const creds = await this.getCredentials(storeId);
        let externalProducts: any[] = [];

        if (store.platform === "WOOCOMMERCE") {
            externalProducts = await this.fetchWooCommerceProducts(creds);
        } else if (store.platform === "SHOPIFY") {
            externalProducts = await this.fetchShopifyProducts(creds);
        }

        for (const p of externalProducts) {
            const { categories, variants, ...prod } = p;

            // Sync Categories first
            let categoryId = null;
            if (categories && categories.length > 0) {
                const cat = await prisma.commerceCategory.upsert({
                    where: { store_id_external_id: { store_id: storeId, external_id: String(categories[0].id) } },
                    update: { name: categories[0].name },
                    create: { store_id: storeId, external_id: String(categories[0].id), name: categories[0].name }
                });
                categoryId = cat.id;
            }

            const product = await prisma.commerceProduct.upsert({
                where: { store_id_external_id: { store_id: storeId, external_id: String(prod.external_id) } },
                update: { ...prod, category_id: categoryId, updated_at: new Date() },
                create: { ...prod, store_id: storeId, category_id: categoryId }
            });

            if (variants) {
                for (const v of variants) {
                    await prisma.commerceProductVariant.upsert({
                        where: { product_id_external_id: { product_id: product.id, external_id: String(v.external_id) } },
                        update: { ...v },
                        create: { ...v, product_id: product.id }
                    });
                }
            }
        }

        await prisma.commerceStore.update({ 
            where: { id: storeId }, 
            data: { 
                last_sync_at: new Date()
            } 
        });
        return externalProducts.length;
    }

    private static async fetchWooCommerceProducts(creds: any) {
        const { url, consumerKey, consumerSecret } = creds;
        const res = await fetch(`${url}/wp-json/wc/v3/products?per_page=100`, {
            headers: { Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64") }
        });
        const data = await res.json();
        return data.map((p: any) => ({
            external_id: String(p.id),
            name: p.name,
            description: p.description?.replace(/<[^>]*>?/gm, ''),
            price: new Decimal(p.price || "0"),
            compare_at_price: p.regular_price && p.regular_price !== p.price ? new Decimal(p.regular_price) : null,
            stock: p.stock_quantity || 0,
            image_urls: p.images?.map((img: any) => img.src) || [],
            categories: p.categories?.map((c: any) => ({ id: c.id, name: c.name })),
            variants: p.variations?.map((v_id: any) => ({ external_id: String(v_id), name: "Variant", price: new Decimal(p.price || "0") }))
        }));
    }

    private static async fetchShopifyProducts(creds: any) {
        let { shop, accessToken } = creds;
        // Strip .myshopify.com if included
        shop = shop.replace(/^https?:\/\//, '').replace(/\.myshopify\.com.*$/, '').trim();
        const url = `https://${shop}.myshopify.com/admin/api/2024-10/products.json?limit=250`;
        console.log('[Commerce] Fetching Shopify products:', url);
        const res = await fetch(url, {
            headers: { "X-Shopify-Access-Token": accessToken }
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`Shopify fetch failed (${res.status}): ${body.substring(0, 200)}`);
        }
        const data = await res.json();
        return (data.products || []).map((p: any) => ({
            external_id: String(p.id),
            name: p.title,
            description: p.body_html?.replace(/<[^>]*>?/gm, ''),
            price: new Decimal(p.variants[0]?.price || "0"),
            compare_at_price: p.variants[0]?.compare_at_price ? new Decimal(p.variants[0].compare_at_price) : null,
            stock: p.variants.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0),
            image_urls: p.images?.map((img: any) => img.src) || [],
            categories: [{ id: p.product_type || "default", name: p.product_type || "General" }],
            variants: p.variants.map((v: any) => ({ external_id: String(v.id), name: v.title, price: new Decimal(v.price), stock: v.inventory_quantity }))
        }));
    }

    /**
     * ULTIMATE SALES ENGINE: Place Order
     */
    static async createOrder(payload: OrderPayload) {
        const store = await prisma.commerceStore.findUnique({ where: { id: payload.store_id } });
        if (!store) throw new Error("Store not found");

        return await prisma.$transaction(async (tx) => {
            let subtotal = new Decimal(0);
            let tax_total = new Decimal(0);

            const lineItems = [];
            for (const item of payload.items) {
                const product = await tx.commerceProduct.findUnique({
                    where: { id: item.product_id },
                    include: { variants: true }
                });
                if (!product) throw new Error(`Product ${item.product_id} not found`);

                // MONSTER GUARD: Real-time Stock Check
                const requestedQuantity = Number(item.quantity);
                const availableStock = Number(product.stock);
                
                if (availableStock < requestedQuantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}. Requested: ${requestedQuantity}, Available: ${availableStock}`);
                }

                let unitPrice = product.price;
                let name = product.name;

                if (item.variant_id) {
                    const variant = product.variants.find(v => v.id === item.variant_id);
                    if (variant) {
                        unitPrice = variant.price;
                        name = `${product.name} (${variant.name})`;
                    }
                }

                const itemTotal = unitPrice.mul(item.quantity);
                const itemTax = store.gst_enabled ? itemTotal.mul(product.gst_rate.div(100)) : new Decimal(0);

                subtotal = subtotal.add(itemTotal);
                tax_total = tax_total.add(itemTax);

                lineItems.push({
                    product_id: product.id,
                    variant_id: item.variant_id,
                    name,
                    quantity: item.quantity,
                    price: unitPrice,
                    tax_rate: product.gst_rate,
                    tax_amount: itemTax,
                    total: itemTotal.add(itemTax)
                });
            }

            // Apply Coupon
            let discount = new Decimal(0);
            if (payload.coupon_code) {
                const coupon = await tx.commerceCoupon.findUnique({ where: { code: payload.coupon_code } });
                if (coupon && coupon.is_active) {
                    if (coupon.discount_type === "PERCENTAGE") {
                        discount = subtotal.mul(coupon.discount_value.div(100));
                    } else {
                        discount = coupon.discount_value;
                    }
                }
            }

            const total = subtotal.add(tax_total).sub(discount);
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const order = await tx.commerceOrder.create({
                data: {
                    store_id: store.id,
                    contact_id: payload.contact_id,
                    order_number: orderNumber,
                    subtotal,
                    shipping_total: new Decimal(0), // Defaulting for now as per schema requirements
                    tax_total,
                    discount_total: discount,
                    total_amount: total,
                    payment_method: payload.payment_method,
                    shipping_address: payload.shipping_address,
                    status: "PLACED",
                    items: { create: lineItems }
                }
            });

            // Referral Tracking
            if (payload.referral_code) {
                const referral = await tx.commerceReferral.findFirst({
                    where: { store_id: store.id, referral_code: payload.referral_code }
                });
                if (referral) {
                    await tx.commerceOrder.update({
                        where: { id: order.id },
                        data: { referral_id: referral.id }
                    });
                }
            }

            return order;
        });

        // 🛰️ AUTOMATION: Abandoned Cart Recovery (fires 2 hours later if still unpaid)
        // Only triggered for non-immediate payment methods
        if (order.payment_method !== "RAZORPAY") {
            const workspace = await prisma.commerceStore.findUnique({
                where: { id: order.store_id },
                select: { workspace_id: true }
            });
            if (workspace) {
                scheduleAbandonedCartRecovery({
                    workspaceId: workspace.workspace_id,
                    orderId: order.id,
                    contactId: payload.contact_id,
                    orderNumber: order.order_number,
                    totalAmount: Number(order.total_amount),
                }).catch(e => console.error("[ABANDONED-CART-SCHEDULE-FAIL]:", e));
            }
        }

        return order;
    }

    /**
     * Webhook Processor
     */
    static async processWebhook(platform: CommercePlatform, payload: any, headers: any) {
        const store = await prisma.commerceStore.findFirst({ where: { platform } });
        if (!store) throw new Error(`Active store not found for ${platform}`);

        // Logic to update orders based on webhooks...
        // (Similar to previous logic but with new schema fields)
        return { success: true };
    }

    /**
     * WHATSAPP INTEGRATION: Format Catalog Message
     */
    static async getWhatsAppCatalog(storeId: string) {
        const products = await prisma.commerceProduct.findMany({
            where: { store_id: storeId, is_active: true },
            take: 10
        });

        // This would return a structured object that the Bot Engine 
        // can use to send an 'interactive' message with a product list.
        return products.map(p => ({
            id: p.id,
            title: p.name,
            description: p.description?.substring(0, 70),
            price: p.price,
            image_url: p.image_urls[0]
        }));
    }

    static async getCredentials(storeId: string) {
        const store = await prisma.commerceStore.findUnique({ where: { id: storeId } });
        if (!store || !store.encrypted_credentials) throw new Error("Credentials not found");
        return JSON.parse(decrypt((store.encrypted_credentials as any).data));
    }

    static async getLogisticsCredentials(storeId: string) {
        const store = await prisma.commerceStore.findUnique({ where: { id: storeId } });
        if (!store || !store.shipping_config) throw new Error("Logistics configuration not found");
        
        const config = store.shipping_config as any;
        if (config.password) {
            config.password = decrypt(config.password);
        }
        return config;
    }
}
