const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';
const FLOW_ID = '77c2a104-b38a-4e0a-b7cb-999e0c2a5d01';

async function main() {
  console.log('Fetching products and store...');

  const store = await prisma.commerceStore.findFirst({
    where: { workspace_id: WORKSPACE_ID },
    select: { id: true, catalog_id: true, name: true }
  });

  if (!store || !store.catalog_id) {
    console.error('Store or catalog_id not found!');
    return;
  }

  const products = await prisma.commerceProduct.findMany({
    where: { store_id: store.id, is_active: true },
    select: { id: true, name: true, price: true, retailer_id: true },
    orderBy: { created_at: 'asc' }
  });

  console.log(`Found ${products.length} products for catalog ${store.catalog_id}`);

  const nodes = [];
  const edges = [];

  // ─────────────────────────────────────────────
  // 1. Start Node
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'start_node', type: 'start',
    data: { triggerKeyword: 'NATIVE', triggerType: 'keyword', label: 'Start: NATIVE' },
    position: { x: 400, y: 0 }, width: 250, height: 60,
  });

  // ─────────────────────────────────────────────
  // 2. Welcome Message
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'msg_welcome', type: 'message',
    data: {
      label: 'Welcome',
      text: `🌿 *Welcome to ${store.name}!*\n\nWe bring you wholesome, natural foods crafted with care.\n\n👇 Browse our catalog, add products to your cart, and place your order directly here on WhatsApp!`,
    },
    position: { x: 400, y: 120 }, width: 280, height: 110,
  });
  edges.push({ id: 'e_start_welcome', source: 'start_node', target: 'msg_welcome' });

  // ─────────────────────────────────────────────
  // 3. Catalog Page 1 (Products 1–9)
  //    Cart submission from this node → directly to Order Summary
  // ─────────────────────────────────────────────
  const page1 = products.slice(0, 9);
  nodes.push({
    id: 'catalog_page_1', type: 'catalog',
    data: {
      label: '🛍️ Browse Products (1/2)',
      text: '📦 *Pummys Bites — Page 1 of 2*\n\n👇 Tap a product, choose quantity, and press *Send Cart* to order!',
      sectionTitle: 'Healthy Foods — Page 1',
      buttonTitle: 'View Product',
      storeId: store.id,
      carouselProducts: page1.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price.toString(),
        retailer_id: p.retailer_id,
      })),
    },
    position: { x: 400, y: 290 }, width: 320, height: 180,
  });
  edges.push({ id: 'e_welcome_catalog1', source: 'msg_welcome', target: 'catalog_page_1' });

  // ─────────────────────────────────────────────
  // 4. Catalog Page 2 (Products 10–17)
  //    Shown via "See More" navigation list
  // ─────────────────────────────────────────────
  const page2 = products.slice(9, 17);
  nodes.push({
    id: 'catalog_page_2', type: 'catalog',
    data: {
      label: '🛍️ Browse Products (2/2)',
      text: '📦 *Pummys Bites — Page 2 of 2*\n\n👇 Tap a product, choose quantity, and press *Send Cart* to order!',
      sectionTitle: 'Healthy Foods — Page 2',
      buttonTitle: 'View Product',
      storeId: store.id,
      carouselProducts: page2.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price.toString(),
        retailer_id: p.retailer_id,
      })),
    },
    position: { x: 800, y: 290 }, width: 320, height: 180,
  });

  // ─────────────────────────────────────────────
  // 5. "More Products?" navigation list (shown after page 1)
  //    - "More Products" → Catalog Page 2
  //    - "Back to Page 1" → Catalog Page 1 again (send catalog again)
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'list_more_or_order', type: 'list',
    data: {
      label: 'More Products or Ready to Order?',
      text: '👋 Still browsing? You can also see Page 2 of our catalog below!\n\n_Once you have added to cart from either page, your order will be processed automatically._',
      buttonText: '📋 Options',
      sectionTitle: 'Navigation',
      items: [
        { id: 'see_page_2', title: '👉 See More Products', description: 'View products 10 to 17' },
        { id: 'back_page_1', title: '🔁 Back to Page 1', description: 'View products 1 to 9 again' },
      ]
    },
    position: { x: 400, y: 530 }, width: 320, height: 160,
  });
  edges.push({ id: 'e_catalog1_nav', source: 'catalog_page_1', target: 'list_more_or_order' });
  edges.push({ id: 'e_nav_catalog2', source: 'list_more_or_order', sourceHandle: 'item-see_page_2', target: 'catalog_page_2' });
  edges.push({ id: 'e_nav_catalog1', source: 'list_more_or_order', sourceHandle: 'item-back_page_1', target: 'catalog_page_1' });

  // ─────────────────────────────────────────────
  // 6. Order Summary (reached after cart submission from EITHER catalog page)
  //    {{product_name}}, {{qty}}, {{price}}, {{total}} are set by the engine
  //    automatically when the cart order message is received
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'msg_order_summary', type: 'message',
    data: {
      label: 'Order Summary',
      text: '🛒 *Order Summary*\n\n📦 Product: *{{product_name}}*\n🔢 Quantity: {{qty}} unit(s)\n💰 Unit Price: ₹{{price}}\n━━━━━━━━━━━━━━\n💳 *Total: ₹{{total}}*\n\nPlease share your delivery details to complete the order. 👇',
    },
    position: { x: 400, y: 760 }, width: 300, height: 140,
  });

  // Cart submission from EITHER catalog page goes to order summary
  edges.push({ id: 'e_catalog1_summary', source: 'catalog_page_1', sourceHandle: 'cart_submitted', target: 'msg_order_summary' });
  edges.push({ id: 'e_catalog2_summary', source: 'catalog_page_2', sourceHandle: 'cart_submitted', target: 'msg_order_summary' });
  // Also connect catalog_page_2's default edge (the engine uses first outgoing edge for cart)
  edges.push({ id: 'e_catalog2_nav', source: 'catalog_page_2', target: 'list_more_or_order' });

  // ─────────────────────────────────────────────
  // 7. Collect Name, Address, Phone
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'collect_name', type: 'collect_input',
    data: { label: 'Collect Name', text: '👤 Please enter your *Full Name*:', variableName: 'contact_name' },
    position: { x: 400, y: 960 }, width: 260, height: 90,
  });
  nodes.push({
    id: 'collect_address', type: 'collect_input',
    data: { label: 'Collect Address', text: '🏠 Please enter your *Delivery Address* with Pincode:', variableName: 'contact_address' },
    position: { x: 400, y: 1100 }, width: 260, height: 90,
  });
  nodes.push({
    id: 'collect_phone', type: 'collect_input',
    data: { label: 'Collect Phone', text: '📱 Please enter your *Contact Phone Number*:', variableName: 'contact_phone' },
    position: { x: 400, y: 1240 }, width: 260, height: 90,
  });

  edges.push({ id: 'e_summary_name',   source: 'msg_order_summary', target: 'collect_name' });
  edges.push({ id: 'e_name_address',   source: 'collect_name',      target: 'collect_address' });
  edges.push({ id: 'e_address_phone',  source: 'collect_address',   target: 'collect_phone' });

  // ─────────────────────────────────────────────
  // 8. Payment Node (Razorpay) — amount = {{total}} which is set by cart engine
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'node_payment', type: 'payment',
    data: {
      label: 'Razorpay Payment',
      amount: '{{total}}',
      currency: 'INR',
      description: 'Order: {{product_name}} × {{qty}} from Pummys Bites',
      paymentProvider: 'Razorpay',
    },
    position: { x: 400, y: 1380 }, width: 260, height: 110,
  });
  edges.push({ id: 'e_phone_payment', source: 'collect_phone', target: 'node_payment' });

  // ─────────────────────────────────────────────
  // 9. Order Confirmed
  // ─────────────────────────────────────────────
  nodes.push({
    id: 'msg_confirmed', type: 'message',
    data: {
      label: 'Order Confirmed',
      text: '🎉 *Order Placed Successfully!*\n\nThank you, *{{contact_name}}*! 🙏\n\n📦 *{{product_name}}* × {{qty}}\n💳 Total Paid: ₹{{total}}\n📍 Delivery to: {{contact_address}}\n📱 Contact: {{contact_phone}}\n\n_We will process your order within 24 hours. Thank you for choosing Pummys Bites!_ 🌿',
    },
    position: { x: 400, y: 1550 }, width: 300, height: 160,
  });
  edges.push({ id: 'e_payment_confirm', source: 'node_payment', target: 'msg_confirmed' });

  // ─────────────────────────────────────────────
  // Save to DB
  // ─────────────────────────────────────────────
  console.log(`\nBuilding flow with ${nodes.length} nodes and ${edges.length} edges...`);

  await prisma.flow.upsert({
    where: { id: FLOW_ID },
    update: {
      name: 'Native Store — Catalog Edition',
      nodes,
      edges,
      trigger_keyword: 'NATIVE',
      status: 'PUBLISHED',
    },
    create: {
      id: FLOW_ID,
      workspace_id: WORKSPACE_ID,
      name: 'Native Store — Catalog Edition',
      nodes,
      edges,
      trigger_keyword: 'NATIVE',
      status: 'PUBLISHED',
    }
  });

  console.log(`\n✅ Flow "Native Store — Catalog Edition" updated!`);
  console.log(`   Nodes: ${nodes.length}, Edges: ${edges.length}`);
  console.log(`   Catalog ID: ${store.catalog_id}`);
  console.log(`\n🧪 End-to-End Test Path:`);
  console.log(`   1. Send "NATIVE" → Welcome message`);
  console.log(`   2. Catalog Page 1 appears with product images`);
  console.log(`   3. Tap any product → Add to Cart → Send Cart`);
  console.log(`   4. Engine extracts product + qty automatically`);
  console.log(`   5. Order Summary shows: product name, qty, price, total`);
  console.log(`   6. Bot asks for Name → Address → Phone`);
  console.log(`   7. Razorpay payment link generated with correct ₹total`);
  console.log(`   8. After payment → Confirmation message`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
