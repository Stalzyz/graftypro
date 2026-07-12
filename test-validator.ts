const nodes = [
  { id: 'start-1', type: 'start' },
  { id: 'node_2', type: 'meta_flow' },
  { id: 'node_3', type: 'message' }
];
const edges = [
  { source: 'start-1', target: 'node_2' },
  { source: 'node_2', target: 'node_3' }
];

const connectedTargets = new Set(edges.map(e => e.target));
nodes.forEach(node => {
    if (node.type === 'start') return;
    if (!connectedTargets.has(node.id)) {
        console.log(`Node ${node.id} is NOT connected`);
    } else {
        console.log(`Node ${node.id} is connected`);
    }
});
