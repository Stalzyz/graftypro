
import { prisma } from "@/lib/db";

// Types for our Flow Nodes (simplified matches ReactFlow structure)
interface NodeData {
    text?: string;
    mediaUrl?: string;
    contentType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'VOICE';
    caption?: string;
    buttons?: { id: string, title: string, type: 'reply' | 'url' | 'call', value?: string }[];
    productId?: string;
    amount?: string;
    currency?: string;
    paymentTitle?: string;
    flowId?: string;
    flowCTA?: string;
    flowHeader?: string;
    flowFooter?: string;
    items?: any[];
    sectionTitle?: string;
    buttonText?: string;
    actionType?: string;
    dripId?: string;
}

export class FlowRunner {

    /**
     * Start a flow programmatically (e.g. from Campaign or Drip)
     */
    static async startFlow(workspaceId: string, contactId: string, flowIdentifier: string) {
        // 1. Try finding by ID first
        let flow = await prisma.flow.findUnique({ where: { id: flowIdentifier } });

        // 2. If not found, try by Trigger Keyword
        if (!flow) {
            flow = await prisma.flow.findFirst({
                where: {
                    workspace_id: workspaceId,
                    trigger_keyword: { equals: flowIdentifier, mode: "insensitive" },
                    status: "PUBLISHED"
                }
            });
        }

        if (!flow) {
            console.error(`[FlowRunner] Could not find flow '${flowIdentifier}'`);
            return false;
        }

        // 3. Create Session
        const session = await prisma.flowSession.create({
            data: {
                flow_id: flow.id,
                contact_id: contactId,
                current_node_id: null,
                state: { source: "AUTOMATION" },
            },
            include: { flow: true },
        });

        // 4. Start
        await this.executeNextStep(session, null);
        return true;
    }

    /**
     * Main Entry Point: Process an incoming message for a contact.
     */
    static async processMessage(
        workspaceId: string,
        contactId: string,
        messageBody: string
    ) {
        const startTime = Date.now();
        console.log(`[FlowRunner] Processing message for contact ${contactId} in workspace ${workspaceId}`);

        // 1. Check for Active Session
        let session = await prisma.flowSession.findFirst({
            where: {
                contact_id: contactId,
                is_completed: false,
            },
            include: { flow: true },
        });

        // 2. If NO session, check for AUTO-RESPONDERS or Keywords to START one
        if (!session) {
            // @ts-ignore
            const responders = await prisma.autoResponder.findMany({
                where: {
                    workspace_id: workspaceId,
                    status: true
                },
                include: { flow: true }
            });

            // Find best match
            const bestMatch = responders.find((r: any) => {
                const keyword = r.keyword.toLowerCase();
                const input = messageBody.toLowerCase().trim();

                if (r.match_type === "EXACT") return input === keyword;
                if (r.match_type === "CONTAINS") return input.includes(keyword);
                if (r.match_type === "STARTS_WITH") return input.startsWith(keyword);
                return false;
            });

            if (bestMatch) {
                if (bestMatch.reply_type === "TEXT" && bestMatch.reply_text) {
                    const { WhatsAppService } = await import("@/lib/whatsapp/service");
                    const waba = await prisma.whatsAppAccount.findUnique({
                        where: { workspace_id: workspaceId }
                    });
                    const contact = await prisma.contact.findUnique({
                        where: { id: contactId }
                    });

                    if (waba && contact) {
                        await WhatsAppService.sendText(waba.phone_number_id, waba.access_token, contact.phone, bestMatch.reply_text);
                        return;
                    }
                } else if (bestMatch.reply_type === "FLOW" && bestMatch.flow_id) {
                    session = await prisma.flowSession.create({
                        data: {
                            flow_id: bestMatch.flow_id,
                            contact_id: contactId,
                            current_node_id: null,
                            state: { last_input: messageBody },
                        },
                        include: { flow: true },
                    });
                    return await this.executeNextStep(session, null);
                }
            }

            // Fallback to legacy Flow trigger_keyword (EXACT only)
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
                session = await prisma.flowSession.create({
                    data: {
                        flow_id: matchingFlow.id,
                        contact_id: contactId,
                        current_node_id: null,
                        state: { last_input: messageBody },
                    },
                    include: { flow: true },
                });
                return await this.executeNextStep(session, null);
            } else if (messageBody === "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER") {
                return;
            } else {
                console.log(`[FlowRunner] No flow or responder triggered in ${Date.now() - startTime}ms`);
                return;
            }
        }

        // 3. If Session EXISTS, handle the Input
        if (session.current_node_id) {
            if (messageBody === "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER" || messageBody === "FLOW_SUBMITTED_SUCCESSFULLY") {
                // Skip handleInput and just move to next node
                await this.executeNextStep(session, session.current_node_id);
            } else {
                const advanced = await this.handleInput(session, messageBody);
                // 4. Move to Next Node (only if not already advanced by handleInput)
                if (!advanced) {
                    await this.executeNextStep(session, session.current_node_id);
                }
            }
        }
        console.log(`[FlowRunner] processMessage completed in ${Date.now() - startTime}ms`);
    }

    /**
     * Handle user input and branching.
     */
    private static async handleInput(session: any, input: string) {
        // Update state with last input for conditions
        const newState = { ...(session.state as any || {}), last_input: input };
        await prisma.flowSession.update({
            where: { id: session.id },
            data: { state: newState }
        });
        session.state = newState;

        console.log(`User replied '${input}' to node ${session.current_node_id}`);

        // Interactive Branching Logic
        if (input.startsWith("LIST_SELECT_ID:")) {
            const selectedId = input.replace("LIST_SELECT_ID:", "");
            const handleId = `item-${selectedId}`;

            const edges = (session.flow.edges as any) || [];
            const correctEdge = edges.find((e: any) =>
                e.source === session.current_node_id && e.sourceHandle === handleId
            );

            if (correctEdge) {
                await this.executeNextStep(session, session.current_node_id, 0, correctEdge.target);
                return true; // Advanced
            }
        }

        return false; // Not advanced, allow default sequential jump
    }


    /**
     * Move the state machine forward.
     * Handles recursive traversal for non-interactive nodes (Logic, Actions).
     */
    static async executeNextStep(session: any, previousNodeId: string | null, depth = 0, specificNextNodeId: string | null = null) {
        const stepStartTime = Date.now();
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
            // @ts-ignore
            data: { current_node_id: nextNode.id },
        });

        // --- TRACK ANALYTICS ---
        try {
            // @ts-ignore
            await prisma.flowAnalytics.upsert({
                where: {
                    flow_id_node_id: {
                        flow_id: session.flow_id,
                        node_id: nextNode.id
                    }
                },
                update: {
                    hits: { increment: 1 },
                    last_hit_at: new Date()
                },
                create: {
                    flow_id: session.flow_id,
                    node_id: nextNode.id,
                    hits: 1
                }
            });
        } catch (e) {
            console.error("Analytics Error:", e);
        }

        console.log(`[FlowRunner] Executed node ${nextNode.id} (${nextNode.type}) in ${Date.now() - stepStartTime}ms`);

        // --- HANDLE NODE TYPES ---

        // 0. GOAL COMPLETION (End Node)
        if (nextNode.type === "goal") {
            const goalId = nextNode.id; // Corrected: nextNode.id is the node ID, goalId should be in data
            const actualGoalId = nextNode.data?.goalId;

            if (actualGoalId) {
                // Stop associated Drips
                const { DripService } = await import("@/lib/services/drip-service");
                await DripService.stopForGoal(session.contact_id, actualGoalId);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                await prisma.goalMetric.upsert({
                    where: {
                        // @ts-ignore
                        id: 'dummy'
                    },
                    // @ts-ignore
                    update: { completed_count: { increment: 1 } },
                    // @ts-ignore
                    create: { goal_id: actualGoalId, date: today, completed_count: 1 }
                }).catch(async () => {
                    const existing = await prisma.goalMetric.findFirst({
                        where: { goal_id: actualGoalId, date: today }
                    });
                    if (existing) {
                        await prisma.goalMetric.update({ where: { id: existing.id }, data: { completed_count: { increment: 1 } } });
                    } else {
                        await prisma.goalMetric.create({ data: { goal_id: actualGoalId, date: today, completed_count: 1 } });
                    }
                });
            }
            await this.completeFlow(session);
            return;
        }

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

        // 1.1 TIME WINDOW NODE
        if (nextNode.type === 'time_window') {
            const startStr = nextNode.data?.startTime || "09:00";
            const endStr = nextNode.data?.endTime || "18:00";

            // Current Time in IST
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(now.getTime() + istOffset);
            const curStr = `${String(istTime.getUTCHours()).padStart(2, '0')}:${String(istTime.getUTCMinutes()).padStart(2, '0')}`;

            const isWithin = curStr >= startStr && curStr <= endStr;
            const handleId = isWithin ? 'within' : 'outside';

            const correctEdge = edges.find((e: any) => e.source === nextNode.id && e.sourceHandle === handleId);

            if (correctEdge) {
                await this.executeNextStep(session, nextNode.id, depth + 1, correctEdge.target);
            } else {
                await this.completeFlow(session);
            }
            return;
        }

        // 1.2 WAIT NODE
        if (nextNode.type === 'wait') {
            const val = parseInt(nextNode.data?.delayValue || "5");
            const unit = nextNode.data?.delayUnit || "minutes";

            let delayMs = val * 60 * 1000;
            if (unit === "hours") delayMs = val * 60 * 60 * 1000;
            if (unit === "days") delayMs = val * 24 * 60 * 60 * 1000;

            const nextRun = new Date(Date.now() + delayMs);

            await prisma.flowSession.update({
                where: { id: session.id },
                // @ts-ignore
                data: {
                    current_node_id: nextNode.id,
                    // @ts-ignore
                    is_waiting: true,
                    // @ts-ignore
                    next_run_at: nextRun
                }
            });

            console.log(`Flow session ${session.id} paused until ${nextRun.toISOString()}`);
            return; // STOP recursion
        }

        // 2. ACTION / DRIP NODE
        if (nextNode.type === 'action' || nextNode.type === 'drip') {
            await this.performNodeAction(session, nextNode);
            // Re-traverse immediately
            await this.executeNextStep(session, nextNode.id, depth + 1);
            return;
        }

        // 3. ORDER TRACKING (Logic + Interactive)
        if (nextNode.type === "order_tracking") {
            const result = await this.performNodeAction(session, nextNode);
            const handleId = result ? 'found' : 'failed';
            const correctEdge = edges.find((e: any) => e.source === nextNode.id && e.sourceHandle === handleId);

            if (correctEdge) {
                await this.executeNextStep(session, nextNode.id, depth + 1, correctEdge.target);
            } else {
                await this.completeFlow(session);
            }
            return;
        }

        // 4. MESSAGE / START / CATALOG / PAYMENT (Interactive)
        // Execute Action (Send) then STOP recursion to wait for user reply.
        await this.performNodeAction(session, nextNode);
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
                const { DripService } = await import("@/lib/services/drip-service");
                await DripService.stopForGoal(session.contact_id, goalId);
            }
        } catch (e) {
            console.error("Error processing Goal Completion", e);
        }
    }


    /**
     * Send the actual WhatsApp message to the API OR perform internal action
     */
    private static async performNodeAction(session: any, node: any): Promise<boolean> {
        const contactId = session.contact_id;
        const data = node.data;

        // Fetch Contact & Workspace Context
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: { workspace: { include: { waba: true } } }
        });

        if (!contact || !contact.workspace?.waba) {
            console.error("Context missing for Flow Action");
            return false;
        }

        const { waba } = contact.workspace;

        // --- PHASE 9: CREDIT & RESELLER INTEGRATION ---
        // Prevent sending without validation
        try {
            const { CreditService } = await import("@/lib/credits/service");
            const category = node.type === "catalog" || node.type === "carousel" ? "MARKETING" : "UTILITY";
            const countryCode = contact.phone.substring(0, 2); // Simple prefix check

            const cost = await CreditService.getMessageCost(category, countryCode, contact.workspace_id);

            await prisma.$transaction(async (tx) => {
                await CreditService.deductCredits(
                    tx,
                    contact.workspace_id,
                    cost,
                    `AUTO-${node.id}`,
                    `Automation: ${node.type} (${category})`
                );
            });
        } catch (creditError: any) {
            console.error(`[Credit Block] ${creditError.message}`);
            return false; // Stop Flow Execution
        }

        // DRIP ENROLLMENT (Legacy Node or New Action)
        if (node.type === "drip" || (node.type === "action" && data.actionType === "start_drip")) {
            const dripId = data.dripId || data.drip_id || data.dripIdSelect; // Handle various data shapes
            if (dripId) {
                try {
                    const { DripService } = await import("@/lib/services/drip-service");
                    await DripService.enroll(contact.workspace_id, contactId, dripId, session.state || {});
                    console.log(`Flow enrolled contact ${contact.phone} in drip ${dripId}`);
                    return true;
                } catch (e) {
                    console.error("Drip Enrollment Error in Flow", e);
                    return false;
                }
            }
            return false;
        }

        // ACTION: Stop Drip
        if (node.type === "action" && data.actionType === "stop_drip") {
            try {
                // If specific drip ID is provided (unlikely in simple UI, usually stops ALL or by Goal)
                // For now, stop ALL drips for this contact is the safest interpretation unless logic is more complex
                await prisma.dripEnrollment.updateMany({
                    where: { contact_id: contactId, is_stopped: false },
                    data: { is_stopped: true, stop_reason: "FLOW_ACTION_STOP" }
                });
                return true;
            } catch (e) {
                console.error("Drip Stop Error", e);
                return false;
            }
        }

        // ORDER TRACKING: Fetch & Display
        if (node.type === "order_tracking") {
            try {
                const { LogisticsService } = await import("@/lib/integrations/logistics");
                const orderId = (session.state as any)?.last_input || "";

                const tracking = await LogisticsService.getTrackingInfo(orderId);

                if (tracking) {
                    const emoji = LogisticsService.getStatusEmoji(tracking.status);
                    const message = [
                        `📦 *Order Found: ${tracking.orderId}*`,
                        ``,
                        `Status: ${emoji} *${tracking.status.replace(/_/g, ' ')}*`,
                        `Carrier: *${tracking.carrier}*`,
                        `Location: *${tracking.lastLocation}*`,
                        `Est. Delivery: *${tracking.estimatedDelivery}*`,
                        ``,
                        `_Reply to this message if you need more help with your order._`
                    ].join('\n');

                    const { WhatsAppService } = await import("@/lib/whatsapp/service");
                    await WhatsAppService.sendText(waba.phone_number_id, waba.access_token, contact.phone, message);
                    return true;
                } else {
                    const { WhatsAppService } = await import("@/lib/whatsapp/service");
                    await WhatsAppService.sendText(
                        waba.phone_number_id,
                        waba.access_token,
                        contact.phone,
                        "❌ *Search Failed*\n\nWe couldn't find an order with that ID. Please check the spelling or contact support."
                    );
                    return false;
                }
            } catch (e) {
                console.error("Order Tracking Error", e);
                return false;
            }
        }

        // CATALOG: Send Product
        if (node.type === "catalog" && data.productId) {
            try {
                const product = await prisma.product.findUnique({ where: { id: data.productId } });
                if (product) {
                    const caption = `*${product.name}*\n\n${product.description || ""}\n\nPrice: *₹${product.price}*\n\nSKU: ${product.sku || "N/A"}\n\nReply "Buy" to express interest!`;

                    const { WhatsAppService } = await import("@/lib/whatsapp/service");
                    await WhatsAppService.sendImage(
                        waba.phone_number_id,
                        waba.access_token,
                        contact.phone,
                        product.image_url || "",
                        caption
                    );
                    return true;
                }
            } catch (e) {
                console.error("Error sending product", e);
            }
            return false;
        }

        // PAYMENT: Generate Razorpay Link
        if (node.type === "payment" && data.amount) {
            try {
                const { RazorpayManager } = await import("@/lib/payments/razorpay");
                const amount = parseFloat(data.amount);
                const currency = data.currency || "INR";
                const title = data.paymentTitle || "Payment Request";

                const paymentLink = await RazorpayManager.createPaymentLink(
                    contact.workspace_id,
                    amount,
                    currency,
                    title,
                    {
                        name: contact.name || "Customer",
                        contact: contact.phone,
                        email: "customer@example.com"
                    }
                );

                const message = `💳 *Payment Request*\n\nReason: *${title}*\nAmount: *${currency} ${amount}*\n\nClick the link below to pay securely via Razorpay:\n\n${paymentLink.short_url}`;

                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendText(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    message
                );
                return true;
            } catch (e) {
                console.error("Payment Generation Error", e);
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendText(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    "Oops! There was an error generating your payment link."
                );
                return false;
            }
        }

        // META FLOW: Send Form
        if (node.type === "meta_flow" && data.flowId) {
            try {
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendMetaFlow(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    data.flowId,
                    data.flowCTA || "Open Form",
                    data.flowHeader || "",
                    data.text || "Please fill out the form below.",
                    data.flowFooter || ""
                );
                return true;
            } catch (e) {
                console.error("Meta Flow Send Error", e);
                return false;
            }
        }

        if (node.type === "carousel") {
            try {
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                const cards = (data.cards || []).map((card: any) => ({
                    image_url: card.imageUrl,
                    title: card.title,
                    description: card.description,
                    buttons: (card.buttons || []).map((btn: any) => ({
                        id: btn.id || btn.text,
                        text: btn.text
                    }))
                }));

                await WhatsAppService.sendCarousel(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    cards
                );
                return true;
            } catch (e) {
                console.error("Carousel send error", e);
                return false;
            }
        }

        if (node.type === "list") {
            try {
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendListMessage(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    data.text || "Please select an option:",
                    data.buttonText || "Open Menu",
                    [{
                        title: data.sectionTitle || "Options",
                        rows: (data.items || []).map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            description: item.description
                        }))
                    }]
                );
                return true;
            } catch (e) {
                console.error("List Message Send Error", e);
                return false;
            }
        }

        // STANDARD: Send Message
        // APPOINTMENT: Book a Slot
        if (node.type === "appointment") {
            try {
                const { AppointmentService } = await import("@/lib/services/appointment-service");
                const slotId = (session.state as any)?.last_input || "";

                // If input is a valid slot ID, book it. 
                // In a real flow, you'd show available slots first.
                const appointment = await AppointmentService.bookSlot(
                    contact.workspace_id,
                    contactId,
                    slotId,
                    `Booked via Flow: ${session.flow.name}`
                );

                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendText(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    `✅ *Appointment Confirmed!*\n\nYour slot has been successfully booked. We'll send you a reminder 24 hours before.`
                );
                return true;
            } catch (e: any) {
                console.error("Appointment Booking Error", e);
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendText(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    `❌ *Booking Failed*\n\n${e.message || "That slot is no longer available or the ID is invalid."}`
                );
                return false;
            }
        }

        // STANDARD & ENHANCED MESSAGE NODE
        if (data.contentType === 'IMAGE' && data.mediaUrl) {
            const { WhatsAppService } = await import("@/lib/whatsapp/service");
            await WhatsAppService.sendImage(waba.phone_number_id, waba.access_token, contact.phone, data.mediaUrl, data.text || data.caption);
            return true;
        }

        if (data.contentType === 'VIDEO' && data.mediaUrl) {
            const { WhatsAppService } = await import("@/lib/whatsapp/service");
            await WhatsAppService.sendVideo(waba.phone_number_id, waba.access_token, contact.phone, data.mediaUrl, data.text || data.caption);
            return true;
        }

        if (data.contentType === 'DOCUMENT' && data.mediaUrl) {
            const { WhatsAppService } = await import("@/lib/whatsapp/service");
            await WhatsAppService.sendDocument(waba.phone_number_id, waba.access_token, contact.phone, data.mediaUrl, data.caption || "Document");
            return true;
        }

        if (data.contentType === 'VOICE' && data.mediaUrl) {
            const { WhatsAppService } = await import("@/lib/whatsapp/service");
            await WhatsAppService.sendVoice(waba.phone_number_id, waba.access_token, contact.phone, data.mediaUrl);
            return true;
        }

        // INTERACTIVE BUTTONS
        if (data.buttons && data.buttons.length > 0) {
            const { WhatsAppService } = await import("@/lib/whatsapp/service");
            const replyButtons = data.buttons.filter((b: any) => b.type === 'reply');
            const ctaButtons = data.buttons.filter((b: any) => b.type === 'url' || b.type === 'call');

            if (replyButtons.length > 0) {
                await WhatsAppService.sendInteractiveButtons(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    data.text || "Please choose an option:",
                    replyButtons.map((b: any) => ({ id: b.id, title: b.title }))
                );
            } else if (ctaButtons.length > 0) {
                await WhatsAppService.sendCTAButtons(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    data.text || "Click below:",
                    ctaButtons.map((b: any) => ({ type: b.type === 'url' ? 'url' : 'phone', title: b.title, value: b.value || "" }))
                );
            }
            return true;
        }

        if (data.text) {
            try {
                const { WhatsAppService } = await import("@/lib/whatsapp/service");
                await WhatsAppService.sendText(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    data.text
                );
                return true;
            } catch (e) {
                console.error("Flow Send Error", e);
                return false;
            }
        }

        return true;
    }
}
