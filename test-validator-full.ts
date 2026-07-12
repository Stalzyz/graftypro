import { validateFlowData } from './lib/engine/node-validator.ts';
const nodes = [
  { id: 'start-1', type: 'start', data: { label: 'Start' } },
  { id: 'node_2', type: 'meta_flow', data: { label: 'Meta' } },
  { id: 'node_3', type: 'message', data: { text: 'Hello' } }
];
const edges = [
  { id: 'e1', source: 'start-1', target: 'node_2' },
  { id: 'e2', source: 'node_2', target: 'node_3' }
];

const res = validateFlowData(nodes, edges);
console.log(JSON.stringify(res, null, 2));
