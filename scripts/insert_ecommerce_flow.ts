#!/usr/bin/env tsx
/**
 * Inserts Pummy's Bites E-Commerce Flow into production DB with
 * full React Flow visual compatibility (items array for ListNode & proper handle edge connections).
 */
import { prisma } from '../lib/db';

const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';

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

const qtyOptions = [
  { id: 'qty_1', title: '1 Unit', qty: 1 },
  { id: 'qty_2', title: '2 Units', qty: 2 },
  { id: 'qty_3', title: '3 Units', qty: 3 },
  { id: 'qty_5', title: '5 Units', qty: 5 },
  { id: 'qty_10', title: '10 Units', qty: 10 },
];

const COL_W = 280;
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

// START NODE
nodes.push({ id: 'start_1', type: 'start', data: { text: 'SHOP', label: 'Trigger: SHOP / MENU' }, position: { x: 64, y: 64 }, width: 200, height: 64 });

// WELCOME MESSAGE
nodes.push({ id: 'msg_welcome', type: 'message', data: { text: "👋 Welcome to *Pummy's Bites*!\n\nWe deliver natural, healthy foods right to your door. 🌿\n\nBrowse our menu below and order in seconds! 🛒", label: 'Welcome' }, position: { x: 64, y: 170 }, width: 260, height: 120 });
edges.push(makeEdge('e_start_welcome', 'start_1', 'msg_welcome'));

// PRODUCT LIST MENU
nodes.push({
  id: 'list_products',
  type: 'list',
  data: {
    text: "🛍️ *Our Products*\n\nSelect a product to see details and place your order:",
    buttonText: '🛒 View Products',
    label: 'Product Menu',
    sectionTitle: 'Health Foods',
    items: products.map(p => ({
      id: `sel_${p.id}`,
      title: p.shortName.substring(0, 24),
      description: `₹${p.price} per unit`,
    })),
    sections: [
      {
        title: 'Health Foods',
        rows: products.map(p => ({
          id: `sel_${p.id}`,
          title: p.shortName.substring(0, 24),
          description: `₹${p.price} per unit`,
        })),
      },
    ],
  },
  position: { x: 64, y: 340 },
  width: 320,
  height: 480,
});
edges.push(makeEdge('e_welcome_prodlist', 'msg_welcome', 'list_products'));

// PER-PRODUCT ACTIONS (Set price & set name)
products.forEach((prod, i) => {
  const setPriceId = `action_price_${prod.id}`;
  const setNameId = `action_name_${prod.id}`;

  nodes.push({
    id: setPriceId,
    type: 'action',
    data: {
      label: `Set Price: ₹${prod.price}`,
      actionType: 'set_variable',
      variableKey: 'price',
      variableValue: String(prod.price),
    },
    position: { x: 450 + i * COL_W, y: 340 },
    width: 240,
    height: 90,
  });

  // Edge from product item handle on list_products to action_price node
  edges.push(makeEdge(`e_prod_${prod.id}`, 'list_products', setPriceId, `item-sel_${prod.id}`));

  nodes.push({
    id: setNameId,
    type: 'action',
    data: {
      label: `Set Name: ${prod.shortName}`,
      actionType: 'set_variable',
      variableKey: 'product_name',
      variableValue: prod.name,
    },
    position: { x: 450 + i * COL_W, y: 460 },
    width: 240,
    height: 90,
  });

  edges.push(makeEdge(`e_setprice_setname_${prod.id}`, setPriceId, setNameId));
  edges.push(makeEdge(`e_setname_qty_${prod.id}`, setNameId, 'list_qty'));
});

// QUANTITY LIST MENU
nodes.push({
  id: 'list_qty',
  type: 'list',
  data: {
    text: "📦 *{{product_name}}* selected!\n💰 Price: ₹{{price}} per unit\n\nHow many units would you like to order?",
    buttonText: '📦 Choose Quantity',
    label: 'Quantity Menu',
    sectionTitle: 'Select Quantity',
    items: qtyOptions.map(q => ({
      id: q.id,
      title: q.title,
      description: `₹${q.qty} × unit price`,
    })),
    sections: [
      {
        title: 'Select Quantity',
        rows: qtyOptions.map(q => ({
          id: q.id,
          title: q.title,
          description: `₹${q.qty} × unit price`,
        })),
      },
    ],
  },
  position: { x: 64, y: 880 },
  width: 320,
  height: 340,
});

// PER-QTY ACTIONS (Set qty & compute)
qtyOptions.forEach((q, i) => {
  const setQtyId = `action_qty_${q.id}`;
  nodes.push({
    id: setQtyId,
    type: 'action',
    data: {
      label: `Set Qty: ${q.title}`,
      actionType: 'set_variable',
      variableKey: 'qty',
      variableValue: String(q.qty),
    },
    position: { x: 450 + i * COL_W, y: 880 },
    width: 240,
    height: 90,
  });

  // Edge from item handle on list_qty to setQtyId
  edges.push(makeEdge(`e_qty_${q.id}`, 'list_qty', setQtyId, `item-${q.id}`));
  edges.push(makeEdge(`e_setqty_compute_${q.id}`, setQtyId, 'action_compute_total'));
});

// COMPUTE TOTAL NODE
nodes.push({
  id: 'action_compute_total',
  type: 'action',
  data: {
    label: 'Compute Total',
    actionType: 'compute',
    variableKey: 'total',
    expression: '{{price}} * {{qty}}',
  },
  position: { x: 64, y: 1280 },
  width: 240,
  height: 90,
});
edges.push(makeEdge('e_compute_summary', 'action_compute_total', 'msg_order_summary'));

// ORDER SUMMARY MESSAGE
nodes.push({
  id: 'msg_order_summary',
  type: 'message',
  data: {
    text: '🛒 *Order Summary*\n\n📦 Product: {{product_name}}\n🔢 Quantity: {{qty}} unit(s)\n💰 Unit Price: ₹{{price}}\n━━━━━━━━━━━━━━\n💳 *Total: ₹{{total}}*\n\nPlease share your details to complete the order.',
    label: 'Order Summary',
  },
  position: { x: 64, y: 1410 },
  width: 280,
  height: 140,
});

// COLLECT INPUTS
nodes.push({ id: 'collect_name', type: 'collect_input', data: { text: '👤 Please enter your *full name*:', label: 'Collect Name', variableName: 'customer_name' }, position: { x: 64, y: 1580 }, width: 260, height: 100 });
nodes.push({ id: 'collect_address', type: 'collect_input', data: { text: '🏠 Please enter your *delivery address* (include city & pincode):', label: 'Collect Address', variableName: 'delivery_address' }, position: { x: 64, y: 1710 }, width: 260, height: 100 });
nodes.push({ id: 'collect_phone', type: 'collect_input', data: { text: '📱 Please enter your *contact phone number*:', label: 'Collect Phone', variableName: 'contact_phone' }, position: { x: 64, y: 1840 }, width: 260, height: 100 });
nodes.push({ id: 'collect_email', type: 'collect_input', data: { text: '📧 Please enter your *email address* (for order confirmation):', label: 'Collect Email', variableName: 'contact_email' }, position: { x: 64, y: 1970 }, width: 260, height: 100 });

edges.push(makeEdge('e_summary_name', 'msg_order_summary', 'collect_name'));
edges.push(makeEdge('e_name_address', 'collect_name', 'collect_address'));
edges.push(makeEdge('e_address_phone', 'collect_address', 'collect_phone'));
edges.push(makeEdge('e_phone_email', 'collect_phone', 'collect_email'));

// PAYMENT NODE
nodes.push({
  id: 'node_payment',
  type: 'payment',
  data: {
    label: 'Collect Payment',
    amount: '{{total}}',
    paymentTitle: '{{product_name}} × {{qty}} units',
    paymentProvider: 'Razorpay',
    text: "💳 *Ready to pay!*\n\n📦 *{{product_name}}*\n🔢 Qty: {{qty}} | 💰 Total: ₹{{total}}\n\nTap below to pay securely 👇",
  },
  position: { x: 64, y: 2100 },
  width: 280,
  height: 200,
});
edges.push(makeEdge('e_email_payment', 'collect_email', 'node_payment'));

// CONFIRMATION MESSAGE
nodes.push({
  id: 'msg_confirmation',
  type: 'message',
  data: {
    text: "🎉 *Order Placed Successfully!*\n\nThank you, *{{customer_name}}*! 🙏\n\n📦 *{{product_name}}* × {{qty}} units\n💰 Amount: ₹{{total}}\n🏠 Delivery to: {{delivery_address}}\n\nWe'll dispatch within 1-2 business days. Tracking details to follow!\n\nReply *HELP* for support 😊\n\n— *Pummy's Bites Team* 🌿",
    label: 'Confirmation',
  },
  position: { x: 64, y: 2330 },
  width: 280,
  height: 180,
});
edges.push(makeEdge('e_payment_confirm', 'node_payment', 'msg_confirmation'));

// END NODE
nodes.push({ id: 'node_end', type: 'end', data: { label: 'Flow Complete' }, position: { x: 64, y: 2540 }, width: 200, height: 64 });
edges.push(makeEdge('e_confirm_end', 'msg_confirmation', 'node_end'));

async function main() {
  console.log(`Inserting updated flow for workspace ${WORKSPACE_ID}...`);
  console.log(`  Nodes: ${nodes.length}, Edges: ${edges.length}`);

  // Delete duplicate flows if any
  await (prisma as any).flow.deleteMany({
    where: {
      workspace_id: WORKSPACE_ID,
      id: { not: 'c9788717-b6cc-4fe6-932e-ac0dda65f0d6' },
      name: { contains: 'E-Commerce' },
    },
  });

  const flow = await (prisma as any).flow.upsert({
    where: { id: 'c9788717-b6cc-4fe6-932e-ac0dda65f0d6' },
    update: {
      name: "🛒 Pummy's Bites E-Commerce Flow",
      trigger_keyword: 'SHOP',
      nodes: nodes as any,
      edges: edges as any,
      status: 'PUBLISHED',
    },
    create: {
      id: 'c9788717-b6cc-4fe6-932e-ac0dda65f0d6',
      workspace_id: WORKSPACE_ID,
      name: "🛒 Pummy's Bites E-Commerce Flow",
      trigger_keyword: 'SHOP',
      nodes: nodes as any,
      edges: edges as any,
      status: 'PUBLISHED',
    },
  });

  console.log(`✅ Flow updated: ${flow.id}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
