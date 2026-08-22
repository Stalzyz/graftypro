import { prisma } from '../lib/db';

async function main() {
  const EXACT_WORKSPACE_ID = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';
  console.log(`🚀 Publishing E-Commerce Solutions Flow to Grekam's Workspace (${EXACT_WORKSPACE_ID})...`);

  // Ensure workspace exists or fetch details
  let workspace = await prisma.workspace.findUnique({
    where: { id: EXACT_WORKSPACE_ID }
  });

  if (!workspace) {
    workspace = await prisma.workspace.findFirst({
      where: { id: { startsWith: '89b6c788' } }
    });
  }

  const workspaceId = workspace ? workspace.id : EXACT_WORKSPACE_ID;
  console.log(`🎯 Target Workspace ID: ${workspaceId}`);

  // Define Flow Nodes & Edges
  const nodes: any[] = [];
  const edges: any[] = [];

  const EDGE_STYLE = { stroke: '#00a884', strokeWidth: 2 };
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

  // NODE 1: Trigger Node ("Ecommerce")
  nodes.push({
    id: 'start_ecommerce',
    type: 'start',
    data: {
      text: 'Ecommerce',
      label: 'Trigger: Keyword "Ecommerce" / "get quote"',
      keywords: ['Ecommerce', 'ecommerce', 'E-commerce', 'get quote', 'Get Quote']
    },
    position: { x: 100, y: 50 },
    width: 240,
    height: 70
  });

  // NODE 2: Greeting & Qualification Message
  nodes.push({
    id: 'msg_greeting',
    type: 'message',
    data: {
      label: 'Greeting & Qualification',
      text: `👋 Welcome to *Grekam Academy*!\n\nWe specialize in high-converting E-Commerce platforms & custom web app solutions designed to scale your revenue. 🚀\n\nTo help us recommend the exact tech stack & quote for your project, please answer 3 quick details below:`
    },
    position: { x: 100, y: 160 },
    width: 320,
    height: 140
  });
  edges.push(makeEdge('e_start_greeting', 'start_ecommerce', 'msg_greeting'));

  // NODE 3: Meta Flow / Interactive Form Node
  nodes.push({
    id: 'form_lead_info',
    type: 'action',
    data: {
      label: 'Lead Form Collection',
      actionType: 'form_input',
      title: '📋 Grekam E-Commerce Requirement Form',
      fields: [
        { name: 'full_name', label: 'Full Name', required: true },
        { name: 'business_name', label: 'Business / Brand Name', required: true },
        { name: 'requirements', label: 'Key Requirements & Features', required: false }
      ]
    },
    position: { x: 100, y: 340 },
    width: 320,
    height: 150
  });
  edges.push(makeEdge('e_greeting_form', 'msg_greeting', 'form_lead_info'));

  // NODE 4: Carousel Package Options (Shopify, E-Commerce, Atlas)
  nodes.push({
    id: 'carousel_packages',
    type: 'carousel',
    data: {
      label: 'Package Details Carousel',
      text: '📦 *Choose Your E-Commerce Solution Package*',
      cards: [
        {
          id: 'card_shopify',
          title: '🛒 Shopify Solution',
          description: '₹25,000 — Quick store launch, 100+ themes, payment gateway & inventory sync.',
          buttons: [{ type: 'QUICK_REPLY', text: 'Select Shopify (₹25k)', payload: 'pkg_shopify' }]
        },
        {
          id: 'card_ecommerce',
          title: '🛍️ E-Commerce Standard',
          description: '₹45,000 — Custom storefront, CRM integration, automated shipping & GST billing.',
          buttons: [{ type: 'QUICK_REPLY', text: 'Select E-Commerce (₹45k)', payload: 'pkg_ecommerce' }]
        },
        {
          id: 'card_atlas',
          title: '⚡ Atlas Custom Web App',
          description: 'Starting ₹75,000 — Bespoke ultra-fast web development, custom admin panel & API integrations.',
          buttons: [
            { type: 'URL', text: '🌐 View Live Demo', url: 'https://atlasadmin.grekam.in/login' },
            { type: 'QUICK_REPLY', text: 'Select Atlas (₹75k+)', payload: 'pkg_atlas' }
          ]
        }
      ]
    },
    position: { x: 100, y: 530 },
    width: 360,
    height: 280
  });
  edges.push(makeEdge('e_form_carousel', 'form_lead_info', 'carousel_packages'));

  // NODE 5: Direct Call Executive Template Message Node
  nodes.push({
    id: 'msg_call_executive',
    type: 'message',
    data: {
      label: 'Direct Phone Call CTA',
      text: `📞 *Speak With Our Lead Tech Executive*\n\nWant an immediate consultation or custom project breakdown?\n\nClick the button below to call our executive directly!`,
      buttons: [
        {
          type: 'PHONE_NUMBER',
          text: '📞 Call Executive',
          phone_number: '919789359407'
        }
      ]
    },
    position: { x: 100, y: 850 },
    width: 320,
    height: 160
  });
  edges.push(makeEdge('e_carousel_call', 'carousel_packages', 'msg_call_executive'));

  // NODE 6: Flow End Node
  nodes.push({
    id: 'node_end',
    type: 'end',
    data: { label: 'Flow Complete' },
    position: { x: 100, y: 1050 },
    width: 200,
    height: 64
  });
  edges.push(makeEdge('e_call_end', 'msg_call_executive', 'node_end'));

  // Upsert Flow into database
  const flowId = 'grekam-ecommerce-flow-01';
  const flow = await (prisma as any).flow.upsert({
    where: { id: flowId },
    update: {
      workspace_id: workspaceId,
      name: '🛒 Grekam Academy — E-Commerce Solutions Flow',
      trigger_keyword: 'Ecommerce',
      status: 'PUBLISHED',
      nodes: nodes as any,
      edges: edges as any
    },
    create: {
      id: flowId,
      workspace_id: workspaceId,
      name: '🛒 Grekam Academy — E-Commerce Solutions Flow',
      trigger_keyword: 'Ecommerce',
      status: 'PUBLISHED',
      nodes: nodes as any,
      edges: edges as any
    }
  });

  console.log(`✅ Flow successfully published in Workspace ID ${workspaceId}! Flow ID: ${flow.id}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
