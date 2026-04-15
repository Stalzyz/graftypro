import { prisma } from "../db";
import { WhatsAppService } from "../whatsapp/service";
import { decrypt } from "../security/encryption";
import axios from "axios";

const META_API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * ☢️ NUCLEAR CATALOG ENGINE
 * 
 * Bridges Grafty's CommerceProduct database with Meta Commerce Manager.
 * Enables native WhatsApp product cards (MPM/SPM) and processes
 * Meta's native cart orders back into CommerceOrder records.
 */
export class CatalogEngine {

    // =========================================================
    // 1. CATALOG SYNC — Push products to Meta Commerce Manager
    // =========================================================

    /**
     * Sync all active products from a Grafty store to the linked Meta Commerce Catalog.
     * Each product gets a `retailer_id` assigned (uses SKU or product UUID).
     * 
     * Prerequisite: Store must have a `catalog_id` set (from Meta Commerce Manager).
     */
    static async syncCatalogToMeta(workspaceId: string): Promise<{ synced: number; errors: string[] }> {
        const store = await prisma.commerceStore.findFirst({
            where: { workspace_id: workspaceId },
            include: { products: { where: { is_active: true }, include: { variants: true } } }
        });

        if (!store) throw new Error("No store found for this workspace");
        if (!store.catalog_id) throw new Error("No Meta Catalog ID configured. Link your catalog in Commerce Settings.");

        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId },
            select: { access_token: true }
        });
        if (!waba) throw new Error("WhatsApp account not connected");

        const token = decrypt(waba.access_token);
        const catalogId = store.catalog_id;
        const errors: string[] = [];
        let synced = 0;

        for (const product of store.products) {
            try {
                // Determine retailer_id: prefer SKU, fallback to product UUID
                const retailerId = product.retailer_id || product.sku || product.id;

                // Build Meta Catalog item payload
                // Ref: https://developers.facebook.com/docs/commerce-platform/catalog/batch-api
                const itemData: any = {
                    retailer_id: retailerId,
                    name: product.name.substring(0, 200), // Meta limit: 200 chars
                    description: (product.description || product.name).substring(0, 9999),
                    price: `${Math.round(Number(product.price) * 100)}`, // Price in smallest unit (paise)
                    currency: store.currency || "INR",
                    availability: product.stock > 0 ? "in stock" : "out of stock",
                    url: product.platform_url || `https://wa.me/${retailerId}`, // Required but can be placeholder
                };

                // Add image if available
                if (product.image_urls && product.image_urls.length > 0) {
                    itemData.image_url = product.image_urls[0];
                }

                // Add sale price if compare_at_price exists
                if (product.compare_at_price && Number(product.compare_at_price) > Number(product.price)) {
                    itemData.sale_price = `${Math.round(Number(product.price) * 100)}`;
                    itemData.sale_price_effective_date = `${new Date().toISOString()}/${new Date(Date.now() + 365 * 86400000).toISOString()}`;
                    itemData.price = `${Math.round(Number(product.compare_at_price) * 100)}`;
                }

                // Push to Meta via Batch API
                await axios.post(`${BASE_URL}/${catalogId}/batch`, {
                    requests: [{
                        method: "UPDATE",
                        retailer_id: retailerId,
                        data: itemData
                    }]
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update local product with retailer_id if not set
                if (!product.retailer_id) {
                    await prisma.commerceProduct.update({
                        where: { id: product.id },
                        data: { retailer_id: retailerId }
                    });
                }

                synced++;
                console.log(`[CatalogEngine] ✅ Synced: ${product.name} → retailer_id: ${retailerId}`);
            } catch (err: any) {
                const msg = `Failed to sync "${product.name}": ${err.response?.data?.error?.message || err.message}`;
                errors.push(msg);
                console.error(`[CatalogEngine] ❌ ${msg}`);
            }
        }

        // Update last sync timestamp
        await prisma.commerceStore.update({
            where: { id: store.id },
            data: { last_sync_at: new Date() }
        });

        console.log(`[CatalogEngine] Sync complete: ${synced}/${store.products.length} products synced`);
        return { synced, errors };
    }

    // =========================================================
    // 2. SEND PRODUCT CATALOG — Multi-Product Message (MPM)
    // =========================================================

    /**
     * Send a native WhatsApp Multi-Product Message to a customer.
     * Falls back to interactive List Message if no catalog_id is configured.
     */
    static async sendProductCatalog(
        phoneId: string,
        token: string,
        to: string,
        workspaceId: string,
        categoryFilter?: string
    ): Promise<any> {
        const store = await prisma.commerceStore.findFirst({
            where: { workspace_id: workspaceId },
            include: {
                products: {
                    where: { is_active: true, stock: { gt: 0 } },
                    include: { category: true },
                    take: 30, // Meta MPM limit per section
                    orderBy: { created_at: "desc" }
                },
                categories: true
            }
        });

        if (!store || store.products.length === 0) {
            // Graceful fallback: send text
            return WhatsAppService.sendText(
                phoneId, token, to,
                "📦 Our catalog is being updated. Please check back shortly!",
                workspaceId, "SERVICE"
            );
        }

        // Filter by category if specified
        let products = store.products;
        if (categoryFilter) {
            products = products.filter(p =>
                p.category?.name?.toLowerCase().includes(categoryFilter.toLowerCase())
            );
        }

        if (products.length === 0) {
            return WhatsAppService.sendText(
                phoneId, token, to,
                `📦 No products found in "${categoryFilter}". Try browsing all categories!`,
                workspaceId, "SERVICE"
            );
        }

        // ====== STRATEGY: Native MPM if catalog_id exists, else List Message ======

        if (store.catalog_id) {
            // ✅ NATIVE MULTI-PRODUCT MESSAGE
            return this.sendNativeMPM(phoneId, token, to, store, products, workspaceId);
        } else {
            // ⚠️ FALLBACK: Interactive List Message
            return this.sendListFallback(phoneId, token, to, store, products, workspaceId);
        }
    }

    /**
     * Send native Meta Multi-Product Message using catalog_id.
     */
    private static async sendNativeMPM(
        phoneId: string,
        token: string,
        to: string,
        store: any,
        products: any[],
        workspaceId: string
    ): Promise<any> {
        // Group products by category for sections
        const categoryMap = new Map<string, any[]>();

        for (const product of products) {
            const catName = product.category?.name || "All Products";
            if (!categoryMap.has(catName)) {
                categoryMap.set(catName, []);
            }
            categoryMap.get(catName)!.push(product);
        }

        const sections = Array.from(categoryMap.entries()).map(([title, items]) => ({
            title: title.substring(0, 24), // Meta limit
            product_items: items
                .filter(p => p.retailer_id || p.sku || p.id) // Must have retailer_id
                .slice(0, 30) // Meta limit per section
                .map(p => ({
                    product_retailer_id: p.retailer_id || p.sku || p.id
                }))
        })).filter(s => s.product_items.length > 0);

        if (sections.length === 0) {
            return this.sendListFallback(phoneId, token, to, store, products, workspaceId);
        }

        // Limit to 10 sections max (Meta limit)
        const limitedSections = sections.slice(0, 10);

        return WhatsAppService.sendMultiProductMessage(
            phoneId, token, to,
            store.catalog_id,
            `🛍️ *${store.name}*\n\nBrowse our collection below and tap to add items to your cart!`,
            limitedSections.map(s => ({
                title: s.title,
                product_retailer_ids: s.product_items.map(i => i.product_retailer_id)
            })),
            workspaceId,
            "SERVICE",
            "Product Catalog Sent"
        );
    }

    /**
     * Fallback: Send products as an interactive List Message.
     * Used when vendor hasn't configured Meta Commerce Catalog.
     */
    private static async sendListFallback(
        phoneId: string,
        token: string,
        to: string,
        store: any,
        products: any[],
        workspaceId: string
    ): Promise<any> {
        // Build sections grouped by category
        const categoryMap = new Map<string, any[]>();

        for (const product of products) {
            const catName = product.category?.name || "All Products";
            if (!categoryMap.has(catName)) {
                categoryMap.set(catName, []);
            }
            categoryMap.get(catName)!.push(product);
        }

        const sections = Array.from(categoryMap.entries()).map(([title, items]) => ({
            title: title.substring(0, 24),
            rows: items.slice(0, 10).map(p => ({
                id: `product_${p.id}`,
                title: p.name.substring(0, 24),
                description: `₹${Number(p.price).toLocaleString("en-IN")}${p.stock > 0 ? "" : " (Out of Stock)"}`
            }))
        }));

        // WhatsApp List Message: max 10 sections, 10 rows each
        const limitedSections = sections.slice(0, 10);

        return WhatsAppService.sendListMessage(
            phoneId, token, to,
            `🛍️ *${store.name}*\n\nBrowse our products below:`,
            "View Products",
            limitedSections,
            { type: "text", text: "Product Catalog" },
            `${products.length} products available`,
            workspaceId,
            "SERVICE",
            "Product Catalog (List)"
        );
    }

    // =========================================================
    // 3. SEND SINGLE PRODUCT — Single Product Message (SPM)
    // =========================================================

    /**
     * Send a native Single Product Message for a specific product.
     * Falls back to text + image if no catalog_id.
     */
    static async sendSingleProduct(
        phoneId: string,
        token: string,
        to: string,
        productId: string,
        workspaceId: string
    ): Promise<any> {
        const product = await prisma.commerceProduct.findUnique({
            where: { id: productId },
            include: { store: true, variants: true }
        });

        if (!product) throw new Error(`Product ${productId} not found`);

        const catalogId = product.store.catalog_id;
        const retailerId = product.retailer_id || product.sku || product.id;

        if (catalogId) {
            // ✅ Native Single Product Message
            return WhatsAppService.sendMessage(phoneId, token, {
                to,
                type: "interactive",
                interactive: {
                    type: "product",
                    body: {
                        text: product.description
                            ? product.description.substring(0, 1024)
                            : `Check out ${product.name}!`
                    },
                    footer: { text: `₹${Number(product.price).toLocaleString("en-IN")} • ${product.stock > 0 ? "In Stock" : "Out of Stock"}` },
                    action: {
                        catalog_id: catalogId,
                        product_retailer_id: retailerId
                    }
                }
            }, workspaceId, "SERVICE", "Single Product View");
        } else {
            // ⚠️ Fallback: Image + text + order button
            const priceText = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
                ? `~₹${Number(product.compare_at_price).toLocaleString("en-IN")}~ → *₹${Number(product.price).toLocaleString("en-IN")}*`
                : `*₹${Number(product.price).toLocaleString("en-IN")}*`;

            const body = [
                `🛍️ *${product.name}*`,
                "",
                product.description ? product.description.substring(0, 500) : "",
                "",
                `💰 Price: ${priceText}`,
                `📦 Stock: ${product.stock > 0 ? `${product.stock} available` : "Out of Stock"}`,
                product.variants.length > 0 ? `🎨 Variants: ${product.variants.map(v => v.name).join(", ")}` : ""
            ].filter(Boolean).join("\n");

            if (product.image_urls && product.image_urls.length > 0) {
                return WhatsAppService.sendImage(
                    phoneId, token, to,
                    product.image_urls[0],
                    body,
                    workspaceId, "SERVICE", "Product Detail"
                );
            }

            return WhatsAppService.sendInteractiveButtons(
                phoneId, token, to,
                body,
                [{ id: `order_${product.id}`, title: "Order Now" }],
                undefined,
                workspaceId, "SERVICE", "Product Detail"
            );
        }
    }

    // =========================================================
    // 4. PROCESS META CART ORDER — Native WhatsApp Cart → DB
    // =========================================================

    /**
     * Process a native WhatsApp cart order (from Meta's `order` message type).
     * Creates a CommerceOrder from the cart payload and returns it.
     * 
     * Meta order payload structure:
     * { catalog_id, product_items: [{ product_retailer_id, quantity, item_price, currency }] }
     */
    static async processMetaCartOrder(
        workspaceId: string,
        contactId: string,
        orderPayload: any
    ): Promise<any> {
        const store = await prisma.commerceStore.findFirst({
            where: { workspace_id: workspaceId },
            include: { products: true }
        });

        if (!store) throw new Error("No store found for order processing");

        const productItems = orderPayload.product_items || [];
        if (productItems.length === 0) throw new Error("Empty cart received");

        // Build order items by matching retailer_id to our products
        const orderItems: any[] = [];
        let subtotal = 0;
        let taxTotal = 0;

        for (const cartItem of productItems) {
            const product = store.products.find(p =>
                (p.retailer_id === cartItem.product_retailer_id) ||
                (p.sku === cartItem.product_retailer_id) ||
                (p.id === cartItem.product_retailer_id)
            );

            if (!product) {
                console.warn(`[CatalogEngine] Product not found for retailer_id: ${cartItem.product_retailer_id}`);
                continue;
            }

            // Use Meta's price if available, otherwise our DB price
            const unitPrice = cartItem.item_price
                ? Number(cartItem.item_price) / 1000 // Meta sends in milli-units
                : Number(product.price);
            const quantity = Number(cartItem.quantity) || 1;
            const itemTotal = unitPrice * quantity;

            // Calculate GST
            const gstRate = Number(product.gst_rate) || 0;
            const taxAmount = store.gst_enabled ? itemTotal * (gstRate / (100 + gstRate)) : 0;

            subtotal += itemTotal;
            taxTotal += taxAmount;

            orderItems.push({
                product_id: product.id,
                name: product.name,
                quantity,
                price: unitPrice,
                tax_rate: gstRate,
                tax_amount: taxAmount,
                total: itemTotal
            });
        }

        if (orderItems.length === 0) {
            throw new Error("No valid products found in cart");
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const total = subtotal; // Tax is inclusive for WhatsApp commerce

        const order = await prisma.commerceOrder.create({
            data: {
                store_id: store.id,
                contact_id: contactId,
                order_number: orderNumber,
                subtotal: subtotal - taxTotal,
                tax_total: taxTotal,
                shipping_total: 0,
                discount_total: 0,
                total_amount: total,
                payment_method: "PENDING",
                status: "PLACED",
                payment_status: "PENDING",
                metadata: { source: "WHATSAPP_NATIVE_CART", catalog_id: orderPayload.catalog_id },
                items: {
                    create: orderItems
                }
            },
            include: { items: true }
        });

        console.log(`[CatalogEngine] ✅ Native cart order created: ${order.order_number} (${orderItems.length} items, ₹${total})`);
        return order;
    }
}
