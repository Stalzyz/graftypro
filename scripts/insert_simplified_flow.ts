#!/usr/bin/env tsx
/**
 * Simplifies Pummy's Bites E-Commerce Flow:
 * Trigger -> Product List Menu (10 products) -> Direct Payment Gateway per Product -> Contact Form -> Confirmation
 */
import { prisma } from '../lib/db';

const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';
const FLOW_ID = 'c9788717-b6cc-4fe6-932e-ac0dda65f0d6';

const products = [
  { id: 'c8e8d453', name: 'Forest Honey - Pure, Raw & Natural (300ml)', shortName: 'Forest Honey (300ml)', price: 399 },
  { id: '86aeca1e', name: 'Urad Fit Nutri Blend - Strength & Fitness (250g)', shortName: 'Urad Nutri Blend (250g)', price: 350 },
  { id: 'b0da196f', name: 'Ragi Urad Boneshield - Strong Bones (250g)', shortName: 'Ragi Boneshield (250g)', price: 350 },
  { id: 'cbc2217e', name: 'Nendran Malt - Natural Energy Drink (200g)', shortName: 'Nendran Malt (200g)', price: 350 },
  { id: '1d53ef52', name: 'Multi grain Nutri Force Blend (250g)', shortName: 'Nutri Force Blend (250g)', price: 350 },
  { id: '604d4b7b', name: 'Tomato Pasta - Tangy & Nutritious (250g)', shortName: 'Tomato Pasta (250g)', price: 150 },
  { id: 'bccb624b', name: 'Tomato Noodles - Tangy & Nutritious (250g)', shortName: 'Tomato Noodles (250g)', price: 150 },
  { id: '7616da0b', name: 'Spinach Pasta - Green & Healthy (250g)', shortName: 'Spinach Pasta (250g)', price: 150 },
  { id: '4810d215', name: 'Spinach Noodles - Green & Healthy (250g)', shortName: 'Spinach Noodles (250g)', price: 150 },
  { id: 'a4611f4a', name: 'Multi Millet Pasta - Wholesome (250g)', shortName: 'Millet Pasta (250g)', price: 150 },
];

const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };

function makeEdge(id: string, source: string, target: string, sourceHandle: string | null = null) {
  return {
    id,
    type: 'smoothstep',
    style: EDGE_STYLE,
    source,
    target,
    animated: false,
    sourceHandle,
    targetHandle: null,
  };
}

const nodes: any[] = [];
const edges: any[] = [];

// 1. TRIGGER NODE
nodes.push({
  id: 'start_1',
  type: 'start',
  data: { text: 'SHOP', label: 'Trigger: SHOP / MENU' },
  position: { x: 50, y: 100 },
  width: 220,
  height: 64,
});

// 2. PRODUCT LIST MENU (10 Products directly from Store)
const listProductsId = 'list_products';
nodes.push({
  id: listProductsId,
  type: 'list',
  data: {
    text: "👋 Welcome to *Pummy's Bites*! 🌿\n\nSelect a product from our e-commerce store to order:",
    buttonText: '🛒 Select Product',
    label: '10 E-Commerce Products',
    sectionTitle: 'Pummy\'s Healthy Store',
    items: products.map(p => ({
      id: `sel_${p.id}`,
      title: p.shortName.substring(0, 24),
      description: `₹${p.price} • Tap to Pay`,
    })),
    sections: [
      {
        title: 'Pummy\'s Healthy Store',
        rows: products.map(p => ({
          id: `sel_${p.id}`,
          title: p.shortName.substring(0, 24),
          description: `₹${p.price} • Tap to Pay`,
        })),
      },
    ],
  },
  position: { x: 350, y: 100 },
  width: 320,
  height: 520,
});
edges.push(makeEdge('e_start_products', 'start_1', listProductsId));

// 3. CONTACT FORM NODES (Form comes AFTER payment link selection or for order collection)
const collectNameId = 'collect_name';
const collectAddressId = 'collect_address';
const collectPhoneId = 'collect_phone';
const collectEmailId = 'collect_email';

nodes.push({ id: collectNameId, type: 'collect_input', data: { text: '👤 Please enter your *full name*:', label: 'Collect Name', variableName: 'customer_name' }, position: { x: 1250, y: 100 }, width: 250, height: 100 });
nodes.push({ id: collectAddressId, type: 'collect_input', data: { text: '🏠 Please enter your *delivery address*:', label: 'Collect Address', variableName: 'delivery_address' }, position: { x: 1250, y: 240 }, width: 250, height: 100 });
nodes.push({ id: collectPhoneId, type: 'collect_input', data: { text: '📱 Please enter your *contact phone number*:', label: 'Collect Phone', variableName: 'contact_phone' }, position: { x: 1250, y: 380 }, width: 250, height: 100 });
nodes.push({ id: collectEmailId, type: 'collect_input', data: { text: '📧 Please enter your *email address*:', label: 'Collect Email', variableName: 'contact_email' }, position: { x: 1250, y: 520 }, width: 250, height: 100 });

edges.push(makeEdge('e_name_address', collectNameId, collectAddressId));
edges.push(makeEdge('e_address_phone', collectAddressId, collectPhoneId));
edges.push(makeEdge('e_phone_email', collectPhoneId, collectEmailId));

// 4. CONFIRMATION MESSAGE & END
const confirmationId = 'msg_confirmation';
nodes.push({
  id: confirmationId,
  type: 'message',
  data: {
    text: "🎉 *Order Placed Successfully!*\n\nThank you for ordering from *Pummy's Bites*! 🙏\n\nWe will dispatch your order shortly.\n\nReply *HELP* anytime for support 😊",
    label: 'Order Confirmation',
  },
  position: { x: 1560, y: 520 },
  width: 280,
  height: 160,
});
edges.push(makeEdge('e_email_confirm', collectEmailId, confirmationId));

const endId = 'node_end';
nodes.push({ id: endId, type: 'end', data: { label: 'Flow Complete' }, position: { x: 1900, y: 520 }, width: 180, height: 64 });
edges.push(makeEdge('e_confirm_end', confirmationId, endId));

// 5. 10 PAYMENT NODES — EACH PRODUCT CONNECTS DIRECTLY TO ITS PAYMENT GATEWAY NODE, THEN TO CONTACT FORM
const COL_HEIGHT = 160;
products.forEach((prod, i) => {
  const paymentNodeId = `payment_${prod.id}`;

  nodes.push({
    id: paymentNodeId,
    type: 'payment',
    data: {
      label: `Pay ₹${prod.price}: ${prod.shortName}`,
      amount: String(prod.price),
      currency: 'INR',
      paymentTitle: prod.name,
      paymentProvider: 'Razorpay',
      text: `💳 *Order ${prod.shortName}*\n\n💰 Price: ₹${prod.price}\n\nTap the button below to pay securely via Razorpay 👇`,
    },
    position: { x: 800, y: 50 + i * COL_HEIGHT },
    width: 300,
    height: 140,
  });

  // Edge 1: Product List option -> Payment Gateway Node for that product
  edges.push(makeEdge(`e_prod_pay_${prod.id}`, listProductsId, paymentNodeId, `item-sel_${prod.id}`));

  // Edge 2: Payment Gateway Node -> Contact Form (Name Collection)
  edges.push(makeEdge(`e_pay_contact_${prod.id}`, paymentNodeId, collectNameId));
});

async function main() {
  console.log(`Updating simplified flow (Trigger -> 10 Store Products -> Razorpay Payment per Product -> Contact Form -> Confirmation)...`);
  console.log(`  Total Nodes: ${nodes.length}, Total Edges: ${edges.length}`);

  const flow = await (prisma as any).flow.upsert({
    where: { id: FLOW_ID },
    update: {
      name: "🛒 Pummy's Store E-Commerce Flow",
      trigger_keyword: 'SHOP',
      nodes: nodes as any,
      edges: edges as any,
      status: 'PUBLISHED',
    },
    create: {
      id: FLOW_ID,
      workspace_id: WORKSPACE_ID,
      name: "🛒 Pummy's Store E-Commerce Flow",
      trigger_keyword: 'SHOP',
      nodes: nodes as any,
      edges: edges as any,
      status: 'PUBLISHED',
    },
  });

  console.log(`✅ Flow updated successfully: ${flow.id}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
