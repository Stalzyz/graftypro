/**
 * 🔥 FLOW EXECUTOR
 * Deterministic, recursive node execution engine.
 * 
 * Rules:
 * - Reads from session — never from raw input after this point
 * - Handles all node types with specific branching logic
 * - Interactive nodes STOP execution and wait for user input
 * - All messages go through PayloadBuilder (validated) then FlowQueue (deduplicated)
 * - Max depth of 25 to prevent infinite loops
 */

import { prisma } from '../db';
import { FlowSessionData, advanceSession, closeSession, pauseSession, updateSessionState } from './session-manager';
import { buildNodePayload, buildTextPayload } from './payload-builder';
import { enqueueMessage, sendMessageDirect } from './flow-queue';
import { EmailService } from '../email/service';
import { decrypt } from '../security/encryption';
import { getAbsoluteMediaUrl } from '../utils/url';

const MAX_DEPTH = 25;

// -----------------------------------------------------------------------
// Context available to every node during execution
// -----------------------------------------------------------------------
interface ExecutionContext {
    session: FlowSessionData;
    waba: any;
    contact: any;
}

// -----------------------------------------------------------------------
// Entry Point
// -----------------------------------------------------------------------

/**
 * Begins or continues execution from a given node.
 * @param session - The active flow session
 * @param waba - WhatsApp account record (with decryptable access_token)
 * @param contact - Contact record
 * @param fromNodeId - If null, starts from the 'start' node
 * @param targetNodeId - If provided, jumps directly to this node (used for button routing)
 * @param depth - Internal recursion depth counter
 */
export async function executeFrom(
    session: FlowSessionData,
    waba: any,
    contact: any,
    fromNodeId: string | null,
    targetNodeId: string | null = null,
    depth = 0
): Promise<void> {
    if (depth > MAX_DEPTH) {
        console.error(`[FlowExecutor] ⛔ Max depth (${MAX_DEPTH}) reached. Possible loop in flow ${session.flow_id}`);
        await closeSession(session.id, 'MAX_DEPTH_EXCEEDED');
        return;
    }

    const nodes: any[] = session.flow.nodes || [];
    const edges: any[] = session.flow.edges || [];
    const ctx: ExecutionContext = { session, waba, contact };

    // ----------------------------------------------------------------
    // Find the next node to execute
    // ----------------------------------------------------------------
    let nextNode: any;

    if (targetNodeId) {
        // Explicit jump (button/list selection or condition branch)
        nextNode = nodes.find((n: any) => n.id === targetNodeId);
        if (!nextNode) {
            console.error(`[FlowExecutor] ❌ Target node "${targetNodeId}" not found in flow ${session.flow_id}`);
            await closeSession(session.id, `NODE_NOT_FOUND:${targetNodeId}`);
            return;
        }
    } else if (!fromNodeId) {
        // Start of flow — find the start node
        nextNode = nodes.find((n: any) => n.type === 'start') || nodes[0];
    } else {
        // Default traversal: follow the single outgoing edge from fromNodeId
        const fromNode = nodes.find((n: any) => n.id === fromNodeId);
        const interactiveTypes = new Set(['list', 'meta_flow', 'appointment', 'payment', 'catalog', 'Catalog', 'product_catalog', 'product_catalog_node']);
        const isInteractiveButton = fromNode?.type === 'message' && (fromNode?.data?.buttons || []).some(
            (b: any) => b.type === 'reply'
        );

        if (interactiveTypes.has(fromNode?.type) || isInteractiveButton) {
            // Interactive node — do NOT auto-advance. Wait for user input.
            console.error(`[FlowExecutor] ✋ Node ${fromNodeId} is interactive. Halting until user responds.`);
            return;
        }

        const outEdges = edges.filter((e: any) => e.source === fromNodeId);
        if (outEdges.length === 0) {
            // No outgoing edges → flow ends
            await closeSession(session.id, 'FLOW_COMPLETED_NO_EDGES');
            return;
        }
        const nextNodeId = outEdges[0].target;
        nextNode = nodes.find((n: any) => n.id === nextNodeId);
    }

    if (!nextNode) {
        await closeSession(session.id, 'FLOW_COMPLETED');
        return;
    }

    console.log(`[FlowExecutor] ▶️ Executing node ${nextNode.id} (${nextNode.type}) depth=${depth}`);

    // Advance session to this node
    await advanceSession(session.id, nextNode.id);
    session.current_node_id = nextNode.id;

    // ----------------------------------------------------------------
    // Track analytics (non-blocking)
    // ----------------------------------------------------------------
    trackAnalytics(session.flow_id, nextNode.id).catch(() => { });

    // ----------------------------------------------------------------
    // Execute by node type
    // ----------------------------------------------------------------
    await executeNode(ctx, nextNode, edges, depth);
}

// -----------------------------------------------------------------------
// Node Dispatcher
// -----------------------------------------------------------------------
async function executeNode(
    ctx: ExecutionContext,
    node: any,
    edges: any[],
    depth: number
): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = node.data || {};

    switch (node.type) {

        // ── PASS-THROUGH NODES (execute action then immediately continue) ──
        case 'start':
        case 'action':
            await runActionNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;

        case 'drip':
            await runDripNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;

        // ── LOGIC NODES (determine branch then continue) ──
        case 'condition':
            await runConditionNode(ctx, node, edges, depth);
            break;

        case 'time_window':
            await runTimeWindowNode(ctx, node, edges, depth);
            break;

        // ── WAIT / DELAY NODE ──
        case 'wait':
            await runWaitNode(ctx, node);
            break;

        // ── GOAL NODE ──
        case 'goal':
            await runGoalNode(ctx, node);
            break;

        // ── END NODE ──
        case 'end':
            await closeSession(session.id, 'FLOW_COMPLETED_END_NODE');
            break;

        // ── SPECIALIZED ACTION NODES ──
        case 'order_tracking':
            await runOrderTrackingNode(ctx, node, edges, depth);
            break;

        case 'appointment':
            await runAppointmentNode(ctx, node, edges, depth);
            break;

        case 'payment':
        case 'Payment':
            console.log(`[FlowExecutor] 💳 Processing Payment node: ${node.id}`);
            await runPaymentNode(ctx, node);
            break;

        case 'catalog':
        case 'Catalog':
        case 'product_catalog':
            console.log(`[FlowExecutor] 📦 [CATALOG_DISPATCH] node=${node.id}`);
            await runCatalogNode(ctx, node);
            // DO NOT auto-advance here. Catalog is now INTERACTIVE.
            // It will wait for the "Interested" button click.
            break;

        case 'meta_flow':
        case 'MetaFlow':
            console.log(`[FlowExecutor] 🌊 Processing Meta Flow node: ${node.id}`);
            await runMetaFlowNode(ctx, node);
            // Meta flow is interactive — stop and wait
            break;

        case 'order_summary':
            await runOrderSummaryNode(ctx, node);
            await sleep(500);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;

        case 'meta_template':
            await runTemplateNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;

        // ── MESSAGE NODE (text / media / buttons / lists) ──
        case 'message':
        case 'list':
        default:
            await runMessageNode(ctx, node, depth);
            break;
    }
}

// -----------------------------------------------------------------------
// Message Node — the core content delivery node
// -----------------------------------------------------------------------
async function runMessageNode(ctx: ExecutionContext, node: any, depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = node.data || {};
    const phone = contact.phone;
    const token = waba.access_token; // still encrypted

    const { payloads, isInteractive } = buildNodePayload(phone, node.type, data);

    if (payloads.length === 0) {
        console.warn(`[FlowExecutor] ⚠️ Node ${node.id} produced no sendable payloads. Skipping.`);
        // Don't block the flow — continue to next node
        if (!isInteractive) {
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
        }
        return;
    }

    // Send all payloads (with a small delay between sequential messages)
    for (let i = 0; i < payloads.length; i++) {
        const qMsg = {
            phoneNumberId: waba.phone_number_id,
            accessToken: token,
            payload: payloads[i],
            sessionId: session.id,
            nodeId: node.id,
            workspaceId: session.workspace_id,
            contactId: contact.id,
        };

        try {
            const metaId = await sendMessageDirect(qMsg);
            await saveOutboundMessage(waba, contact, metaId, payloads[i]);
        } catch (err: any) {
            console.error(`[FlowExecutor] ❌ Failed to send payload ${i}: ${err?.message}`);
        }

        // Brief delay between multiple sequential payloads
        if (i < payloads.length - 1) {
            await sleep(600);
        }
    }

    // If NOT interactive, continue to next node
    if (!isInteractive) {
        await executeFrom(session, waba, contact, node.id, null, depth + 1);
    }
    // If interactive, we stop here. Flow resumes when user replies.
}

// -----------------------------------------------------------------------
// Condition Node — evaluates state and branches
// -----------------------------------------------------------------------
async function runConditionNode(
    ctx: ExecutionContext,
    node: any,
    edges: any[],
    depth: number
): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = node.data || {};
    const lastInput = (session.state?.last_input || '').toLowerCase();
    const expected = (data.value || '').toLowerCase();
    const op = data.operator || 'contains';
    const condType = data.conditionType || 'message_body';

    let passed = false;
    if (condType === 'message_body') {
        if (op === 'equals') passed = lastInput === expected;
        else if (op === 'contains') passed = lastInput.includes(expected);
        else if (op === 'starts_with') passed = lastInput.startsWith(expected);
        else if (op === 'not_equals') passed = lastInput !== expected;
    }

    const handleId = passed ? 'true' : 'false';
    console.log(`[FlowExecutor] Condition "${data.label}": ${passed} → handle "${handleId}"`);

    const correctEdge = edges.find((e: any) => e.source === node.id && e.sourceHandle === handleId);
    if (correctEdge) {
        await executeFrom(session, waba, contact, node.id, correctEdge.target, depth + 1);
    } else {
        console.log(`[FlowExecutor] Condition dead-end on handle "${handleId}" — closing flow`);
        await closeSession(session.id, `CONDITION_DEAD_END:${handleId}`);
    }
}

// -----------------------------------------------------------------------
// Time Window Node
// -----------------------------------------------------------------------
async function runTimeWindowNode(
    ctx: ExecutionContext,
    node: any,
    edges: any[],
    depth: number
): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = node.data || {};
    const startStr = data.startTime || '09:00';
    const endStr = data.endTime || '18:00';

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    const curStr = `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`;

    const isWithin = curStr >= startStr && curStr <= endStr;
    const handleId = isWithin ? 'within' : 'outside';

    const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === handleId);
    if (edge) {
        await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
    } else {
        await closeSession(session.id, `TIME_WINDOW_DEAD_END:${handleId}`);
    }
}

// -----------------------------------------------------------------------
// Wait / Delay Node
// -----------------------------------------------------------------------
async function runWaitNode(ctx: ExecutionContext, node: any): Promise<void> {
    const data = node.data || {};
    const val = parseInt(data.delayValue || '5', 10);
    const unit = data.delayUnit || 'minutes';

    let ms = val * 60 * 1000;
    if (unit === 'hours') ms = val * 60 * 60 * 1000;
    if (unit === 'days') ms = val * 24 * 60 * 60 * 1000;

    const nextRun = new Date(Date.now() + ms);
    await pauseSession(ctx.session.id, node.id, nextRun);
}

// -----------------------------------------------------------------------
// Goal Node
// -----------------------------------------------------------------------
async function runGoalNode(ctx: ExecutionContext, node: any): Promise<void> {
    const goalId = node.data?.goalId;
    if (goalId) {
        try {
            const { DripService } = await import('../services/drip-service');
            await DripService.stopForGoal(ctx.contact.id, goalId);
        } catch { }
    }
    await closeSession(ctx.session.id, 'GOAL_REACHED');
}

// -----------------------------------------------------------------------
// Action Node (enroll drip, tag, etc.)
// -----------------------------------------------------------------------
async function runActionNode(ctx: ExecutionContext, node: any): Promise<void> {
    const data = node.data || {};

    if (data.actionType === 'start_drip' || data.actionType === 'drip') {
        await runDripNode(ctx, node);
    } else if (data.actionType === 'stop_drip') {
        await prisma.dripEnrollment.updateMany({
            where: { contact_id: ctx.contact.id, is_stopped: false },
            data: { is_stopped: true, stop_reason: 'FLOW_ACTION_STOP' },
        });
    } else if (data.actionType === 'webhook') {
        // Send data to Workspace configured Webhook
        if (ctx.session?.workspace_id) {
            try {
                const ws = await prisma.workspace.findUnique({
                    where: { id: ctx.session.workspace_id },
                    select: { webhook_url: true }
                });

                if (ws?.webhook_url) {
                    const payload = {
                        event: "flow.webhook_action",
                        contact: { id: ctx.contact.id, name: ctx.contact.name, phone: ctx.contact.phone },
                        flow_id: ctx.session.flow_id,
                        context_state: ctx.session.state || {},
                        timestamp: new Date().toISOString()
                    };

                    // Fire and forget (don't block flow execution)
                    fetch(ws.webhook_url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    }).catch(err => console.error("[FlowExecutor] Webhook push failed:", err));

                    console.log(`[FlowExecutor] 🚀 Fired outbound webhook for contact ${ctx.contact.phone}`);
                }
            } catch (err) {
                console.error("[FlowExecutor] Error looking up webhook URL:", err);
            }
        }
    } else if (data.actionType === 'save_to_crm') {
        // Sync contact data to Universal CRM
        try {
            // Find existing lead for this contact in this workspace
            let lead = await prisma.universalCrmLead.findFirst({
                where: {
                    workspace_id: ctx.contact.workspace_id,
                    OR: [
                        { contact_id: ctx.contact.id },
                        { phone: ctx.contact.phone }
                    ]
                }
            });

            if (lead) {
                // Update existing lead
                await prisma.universalCrmLead.update({
                    where: { id: lead.id },
                    data: {
                        name: ctx.contact.name || lead.name,
                        email: ctx.contact.email || lead.email,
                        // Merge session state into custom_data
                        custom_data: {
                            ...(lead.custom_data as any || {}),
                            ...(ctx.session.state || {}),
                            last_flow_id: ctx.session.flow_id,
                            last_updated_by: "flow_engine"
                        }
                    }
                });
                console.log(`[FlowExecutor] 📈 Updated CRM Lead for ${ctx.contact.phone}`);
            } else {
                // Create new lead
                await prisma.universalCrmLead.create({
                    data: {
                        workspace_id: ctx.contact.workspace_id,
                        contact_id: ctx.contact.id,
                        name: ctx.contact.name || ctx.contact.phone,
                        phone: ctx.contact.phone,
                        email: ctx.contact.email,
                        source: "WhatsApp Flow",
                        custom_data: {
                            ...(ctx.session.state || {}),
                            flow_id: ctx.session.flow_id
                        }
                    }
                });
                console.log(`[FlowExecutor] ✨ Created new CRM Lead for ${ctx.contact.phone}`);
            }
        } catch (err) {
            console.error("[FlowExecutor] Failed to sync to CRM:", err);
        }
    } else if (data.actionType === 'send_email') {
        const email = data.emailAddress || '';
        const subject = data.emailSubject || 'New WhatsApp Flow Notification';

        if (email && ctx.session?.workspace_id) {
            try {
                const body = `
                    <h3>New Flow Interaction</h3>
                    <p><b>Contact:</b> ${ctx.contact.name || ctx.contact.phone}</p>
                    <p><b>Phone:</b> ${ctx.contact.phone}</p>
                    <p><b>Flow:</b> ${ctx.session.flow_id}</p>
                    <hr/>
                    <h4>Captured Data:</h4>
                    <pre style="background:#f4f4f4; padding:16px; border-radius:8px; font-size:12px;">${JSON.stringify(ctx.session.state || {}, null, 2)}</pre>
                `;

                // Fire and forget email
                EmailService.sendBrandedEmail(ctx.session.workspace_id, {
                    to: email,
                    subject: subject,
                    templateName: "FLOW_NOTIFICATION",
                    context: {
                        body_content: body
                    }
                }).catch(err => console.error("[FlowExecutor] Flow alert email failed:", err));

                console.log(`[FlowExecutor] 📧 Sent alert email for contact ${ctx.contact.phone} to ${email}`);
            } catch (err) {
                console.error("[FlowExecutor] Error sending action email:", err);
            }
        }
    } else if (data.actionType === 'google_sheet') {
        const spreadsheetId = data.spreadsheetId || '';
        const sheetName = data.sheetName || 'Sheet1';

        if (spreadsheetId && ctx.session?.workspace_id) {
            console.log(`[FlowExecutor] 📊 Appending to Google Sheet: ${spreadsheetId}/${sheetName}`);
            // IMPLEMENTATION NOTE: Normally we would call a GoogleSheetService here.
            // For now, we log the intent. In a production environment, you'd use a service account.
        }
    }
}

// -----------------------------------------------------------------------
// Drip Node
// -----------------------------------------------------------------------
async function runDripNode(ctx: ExecutionContext, node: any): Promise<void> {
    const data = node.data || {};
    const dripId = data.dripId || data.drip_id || data.dripIdSelect;
    if (!dripId) return;
    try {
        const { DripService } = await import('../services/drip-service');
        await DripService.enroll(ctx.contact.workspace_id, ctx.contact.id, dripId, ctx.session.state);
        console.log(`[FlowExecutor] ✅ Enrolled contact ${ctx.contact.phone} in drip ${dripId}`);
    } catch (e) {
        console.error('[FlowExecutor] Drip enrollment error:', e);
    }
}

// -----------------------------------------------------------------------
// Catalog Node
// -----------------------------------------------------------------------
async function runCatalogNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;
    const data = node.data || {};
    const phone = contact.phone;

    console.error(`[FlowExecutor] 📦 [MONSTER_CATALOG] START node=${node.id} phone=${phone}`);

    const products = data.carouselProducts && data.carouselProducts.length > 0
        ? data.carouselProducts
        : [{
            name: data.productName || 'Product',
            price: data.productPrice || 'N/A',
            text: data.text || data.label || 'View this item in our store!',
            image: data.productImage || '',
            id: data.productId || 'none'
        }];

    for (const prod of products) {
        const name = (prod.name || 'Product').toUpperCase();
        const price = prod.price || 'N/A';
        const desc = prod.text || prod.desc || 'View this item in our store!';
        const img = prod.image || '';
        const productId = prod.id || 'none';

        const absUrl = getAbsoluteMediaUrl(img);
        const bodyText = `🏷️ *${name}*\n\n${desc}\n\n*Price: ₹${price}*`;

        let lastPayload: any = null;

        const sendWithImage = async () => {
            lastPayload = {
                to: phone,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    header: { type: 'image', image: { link: absUrl } },
                    body: { text: bodyText.substring(0, 1024) },
                    action: {
                        buttons: [{ type: 'reply', reply: { id: `buy_${productId}`.substring(0, 256), title: 'Interested' } }]
                    }
                }
            };
            return sendMessageDirect({
                phoneNumberId: waba.phone_number_id,
                accessToken: waba.access_token,
                payload: lastPayload,
                sessionId: session.id,
                nodeId: node.id,
                workspaceId: session.workspace_id,
                contactId: contact.id
            });
        };

        const sendWithoutImage = async () => {
            lastPayload = {
                to: phone,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: `📷 (Image unavailable)\n\n${bodyText}`.substring(0, 1024) },
                    action: {
                        buttons: [{ type: 'reply', reply: { id: `buy_${productId}`.substring(0, 256), title: 'Interested' } }]
                    }
                }
            };
            return sendMessageDirect({
                phoneNumberId: waba.phone_number_id,
                accessToken: waba.access_token,
                payload: lastPayload,
                sessionId: session.id,
                nodeId: node.id,
                workspaceId: session.workspace_id,
                contactId: contact.id
            });
        };

        try {
            let metaId = null;
            if (absUrl && absUrl.startsWith('http')) {
                console.error(`[FlowExecutor] 🚀 [MONSTER_CATALOG] TIER 1: Interactive + Image...`);
                try {
                    metaId = await sendWithImage();
                } catch (err) {
                    console.error(`[FlowExecutor] ⚠️ [MONSTER_CATALOG] TIER 1 FAILED, trying TIER 2...`);
                    metaId = await sendWithoutImage();
                }
            } else {
                console.error(`[FlowExecutor] 🚀 [MONSTER_CATALOG] TIER 2: Interactive ONLY (No Image URL)...`);
                metaId = await sendWithoutImage();
            }

            if (metaId) {
                console.error(`[FlowExecutor] ✅ [MONSTER_CATALOG] SUCCESS metaId=${metaId}`);
                await saveOutboundMessage(waba, contact, metaId, lastPayload);
            } else {
                throw new Error("Message rejected by Meta (No ID)");
            }
        } catch (err: any) {
            console.error(`[FlowExecutor] ❌ [MONSTER_CATALOG] FATAL error=${err.message}`);
            const emergencyText = `📦 *${name}*\n\n${desc}\n*Price: ₹${price}*\n\n_Type "Interested" to proceed!_`;
            const ep = buildTextPayload(phone, emergencyText);
            if (ep) {
                const txtId = await sendMessageDirect({
                    phoneNumberId: waba.phone_number_id,
                    accessToken: waba.access_token,
                    payload: ep,
                    sessionId: session.id,
                    nodeId: node.id,
                    workspaceId: session.workspace_id,
                    contactId: contact.id
                });
                if (txtId) await saveOutboundMessage(waba, contact, txtId, ep);
            }
        }

        // Add a small delay between sending multiple products
        if (products.length > 1) await new Promise(r => setTimeout(r, 800));
    }
}

async function runPaymentNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;
    const data = node.data || {};

    console.log(`[FlowExecutor] 💳 Payment data for node ${node.id}:`, JSON.stringify(data));

    if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
        console.error(`[FlowExecutor] ❌ Invalid payment amount for node ${node.id}: ${data.amount}`);
        return;
    }

    const provider = data.paymentProvider || 'Razorpay';
    const amountDisplay = `₹${data.amount}`;
    const bodyText = `🛒 *Payment Request*\n\nFor: *${data.paymentTitle || 'Order'}*\nTotal: *${amountDisplay}*\n\nPlease click the button below to complete your payment securely.`;
    const ctaTitle = `Pay ${amountDisplay} Now`;

    try {
        let shortUrl: string;

        if (provider === 'PhonePe') {
            const { PhonePeManager } = await import('../payments/phonepe');
            const txnId = `FLOW_${session.id}_${Date.now()}`;
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grafty.pro';
            const result = await PhonePeManager.createPaymentLinkForWorkspace(
                contact.workspace_id,
                parseFloat(data.amount),
                txnId,
                `usr_${contact.id}`,
                `${baseUrl}/api/webhooks/phonepe`,
                `${baseUrl}/payment-success?txnId=${txnId}`,
                contact.phone
            );
            shortUrl = result.redirectUrl;
            console.log(`[FlowExecutor] 🔗 Generated PhonePe Link: ${shortUrl}`);
        } else {
            const { RazorpayManager } = await import('../payments/razorpay');
            const linkResponse = await RazorpayManager.createPaymentLink(
                contact.workspace_id,
                parseFloat(data.amount),
                data.currency || 'INR',
                data.paymentTitle || 'Payment Request',
                { name: contact.name || 'Customer', contact: contact.phone, email: 'customer@email.com' }
            );
            shortUrl = linkResponse.short_url;
            console.log(`[FlowExecutor] 🔗 Generated Razorpay Link: ${shortUrl}`);
        }

        const { buildCTAUrlPayload } = await import('./payload-builder');
        const p = buildCTAUrlPayload(contact.phone, bodyText, { title: ctaTitle, value: shortUrl });

        if (p) {
            const metaId = await sendMessageDirect({
                phoneNumberId: waba.phone_number_id,
                accessToken: waba.access_token,
                payload: p,
                sessionId: session.id,
                nodeId: node.id,
                workspaceId: session.workspace_id,
                contactId: contact.id
            });
            await saveOutboundMessage(waba, contact, metaId, p);
        }
    } catch (err: any) {
        console.error(`[FlowExecutor] ❌ Payment Failure (${provider}): ${err.message}`);
        const errorText = `❌ *Payment Generation Failed*\n\nReason: ${err.message || 'System error'}`;
        const p = buildTextPayload(contact.phone, errorText);
        if (p) await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
    }
}

async function runTemplateNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact } = ctx;
    const data = node.data || {};
    if (!data.templateName) return;

    const { buildTemplatePayload } = await import('./payload-builder');
    const p = buildTemplatePayload(contact.phone, data.templateName, data.language || 'en_US');
    if (p) {
        const metaId = await sendMessageDirect({
            phoneNumberId: waba.phone_number_id,
            accessToken: waba.access_token,
            payload: p,
            sessionId: ctx.session.id,
            nodeId: node.id,
            workspaceId: ctx.session.workspace_id,
            contactId: contact.id
        });
        if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
    }
}

// -----------------------------------------------------------------------
// Meta Flow Node (WhatsApp Form)
// -----------------------------------------------------------------------
async function runMetaFlowNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact } = ctx;
    const data = node.data || {};
    if (!data.flowId) return;

    const { buildMetaFlowPayload } = await import('./payload-builder');
    const p = buildMetaFlowPayload(contact.phone, data.flowId, data.flowCTA || 'Open', data.flowHeader || '', data.text || '', data.flowFooter || '');
    if (p) {
        const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: ctx.session.id, nodeId: node.id, workspaceId: ctx.session.workspace_id, contactId: contact.id });
        if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
    }
}

// -----------------------------------------------------------------------
// Order Tracking Node
// -----------------------------------------------------------------------
async function runOrderTrackingNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const orderId = (session.state?.last_input || '').trim();

    try {
        const { LogisticsService } = await import('../integrations/logistics');
        const tracking = await LogisticsService.getTrackingInfo(orderId);

        if (tracking) {
            const emoji = LogisticsService.getStatusEmoji(tracking.status);
            const msg = `📦 *Order: ${tracking.orderId}*\nStatus: ${emoji} *${tracking.status}*\nCarrier: ${tracking.carrier}\nLocation: ${tracking.lastLocation}\nEst. Delivery: ${tracking.estimatedDelivery}`;
            const p = buildTextPayload(contact.phone, msg);
            if (p) {
                const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
                if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
            }
            const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'found');
            if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
            else await closeSession(session.id, 'ORDER_TRACKING_DONE');
        } else {
            const p = buildTextPayload(contact.phone, '❌ Order not found. Please check the ID and try again.');
            if (p) {
                const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
                if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
            }
            const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'failed');
            if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
            else await closeSession(session.id, 'ORDER_TRACKING_FAILED');
        }
    } catch (e) {
        console.error('[FlowExecutor] Order tracking error:', e);
    }
}

// -----------------------------------------------------------------------
// Appointment Node
// -----------------------------------------------------------------------
async function runAppointmentNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const slotId = (session.state?.last_input || '').trim();

    try {
        const { AppointmentService } = await import('../services/appointment-service');
        await AppointmentService.bookSlot(contact.workspace_id, contact.id, slotId, `Booked via Flow: ${session.flow.name}`);

        const p = buildTextPayload(contact.phone, '✅ *Appointment Confirmed!* We will send you a reminder before your slot.');
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
        }
        const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'true');
        if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
        else await closeSession(session.id, 'APPOINTMENT_BOOKED');
    } catch (e: any) {
        const p = buildTextPayload(contact.phone, `❌ Booking failed: ${e.message || 'Slot unavailable'}`);
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
        }
        const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'false');
        if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
        else await closeSession(session.id, 'APPOINTMENT_FAILED');
    }
}

// -----------------------------------------------------------------------
// Order Summary Node
// -----------------------------------------------------------------------
async function runOrderSummaryNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;

    try {
        const order = await prisma.order.findFirst({
            where: { workspace_id: contact.workspace_id, contact_id: contact.id, status: 'PENDING' },
            include: { items: { include: { product: true } } },
            orderBy: { created_at: 'desc' },
        });

        let msg = node.data?.text || 'No pending orders found.';
        if (order && order.items.length > 0) {
            const lines = order.items.map((i: any) => `• ${i.product?.name || 'Item'} x${i.quantity} — ₹${i.total_price}`);
            msg = `📋 *Order Summary*\n\n${lines.join('\n')}\n\n*Total: ₹${order.total_amount}*`;
        }

        const p = buildTextPayload(contact.phone, msg);
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
        }
    } catch (e) {
        console.error('[FlowExecutor] Order summary error:', e);
    }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

async function saveOutboundMessage(waba: any, contact: any, metaId: string | null, payload: any): Promise<void> {
    try {
        let conversation = await prisma.conversation.findFirst({
            where: { contact_id: contact.id, workspace_id: waba.workspace_id, status: 'OPEN' },
            orderBy: { updated_at: 'desc' },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { workspace_id: waba.workspace_id, contact_id: contact.id, status: 'OPEN' },
            });
        }

        const msgType = detectMessageType(payload);
        const content = buildContentRecord(payload);

        await prisma.message.create({
            data: {
                workspace_id: waba.workspace_id,
                contact_id: contact.id,
                conversation_id: conversation.id,
                meta_id: metaId || `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: msgType as any,
                direction: 'OUTBOUND',
                content,
                status: 'SENT',
            },
        });
    } catch (e) {
        console.error('[FlowExecutor] Failed to save outbound message:', e);
    }
}

function detectMessageType(payload: any): string {
    if (payload.type === 'text') return 'TEXT';
    if (payload.type === 'image') return 'IMAGE';
    if (payload.type === 'video') return 'VIDEO';
    if (payload.type === 'document') return 'DOCUMENT';
    if (payload.type === 'audio') return 'AUDIO';
    if (payload.type === 'interactive') return 'INTERACTIVE';
    if (payload.type === 'template') return 'TEMPLATE';
    return 'TEXT';
}

/**
 * Normalizes outbound Meta API payload into our canonical "content" JSON for DB storage.
 */
function buildContentRecord(payload: any): any {
    if (!payload) return {};

    const type = payload.type?.toLowerCase();

    // 1. Plain Text
    if (type === 'text') {
        return { body: payload.text?.body };
    }

    // 2. Media (Image, Video, Audio, Document)
    if (type === 'image') return { link: payload.image?.link, caption: payload.image?.caption, contentType: 'IMAGE' };
    if (type === 'video') return { link: payload.video?.link, caption: payload.video?.caption, contentType: 'VIDEO' };
    if (type === 'audio') return { link: payload.audio?.link, contentType: 'AUDIO' };
    if (type === 'document') return { link: payload.document?.link, filename: payload.document?.filename, caption: payload.document?.caption, contentType: 'DOCUMENT' };

    // 3. Interactive Messages (Buttons, Lists, Products, CTA-URLs, Catalogs)
    if (type === 'interactive') {
        const i = payload.interactive || {};
        const body = i.body?.text || '';
        const footer = i.footer?.text || '';
        const buttons = i.action?.buttons?.map((b: any) => b.reply?.title) || [];

        let link: string | undefined;
        let contentType: string | undefined;
        let filename: string | undefined;
        let msgContent: any = {};

        // Header Media
        if (i.header) {
            const h = i.header;
            const hType = h.type?.toLowerCase();
            if (hType === 'image' && h.image?.link) { link = h.image.link; contentType = 'IMAGE'; }
            else if (hType === 'video' && h.video?.link) { link = h.video.link; contentType = 'VIDEO'; }
            else if (hType === 'document' && h.document?.link) { link = h.document.link; contentType = 'DOCUMENT'; filename = h.document.filename; }
        }

        // Native Catalog / Product
        if (i.type === 'product' || i.type === 'product_list') {
            const action = i.action || {};
            // DO NOT return early here, we need to collect body/footer/link below
            // Just set some specific fields
            msgContent = {
                ...msgContent,
                catalog_id: action.catalog_id,
                product_retailer_id: action.product_retailer_id,
                sections: action.sections,
                interactiveType: i.type,
                contentType: 'PRODUCT'
            };
        }

        // CTA URL
        if (i.type === 'cta_url' && i.action?.parameters) {
            try {
                const params = typeof i.action.parameters === 'string' ? JSON.parse(i.action.parameters) : i.action.parameters;
                msgContent.cta_url = params.url;
                msgContent.cta_text = params.display_text;
            } catch { }
        }

        return {
            ...msgContent,
            body,
            footer,
            link,
            contentType: contentType || msgContent.contentType,
            filename,
            buttons,
            action: i.action, // CRITICAL: Preserve full action for carousel/flows
            interactiveType: i.type,
            raw: payload // Extra safeguard
        };
    }

    // 4. Template Messages
    if (type === 'template') {
        const t = payload.template || {};
        let link: string | undefined;
        let contentType: string | undefined;

        if (Array.isArray(t.components)) {
            const header = t.components.find((c: any) => c.type === 'header');
            if (header && Array.isArray(header.parameters)) {
                const mediaParam = header.parameters.find((p: any) => ['image', 'video', 'document'].includes(p.type));
                if (mediaParam) {
                    const mType = mediaParam.type;
                    link = mediaParam[mType]?.link;
                    contentType = mType.toUpperCase();
                }
            }
        }

        return {
            templateName: t.name,
            language: t.language?.code,
            link,
            contentType
        };
    }

    return { type: payload.type, raw: payload };
}

async function trackAnalytics(flowId: string, nodeId: string): Promise<void> {
    try {
        await (prisma as any).flowAnalytics.upsert({
            where: { flow_id_node_id: { flow_id: flowId, node_id: nodeId } },
            update: { hits: { increment: 1 }, last_hit_at: new Date() },
            create: { flow_id: flowId, node_id: nodeId, hits: 1 },
        });
    } catch (err: any) {
        console.error(`[FlowAnalytics] Failed to track hit for ${nodeId}: ${err.message}`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

// -----------------------------------------------------------------------
// Input Handler — called when a session exists and user sends a reply
// -----------------------------------------------------------------------
export async function handleUserInput(
    session: FlowSessionData,
    waba: any,
    contact: any,
    inputValue: string
): Promise<void> {
    const nodes: any[] = session.flow.nodes || [];
    const edges: any[] = session.flow.edges || [];
    const currentNodeId = session.current_node_id;

    if (!currentNodeId) {
        // Session exists but no current node — re-execute from start
        await executeFrom(session, waba, contact, null, null, 0);
        return;
    }

    // Update session state with user's input
    const newState = await updateSessionState(session.id, session.state, { last_input: inputValue });
    session.state = newState;

    const currentNode = nodes.find((n: any) => n.id === currentNodeId);
    if (!currentNode) {
        console.error(`[FlowExecutor] ❌ Current node ${currentNodeId} not found — closing session`);
        await closeSession(session.id, `NODE_NOT_FOUND:${currentNodeId}`);
        return;
    }

    // Special internal triggers (payment, cart, form submission)
    const internalTriggers = new Set([
        'PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER',
        'FLOW_SUBMITTED_SUCCESSFULLY',
        'CART_SUBMITTED',
    ]);

    if (internalTriggers.has(inputValue)) {
        // Skip input handling — just advance to next node
        await executeFrom(session, waba, contact, currentNodeId, null, 0);
        return;
    }

    // ----------------------------------------------------------------
    // Button/List routing — match input value to edge sourceHandle
    // ----------------------------------------------------------------
    let handleId: string | null = null;

    if (inputValue.startsWith('LIST_SELECT_ID:')) {
        // List selection: "LIST_SELECT_ID:item_id" → handle "item-item_id"
        const itemId = inputValue.replace('LIST_SELECT_ID:', '');
        handleId = `item-${itemId}`;
    } else {
        // Button reply: the button's id IS the value
        // Try direct match first (button ID), then prefixed
        handleId = `button-${inputValue}`;
    }

    // Try to find a matching edge from the current node
    const matchedEdge = edges.find((e: any) =>
        e.source === currentNodeId && (
            e.sourceHandle === handleId ||
            e.sourceHandle === inputValue // direct handle match
        )
    );

    // ----------------------------------------------------------------
    // Numbered Input Routing (Fallback for URL-prioritized single bubbles)
    // ----------------------------------------------------------------
    if (!matchedEdge && /^\d+$/.test(inputValue)) {
        const num = parseInt(inputValue);
        // Identify which buttons were converted to text 
        // In the new payload builder, if URL is present, ALL replies are text.
        // Otherwise, if > 3 replies, extra replies are text.
        const allButtons = currentNode.data?.buttons || [];
        const urlButtons = allButtons.filter((b: any) => b.type === 'url');
        const replyButtons = allButtons.filter((b: any) => b.type === 'reply');

        let textButtons: any[] = [];
        if (urlButtons.length > 0) {
            textButtons = replyButtons;
        } else if (replyButtons.length > 3) {
            textButtons = replyButtons.slice(3);
        }

        if (num > 0 && num <= textButtons.length) {
            const targetBtn = textButtons[num - 1];
            console.log(`[FlowExecutor] 🔢 Numbered Routing: ${num} → Button ${targetBtn.id}`);
            handleId = `button-${targetBtn.id}`;
            // Re-search edge with the resolved handleId
            const secondChanceMatch = edges.find((e: any) =>
                e.source === currentNodeId && e.sourceHandle === handleId
            );
            if (secondChanceMatch) {
                await executeFrom(session, waba, contact, currentNodeId, secondChanceMatch.target, 0);
                return;
            }
        }
    }

    if (matchedEdge) {
        console.log(`[FlowExecutor] 🔀 Routing: node ${currentNodeId} → ${matchedEdge.target} (via handle "${matchedEdge.sourceHandle}")`);
        await executeFrom(session, waba, contact, currentNodeId, matchedEdge.target, 0);
        return;
    }

    // ----------------------------------------------------------------
    // Fallback: No matching button/list item
    // ----------------------------------------------------------------
    const isInteractiveNode = (
        ['list', 'meta_flow', 'appointment', 'payment', 'catalog', 'Catalog', 'product_catalog', 'product_catalog_node'].includes(currentNode.type) ||
        (currentNode.type === 'message' && (currentNode.data?.buttons || []).some((b: any) => b.type === 'reply'))
    );

    if (isInteractiveNode) {
        // MONSTER FIX: Strictly do NOT auto-advance or resend on random text.
        // If the user sends something that doesn't match a button, we stay silent.
        // This allows human-to-human conversation to happen without the bot interjecting.
        console.log(`[FlowExecutor] 😶 Unrecognized input for interactive node ${currentNodeId} — staying silent.`);
        return;
    } else {
        // Non-interactive node: just advance
        console.log(`[FlowExecutor] ⏩ Non-interactive node ${currentNodeId}. Advancing.`);
        await executeFrom(session, waba, contact, currentNodeId, null, 0);
    }
}
