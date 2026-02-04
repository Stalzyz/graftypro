
import { prisma } from "@/lib/db";

// Types for our Flow Nodes (simplified matches ReactFlow structure)
interface NodeData {
    text?: string;
    mediaUrl?: string;
    buttons?: string[];
}

export class FlowRunner {

    /**
     * Main Entry Point: Process an incoming message for a contact.
     */
    static async processMessage(
        workspaceId: string,
        contactId: string,
        messageBody: string
    ) {
        // 1. Check for Active Session
        let session = await prisma.flowSession.findFirst({
            where: {
                contact_id: contactId,
                is_completed: false,
            },
            include: { flow: true },
        });

        // 2. If NO session, check for Keywords to START one
        if (!session) {
            const matchingFlow = await prisma.flow.findFirst({
                where: {
                    workspace_id: workspaceId,
                    status: "PUBLISHED",
                    trigger_keyword: {
                        equals: messageBody,
                        mode: "insensitive",
                    },
                },
            });

            if (matchingFlow) {
                // Start New Session
                session = await prisma.flowSession.create({
                    data: {
                        flow_id: matchingFlow.id,
                        contact_id: contactId,
                        current_node_id: null, // Will start at first node
                        state: { last_input: messageBody },
                    },
                    include: { flow: true },
                });

                // Execute the first node immediately
                return await this.executeNextStep(session, null);
            } else {
                console.log("No flow triggered for:", messageBody);
                return;
            }
        }

        // 3. If Session EXISTS, handle the Input (User's reply)
        if (session.current_node_id) {
            await this.handleInput(session, messageBody);
        }

        // 4. Move to Next Node
        await this.executeNextStep(session, session.current_node_id);
    }

    /**
     * Save user input if needed (e.g., captured variable)
     */
    private static async handleInput(session: any, input: string) {
        // Update state with last input for conditions
        const newState = { ...(session.state as object), last_input: input };

        await prisma.flowSession.update({
            where: { id: session.id },
            data: { state: newState }
        });

        // Update local session object for this run
        session.state = newState;

        console.log(`User replied '${input}' to node ${session.current_node_id}`);
    }


    /**
     * Move the state machine forward.
     * Handles recursive traversal for non-interactive nodes (Logic, Actions).
     */
    private static async executeNextStep(session: any, previousNodeId: string | null, depth = 0, specificNextNodeId: string | null = null) {
        if (depth > 20) {
            console.error("Flow Infinite Loop Detected");
            return;
        }

        const nodes = session.flow.nodes as any[];
        const edges = session.flow.edges as any[];

        let nextNode: any;

        if (specificNextNodeId) {
            nextNode = nodes.find(n => n.id === specificNextNodeId);
        } else if (!previousNodeId) {
            // Start of Flow - Find Start Node
            nextNode = nodes.find(n => n.type === 'start') || nodes[0];
        } else {
            // Default Traversal: Find edge from previousNode
            const connectedEdges = edges.filter((e: any) => e.source === previousNodeId);

            if (connectedEdges.length === 0) {
                nextNode = null;
            } else if (connectedEdges.length === 1) {
                nextNode = nodes.find((n: any) => n.id === connectedEdges[0].target);
            } else {
                // Ambiguous path - usually means we are coming from a Condition node but didn't specify path?
                // Should be handled by recursive call passing 'specificNextNodeId'
                nextNode = nodes.find((n: any) => n.id === connectedEdges[0].target);
            }
        }

        if (!nextNode) {
            await this.completeFlow(session);
            return;
        }

        // UPDATE Session State (We are now at this node)
        await prisma.flowSession.update({
            where: { id: session.id },
            data: { current_node_id: nextNode.id },
        });

        // --- HANDLE NODE TYPES ---

        // 1. CONDITION NODE
        if (nextNode.type === 'condition') {
            console.log(`Evaluating Condition: ${nextNode.data.label}`);

            // Evaluate
            const lastInput = (session.state as any)?.last_input || "";
            const expected = nextNode.data.value || "";
            const op = nextNode.data.operator || "contains";
            const condType = nextNode.data.conditionType || "message_body";

            let passed = false;

            // Simplified Logic
            if (condType === 'message_body') {
                if (op === 'equals') passed = lastInput.toLowerCase() === expected.toLowerCase();
                else if (op === 'contains') passed = lastInput.toLowerCase().includes(expected.toLowerCase());
                else if (op === 'starts_with') passed = lastInput.toLowerCase().startsWith(expected.toLowerCase());
            }

            const handleId = passed ? 'true' : 'false';
            console.log(`Condition result: ${passed} (Path: ${handleId})`);

            // Find edge starting from this Condition Node with the correct Handle
            const correctEdge = edges.find((e: any) => e.source === nextNode.id && e.sourceHandle === handleId);

            if (correctEdge) {
                // RECURSE: Jump to the target of the correct handle
                await this.executeNextStep(session, nextNode.id, depth + 1, correctEdge.target);
            } else {
                console.log("Dead end at Condition - No edge for " + handleId);
                await this.completeFlow(session);
            }
            return;
        }

        // 2. ACTION NODE
        if (nextNode.type === 'action') {
            await this.performNodeAction(session.contact_id, nextNode);
            // Re-traverse immediately
            await this.executeNextStep(session, nextNode.id, depth + 1);
            return;
        }

        // 3. MESSAGE / START / CATALOG (Interactive)
        // Execute Action (Send) then STOP recursion to wait for user reply.
        await this.performNodeAction(session.contact_id, nextNode);
    }

    private static async completeFlow(session: any) {
        await prisma.flowSession.update({
            where: { id: session.id },
            data: { is_completed: true },
        });
        console.log("Flow Completed");

        // CHECK GOAL COMPLETION
        try {
            const flowWithGoal = await prisma.flow.findUnique({
                where: { id: session.flow.id },
                include: { goal: true }
            });

            if (flowWithGoal?.goal) {
                const goalId = flowWithGoal.goal.id;
                await prisma.dripEnrollment.updateMany({
                    where: {
                        contact_id: session.contact_id,
                        is_stopped: false,
                        drip: { goal_id: goalId }
                    },
                    data: { is_stopped: true }
                });
            }
        } catch (e) {
            console.error("Error processing Goal Completion", e);
        }
    }


    /**
     * Send the actual WhatsApp message to the API OR perform internal action
     */
    private static async performNodeAction(contactId: string, node: any) {
        const data = node.data;

        // Fetch Contact & Workspace Context
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: { workspace: { include: { waba: true } } }
        });

        if (!contact || !contact.workspace?.waba) {
            console.error("Context missing for Flow Action");
            return;
        }

        const { waba } = contact.workspace;

        // ACTION: Start Drip
        if (node.type === "action" && data.actionType === "start_drip") {
            const dripId = data.dripId;
            if (dripId) {
                await prisma.dripEnrollment.create({
                    data: {
                        drip_id: dripId,
                        contact_id: contactId,
                        next_run_at: new Date(Date.now() + 1000 * 60 * 60), // +1 Hour default
                    }
                });
            }
            return;
        }

        // ACTION: Stop Drip
        if (node.type === "action" && data.actionType === "stop_drip") {
            await prisma.dripEnrollment.updateMany({
                where: { contact_id: contactId, is_stopped: false },
                data: { is_stopped: true }
            });
            return;
        }

        // CATALOG: Send Product
        if (node.type === "catalog" && data.productId) {
            try {
                const product = await prisma.product.findUnique({ where: { id: data.productId } });
                if (product) {
                    const caption = `*${product.name}*\n\n${product.description || ""}\n\nPrice: *₹${product.price}*\n\nSKU: ${product.sku || "N/A"}\n\nReply "Buy" to express interest!`;

                    await import("@/lib/whatsapp/service").then(m =>
                        m.WhatsAppService.sendImage(
                            waba.phone_number_id,
                            waba.access_token,
                            contact.phone,
                            product.image_url || "", // If no image, fallback?
                            caption
                        )
                    );
                } else {
                    console.error("Product not found for Catalog Node");
                }
            } catch (e) {
                console.error("Error sending product", e);
            }
            return;
        }

        // STANDARD: Send Message
        if (data.text) {
            try {
                // Determine logic for buttons later
                // For now, just Text
                await import("@/lib/whatsapp/service").then(m =>
                    m.WhatsAppService.sendText(
                        waba.phone_number_id,
                        waba.access_token,
                        contact.phone,
                        data.text
                    )
                );
            } catch (e) {
                console.error("Flow Send Error", e);
            }
        }
    }
}
