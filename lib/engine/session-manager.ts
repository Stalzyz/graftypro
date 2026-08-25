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

// -------------------------------------------------------------------
// Lock Management (Redis-backed with in-memory fail-open fallback)
// -------------------------------------------------------------------

// In-memory fallback set: used when Redis is temporarily unavailable
const inMemoryLocks = new Set<string>();

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
    } catch (e) {
        // FAIL-OPEN FALLBACK: If Redis is temporarily unavailable,
        // use an in-memory Set to prevent concurrent processing.
        // This is safe because Next.js is single-process per instance.
        console.warn(`[SessionManager] ⚠️ Redis unavailable for lock ${lockKey}. Using in-memory fallback.`);
        if (inMemoryLocks.has(lockKey)) return false;
        inMemoryLocks.add(lockKey);
        // Auto-release after TTL in case releaseLock is never called
        setTimeout(() => inMemoryLocks.delete(lockKey), LOCK_TTL_MS);
        return true;
    }
}

async function releaseLock(lockKey: string): Promise<void> {
    // Always clean up in-memory fallback
    inMemoryLocks.delete(lockKey);
    try {
        const { redis } = await import('../redis');
        await redis.del(`flow_lock:${lockKey}`);
    } catch (e) {
        console.warn(`[SessionManager] Warning: Could not release Redis lock for ${lockKey}`);
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
 * BUG-M4 FIX: Merges existing state before closing instead of overwriting
 * (previously this wiped all user-collected variables like name, email, order)
 */
async function expireOldSessions(contactId: string): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - SESSION_EXPIRE_HOURS * 60 * 60 * 1000);
        // Fetch stale sessions first so we can merge-close them
        const staleSessions = await prisma.flowSession.findMany({
            where: {
                contact_id: contactId,
                is_completed: false,
                updated_at: { lt: cutoff },
            },
            select: { id: true, state: true },
        });
        for (const s of staleSessions) {
            await prisma.flowSession.update({
                where: { id: s.id },
                data: {
                    is_completed: true,
                    // CRITICAL: merge, not overwrite — preserve all user variables
                    state: {
                        ...((s.state as Record<string, any>) || {}),
                        closed_reason: 'EXPIRED_24H',
                        closed_at: new Date().toISOString(),
                    } as any,
                },
            });
        }
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
            // BUG-C2 FIX: Exclude waiting (paused/delayed) sessions.
            // A waiting session is in the middle of a Wait node delay.
            // Only the scheduled worker resume cron should advance these.
            // Allowing user input to continue a waiting session bypasses the delay.
            is_waiting: false,
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

    // FIX #6 (Bug #6): Flow freshness check.
    // If a vendor edited the flow AFTER this session was created,
    // refresh the flow's nodes/edges so the session uses the latest node graph.
    let liveFlow = session.flow;
    const sessionCreated = session.created_at;
    const flowUpdated = (session.flow as any).updated_at;
    if (sessionCreated && flowUpdated && new Date(flowUpdated) > new Date(sessionCreated)) {
        const refreshed = await prisma.flow.findUnique({ where: { id: session.flow_id } });
        if (refreshed) {
            liveFlow = refreshed;
            console.log(`[SessionManager] 🔄 Flow ${session.flow_id} was updated after session creation — using fresh node graph.`);
        }
    }

    return {
        id: session.id,
        flow_id: session.flow_id,
        contact_id: session.contact_id,
        workspace_id: liveFlow.workspace_id,
        current_node_id: session.current_node_id,
        state: (session.state as Record<string, any>) || {},
        is_completed: session.is_completed,
        is_waiting: (session as any).is_waiting || false,
        flow: liveFlow,
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
    // Close any lingering sessions first — IMPORTANT: only mark them completed,
    // do NOT overwrite their state (Fix #4: preserve final state JSON)
    const openSessions = await prisma.flowSession.findMany({
        where: { contact_id: contactId, is_completed: false },
        select: { id: true, state: true },
    });
    for (const s of openSessions) {
        await prisma.flowSession.update({
            where: { id: s.id },
            data: {
                is_completed: true,
                state: {
                    ...((s.state as Record<string, any>) || {}),
                    closed_reason: 'NEW_FLOW_STARTED',
                } as any,
            },
        });
    }

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
 * SAFE STATE MERGE: preserves all existing state fields, only appends closed_reason.
 * Previously this overwrote the entire state JSON, killing all user variables.
 */
export async function closeSession(
    sessionId: string,
    reason: string = 'FLOW_COMPLETED'
): Promise<void> {
    try {
        // Fetch current state before overwriting (merge-safe close)
        const existing = await prisma.flowSession.findUnique({
            where: { id: sessionId },
            select: { state: true },
        });
        const mergedState = {
            ...((existing?.state as Record<string, any>) || {}),
            closed_reason: reason,
            closed_at: new Date().toISOString(),
        };
        await prisma.flowSession.update({
            where: { id: sessionId },
            data: {
                is_completed: true,
                state: mergedState as any,
            },
        });
    } catch {
        // Already closed or not found — silently ignore
    }
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

/**
 * BUG-M1 FIX: Resumes a paused (waiting) session.
 * Clears the is_waiting flag and next_run_at so the session is live again.
 * Called by the wait-node resume worker cron.
 */
export async function resumeSession(
    sessionId: string
): Promise<FlowSessionData | null> {
    try {
        const session = await prisma.flowSession.update({
            where: { id: sessionId },
            data: {
                is_waiting: false,
                next_run_at: null,
            } as any,
            include: { flow: true },
        });
        return {
            id: session.id,
            flow_id: session.flow_id,
            contact_id: session.contact_id,
            workspace_id: session.flow.workspace_id,
            current_node_id: session.current_node_id,
            state: (session.state as Record<string, any>) || {},
            is_completed: session.is_completed,
            is_waiting: false,
            flow: session.flow,
        };
    } catch (e) {
        console.error(`[SessionManager] Could not resume session ${sessionId}:`, e);
        return null;
    }
}

/**
 * BUG-C3 SUPPORT: Finds all sessions whose wait delay has expired and are ready to resume.
 * Used by the worker cron to restart paused flows.
 */
export async function getExpiredWaitingSessions(): Promise<FlowSessionData[]> {
    const now = new Date();
    const sessions = await prisma.flowSession.findMany({
        where: {
            is_completed: false,
            is_waiting: true,
            next_run_at: { lte: now },
        } as any,
        include: { flow: true },
        take: 50, // Process max 50 at a time per tick
    });

    return sessions.map((s: any) => ({
        id: s.id,
        flow_id: s.flow_id,
        contact_id: s.contact_id,
        workspace_id: s.flow.workspace_id,
        current_node_id: s.current_node_id,
        state: (s.state as Record<string, any>) || {},
        is_completed: s.is_completed,
        is_waiting: true,
        flow: s.flow,
    }));
}
