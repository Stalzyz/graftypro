import { prisma } from './lib/db';

const WORKSPACE_ID = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';

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

async function main() {
    const store = await prisma.commerceStore.findFirst({
        where: { workspace_id: WORKSPACE_ID },
        include: { products: { where: { is_active: true } } }
    });

    if (!store) {
        console.error("Store not found!");
        return;
    }

    // Limit to 30 products for WhatsApp catalog limitations if needed
    const products = store.products.slice(0, 30);
    console.log(`Using ${products.length} products...`);

    const nodes: any[] = [];
    const edges: any[] = [];

    // 1. TRIGGER NODE
    nodes.push({
      id: 'start_1',
      type: 'start',
      data: { text: 'SHOP', label: 'Trigger: meta' },
      position: { x: 50, y: 100 },
      width: 220,
      height: 64,
    });

    // 2. E-COMMERCE CATALOG NODE
    const catalogNodeId = 'catalog_products';
    nodes.push({
      id: catalogNodeId,
      type: 'catalog',
      data: {
        label: `Pummy's Store Catalog`,
        buttonTitle: 'Buy Now',
        storeId: store.id,
        carouselProducts: products.map(p => ({
          id: p.id,
          name: p.name.substring(0, 20),
          price: String(p.price),
          text: p.name,
          image: p.image_urls[0] || '',
        })),
      },
      position: { x: 350, y: 100 },
      width: 300,
      height: 520,
    });
    edges.push(makeEdge('e_start_catalog', 'start_1', catalogNodeId));

    // 3. CONTACT FORM NODES
    const collectNameId = 'collect_name';
    const collectAddressId = 'collect_address';
    const collectPhoneId = 'collect_phone';
    
    nodes.push({ id: collectNameId, type: 'collect_input', data: { text: '👤 Please enter your *full name*:', label: 'Collect Name', variableName: 'customer_name' }, position: { x: 1250, y: 100 }, width: 250, height: 100 });
    nodes.push({ id: collectAddressId, type: 'collect_input', data: { text: '🏠 Please enter your *delivery address*:', label: 'Collect Address', variableName: 'delivery_address' }, position: { x: 1250, y: 240 }, width: 250, height: 100 });
    nodes.push({ id: collectPhoneId, type: 'collect_input', data: { text: '📱 Please enter your *contact phone number*:', label: 'Collect Phone', variableName: 'contact_phone' }, position: { x: 1250, y: 380 }, width: 250, height: 100 });
    
    edges.push(makeEdge('e_name_address', collectNameId, collectAddressId));
    edges.push(makeEdge('e_address_phone', collectAddressId, collectPhoneId));

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
    edges.push(makeEdge('e_phone_confirm', collectPhoneId, confirmationId));

    const endId = 'node_end';
    nodes.push({ id: endId, type: 'end', data: { label: 'Flow Complete' }, position: { x: 1900, y: 520 }, width: 180, height: 64 });
    edges.push(makeEdge('e_confirm_end', confirmationId, endId));

    // 5. PAYMENT GATEWAY NODES
    const COL_HEIGHT = 160;
    products.forEach((prod, i) => {
      const paymentNodeId = `payment_${prod.id}`;
      nodes.push({
        id: paymentNodeId,
        type: 'payment',
        data: {
          label: `Pay ₹${prod.price}: ${prod.name.substring(0, 20)}`,
          amount: String(prod.price),
          currency: 'INR',
          paymentTitle: prod.name,
          paymentProvider: 'Razorpay',
          text: `💳 *Order ${prod.name}*\n\n💰 Price: ₹${prod.price}\n\nTap the button below to pay securely via Razorpay 👇`,
        },
        position: { x: 800, y: 50 + (i * COL_HEIGHT) },
        width: 300,
        height: 140,
      });

      // Edge 1: Catalog item -> Payment Gateway Node
      edges.push(makeEdge(`e_cat_pay_${prod.id}`, catalogNodeId, paymentNodeId, `item-sel_${prod.id}`));

      // Edge 2: Payment Gateway Node -> Contact Form
      edges.push(makeEdge(`e_pay_contact_${prod.id}`, paymentNodeId, collectNameId));
    });

    const FLOW_ID = 'meta-store-flow-' + Date.now();
    await prisma.flow.create({
      data: {
        id: FLOW_ID,
        workspace_id: WORKSPACE_ID,
        name: "🛒 Pummy's Store E-Commerce Flow",
        trigger_keyword: 'meta',
        nodes: nodes as any,
        edges: edges as any,
        status: 'PUBLISHED',
      },
    });
    console.log(`✅ Flow created successfully: ${FLOW_ID}`);

    // CREATE TRACKING FLOW
    const trackNodes: any[] = [
        { id: 'start_track', type: 'start', data: { text: 'track', label: 'Trigger: track' }, position: { x: 50, y: 100 }, width: 220, height: 64 },
        { id: 'track_node', type: 'order_tracking', data: { label: 'Order Tracking' }, position: { x: 350, y: 100 }, width: 300, height: 120 }
    ];
    const trackEdges: any[] = [
        makeEdge('e_track', 'start_track', 'track_node')
    ];

    const TRACK_FLOW_ID = 'track-flow-' + Date.now();
    await prisma.flow.create({
      data: {
        id: TRACK_FLOW_ID,
        workspace_id: WORKSPACE_ID,
        name: "📦 Track Order Flow",
        trigger_keyword: 'track',
        nodes: trackNodes as any,
        edges: trackEdges as any,
        status: 'PUBLISHED',
      },
    });
    console.log(`✅ Track Flow created successfully: ${TRACK_FLOW_ID}`);

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
