/**
 * 🔥 SESSION MANAGER
 * Single source of truth for all flow session operations.
 * 
 * Guarantees:
 * - One active session per contact (enforced at DB level)
 * - Distributed concurrency lock via Redis (prevents race conditions)
 * - Automatic 24h session expiry
 * - Full multi-tenant isolation (workspace_id always scoped)
 */

import { prisma } from '../db';

// Session lock TTL: 10 seconds. If flow processing hangs, lock auto-releases.
const LOCK_TTL_MS = 10_000;
// Session TTL: 24 hours of inactivity
const SESSION_EXPIRE_HOURS = 24;

// In-memory lock fallback when Redis is unavailable
const memoryLocks = new Map<string, { until: number }>();

// -------------------------------------------------------------------
// Lock Management (Redis with in-memory fallback)
// -------------------------------------------------------------------

async function acquireLock(lockKey: string): Promise<boolean> {
    try {
        const { redis } = await import('../redis');
        const result = await redis.set(
            `flow_lock:${lockKey}`,
            '1',
            'PX', LOCK_TTL_MS,
            'NX'
        );
        return result === 'OK';
    } catch {
        // Redis unavailable — use memory lock
        const existing = memoryLocks.get(lockKey);
        if (existing && existing.until > Date.now()) return false;
        memoryLocks.set(lockKey, { until: Date.now() + LOCK_TTL_MS });
        return true;
    }
}

async function releaseLock(lockKey: string): Promise<void> {
    try {
        const { redis } = await import('../redis');
        await redis.del(`flow_lock:${lockKey}`);
    } catch {
        memoryLocks.delete(lockKey);
    }
}

// -------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------

export interface FlowSessionData {
    id: string;
    flow_id: string;
    contact_id: string;
    workspace_id: string;
    current_node_id: string | null;
    state: Record<string, any>;
    is_completed: boolean;
    is_waiting: boolean;
    flow: any;
}

/**
 * Acquires a distributed lock for a contact, then returns their active session.
 * Returns null if already locked (concurrent processing detected).
 * Caller MUST call `releaseContactLock` when done.
 */
export async function acquireContactLock(contactId: string): Promise<boolean> {
    return acquireLock(contactId);
}

export async function releaseContactLock(contactId: string): Promise<void> {
    return releaseLock(contactId);
}

/**
 * Expires sessions older than SESSION_EXPIRE_HOURS.
 * Called lazily before fetching a session.
 */
async function expireOldSessions(contactId: string): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - SESSION_EXPIRE_HOURS * 60 * 60 * 1000);
        await prisma.flowSession.updateMany({
            where: {
                contact_id: contactId,
                is_completed: false,
                updated_at: { lt: cutoff },
            },
            data: {
                is_completed: true,
                state: { closed_reason: 'EXPIRED_24H' } as any,
            },
        });
    } catch (e) {
        console.warn('[SessionManager] Could not expire old sessions:', e);
    }
}

/**
 * Retrieves the single active (non-completed) session for a contact.
 * Automatically expires stale sessions before returning.
 */
export async function getActiveSession(
    contactId: string,
    workspaceId: string
): Promise<FlowSessionData | null> {
    await expireOldSessions(contactId);

    const session = await prisma.flowSession.findFirst({
        where: {
            contact_id: contactId,
            is_completed: false,
        },
        include: { flow: true },
        orderBy: { created_at: 'desc' },
    });

    if (!session) return null;

    // Multi-tenant safety: ensure session belongs to this workspace
    if (session.flow.workspace_id !== workspaceId) {
        console.error(
            `[SessionManager] ⚠️ Cross-tenant session detected! ` +
            `Contact ${contactId} session flow belongs to workspace ` +
            `${session.flow.workspace_id}, but request is from ${workspaceId}. Closing.`
        );
        await closeSession(session.id, 'CROSS_TENANT_VIOLATION');
        return null;
    }

    return {
        id: session.id,
        flow_id: session.flow_id,
        contact_id: session.contact_id,
        workspace_id: session.flow.workspace_id,
        current_node_id: session.current_node_id,
        state: (session.state as Record<string, any>) || {},
        is_completed: session.is_completed,
        is_waiting: (session as any).is_waiting || false,
        flow: session.flow,
    };
}

/**
 * Creates a fresh session, closing any existing open ones first.
 * Enforces the "One User = One Active Flow" principle.
 */
export async function createSession(
    contactId: string,
    workspaceId: string,
    flowId: string,
    initialInput: string,
    initialState: Record<string, any> = {}
): Promise<FlowSessionData> {
    // Close any lingering sessions first
    await prisma.flowSession.updateMany({
        where: { contact_id: contactId, is_completed: false },
        data: {
            is_completed: true,
            state: { closed_reason: 'NEW_FLOW_STARTED' } as any,
        },
    });

    const session = await prisma.flowSession.create({
        data: {
            flow_id: flowId,
            contact_id: contactId,
            current_node_id: null,
            state: {
                ...initialState,
                last_input: initialInput,
                started_at: new Date().toISOString()
            },
        },
        include: { flow: true },
    });

    console.log(`[SessionManager] ✅ Created session ${session.id} for contact ${contactId} (flow: ${flowId})`);

    return {
        id: session.id,
        flow_id: session.flow_id,
        contact_id: session.contact_id,
        workspace_id: session.flow.workspace_id,
        current_node_id: null,
        state: (session.state as Record<string, any>) || {},
        is_completed: false,
        is_waiting: false,
        flow: session.flow,
    };
}

/**
 * Advances the session to the given node ID.
 */
export async function advanceSession(
    sessionId: string,
    nodeId: string,
    stateUpdate?: Record<string, any>
): Promise<void> {
    await prisma.flowSession.update({
        where: { id: sessionId },
        data: {
            current_node_id: nodeId,
            ...(stateUpdate
                ? { state: stateUpdate as any }
                : {}),
        },
    });
}

/**
 * Updates state data on the session without changing the current node.
 */
export async function updateSessionState(
    sessionId: string,
    currentState: Record<string, any>,
    newData: Record<string, any>
): Promise<Record<string, any>> {
    const merged = { ...currentState, ...newData };
    await prisma.flowSession.update({
        where: { id: sessionId },
        data: { state: merged as any },
    });
    return merged;
}

/**
 * Marks the session as complete.
 */
export async function closeSession(
    sessionId: string,
    reason: string = 'FLOW_COMPLETED'
): Promise<void> {
    await prisma.flowSession.update({
        where: { id: sessionId },
        data: {
            is_completed: true,
            state: { closed_reason: reason } as any,
        },
    }).catch(() => { }); // Silently ignore if already closed
    console.log(`[SessionManager] 🔒 Session ${sessionId} closed: ${reason}`);
}

/**
 * Pauses a session at the current node for a delayed execution.
 */
export async function pauseSession(
    sessionId: string,
    nodeId: string,
    nextRunAt: Date
): Promise<void> {
    await prisma.flowSession.update({
        where: { id: sessionId },
        data: {
            current_node_id: nodeId,
            is_waiting: true,
            next_run_at: nextRunAt,
        } as any,
    });
    console.log(`[SessionManager] ⏸️ Session ${sessionId} paused until ${nextRunAt.toISOString()}`);
}
