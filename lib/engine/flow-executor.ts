/**
 * 🔥 FLOW EXECUTOR
 * Deterministic, recursive node execution engine.
 */

import { prisma } from '../db';
import { FlowSessionData, advanceSession, closeSession, pauseSession, updateSessionState } from './session-manager';
import { buildNodePayload, buildTextPayload } from './payload-builder';
import { enqueueMessage, sendMessageDirect } from './flow-queue';
import { EmailService } from '../email/service';
import { decrypt } from '../security/encryption';
import { getAbsoluteMediaUrl } from '../utils/url';

const MAX_DEPTH = 25;

interface ExecutionContext {
    session: FlowSessionData;
    waba: any;
    contact: any;
    plan?: any;
}

/**
 * Begins or continues execution from a given node.
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
        console.error(`[FlowExecutor] ⛔ Max depth (${MAX_DEPTH}) reached. Loop in ${session.flow_id}`);
        await closeSession(session.id, 'MAX_DEPTH_EXCEEDED');
        return;
    }

    const nodes: any[] = session.flow.nodes || [];
    const edges: any[] = session.flow.edges || [];
    const plan = (contact as any).workspace?.plan_details;
    const ctx: ExecutionContext = { session, waba, contact, plan };

    let nextNode: any;

    if (targetNodeId) {
        nextNode = nodes.find((n: any) => n.id === targetNodeId);
        if (!nextNode) {
            await closeSession(session.id, `NODE_NOT_FOUND:${targetNodeId}`);
            return;
        }
    } else if (!fromNodeId) {
        nextNode = nodes.find((n: any) => n.type === 'start') || nodes[0];
    } else {
        const fromNode = nodes.find((n: any) => n.id === fromNodeId);
        const interactiveTypes = new Set(['list', 'meta_flow', 'appointment', 'payment', 'catalog', 'Catalog', 'product_catalog', 'product_catalog_node', 'location']);
        const isInteractiveButton = (fromNode?.type === 'message' && (fromNode?.data?.buttons || []).some((b: any) => b.type === 'reply')) ||
            (fromNode?.type === 'location' && fromNode?.data?.locationType === 'REQUEST');

        if (interactiveTypes.has(fromNode?.type) || isInteractiveButton) return;

        const outEdges = edges.filter((e: any) => e.source === fromNodeId);
        if (outEdges.length === 0) {
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

    console.log(`[FlowExecutor] ▶️ Node ${nextNode.id} (${nextNode.type}) depth=${depth}`);
    await advanceSession(session.id, nextNode.id);
    session.current_node_id = nextNode.id;

    trackAnalytics(session.flow_id, nextNode.id).catch(() => { });
    await executeNode(ctx, nextNode, edges, depth);
}

async function executeNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    switch (node.type) {
        case 'start':
        case 'action':
            await runActionNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;
        case 'sync_data':
            await runSyncDataNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;
        case 'drip':
            await runDripNode(ctx, node);
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
            break;
        case 'condition':
            await runConditionNode(ctx, node, edges, depth);
            break;
        case 'time_window':
            await runTimeWindowNode(ctx, node, edges, depth);
            break;
        case 'wait':
            await runWaitNode(ctx, node);
            break;
        case 'goal':
            await runGoalNode(ctx, node);
            break;
        case 'end':
            await closeSession(session.id, 'FLOW_COMPLETED_END_NODE');
            break;
        case 'order_tracking':
            await runOrderTrackingNode(ctx, node, edges, depth);
            break;
        case 'appointment':
            await runAppointmentNode(ctx, node, edges, depth);
            break;
        case 'payment':
        case 'Payment':
            await runPaymentNode(ctx, node);
            break;
        case 'catalog':
        case 'Catalog':
        case 'product_catalog':
            await runCatalogNode(ctx, node);
            break;
        case 'meta_flow':
        case 'MetaFlow':
            await runMetaFlowNode(ctx, node);
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
        case 'external_webhook':
        case 'webhook_crm':
            await runExternalWebhookNode(ctx, node, edges, depth);
            break;
        case 'location':
        case 'message':
        case 'list':
        default:
            await runMessageNode(ctx, node, depth);
            break;
    }
}

async function runMessageNode(ctx: ExecutionContext, node: any, depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = { ...node.data };
    const phone = contact.phone;

    if (data.text) data.text = resolveVariables(data.text, session.state, contact);

    const rawMediaUrl = data.mediaUrl || data.headerUrl || data.imageUrl || data.videoUrl;
    if (rawMediaUrl) {
        try {
            const { WhatsAppService } = await import('../whatsapp/service');
            const absoluteUrl = getAbsoluteMediaUrl(rawMediaUrl);
            const mediaId = await WhatsAppService.uploadMediaFromUrl(absoluteUrl, waba.phone_number_id, waba.access_token);
            if (mediaId) data._mediaId = mediaId;
        } catch (e: any) {
            console.error(`[FlowMedia] Pre-upload failed: ${e.message}`);
        }
    }

    const { buildNodePayload } = await import('./payload-builder');
    const { payloads, isInteractive } = buildNodePayload(phone, node.type, data);

    for (let i = 0; i < payloads.length; i++) {
        try {
            const metaId = await sendMessageDirect({
                phoneNumberId: waba.phone_number_id,
                accessToken: waba.access_token,
                payload: payloads[i],
                sessionId: session.id,
                nodeId: node.id,
                workspaceId: session.workspace_id,
                contactId: contact.id,
            });
            await saveOutboundMessage(waba, contact, metaId, payloads[i]);
        } catch (err: any) {
            console.error(`[FlowExecutor] Send failed: ${err?.message}`);
        }
        if (i < payloads.length - 1) await sleep(600);
    }

    if (!isInteractive) await executeFrom(session, waba, contact, node.id, null, depth + 1);
}

async function runConditionNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
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
    const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === handleId);
    if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
    else await closeSession(session.id, `CONDITION_DEAD_END:${handleId}`);
}

async function runTimeWindowNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const data = node.data || {};
    const startStr = data.startTime || '09:00';
    const endStr = data.endTime || '18:00';

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    const curStr = `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`;

    const handleId = (curStr >= startStr && curStr <= endStr) ? 'within' : 'outside';
    const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === handleId);
    if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
    else await closeSession(session.id, `TIME_WINDOW_DEAD_END:${handleId}`);
}

async function runWaitNode(ctx: ExecutionContext, node: any): Promise<void> {
    const data = node.data || {};
    const val = parseInt(data.delayValue || '5', 10);
    const unit = data.delayUnit || 'minutes';
    let ms = val * 60 * 1000;
    if (unit === 'hours') ms = val * 60 * 60 * 1000;
    if (unit === 'days') ms = val * 24 * 60 * 60 * 1000;
    await pauseSession(ctx.session.id, node.id, new Date(Date.now() + ms));
}

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
        if (ctx.session?.workspace_id) {
            try {
                const ws = await prisma.workspace.findUnique({ where: { id: ctx.session.workspace_id }, select: { webhook_url: true } });
                if (ws?.webhook_url) {
                    fetch(ws.webhook_url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ event: "flow.webhook_action", contact: { id: ctx.contact.id, phone: ctx.contact.phone }, state: ctx.session.state })
                    }).catch(() => { });
                }
            } catch { }
        }
    } else if (data.actionType === 'save_to_crm') {
            await prisma.universalCrmLead.upsert({
                where: { phone_workspace_id: { phone: ctx.contact.phone, workspace_id: ctx.contact.workspace_id } },
                update: { custom_data: { ...(ctx.session.state || {}), last_flow_id: ctx.session.flow_id } },
                create: { workspace_id: ctx.contact.workspace_id, contact_id: ctx.contact.id, name: ctx.contact.name || ctx.contact.phone, phone: ctx.contact.phone, source: "WhatsApp Flow", custom_data: ctx.session.state }
            });
    }
}

async function runDripNode(ctx: ExecutionContext, node: any): Promise<void> {
    const data = node.data || {};
    const dripId = data.dripId || data.drip_id || data.dripIdSelect;
    if (!dripId) return;
    try {
        const { DripService } = await import('../services/drip-service');
        await DripService.enroll(ctx.contact.workspace_id, ctx.contact.id, dripId, ctx.session.state);
    } catch { }
}

async function runCatalogNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;
    const data = node.data || {};
    const products = data.carouselProducts && data.carouselProducts.length > 0 ? data.carouselProducts : [{ name: data.productName || 'Product', price: data.productPrice || 'N/A', text: data.text || 'View this item!', image: data.productImage || '', id: data.productId || 'none' }];

    for (const prod of products) {
        const absUrl = getAbsoluteMediaUrl(prod.image);
        const bodyText = `🏷️ *${(prod.name || 'Product').toUpperCase()}*\n\n${prod.text || 'Selection'}\n\n*Price: ₹${prod.price || 'N/A'}*`;
        const payload = {
            to: contact.phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                header: absUrl ? { type: 'image', image: { link: absUrl } } : undefined,
                body: { text: bodyText.substring(0, 1024) },
                action: { buttons: [{ type: 'reply', reply: { id: `buy_${prod.id || 'none'}`, title: 'Interested' } }] }
            }
        };
        try {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, payload);
        } catch { }
        if (products.length > 1) await sleep(800);
    }
}

async function runPaymentNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;
    const data = node.data || {};
    if (!data.amount) return;

    try {
        const provider = data.paymentProvider || 'Razorpay';
        let shortUrl: string;
        if (provider === 'PhonePe') {
            const { PhonePeManager } = await import('../payments/phonepe');
            const txnId = `FLOW_${session.id}_${Date.now()}`;
            const result = await PhonePeManager.createPaymentLinkForWorkspace(contact.workspace_id, parseFloat(data.amount), txnId, `usr_${contact.id}`, `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/phonepe`, `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?txnId=${txnId}`, contact.phone);
            shortUrl = result.redirectUrl;
        } else {
            const { RazorpayManager } = await import('../payments/razorpay');
            const res = await RazorpayManager.createPaymentLink(
                contact.workspace_id,
                parseFloat(data.amount),
                'INR',
                data.paymentTitle || 'Payment',
                {
                    name: contact.name || 'Customer',
                    contact: contact.phone,
                    email: contact.email || 'noreply@grafty.pro'
                }
            );
            shortUrl = res.short_url;
        }

        const { buildCTAUrlPayload } = await import('./payload-builder');
        const p = buildCTAUrlPayload(contact.phone, data.text || 'Click to pay', { title: 'Pay Now', value: shortUrl });
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            await saveOutboundMessage(waba, contact, metaId, p);
        }
    } catch { }
}

async function runTemplateNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact } = ctx;
    const data = node.data || {};
    if (!data.templateName) return;
    const components: any[] = [];
    if (Array.isArray(data.variables)) {
        const parameters = data.variables.map((v: string) => ({ type: "text", text: resolveVariables(v, ctx.session.state, contact) }));
        if (parameters.length > 0) components.push({ type: "body", parameters });
    }
    const { buildTemplatePayload } = await import('./payload-builder');
    const p = buildTemplatePayload(contact.phone, data.templateName, data.language || 'en_US', components);
    if (p) {
        const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: ctx.session.id, nodeId: node.id, workspaceId: ctx.session.workspace_id, contactId: contact.id });
        if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
    }
}

async function runMetaFlowNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact } = ctx;
    const data = node.data || {};
    const { buildMetaFlowPayload } = await import('./payload-builder');
    const p = buildMetaFlowPayload(contact.phone, data.flowId, data.flowCTA || 'Open', data.flowHeader || '', data.text || '', data.flowFooter || '', data.initialScreen || 'QUESTION_1', data.flowToken || `tk_${Date.now()}`, data.headerType || 'text', getAbsoluteMediaUrl(data.headerUrl));
    if (p) {
        const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: ctx.session.id, nodeId: node.id, workspaceId: ctx.session.workspace_id, contactId: contact.id });
        if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
    }
}

async function runOrderTrackingNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const orderId = (session.state?.last_input || '').trim();
    try {
        const { LogisticsService } = await import('../integrations/logistics');
        const tracking = await LogisticsService.getTrackingInfo(orderId);
        if (tracking) {
            const msg = `📦 *Order: ${tracking.orderId}*\nStatus: ${LogisticsService.getStatusEmoji(tracking.status)} *${tracking.status}*`;
            const p = buildTextPayload(contact.phone, msg);
            if (p) {
                const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
                if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
            }
            const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'found');
            if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
        } else {
            const p = buildTextPayload(contact.phone, '❌ Order not found.');
            if (p) {
                const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
                if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
            }
            const edge = edges.find((e: any) => e.source === node.id && e.sourceHandle === 'failed');
            if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
        }
    } catch { }
}

async function runAppointmentNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact } = ctx;
    const slotId = (session.state?.last_input || '').trim();
    try {
        const { AppointmentService } = await import('../services/appointment-service');
        await AppointmentService.bookSlot(contact.workspace_id, contact.id, slotId, `Booked via Flow: ${session.flow.name}`);
        const p = buildTextPayload(contact.phone, node.data?.text || '✅ *Appointment Confirmed!*');
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
        }
        const edge = edges.find((e: any) => e.source === node.id);
        if (edge) await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
    } catch (e: any) {
        const p = buildTextPayload(contact.phone, `❌ Booking failed: ${e.message || 'Slot unavailable'}`);
        if (p) {
            const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
            if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
        }
    }
}

async function runOrderSummaryNode(ctx: ExecutionContext, node: any): Promise<void> {
    const { waba, contact, session } = ctx;
    try {
        const order = await prisma.order.findFirst({ where: { workspace_id: contact.workspace_id, contact_id: contact.id, status: 'PENDING' }, include: { items: { include: { product: true } } }, orderBy: { created_at: 'desc' } });
        if (order && order.items.length > 0) {
            const lines = order.items.map((i: any) => `• ${i.product?.name || 'Item'} x${i.quantity} — ₹${i.total_price}`);
            const msg = `📋 *Order Summary*\n\n${lines.join('\n')}\n\n*Total: ₹${order.total_amount}*`;
            const p = buildTextPayload(contact.phone, msg);
            if (p) {
                const metaId = await sendMessageDirect({ phoneNumberId: waba.phone_number_id, accessToken: waba.access_token, payload: p, sessionId: session.id, nodeId: node.id, workspaceId: session.workspace_id, contactId: contact.id });
                if (metaId) await saveOutboundMessage(waba, contact, metaId, p);
            }
        }
    } catch { }
}

/**
 * 🛰️ EXTERNAL WEBHOOK (CRM BRIDGE) Node
 * Pushes real-time capture data to external CRMs like HubSpot, Salesforce, etc.
 * Gated by Subscription Plan (flow_integration_access).
 */
async function runExternalWebhookNode(ctx: ExecutionContext, node: any, edges: any[], depth: number): Promise<void> {
    const { session, waba, contact, plan } = ctx;
    const data = node.data || {};

    // 1. Subscription Guard: Ensure the plan supports external integrations
    if (!plan?.flow_integration_access) {
        console.warn(`[FlowExecutor] 🚫 CRM Bridge skipped for Workspace: ${session.workspace_id}. Plan limitation.`);
        // Graceful fallback: just continue the flow
        return executeFrom(session, waba, contact, node.id, null, depth + 1);
    }

    if (!data.url) return executeFrom(session, waba, contact, node.id, null, depth + 1);

    try {
        const url = resolveVariables(data.url, session.state, contact);
        const headers = typeof data.headers === 'string' ? JSON.parse(resolveVariables(data.headers, session.state, contact)) : (data.headers || {});
        const body = typeof data.body === 'string' ? resolveVariables(data.body, session.state, contact) : JSON.stringify(data.body || {});

        const res = await fetch(url, {
            method: data.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: data.method !== 'GET' ? body : undefined,
            signal: AbortSignal.timeout(8000) // 8 second timeout for professional CRM sync
        });

        const status = res.ok ? 'success' : 'failed';
        
        // Potential Capture: If the user specified a key to capture the response JSON into state
        if (res.ok && data.captureKey) {
            try {
                const json = await res.json();
                await updateSessionState(session.id, session.state, { [data.captureKey]: json });
            } catch {}
        }

        // Branching Paths
        const edge = edges.find((e: any) => e.source === node.id && (e.sourceHandle || '').toLowerCase() === status);
        if (edge) {
            await executeFrom(session, waba, contact, node.id, edge.target, depth + 1);
        } else {
            // No success/fail specific branch? Just proceed to next default node
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
        }

    } catch (e: any) {
        console.error(`[FlowExecutor] ❌ Webhook Node Failed:`, e.message);
        const failEdge = edges.find((e: any) => e.source === node.id && (e.sourceHandle || '').toLowerCase() === 'failed');
        if (failEdge) {
            await executeFrom(session, waba, contact, node.id, failEdge.target, depth + 1);
        } else {
            await executeFrom(session, waba, contact, node.id, null, depth + 1);
        }
    }
}

async function saveOutboundMessage(waba: any, contact: any, metaId: string | null, payload: any): Promise<void> {
    try {
        let conversation = await prisma.conversation.findFirst({ where: { contact_id: contact.id, workspace_id: waba.workspace_id, status: 'OPEN' }, orderBy: { updated_at: 'desc' } });
        if (!conversation) conversation = await prisma.conversation.create({ data: { workspace_id: waba.workspace_id, contact_id: contact.id, status: 'OPEN' } });

        const type = payload.type;
        const mediaObj = payload[type];
        
        await prisma.message.create({
            data: {
                workspace_id: waba.workspace_id,
                contact_id: contact.id,
                conversation_id: conversation.id,
                meta_id: metaId || `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: detectMessageType(payload) as any,
                direction: 'OUTBOUND',
                content: buildContentRecord(payload),
                status: 'SENT',
                // @ts-ignore
                media_url: mediaObj?.link || null,
                // @ts-ignore
                mime_type: mediaObj?.mime_type || null,
                // @ts-ignore
                file_name: mediaObj?.filename || null,
                // @ts-ignore
                caption: mediaObj?.caption || null
            },
        });
    } catch (e) {
        console.error('[FlowExecutor] Failed to save message:', e);
    }
}

function detectMessageType(payload: any): string {
    if (payload.type === 'text') return 'TEXT';
    if (['image', 'video', 'document', 'audio'].includes(payload.type)) return payload.type.toUpperCase();
    if (payload.type === 'interactive') return 'INTERACTIVE';
    if (payload.type === 'template') return 'TEMPLATE';
    return 'TEXT';
}

function buildContentRecord(payload: any): any {
    if (!payload) return {};
    const type = payload.type?.toLowerCase();
    if (type === 'text') return { body: payload.text?.body };
    if (['image', 'video', 'audio', 'document'].includes(type)) {
        const m = payload[type];
        return { link: m.link, caption: m.caption, filename: m.filename, contentType: type.toUpperCase() };
    }
    if (type === 'interactive') {
        const i = payload.interactive || {};
        return { body: i.body?.text, footer: i.footer?.text, interactiveType: i.type, action: i.action };
    }
    if (type === 'template') return { templateName: payload.template?.name };
    return { raw: payload };
}

async function trackAnalytics(flowId: string, nodeId: string): Promise<void> {
    try {
        await (prisma as any).flowAnalytics.upsert({
            where: { flow_id_node_id: { flow_id: flowId, node_id: nodeId } },
            update: { hits: { increment: 1 }, last_hit_at: new Date() },
            create: { flow_id: flowId, node_id: nodeId, hits: 1 },
        });
    } catch { }
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

export async function handleUserInput(session: FlowSessionData, waba: any, contact: any, inputValue: string): Promise<void> {
    const nodes: any[] = session.flow.nodes || [];
    const edges: any[] = session.flow.edges || [];
    const currentNodeId = session.current_node_id;
    if (!currentNodeId) return executeFrom(session, waba, contact, null, null, 0);

    const newState = await updateSessionState(session.id, session.state, { last_input: inputValue });
    session.state = newState;

    const currentNode = nodes.find((n: any) => n.id === currentNodeId);
    if (!currentNode) return closeSession(session.id, 'NODE_NOT_FOUND');

    if (inputValue.startsWith('{') && inputValue.endsWith('}')) {
        try {
            const flowData = JSON.parse(inputValue);
            console.log(`[FlowExecutor] 📦 Meta Flow Response Captured:`, flowData);
            
            // 1. Update Session State
            const newState = await updateSessionState(session.id, session.state, { ...flowData, last_flow_response: flowData });
            session.state = newState;

            // 2. MONSTER FEATURE: CRM Auto-mapping
            // Maps common fields (email, name, age, city) directly to CRM attributes
            const crmFields: Record<string, string> = {
                email: 'email',
                email_address: 'email',
                business_name: 'business_name',
                full_name: 'name',
                name: 'name',
            };

            const updates: any = {};
            for (const [key, val] of Object.entries(flowData)) {
                if (crmFields[key]) updates[crmFields[key]] = val;
            }

            if (Object.keys(updates).length > 0) {
                console.log(`[FlowExecutor] 🧬 Auto-mapping CRM fields:`, updates);
                await prisma.contact.update({ where: { id: contact.id }, data: updates });
            }

            // 3. Continue Flow: Move to the NEXT node after the Meta Flow node
            const nextEdge = edges.find((e: any) => e.source === currentNodeId);
            if (nextEdge) {
                return executeFrom(session, waba, contact, null, nextEdge.target, 0);
            }
            
            return closeSession(session.id, 'FLOW_COMPLETED_AFTER_META_FLOW');
        } catch (e: any) {
            console.error(`[FlowExecutor] ❌ Meta Flow Parse Error:`, e.message);
        }
    }

    const matchedEdge = edges.find((e: any) => e.source === currentNodeId && ((e.sourceHandle || '').toLowerCase() === (inputValue || '').toLowerCase() || (e.sourceHandle || '').toLowerCase() === `button-${(inputValue || '').toLowerCase()}`));
    if (matchedEdge) return executeFrom(session, waba, contact, currentNodeId, matchedEdge.target, 0);

    if (['message', 'list', 'meta_flow', 'appointment', 'payment', 'catalog', 'location'].includes(currentNode.type)) return;
    await executeFrom(session, waba, contact, currentNodeId, null, 0);
}

async function runSyncDataNode(ctx: ExecutionContext, node: any): Promise<void> {
    const config = node.data?.apiConfig || {};
    if (!config.url) return;
    try {
        const res = await fetch(resolveVariables(config.url, ctx.session.state, ctx.contact), { method: config.method || 'GET', headers: { 'Content-Type': 'application/json', ...(config.headers || {}) } });
        if (res.ok) {
            const json = await res.json();
            let val = json;
            if (config.jsonPath) config.jsonPath.split('.').forEach((p: string) => { val = val?.[p]; });
            await updateSessionState(ctx.session.id, ctx.session.state, { [config.syncKey || 'last_sync']: val });
        }
    } catch { }
}

function resolveVariables(text: string, state: any = {}, contact: any = {}): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const tk = key.trim();
        const get = (o: any, p: string) => p.split('.').reduce((a, v) => a?.[v], o);
        return String(get(state, tk) ?? get(contact, tk) ?? match);
    });
}
