#!/usr/bin/env tsx
/**
 * Fixes the e-commerce flow edges to use proper React Flow format
 * with type, style, animated, sourceHandle, targetHandle fields.
 */
import { prisma } from '../lib/db';

const FLOW_ID = 'c9788717-b6cc-4fe6-932e-ac0dda65f0d6';

const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };

const products = [
  { id: 'c8e8d453' }, { id: '86aeca1e' }, { id: 'b0da196f' }, { id: 'cbc2217e' },
  { id: '1d53ef52' }, { id: '604d4b7b' }, { id: 'bccb624b' }, { id: '7616da0b' },
  { id: '4810d215' }, { id: 'a4611f4a' },
];

const qtyOptions = [
  { id: 'qty_1' }, { id: 'qty_2' }, { id: 'qty_3' }, { id: 'qty_5' }, { id: 'qty_10' },
];

function edge(id: string, source: string, target: string, sourceHandle: string | null = null) {
  return {
    id,
    type: 'smoothstep',
    style: EDGE_STYLE,
    source,
    target,
    animated: false,
    sourceHandle: sourceHandle,
    targetHandle: null,
  };
}

const edges: any[] = [
  edge('e_start_welcome', 'start_1', 'msg_welcome'),
  edge('e_welcome_prodlist', 'msg_welcome', 'list_products'),
];

// Per product: list → set_price → set_name → qty_list
products.forEach(p => {
  edges.push(edge(`e_prod_${p.id}`, 'list_products', `action_price_${p.id}`, `sel_${p.id}`));
  edges.push(edge(`e_setprice_setname_${p.id}`, `action_price_${p.id}`, `action_name_${p.id}`));
  edges.push(edge(`e_setname_qty_${p.id}`, `action_name_${p.id}`, 'list_qty'));
});

// Per quantity: list → set_qty → compute
qtyOptions.forEach(q => {
  edges.push(edge(`e_qty_${q.id}`, 'list_qty', `action_qty_${q.id}`, q.id));
  edges.push(edge(`e_setqty_compute_${q.id}`, `action_qty_${q.id}`, 'action_compute_total'));
});

// Rest of the flow
edges.push(edge('e_compute_summary', 'action_compute_total', 'msg_order_summary'));
edges.push(edge('e_summary_name', 'msg_order_summary', 'collect_name'));
edges.push(edge('e_name_address', 'collect_name', 'collect_address'));
edges.push(edge('e_address_phone', 'collect_address', 'collect_phone'));
edges.push(edge('e_phone_email', 'collect_phone', 'collect_email'));
edges.push(edge('e_email_payment', 'collect_email', 'node_payment'));
edges.push(edge('e_payment_confirm', 'node_payment', 'msg_confirmation'));
edges.push(edge('e_confirm_end', 'msg_confirmation', 'node_end'));

async function main() {
  console.log(`Updating ${edges.length} edges for flow ${FLOW_ID}...`);

  await (prisma as any).flow.update({
    where: { id: FLOW_ID },
    data: { edges: edges as any },
  });

  console.log('✅ Edges updated with proper React Flow format');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
