#!/usr/bin/env tsx
/**
 * Creates the Pummy's Bites E-Commerce Flow Template in the DB
 */

const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';
const STORE_ID = '930f8aac-0a28-446f-a010-bd0862ee012d';

// Top 10 products with their prices
const products = [
  { id: 'c8e8d453', name: 'Forest Honey (300ml)', shortName: 'Forest Honey', price: 399 },
  { id: '86aeca1e', name: 'Urad Fit Nutri Blend (250g)', shortName: 'Urad Nutri Blend', price: 350 },
  { id: 'b0da196f', name: 'Ragi Urad Boneshield (250g)', shortName: 'Ragi Boneshield', price: 350 },
  { id: 'cbc2217e', name: 'Nendran Malt (200g)', shortName: 'Nendran Malt', price: 350 },
  { id: '1d53ef52', name: 'Multi Grain Nutri Force (250g)', shortName: 'Nutri Force Blend', price: 350 },
  { id: '604d4b7b', name: 'Tomato Pasta (250g)', shortName: 'Tomato Pasta', price: 150 },
  { id: 'bccb624b', name: 'Tomato Noodles (250g)', shortName: 'Tomato Noodles', price: 150 },
  { id: '7616da0b', name: 'Spinach Pasta (250g)', shortName: 'Spinach Pasta', price: 150 },
  { id: '4810d215', name: 'Spinach Noodles (250g)', shortName: 'Spinach Noodles', price: 150 },
  { id: 'a4611f4a', name: 'Multi Millet Pasta (250g)', shortName: 'Millet Pasta', price: 150 },
];

const qtyOptions = [
  { id: 'qty_1', title: '1 Unit', qty: 1 },
  { id: 'qty_2', title: '2 Units', qty: 2 },
  { id: 'qty_3', title: '3 Units', qty: 3 },
  { id: 'qty_5', title: '5 Units', qty: 5 },
  { id: 'qty_10', title: '10 Units', qty: 10 },
];

let nodeIdCounter = 1;
const nextId = (prefix: string) => `${prefix}_${nodeIdCounter++}`;

// ─── NODES ────────────────────────────────────────────────────────────────────

const nodes: any[] = [];
const edges: any[] = [];

// Utility: layout positions
let yPos = 64;
const COL_W = 280;

// ─── START NODE ───────────────────────────────────────────────────────────────
const startId = 'start_1';
nodes.push({
  id: startId, type: 'start',
  data: { text: 'SHOP', label: 'Trigger: SHOP / MENU' },
  position: { x: 64, y: 64 }, width: 200, height: 64,
});

// ─── WELCOME MESSAGE ──────────────────────────────────────────────────────────
const welcomeId = 'msg_welcome';
nodes.push({
  id: welcomeId, type: 'message',
  data: {
    text: '👋 Welcome to *Pummy\'s Bites*!\n\nWe deliver natural, healthy foods right to your door. 🌿\n\nBrowse our menu below and order in seconds! 🛒',
    label: 'Welcome',
  },
  position: { x: 64, y: 170 }, width: 250, height: 120,
});
edges.push({ id: `e_start_welcome`, source: startId, target: welcomeId });

// ─── PRODUCT LIST ─────────────────────────────────────────────────────────────
const productListId = 'list_products';
nodes.push({
  id: productListId, type: 'list',
  data: {
    text: '🛍️ *Our Products*\n\nSelect a product to see details and place your order:',
    buttonText: '🛒 View Products',
    label: 'Product Menu',
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
  position: { x: 64, y: 320 }, width: 280, height: 180,
});
edges.push({ id: `e_welcome_prodlist`, source: welcomeId, target: productListId });

// ─── PER-PRODUCT: set_variable nodes + quantity list ─────────────────────────
// All products share ONE quantity selection node — we route each product edge
// through its own set_variable node (setting price), then into qty_list.

const qtyListId = 'list_qty';

products.forEach((prod, i) => {
  const setPriceId = `action_price_${prod.id}`;
  nodes.push({
    id: setPriceId, type: 'action',
    data: {
      label: `Set Price: ${prod.shortName}`,
      actionType: 'set_variable',
      variableKey: 'price',
      variableValue: String(prod.price),
    },
    position: { x: 400 + i * COL_W, y: 320 }, width: 250, height: 100,
  });
  // Product list → set_variable for this product
  edges.push({
    id: `e_prod_${prod.id}`,
    source: productListId,
    sourceHandle: `sel_${prod.id}`,
    target: setPriceId,
  });

  // Also save product name to state
  const setNameId = `action_name_${prod.id}`;
  nodes.push({
    id: setNameId, type: 'action',
    data: {
      label: `Set Product Name`,
      actionType: 'set_variable',
      variableKey: 'product_name',
      variableValue: prod.name,
    },
    position: { x: 400 + i * COL_W, y: 440 }, width: 250, height: 100,
  });
  edges.push({ id: `e_setprice_setname_${prod.id}`, source: setPriceId, target: setNameId });

  // set_variable → qty list
  edges.push({ id: `e_setname_qty_${prod.id}`, source: setNameId, target: qtyListId });
});

// ─── QUANTITY SELECTION ───────────────────────────────────────────────────────
nodes.push({
  id: qtyListId, type: 'list',
  data: {
    text: '📦 *{{product_name}}* selected!\nPrice: ₹{{price}} per unit\n\nHow many units would you like to order?',
    buttonText: '📦 Choose Quantity',
    label: 'Quantity Menu',
    sections: [
      {
        title: 'Select Quantity',
        rows: qtyOptions.map(q => ({
          id: q.id,
          title: q.title,
          description: `₹${q.qty} × your product price`,
        })),
      },
    ],
  },
  position: { x: 64, y: 600 }, width: 280, height: 200,
});

// ─── PER-QTY: set_variable + compute ─────────────────────────────────────────
const computeTotalId = 'action_compute_total';

qtyOptions.forEach((q, i) => {
  const setQtyId = `action_qty_${q.id}`;
  nodes.push({
    id: setQtyId, type: 'action',
    data: {
      label: `Set Qty: ${q.title}`,
      actionType: 'set_variable',
      variableKey: 'qty',
      variableValue: String(q.qty),
    },
    position: { x: 400 + i * COL_W, y: 600 }, width: 250, height: 100,
  });
  edges.push({
    id: `e_qty_${q.id}`,
    source: qtyListId,
    sourceHandle: q.id,
    target: setQtyId,
  });
  edges.push({ id: `e_setqty_compute_${q.id}`, source: setQtyId, target: computeTotalId });
});

// Compute total = price * qty
nodes.push({
  id: computeTotalId, type: 'action',
  data: {
    label: 'Compute Total',
    actionType: 'compute',
    variableKey: 'total',
    expression: '{{price}} * {{qty}}',
  },
  position: { x: 64, y: 840 }, width: 250, height: 100,
});

// ─── ORDER SUMMARY MESSAGE ────────────────────────────────────────────────────
const orderSummaryId = 'msg_order_summary';
nodes.push({
  id: orderSummaryId, type: 'message',
  data: {
    text: '🛒 *Order Summary*\n\n📦 Product: {{product_name}}\n🔢 Quantity: {{qty}} unit(s)\n💰 Unit Price: ₹{{price}}\n━━━━━━━━━━━━━━\n💳 *Total: ₹{{total}}*\n\nPlease share your details to complete the order.',
    label: 'Order Summary',
  },
  position: { x: 64, y: 970 }, width: 280, height: 140,
});
edges.push({ id: `e_compute_summary`, source: computeTotalId, target: orderSummaryId });

// ─── CONTACT FORM: collect_input nodes ───────────────────────────────────────
const collectNameId = 'collect_name';
const collectAddressId = 'collect_address';
const collectPhoneId = 'collect_phone';
const collectEmailId = 'collect_email';

nodes.push({
  id: collectNameId, type: 'collect_input',
  data: { text: '👤 Please enter your *full name*:', label: 'Collect Name', variableName: 'customer_name' },
  position: { x: 64, y: 1130 }, width: 250, height: 100,
});
nodes.push({
  id: collectAddressId, type: 'collect_input',
  data: { text: '🏠 Please enter your *delivery address* (include city & pincode):', label: 'Collect Address', variableName: 'delivery_address' },
  position: { x: 64, y: 1260 }, width: 250, height: 100,
});
nodes.push({
  id: collectPhoneId, type: 'collect_input',
  data: { text: '📱 Please enter your *contact phone number*:', label: 'Collect Phone', variableName: 'contact_phone' },
  position: { x: 64, y: 1390 }, width: 250, height: 100,
});
nodes.push({
  id: collectEmailId, type: 'collect_input',
  data: { text: '📧 Please enter your *email address* (for order confirmation):', label: 'Collect Email', variableName: 'contact_email' },
  position: { x: 64, y: 1520 }, width: 250, height: 100,
});

edges.push({ id: 'e_summary_name', source: orderSummaryId, target: collectNameId });
edges.push({ id: 'e_name_address', source: collectNameId, target: collectAddressId });
edges.push({ id: 'e_address_phone', source: collectAddressId, target: collectPhoneId });
edges.push({ id: 'e_phone_email', source: collectPhoneId, target: collectEmailId });

// ─── PAYMENT NODE ─────────────────────────────────────────────────────────────
const paymentId = 'node_payment';
nodes.push({
  id: paymentId, type: 'payment',
  data: {
    label: 'Payment',
    amount: '{{total}}',
    paymentTitle: '{{product_name}} × {{qty}} units',
    paymentProvider: 'Razorpay',
    text: '💳 *Order ready!*\n\n📦 *{{product_name}}*\n🔢 Qty: {{qty}} | 💰 Total: ₹{{total}}\n\nTap below to complete your payment securely 👇',
  },
  position: { x: 64, y: 1650 }, width: 280, height: 200,
});
edges.push({ id: 'e_email_payment', source: collectEmailId, target: paymentId });

// ─── CONFIRMATION MESSAGE ─────────────────────────────────────────────────────
const confirmationId = 'msg_confirmation';
nodes.push({
  id: confirmationId, type: 'message',
  data: {
    text: '🎉 *Order Placed Successfully!*\n\nThank you, *{{customer_name}}*! 🙏\n\n📦 *{{product_name}}* × {{qty}} units\n💰 Amount: ₹{{total}}\n🏠 Delivery to: {{delivery_address}}\n\nWe\'ll dispatch your order within 1-2 business days. You\'ll receive tracking details soon!\n\nFor any queries, reply *HELP* 😊\n\n— *Pummy\'s Bites Team* 🌿',
    label: 'Confirmation',
  },
  position: { x: 64, y: 1870 }, width: 280, height: 180,
});
edges.push({ id: 'e_payment_confirm', source: paymentId, target: confirmationId });

// ─── END NODE ─────────────────────────────────────────────────────────────────
const endId = 'node_end';
nodes.push({
  id: endId, type: 'end',
  data: { label: 'Flow Complete' },
  position: { x: 64, y: 2070 }, width: 200, height: 64,
});
edges.push({ id: 'e_confirm_end', source: confirmationId, target: endId });

// ─── OUTPUT ───────────────────────────────────────────────────────────────────
const flow = {
  workspace_id: WORKSPACE_ID,
  name: '🛒 Pummy\'s Bites E-Commerce Flow',
  trigger_keyword: 'SHOP',
  nodes: JSON.stringify(nodes),
  edges: JSON.stringify(edges),
  status: 'PUBLISHED',
};

console.log('=== NODES COUNT:', nodes.length);
console.log('=== EDGES COUNT:', edges.length);
console.log('=== FLOW JSON ===');
console.log(JSON.stringify(flow, null, 2));
