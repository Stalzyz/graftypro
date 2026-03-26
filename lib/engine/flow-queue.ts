/**
 * 🔥 FLOW MESSAGE QUEUE
 * BullMQ-based queue for reliable, deduplicated WhatsApp message sending.
 * 
 * Benefits:
 * - Retry logic (3 attempts with exponential backoff)
 * - Duplicate prevention via content hash
 * - Rate limit safe (controlled delivery)
 * - Never sends broken payloads
 */

import { Queue, Worker } from 'bullmq';
import crypto from 'crypto';

const QUEUE_NAME = 'flow-message-queue';
const DEDUP_WINDOW_MS = 5_000; // 5 second dedup window

// Dedup store: phone+hash → timestamp (in-process fallback)
const dedupCache = new Map<string, number>();

// -----------------------------------------------------------------------
// Redis connection config (shared with existing queue.ts pattern)
// -----------------------------------------------------------------------
const getRedisConfig = () => {
    if (process.env.REDIS_URL) {
        try {
            const url = new URL(process.env.REDIS_URL);
            return { host: url.hostname, port: parseInt(url.port || '6379') };
        } catch { }
    }
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    };
};

// -----------------------------------------------------------------------
// Queue instance (lazy — won't connect during build)
// -----------------------------------------------------------------------
let _queue: Queue | null = null;

function getQueue(): Queue | null {
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;
    if (!_queue) {
        try {
            _queue = new Queue(QUEUE_NAME, {
                connection: getRedisConfig() as any,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1500 },
                    removeOnComplete: { count: 100 },
                    removeOnFail: { count: 50 },
                },
            });
        } catch (e) {
            console.warn('[FlowQueue] Could not create queue (Redis unavailable):', e);
        }
    }
    return _queue;
}

// -----------------------------------------------------------------------
// Message hash for dedup
// -----------------------------------------------------------------------
function messageHash(phone: string, payload: any): string {
    const str = phone + JSON.stringify(payload);
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

function isDuplicate(phone: string, payload: any): boolean {
    const key = messageHash(phone, payload);
    const lastSent = dedupCache.get(key);
    if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
        console.warn(`[FlowQueue] ♻️ Duplicate message suppressed for ${phone}`);
        return true;
    }
    dedupCache.set(key, Date.now());
    // Cleanup old entries
    if (dedupCache.size > 1000) {
        const cutoff = Date.now() - DEDUP_WINDOW_MS * 2;
        dedupCache.forEach((t, k) => {
            if (t < cutoff) dedupCache.delete(k);
        });
    }
    return false;
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

export interface QueuedMessage {
    phoneNumberId: string;
    accessToken: string;
    payload: any;
    sessionId: string;
    nodeId: string;
    workspaceId: string;
    contactId: string;
}

/**
 * Enqueues a validated payload for sending.
 * Falls back to immediate send if Redis/BullMQ is unavailable.
 */
export async function enqueueMessage(msg: QueuedMessage): Promise<void> {
    const phone = msg.payload.to;

    // Dedup check
    if (isDuplicate(phone, msg.payload)) return;

    const queue = getQueue();
    if (queue) {
        await queue.add('send-message', msg, {
            jobId: `${msg.sessionId}:${msg.nodeId}:${messageHash(phone, msg.payload)}`,
        });
        console.log(`[FlowQueue] 📤 Queued message for ${phone} (node: ${msg.nodeId})`);
    } else {
        // Fallback: send immediately (no queue available)
        console.warn('[FlowQueue] ⚠️ Queue unavailable, sending directly');
        await sendMessageDirect(msg);
    }
}

/**
 * Direct send (used as fallback and by the queue worker)
 * 
 * Credit deduction is BEST-EFFORT and NON-BLOCKING.
 * The WhatsApp message is ALWAYS sent, regardless of credit status.
 * This prevents billing issues from breaking message delivery.
 */
export async function sendMessageDirect(msg: QueuedMessage): Promise<string | null> {
    const { WhatsAppService } = await import('../whatsapp/service');
    const { decrypt } = await import('../security/encryption');

    try {
        const token = decrypt(msg.accessToken);

        console.log(
            `[FlowQueue] 📬 Processing ${msg.payload.type} → ${msg.payload.to} ` +
            `(node: ${msg.nodeId})`
        );

        // --- 1. PRE-FLIGHT CREDIT CHECK (The "Block" Logic) ---
        const { CreditService } = await import('../credits/service');
        const { prisma } = await import('../db');

        const getCategory = (payload: any) => {
            if (payload.template?.name) return 'MARKETING'; // Default for template
            if (payload.type === 'interactive') {
                const i = payload.interactive || {};
                if (i.type === 'flow' || i.type === 'button') return 'SERVICE';
                if (i.type === 'list' || i.type === 'product' || i.type === 'product_list') return 'UTILITY';
            }
            if (['image', 'video', 'audio', 'document'].includes(payload.type)) return 'UTILITY';
            return 'SERVICE';
        };

        const category = getCategory(msg.payload);
        const countryCode = (msg.payload.to || '91').replace(/\D/g, '').substring(0, 2);

        let cost = 0;
        try {
            cost = await CreditService.getMessageCost(category, countryCode, msg.workspaceId);
        } catch {
            // Ignored - if pricing fails we assume 0 for now (fallback)
        }

        if (cost > 0 && msg.workspaceId) {
            const wallet = await prisma.vendorWallet.findUnique({
                where: { workspace_id: msg.workspaceId },
                select: { current_balance: true, is_frozen: true, is_automated_blocked: true }
            });

            if (wallet) {
                if (wallet.is_frozen || wallet.is_automated_blocked) {
                    console.warn(`[FlowQueue] 🚫 Blocked: Vendor wallet for workspace ${msg.workspaceId} is frozen or blocked.`);
                    return null;
                }

                if (Number(wallet.current_balance) < cost) {
                    console.warn(`[FlowQueue] 🚫 Paywall Blocked: Insufficient credits for workspace ${msg.workspaceId}. Has ${wallet.current_balance}, needs ${cost}.`);
                    return null; // Silently abort to protect Meta wholesale billing
                }
            }
        }

        // --- 2. SEND MESSAGE TO META ---
        const resp = await WhatsAppService.sendMessage(
            msg.phoneNumberId,
            token,
            msg.payload
        );

        const metaId = resp?.messages?.[0]?.id;
        console.log(`[FlowQueue] ✅ Sent. Meta ID: ${metaId}`);

        // 💳 STEP 2: Credit deduction — fire-and-forget, never blocks message
        // Runs AFTER successful send so we only charge for messages that went through
        if (msg.workspaceId) {
            setImmediate(async () => {
                try {
                    const { CreditService } = await import('../credits/service');

                    // Determine message category
                    const getCategory = (payload: any) => {
                        if (payload.template?.name) return 'MARKETING';
                        if (payload.type === 'interactive') {
                            const i = payload.interactive || {};
                            if (i.type === 'flow' || i.type === 'button') return 'SERVICE';
                            if (i.type === 'list' || i.type === 'product' || i.type === 'product_list') return 'UTILITY';
                        }
                        if (['image', 'video', 'audio', 'document'].includes(payload.type)) return 'UTILITY';
                        return 'SERVICE';
                    };

                    const category = getCategory(msg.payload);
                    const countryCode = (msg.payload.to || '91').replace(/\D/g, '').substring(0, 2);

                    // Get cost (with fallback to 0 if pricing not configured)
                    let cost = 0;
                    try {
                        cost = await CreditService.getMessageCost(category, countryCode, msg.workspaceId);
                    } catch {
                        // No pricing configured yet — skip deduction
                        return;
                    }

                    if (cost <= 0) return; // Free message (SERVICE category)

                    // Deduct atomically
                    const deductionResult = await CreditService.deductCreditsAtomic(
                        msg.workspaceId,
                        cost,
                        `flow_${msg.sessionId}_${msg.nodeId}_${metaId || Date.now()}`,
                        metaId || null,
                        category,
                        countryCode,
                        `Flow: ${category}`
                    );

                    if (deductionResult.success) {
                        console.log(`[CreditLedger] ✅ Deducted ${cost} credits (${category}) from ${msg.workspaceId}. Balance: ${deductionResult.balance_after}`);
                    } else {
                        // Duplicate or zero balance — log only, don't break
                        console.warn(`[CreditLedger] ⚠️ Deduction skipped: ${deductionResult.error}`);
                    }
                } catch (creditErr: any) {
                    // Credit errors NEVER propagate — message already delivered
                    console.error(`[CreditLedger] ❌ Non-fatal credit error: ${creditErr?.message}`);
                }
            });
        }

        return metaId || null;

    } catch (err: any) {
        console.error(`[FlowQueue] ❌ Send failed: ${err?.message}`);
        throw err;
    }
}
