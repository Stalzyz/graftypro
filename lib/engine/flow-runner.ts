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
                        state: {},
                    },
                    include: { flow: true },
                });

                // Execute the first node immediately
                return await this.executeNextStep(session, null);
            } else {
                // No flow triggered. Standard AI reply or Default Message would go here.
                console.log("No flow triggered for:", messageBody);
                return;
            }
        }

        // 3. If Session EXISTS, handle the Input (User's reply)
        // The user just replied to the 'current_node'. We need to find the edge to the NEXT node.
        if (session.current_node_id) {
            await this.handleInput(session, messageBody);
        } // If null (just started), we accept it as is.

        // 4. Move to Next Node
        await this.executeNextStep(session, session.current_node_id);
    }

    /**
     * Move the state machine forward.
     */
    private static async executeNextStep(session: any, previousNodeId: string | null) {
        const nodes = session.flow.nodes as any[];
        const edges = session.flow.edges as any[];

        let nextNode;

        if (!previousNodeId) {
            // Find Start Node (usually the one with no incoming handles, or just the first one)
            // For MVP, assuming the first node in array or the one implicitly at top
            // Better: find node connected to nothing on 'target' handle?
            // Simplified: Just pick the node with logic ID "1" or the first one.
            nextNode = nodes.find(n => n.id === '1') || nodes[0];
        } else {
            // Find edge from previousNode
            const edge = edges.find((e: any) => e.source === previousNodeId);
            if (edge) {
                nextNode = nodes.find((n: any) => n.id === edge.target);
            }
        }

        if (!nextNode) {
            // End of Flow
            await prisma.flowSession.update({
                where: { id: session.id },
                data: { is_completed: true },
            });
            console.log("Flow Completed");
            return;
        }

        // UPDATE Session State
        await prisma.flowSession.update({
            where: { id: session.id },
            data: { current_node_id: nextNode.id },
        });

        // EXECUTE Node Action (Send Message)
        await this.performNodeAction(session.contact_id, nextNode);
    }

    /**
     * Save user input if needed (e.g., captured variable)
     */
    private static async handleInput(session: any, input: string) {
        // In advanced logic, we check validation (is this a valid email?)
        // And store it in session.state
        console.log(`User replied '${input}' to node ${session.current_node_id}`);
    }

    /**
   * Send the actual WhatsApp message to the API OR perform internal action
   */
    private static async performNodeAction(contactId: string, node: any) {
        const data = node.data; // as NodeData

        // ACTION: Start Drip
        if (node.type === "action_start_drip") {
            const dripId = data.dripId;
            if (dripId) {
                // Enroll Contact in Drip
                await prisma.dripEnrollment.create({
                    data: {
                        drip_id: dripId,
                        contact_id: contactId,
                        next_run_at: new Date(Date.now() + 1000 * 60 * 60), // Start in 1 hour (default) or configurable
                    }
                });
                console.log(`Enrolled Contact ${contactId} in Drip ${dripId}`);
            }
            return;
        }

        // ACTION: Stop Drip
        if (node.type === "action_stop_drip") {
            // Stop specific drip or ALL drips
            await prisma.dripEnrollment.updateMany({
                where: { contact_id: contactId, is_stopped: false },
                data: { is_stopped: true }
            });
            console.log(`Stopped Drips for Contact ${contactId}`);
            return;
        }

        // STANDARD: Send Message
        // Simulate Sending to Meta (we will create the 'whatsapp-service' later)
        if (data.text) {
            console.log(`[SIMULATION] Sending WhatsApp to ${contactId}:`, data.text);
        }
        // TODO: Call WhatsAppService.sendMessage(phone, text)
    }
}
