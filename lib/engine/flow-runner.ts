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
import { AIService } from '../ai/openai';

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
                include: {
                    workspace: {
                        include: {
                            waba: true,
                            plan_details: true
                        }
                    }
                },
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
                // FIX #3: Removed the 15-minute aggressive stale-session close.
                // Real WhatsApp users pause for hours mid-flow. Aggressively closing
                // at 15 min was causing flows to silently restart on every short break.
                // The correct TTL is 24 hours, managed via getActiveSession() → expireOldSessions().
                console.log(`[FlowRunner] 🔄 Continuing session ${session.id} at node "${session.current_node_id}"`);
                await handleUserInput(session, waba, contact, normalizedMsg.value);
                return;
            }

            // ----------------------------------------------------------------
            // STEP 6: No session, no trigger — check AI Fallback
            // ----------------------------------------------------------------
            const plan = contact.workspace?.plan_details;

            // NUCLEAR OPT-OUT: If user wants to stop, respect it immediately
            const stopKeywords = ['stop', 'unsubscribe', 'opt out', 'exit', 'quit'];
            if (stopKeywords.includes(normalizedMsg.value.toLowerCase().trim())) {
                console.log(`[FlowRunner] 🛑 Opt-out detected for ${contact.phone}`);
                
                await prisma.contact.update({
                    where: { id: contactId },
                    data: { opt_in: false, unsubscribed_at: new Date() }
                });
                
                const stopPayload = buildTextPayload(contact.phone, "You have been unsubscribed. You will no longer receive automated messages. Reply START to re-enable.");
                if (stopPayload) {
                    await sendMessageDirect({
                        phoneNumberId: waba.phone_number_id,
                        accessToken: waba.access_token,
                        payload: stopPayload,
                        sessionId: 'opt-out',
                        nodeId: 'opt-out',
                        workspaceId,
                        contactId,
                    });
                }
                return;
            }

            // Check if contact is currently OPTED_OUT
            if (contact.opt_in === false) {
                if (normalizedMsg.value.toLowerCase().trim() === 'start') {
                    await prisma.contact.update({ where: { id: contactId }, data: { opt_in: true, unsubscribed_at: null } });
                } else {
                    console.log(`[FlowRunner] 🔇 Contact ${contact.phone} is opted out. Ignoring.`);
                    return;
                }
            }

            if (plan?.ai_fallback_enabled) {
                console.log(`[FlowRunner] 🤖 AI Fallback active for ${contact.phone}`);

                // Load last 5 messages for context
                const history = await prisma.message.findMany({
                    where: { contact_id: contactId, workspace_id: workspaceId },
                    orderBy: { created_at: 'desc' },
                    take: 5,
                });

                const messages = history.reverse().map(m => ({
                    role: (m.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
                    content: (m.content as any)?.body || ''
                }));

                // Add current message if not in history yet
                if (messages.length === 0 || messages[messages.length - 1].content !== normalizedMsg.value) {
                    messages.push({ role: 'user', content: normalizedMsg.value });
                }

                // AI v1.2: Returns JSON { answer, recommended_buttons, intent }
                const aiResult = await AIService.getGroundedAnswer(workspaceId, normalizedMsg.value, messages);

                if (aiResult && aiResult.answer) {
                    // ----------------------------------------------------
                    // NUCLEAR CREDIT ENGINE: Deduct for AI Generation
                    // ----------------------------------------------------
                    try {
                        const { CreditService } = await import('@/lib/credits/service');
                        await CreditService.deductCreditsAtomic(
                            workspaceId,
                            5, // 5 credits per AI Answer (Business Rule)
                            `ai_${Date.now()}`,
                            null,
                            'AI_REPLY',
                            '91',
                            `AI Knowledge Base Answer to ${contact.phone}`
                        );
                    } catch (e: any) {
                        console.warn(`[FlowRunner] 🤖 Billing Block: ${e.message}.`);
                        return; // Stop if user out of credits
                    }

                    const { buildInteractiveButtonsPayload } = await import('./payload-builder');
                    
                    let finalPayload: any;
                    
                    const buttonMap: Record<string, string> = {
                        "TALK_TO_HUMAN": "Talk to Human 👨‍💼",
                        "VIEW_PRICING": "View Pricing 🏷️",
                        "MAIN_MENU": "Main Menu 🏠",
                        "PARTNER_PROGRAM": "Partner Program 🤝",
                        "REQUEST_DEMO": "Request Demo 🚀"
                    };

                    const activeButtons = (aiResult.recommended_buttons || [])
                        .filter((id: string) => !!buttonMap[id])
                        .slice(0, 3)
                        .map((id: string) => ({ id, title: buttonMap[id] }));

                    if (activeButtons.length > 0) {
                        finalPayload = buildInteractiveButtonsPayload(
                            contact.phone,
                            aiResult.answer,
                            activeButtons,
                            undefined,
                            "Grafty AI Assistant"
                        );
                    } else {
                        finalPayload = buildTextPayload(contact.phone, aiResult.answer);
                    }

                    if (finalPayload) {
                        await sendMessageDirect({
                            phoneNumberId: waba.phone_number_id,
                            accessToken: waba.access_token,
                            payload: finalPayload,
                            sessionId: 'ai-knowledge',
                            nodeId: 'ai-knowledge',
                            workspaceId,
                            contactId,
                        });
                        await saveOutboundText(waba, contact, aiResult.answer);
                    }
                    return;
                }
            }

            console.log(`[FlowRunner] 💤 No session, no trigger, and no AI fallback for "${normalizedMsg.value}" — ignoring`);

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
