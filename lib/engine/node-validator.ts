/**
 * 🔥 NODE VALIDATOR
 * System-wide structural and semantic validation for Flow Builder nodes.
 * Prevents corrupted or malicious node configurations from entering the database.
 */

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    cleanedNodes?: any[];
    cleanedEdges?: any[];
}

export function validateFlowData(nodes: any[], edges: any[]): ValidationResult {
    const errors: string[] = [];
    const validNodeIds = new Set<string>();

    if (!Array.isArray(nodes)) return { valid: false, errors: ["Nodes must be an array."] };
    if (!Array.isArray(edges)) return { valid: false, errors: ["Edges must be an array."] };

    // 1. Validate Nodes
    const cleanedNodes = nodes.filter((node, index) => {
        if (!node || typeof node !== 'object') {
            errors.push(`Node at index ${index} is not a valid object.`);
            return false;
        }

        if (!node.id || typeof node.id !== 'string') {
            errors.push(`Node at index ${index} is missing a valid 'id' string.`);
            return false;
        }

        if (validNodeIds.has(node.id)) {
            errors.push(`Duplicate Node ID detected: ${node.id}. Skipping duplicate.`);
            return false;
        }

        if (!node.type || typeof node.type !== 'string') {
            errors.push(`Node ${node.id} is missing a valid 'type'.`);
            return false;
        }

        if (!node.data || typeof node.data !== 'object') {
            errors.push(`Node ${node.id} is missing a valid 'data' payload.`);
            return false;
        }

        // --- Type-Specific Schema Validation ---
        const d = node.data;

        switch (node.type) {
            case 'message':
                if (!d.text && !d.mediaUrl && !d.contentType) {
                    errors.push(`Message node ${node.id} must have text or media.`);
                }
                if (d.buttons && !Array.isArray(d.buttons)) {
                    errors.push(`Message node ${node.id} buttons must be an array.`);
                }
                break;
            case 'payment':
            case 'Payment':
                if (!d.amount || isNaN(parseFloat(d.amount)) || parseFloat(d.amount) <= 0) {
                    errors.push(`Payment node ${node.id} requires a valid numeric amount > 0.`);
                }
                break;
            case 'list':
                if (!d.items || !Array.isArray(d.items) || d.items.length === 0) {
                    errors.push(`List node ${node.id} requires at least one item.`);
                }
                break;
            case 'condition':
                if (!d.conditionType || !d.operator) {
                    errors.push(`Condition node ${node.id} requires conditionType and operator.`);
                }
                break;
            case 'action':
                if (!d.actionType) {
                    errors.push(`Action node ${node.id} requires an actionType.`);
                }
                break;
            case 'wait':
                if (!d.delay && !d.delayValue) {
                    errors.push(`Wait node ${node.id} requires a delay value.`);
                }
                break;
        }

        validNodeIds.add(node.id);
        return true;
    });

    // 2. Validate Edges & Connection Integrity
    const validEdgeIds = new Set<string>();
    const cleanedEdges = edges.filter((edge, index) => {
        if (!edge || typeof edge !== 'object') {
            errors.push(`Edge at index ${index} is invalid.`);
            return false;
        }

        if (!edge.id || typeof edge.id !== 'string') {
            errors.push(`Edge missing ID at index ${index}.`);
            return false;
        }

        if (validEdgeIds.has(edge.id)) {
            errors.push(`Duplicate Edge ID: ${edge.id}. Skipping duplicate.`);
            return false;
        }

        if (!edge.source || !edge.target) {
            errors.push(`Edge ${edge.id} missing source or target.`);
            return false;
        }

        // Connection Integrity (Prevent orphans/dead links)
        if (!validNodeIds.has(edge.source)) {
            errors.push(`Edge ${edge.id} starts from non-existent node: ${edge.source}.`);
            return false;
        }
        if (!validNodeIds.has(edge.target)) {
            errors.push(`Edge ${edge.id} points to non-existent node: ${edge.target}.`);
            return false;
        }

        // Circular loop detection (Self-referencing node)
        if (edge.source === edge.target) {
            errors.push(`Edge ${edge.id} creates an infinite self-loop on node ${edge.source}.`);
            return false;
        }

        validEdgeIds.add(edge.id);
        return true;
    });

    return {
        valid: errors.length === 0,
        errors,
        cleanedNodes,
        cleanedEdges
    };
}
