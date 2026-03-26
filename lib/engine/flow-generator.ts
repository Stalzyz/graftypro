/**
 * 🚀 FLOW GENERATOR (JSON Code Injector)
 * Converts a simplified JSON "Dialogue Script" into a full React Flow schema 
 * compatible with the Wabot_BSP Flow Engine.
 */

export interface SimpleStep {
    id: string;
    text: string;
    mediaUrl?: string;
    type?: 'message' | 'list' | 'action' | 'condition' | 'payment' | 'sync_data';
    options?: { label: string; next: string }[];
    actionType?: string;
    config?: {
        url?: string;
        method?: 'GET' | 'POST';
        headers?: Record<string, string>;
        body?: any;
        syncKey?: string;
        jsonPath?: string;
        fallbackValue?: any;
        [key: string]: any;
    };
}

export interface SimpleFlow {
    name: string;
    trigger_keyword?: string;
    steps: SimpleStep[];
}

export class FlowGenerator {
    /**
     * Injects a simplified JSON structure and returns valid nodes/edges
     */
    static generate(script: SimpleFlow) {
        const nodes: any[] = [];
        const edges: any[] = [];
        
        // Add Start Node
        nodes.push({
            id: 'start',
            type: 'start',
            position: { x: 400, y: 0 },
            data: { label: `Start: ${script.name}` }
        });

        script.steps.forEach((step, index) => {
            const x = 400;
            const y = (index + 1) * 200;

            const node: any = {
                id: step.id,
                type: step.type || 'message',
                position: { x, y },
                data: {
                    text: step.text,
                    mediaUrl: step.mediaUrl,
                    label: step.id,
                    ...step.config
                }
            };

            // Handle Buttons/Options
            if (step.options && step.options.length > 0) {
                node.data.buttons = step.options.map(opt => ({
                    type: 'reply',
                    reply: { id: `btn_${opt.next}`, title: opt.label }
                }));

                // Create Edges for Options
                step.options.forEach(opt => {
                    edges.push({
                        id: `e_${step.id}_${opt.next}`,
                        source: step.id,
                        target: opt.next,
                        label: opt.label
                    });
                });
            }

            // Handle Action/Sync Nodes
            if (step.type === 'action') {
                node.data = { ...node.data, actionType: step.actionType };
            }
            if (step.type === 'sync_data') {
                node.data = { 
                    ...node.data, 
                    apiConfig: step.config 
                };
            }

            nodes.push(node);
        });

        // Link Start to First Step if exists
        if (script.steps.length > 0) {
            edges.push({
                id: 'e_start_first',
                source: 'start',
                target: script.steps[0].id
            });
        }

        return {
            name: script.name,
            trigger_keyword: script.trigger_keyword,
            nodes,
            edges,
            status: 'PUBLISHED'
        };
    }

    /**
     * AI-Friendly prompt helper to generate the SimpleFlow JSON
     */
    static getAIPrompt() {
        return `
            Generate a JSON flow for WhatsApp using the following schema:
            {
                "name": "Flow Name",
                "trigger_keyword": "hello",
                "steps": [
                    {
                        "id": "welcome",
                        "text": "Text to send",
                        "options": [
                            { "label": "Button 1", "next": "next_step_id" }
                        ]
                    }
                ]
            }
        `;
    }
}
