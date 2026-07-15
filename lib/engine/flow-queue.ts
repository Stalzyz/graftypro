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
 */
export async function enqueueMessage(msg: QueuedMessage): Promise<void> {
    const { metaApiQueue, PRIORITY_HIGH } = await import('../queue');
    const phone = msg.payload.to;

    // Dedup check
    if (isDuplicate(phone, msg.payload)) return;

    if (metaApiQueue) {
        const type = msg.payload.template?.name ? 'SEND_TEMPLATE' : 
                     (msg.payload.interactive ? 'SEND_INTERACTIVE' : 'SEND_TEXT');

        await metaApiQueue.add('flow-message', {
            type,
            payload: {
                workspaceId: msg.workspaceId,
                contactId: msg.contactId,
                phoneNumberId: msg.phoneNumberId,
                accessToken: msg.accessToken,
                to: phone,
                ...msg.payload 
            }
        }, {
            priority: PRIORITY_HIGH,
            jobId: `FLOW-${msg.sessionId}-${msg.nodeId}-${messageHash(phone, msg.payload)}`
        });
        console.log(`[FlowQueue] 🚀 Bridged to Unified Meta Queue for ${phone} (Priority: HIGH)`);
    } else {
        console.warn('[FlowQueue] ⚠️ Global queue unavailable, falling back to direct send');
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

        // --- 1. PRE-FLIGHT CREDIT CHECK BYPASSED FOR FLOWS ---
        // (Customers already pay subscription & Meta costs directly, so flow automation is free)


        // --- 2. SEND MESSAGE TO META ---
        const resp = await WhatsAppService.sendMessage(
            msg.phoneNumberId,
            token,
            msg.payload
        );

        const metaId = resp?.messages?.[0]?.id;
        console.log(`[FlowQueue] ✅ Sent. Meta ID: ${metaId}`);

        // 💳 STEP 2: Credit deduction — BYPASSED FOR FLOWS
        // Flow automation messaging is now totally free for the vendor since they pay Meta costs directly.

        return metaId || null;

    } catch (err: any) {
        console.error(`[FlowQueue] ❌ Send failed: ${err?.message}`);
        throw err;
    }
}
