// scripts/seed-ecommerce.ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("🛒 Injecting Demo E-commerce Data...");

    const user = await db.user.findFirst({ where: { email: 'demo@grafty.com' }, include: { workspace: true } });
    if (!user || !user.workspace_id) {
        console.error("❌ Demo user or workspace not found.");
        return;
    }

    const wsId = user.workspace_id;
    console.log(`Found Workspace ID: ${wsId}`);

    // Get an existing contact to attach orders to
    const contact = await db.contact.findFirst({ where: { workspace_id: wsId } });
    if (!contact) {
        console.error("❌ No contacts found. Run seed-demo-dashboard.ts first.");
        return;
    }

    // 1. Create a Store
    console.log("➕ Creating Store...");
    const store = await db.commerceStore.create({
        data: {
            workspace_id: wsId,
            name: "Grafty Official Merchandise",
            currency: "USD",
            status: "ACTIVE"
        }
    });

    // 2. Create Categories
    console.log("➕ Creating Categories...");
    const apparelCat = await db.commerceCategory.create({
        data: { store_id: store.id, name: "Apparel" }
    });
    const accessoriesCat = await db.commerceCategory.create({
        data: { store_id: store.id, name: "Accessories" }
    });

    // 3. Create Products
    console.log("➕ Creating Products...");
    const p1 = await db.commerceProduct.create({
        data: {
            store_id: store.id,
            category_id: apparelCat.id,
            name: "Premium Admin Hoodie",
            description: "High quality heavy-blend hoodie for developers.",
            price: 49.99,
            compare_at_price: 65.00,
            stock: 150,
            image_urls: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"],
            is_active: true
        }
    });

    const p2 = await db.commerceProduct.create({
        data: {
            store_id: store.id,
            category_id: accessoriesCat.id,
            name: "Grafty Ceramic Mug",
            description: "Matte black ceramic coffee mug, 11oz.",
            price: 14.99,
            stock: 300,
            image_urls: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80"],
            is_active: true
        }
    });

    const p3 = await db.commerceProduct.create({
        data: {
            store_id: store.id,
            category_id: apparelCat.id,
            name: "Founder T-Shirt",
            description: "100% cotton minimal logo t-shirt.",
            price: 24.99,
            compare_at_price: 30.00,
            stock: 80,
            image_urls: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"],
            is_active: true
        }
    });

    // 4. Create Orders
    console.log("➕ Creating Orders...");
    await db.commerceOrder.create({
        data: {
            store_id: store.id,
            contact_id: contact.id,
            order_number: "ORD-1001",
            status: "DELIVERED",
            payment_status: "PAID",
            payment_method: "STRIPE",
            subtotal: 64.98,
            tax_total: 5.20,
            shipping_total: 0.00,
            discount_total: 0.00,
            total_amount: 70.18,
            items: {
                create: [
                    {
                        product_id: p1.id,
                        name: p1.name,
                        quantity: 1,
                        price: p1.price,
                        total: p1.price
                    },
                    {
                        product_id: p2.id,
                        name: p2.name,
                        quantity: 1,
                        price: p2.price,
                        total: p2.price
                    }
                ]
            }
        }
    });

    await db.commerceOrder.create({
        data: {
            store_id: store.id,
            contact_id: contact.id,
            order_number: "ORD-1002",
            status: "PLACED",
            payment_status: "PENDING",
            payment_method: "COD",
            subtotal: 24.99,
            tax_total: 2.00,
            shipping_total: 5.00,
            discount_total: 0.00,
            total_amount: 31.99,
            items: {
                create: [
                    {
                        product_id: p3.id,
                        name: p3.name,
                        quantity: 1,
                        price: p3.price,
                        total: p3.price
                    }
                ]
            }
        }
    });

    console.log("✅ E-commerce Dummy Data Seeded Successfully!");
    await db.$disconnect();
}

main().catch(console.error);
