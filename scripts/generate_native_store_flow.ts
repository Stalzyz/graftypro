import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// The user's specific workspace ID
const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';

async function main() {
  console.log("Fetching CommerceProducts from database...");
  const store = await prisma.commerceStore.findFirst({
    where: { workspace_id: WORKSPACE_ID }
  });

  if (!store) {
    console.error("No CommerceStore found for workspace.");
    return;
  }

  let products = await prisma.commerceProduct.findMany({
    where: { store_id: store.id },
    take: 17
  });

  if (products.length === 0) {
    console.error("No CommerceProducts found! Please ensure products are added to the store.");
    return;
  }

  console.log(`Found ${products.length} real products. Building flow...`);

  const flowId = '66a0b04b-6b9f-42dc-9729-349db0225b04'; // Fixed ID
  
  const nodes: any[] = [];
  const edges: any[] = [];

  // 1. Start Node
  const startId = 'start_node';
  nodes.push({
    id: startId, type: 'start',
    data: { triggerKeyword: 'NATIVE', triggerType: 'keyword' },
    position: { x: 64, y: 32 }, width: 250, height: 60,
  });

  // 2. Welcome Message
  const welcomeId = 'msg_welcome';
  nodes.push({
    id: welcomeId, type: 'message',
    data: {
      text: '👋 Welcome to our Native Store!\n\nWe have a wide range of healthy and delicious products waiting for you.',
      label: 'Welcome Message'
    },
    position: { x: 64, y: 160 }, width: 250, height: 100,
  });
  edges.push({ id: `e_start_welcome`, source: startId, target: welcomeId });

  // 3. List 1 (Products 1 to 9 + Next Page)
  const carousel1Id = 'carousel_page_1';
  const page1Products = products.slice(0, 9);
  
  const items1 = page1Products.map((p, idx) => ({
    id: p.id,
    title: p.name.substring(0, 24),
    description: `Price: ₹${p.price}`.substring(0, 72)
  }));

  if (products.length > 9) {
    items1.push({
      id: 'next_page_trigger',
      title: 'More Products 👉',
      description: 'Click to see next page'
    });
  }

  nodes.push({
    id: carousel1Id, type: 'list',
    data: {
      label: 'Products Page 1',
      text: 'Please select a product from the list below:',
      buttonText: '🛍️ View Products',
      sectionTitle: 'Available Items',
      items: items1
    },
    position: { x: 64, y: 320 }, width: 320, height: 250,
  });
  edges.push({ id: `e_welcome_c1`, source: welcomeId, target: carousel1Id });

  // 4. List 2 (Products 10 to 17)
  const carousel2Id = 'carousel_page_2';
  if (products.length > 9) {
    const page2Products = products.slice(9, 17);
    const items2 = page2Products.map((p, idx) => ({
      id: p.id,
      title: p.name.substring(0, 24),
      description: `Price: ₹${p.price}`.substring(0, 72)
    }));

    nodes.push({
      id: carousel2Id, type: 'list',
      data: {
        label: 'Products Page 2',
        text: 'Here are more products for you:',
        buttonText: '🛍️ View More',
        sectionTitle: 'More Items',
        items: items2
      },
      position: { x: 400, y: 320 }, width: 320, height: 250,
    });
    edges.push({ id: `e_c1_c2`, source: carousel1Id, sourceHandle: 'item-next_page_trigger', target: carousel2Id });
  }

  // 5. Quantity List Node
  const qtyListId = 'list_qty';
  nodes.push({
    id: qtyListId, type: 'list',
    data: {
      text: '📦 *{{product_name}}* selected!\nPrice: ₹{{price}} per unit\n\nHow many units would you like to order?',
      buttonText: '📦 Choose Quantity',
      label: 'Quantity Menu',
      sectionTitle: 'Select Quantity',
      items: [
        { id: 'qty_1', title: '1 Unit', description: '₹1 × price' },
        { id: 'qty_2', title: '2 Units', description: '₹2 × price' },
        { id: 'qty_3', title: '3 Units', description: '₹3 × price' },
        { id: 'qty_4', title: '4 Units', description: '₹4 × price' },
        { id: 'qty_5', title: '5 Units', description: '₹5 × price' },
      ],
    },
    position: { x: 64, y: 700 }, width: 320, height: 250,
  });

  // 6. Connecting Products to Quantity via Set Actions
  products.forEach((prod, i) => {
    const setPriceId = `action_price_${prod.id}`;
    nodes.push({
      id: setPriceId, type: 'action',
      data: {
        label: `Set Price: ${prod.price}`,
        actionType: 'set_variable',
        variableKey: 'price',
        variableValue: String(prod.price),
      },
      position: { x: 800, y: i * 80 }, width: 250, height: 60,
    });
    
    // Connect List items
    if (i < 9) {
      edges.push({ id: `e_c1_p_${prod.id}`, source: carousel1Id, sourceHandle: `item-${prod.id}`, target: setPriceId });
    } else {
      edges.push({ id: `e_c2_p_${prod.id}`, source: carousel2Id, sourceHandle: `item-${prod.id}`, target: setPriceId });
    }

    const setNameId = `action_name_${prod.id}`;
    nodes.push({
      id: setNameId, type: 'action',
      data: {
        label: `Set Name: ${prod.name.substring(0, 10)}`,
        actionType: 'set_variable',
        variableKey: 'product_name',
        variableValue: prod.name,
      },
      position: { x: 1100, y: i * 80 }, width: 250, height: 60,
    });

    edges.push({ id: `e_setprice_setname_${prod.id}`, source: setPriceId, target: setNameId });
    edges.push({ id: `e_setname_qty_${prod.id}`, source: setNameId, target: qtyListId });
  });

  // 7. Quantity Actions & Compute Total
  const computeTotalId = 'action_compute_total';
  nodes.push({
    id: computeTotalId, type: 'action',
    data: {
      label: 'Compute Total',
      actionType: 'compute',
      variableKey: 'total',
      expression: '{{price}} * {{qty}}',
    },
    position: { x: 64, y: 950 }, width: 250, height: 80,
  });

  [1, 2, 3, 4, 5].forEach((q, i) => {
    const setQtyId = `action_qty_${q}`;
    nodes.push({
      id: setQtyId, type: 'action',
      data: {
        label: `Set Qty: ${q}`,
        actionType: 'set_variable',
        variableKey: 'qty',
        variableValue: String(q),
      },
      position: { x: 400 + i * 280, y: 700 }, width: 250, height: 80,
    });
    edges.push({ id: `e_qty_list_${q}`, source: qtyListId, sourceHandle: `item-qty_${q}`, target: setQtyId });
    edges.push({ id: `e_setqty_compute_${q}`, source: setQtyId, target: computeTotalId });
  });

  // 8. Order Summary
  const orderSummaryId = 'msg_order_summary';
  nodes.push({
    id: orderSummaryId, type: 'message',
    data: {
      text: '🛒 *Order Summary*\n\n📦 Product: {{product_name}}\n🔢 Quantity: {{qty}} unit(s)\n💰 Unit Price: ₹{{price}}\n━━━━━━━━━━━━━━\n💳 *Total: ₹{{total}}*\n\nPlease share your details to complete the order.',
      label: 'Order Summary',
    },
    position: { x: 64, y: 1100 }, width: 280, height: 140,
  });
  edges.push({ id: `e_compute_summary`, source: computeTotalId, target: orderSummaryId });

  // 9. Collect Input Nodes
  const collectNameId = 'collect_name';
  const collectAddressId = 'collect_address';
  const collectPhoneId = 'collect_phone';

  nodes.push({
    id: collectNameId, type: 'collect_input',
    data: { text: '👤 Please enter your *Full Name*:', label: 'Collect Name', variableName: 'contact_name' },
    position: { x: 64, y: 1280 }, width: 250, height: 100,
  });

  nodes.push({
    id: collectAddressId, type: 'collect_input',
    data: { text: '🏠 Please enter your *Delivery Address & Pincode*:', label: 'Collect Address', variableName: 'contact_address' },
    position: { x: 64, y: 1410 }, width: 250, height: 100,
  });

  nodes.push({
    id: collectPhoneId, type: 'collect_input',
    data: { text: '📱 Please enter your *Contact Phone Number*:', label: 'Collect Phone', variableName: 'contact_phone' },
    position: { x: 64, y: 1540 }, width: 250, height: 100,
  });

  edges.push({ id: 'e_summary_name', source: orderSummaryId, target: collectNameId });
  edges.push({ id: 'e_name_address', source: collectNameId, target: collectAddressId });
  edges.push({ id: 'e_address_phone', source: collectAddressId, target: collectPhoneId });

  // 10. Payment Node
  const paymentId = 'node_payment';
  nodes.push({
    id: paymentId, type: 'payment',
    data: {
      label: 'Razorpay Payment',
      amount: '{{total}}',
      currency: 'INR',
      description: 'Order for {{product_name}} (x{{qty}})',
      paymentProvider: 'Razorpay'
    },
    position: { x: 64, y: 1680 }, width: 250, height: 120,
  });
  edges.push({ id: 'e_phone_payment', source: collectPhoneId, target: paymentId });

  // 11. Confirmation Message
  const confirmId = 'msg_confirmation';
  nodes.push({
    id: confirmId, type: 'message',
    data: {
      text: '🎉 *Order Placed Successfully!*\n\nThank you for your order, {{contact_name}}. Your {{product_name}} (x{{qty}}) will be shipped to:\n{{contact_address}}\n\nWe will contact you at {{contact_phone}} if needed.',
      label: 'Confirmation Message'
    },
    position: { x: 64, y: 1840 }, width: 250, height: 140,
  });
  // Note: Payment nodes automatically transition to target on SUCCESS webhook from Razorpay
  edges.push({ id: 'e_payment_confirm', source: paymentId, target: confirmId });

  console.log("Upserting flow to database...");
  await prisma.flow.upsert({
    where: { id: flowId },
    update: {
      name: 'Native Store (Nuclear Edition)',
      nodes,
      edges,
      status: 'PUBLISHED'
    },
    create: {
      id: flowId,
      workspace_id: WORKSPACE_ID,
      name: 'Native Store (Nuclear Edition)',
      nodes,
      edges,
      status: 'PUBLISHED'
    }
  });

  console.log(`✅ Flow successfully created/updated with ID: ${flowId}`);
  console.log(`Trigger it on WhatsApp with the keyword: NATIVE`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
