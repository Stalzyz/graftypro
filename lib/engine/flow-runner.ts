/**
 * 🔥 FLOW RUNNER — Enterprise Orchestrator (v2.0)
 * 
 * This is the ENTRY POINT for all incoming WhatsApp messages.
 * It is a thin coordinator that:
 * 1. Acquires a distributed lock (prevents race conditions)
 * 2. Looks up the active session
 * 3. Determines whether to continue a session or start a new one
 * 4. Delegates actual execution to FlowExecutor
 * 5. Releases the lock
 * 
 * It does NOT do any business logic — that lives in the sub-engines.
 */

import { prisma } from '../db';
import { decrypt } from '../security/encryption';
import { NormalizedMessage } from './message-normalizer';
import {
    acquireContactLock,
    releaseContactLock,
    getActiveSession,
    createSession,
    closeSession,
} from './session-manager';
import { findTrigger } from './trigger-engine';
import { executeFrom, handleUserInput } from './flow-executor';
import { buildTextPayload } from './payload-builder';
import { sendMessageDirect } from './flow-queue';

export class FlowRunner {

    /**
     * Main entry point — processes a normalized incoming message.
     */
    static async processMessage(
        workspaceId: string,
        contactId: string,
        normalizedMsg: NormalizedMessage
    ): Promise<void> {
        const start = Date.now();
        const lockKey = contactId;

        // ----------------------------------------------------------------
        // STEP 1: Acquire distributed lock (prevent concurrent processing)
        // ----------------------------------------------------------------
        const locked = await acquireContactLock(lockKey);
        if (!locked) {
            console.warn(`[FlowRunner] ⚡ Concurrent message for contact ${contactId} — skipping`);
            return;
        }

        try {
            console.log(`[FlowRunner] ▶️ Processing [${normalizedMsg.type}] "${normalizedMsg.value}" for ${normalizedMsg.phone}`);

            // ----------------------------------------------------------------
            // STEP 2: Load WABA and Contact context
            // ----------------------------------------------------------------
            const contact = await prisma.contact.findUnique({
                where: { id: contactId },
                include: { workspace: { include: { waba: true } } },
            });

            if (!contact || !contact.workspace?.waba) {
                console.error(`[FlowRunner] ❌ No WABA found for contact ${contactId}. Aborting.`);
                return;
            }

            const waba = contact.workspace.waba;

            // ----------------------------------------------------------------
            // STEP 3: Load active session
            // ----------------------------------------------------------------
            const session = await getActiveSession(contactId, workspaceId);

            // ----------------------------------------------------------------
            // STEP 4: Check if this message is a trigger keyword FIRST
            // Keywords always take priority — they can restart flows.
            // ----------------------------------------------------------------
            const trigger = await findTrigger(workspaceId, normalizedMsg);

            if (trigger.matched) {
                console.log(`[FlowRunner] 🎯 Trigger matched: type=${trigger.type}`);

                if (trigger.type === 'TEXT_REPLY') {
                    // Simple text reply — send and done
                    const p = buildTextPayload(contact.phone, trigger.text);
                    if (p) {
                        await sendMessageDirect({
                            phoneNumberId: waba.phone_number_id,
                            accessToken: waba.access_token,
                            payload: p,
                            sessionId: 'auto-reply',
                            nodeId: 'auto-reply',
                            workspaceId,
                            contactId,
                        });
                        await saveOutboundText(waba, contact, trigger.text);
                    }
                    return;
                }

                if (trigger.type === 'FLOW') {
                    // Start a new flow session (closes any existing session automatically)
                    const newSession = await createSession(contactId, workspaceId, trigger.flowId, normalizedMsg.value);
                    await executeFrom(newSession, waba, contact, null, null, 0);
                    return;
                }
            }

            // ----------------------------------------------------------------
            // STEP 5: No trigger match — continue existing session if any
            // ----------------------------------------------------------------
            if (session) {
                // AGGRESSIVE FIX: Check if session is "STALE"
                // If the user hasn't messaged in 15 minutes, and they sent a non-matching word,
                // we assume they are starting a fresh conversation (human or otherwise).
                const lastUpdated = (session as any).updated_at || new Date();
                const now = new Date();
                const minsIdle = (now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60);

                if (minsIdle > 15) {
                    console.log(`[FlowRunner] ⏰ Session ${session.id} is stale (${minsIdle.toFixed(1)} mins idle) — closing.`);
                    await closeSession(session.id, 'STALE_SESSION_CLOSED_ON_NEW_MESSAGE');
                } else {
                    console.log(`[FlowRunner] 🔄 Continuing session ${session.id} at node "${session.current_node_id}"`);
                    await handleUserInput(session, waba, contact, normalizedMsg.value);
                    return;
                }
            }

            // ----------------------------------------------------------------
            // STEP 6: No session, no trigger — silently ignore
            // ----------------------------------------------------------------
            console.log(`[FlowRunner] 💤 No session and no trigger for "${normalizedMsg.value}" — ignoring`);

        } catch (error: any) {
            console.error(`[FlowRunner] ❌ Unhandled error:`, error?.message || error);
        } finally {
            // ALWAYS release the lock
            await releaseContactLock(lockKey);
            console.log(`[FlowRunner] ✅ Done in ${Date.now() - start}ms`);
        }
    }

    /**
     * Programmatically start a flow (called from Campaigns, Drips, etc.)
     * @param workspaceId - Workspace ID
     * @param contactId - Contact ID
     * @param flowIdentifier - Flow ID or trigger keyword
     */
    static async startFlow(
        workspaceId: string,
        contactId: string,
        flowIdentifier: string,
        initialState: Record<string, any> = {}
    ): Promise<boolean> {
        // Resolve flow by ID or keyword
        let flow = await prisma.flow.findFirst({
            where: {
                OR: [
                    { id: flowIdentifier, workspace_id: workspaceId },
                    { trigger_keyword: { equals: flowIdentifier, mode: 'insensitive' }, workspace_id: workspaceId, status: 'PUBLISHED' },
                ],
            },
        });

        if (!flow) {
            console.error(`[FlowRunner] startFlow: Could not find flow "${flowIdentifier}"`);
            return false;
        }

        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: { workspace: { include: { waba: true } } },
        });

        if (!contact?.workspace?.waba) {
            console.error(`[FlowRunner] startFlow: No WABA for contact ${contactId}`);
            return false;
        }

        const session = await createSession(contactId, workspaceId, flow.id, 'API_TRIGGER', initialState);
        await executeFrom(session, contact.workspace.waba, contact, null, null, 0);
        return true;
    }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
async function saveOutboundText(waba: any, contact: any, text: string): Promise<void> {
    try {
        let convo = await prisma.conversation.findFirst({
            where: { contact_id: contact.id, workspace_id: waba.workspace_id, status: 'OPEN' },
        });
        if (!convo) {
            convo = await prisma.conversation.create({
                data: { workspace_id: waba.workspace_id, contact_id: contact.id, status: 'OPEN' },
            });
        }
        await prisma.message.create({
            data: {
                workspace_id: waba.workspace_id,
                contact_id: contact.id,
                conversation_id: convo.id,
                meta_id: `auto_${Date.now()}`,
                type: 'TEXT' as any,
                direction: 'OUTBOUND',
                content: { body: text },
                status: 'SENT',
            },
        });
    } catch { }
}
