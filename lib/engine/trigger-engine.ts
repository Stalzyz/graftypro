/**
 * 🔥 TRIGGER ENGINE
 * Determines which flow (if any) to start for an incoming message.
 * 
 * Priority order (deterministic — stops at first match):
 * 1. EXACT keyword match (AutoResponder)
 * 2. STARTS_WITH keyword match (AutoResponder)
 * 3. CONTAINS keyword match (AutoResponder)
 * 4. Exact Flow trigger_keyword match (legacy flows)
 * 5. No match → null
 * 
 * CRITICAL RULES:
 * - Never triggers multiple flows
 * - Only triggers when NO active session exists
 * - Always scoped to workspace_id (multi-tenant safe)
 */

import { prisma } from '../db';
import { NormalizedMessage } from './message-normalizer';

export type TriggerResult =
    | { matched: true; type: 'TEXT_REPLY'; text: string }
    | { matched: true; type: 'FLOW'; flowId: string }
    | { matched: false };

/**
 * Checks whether the incoming message matches any configured trigger.
 * Returns the first matched trigger result.
 */
export async function findTrigger(
    workspaceId: string,
    msg: NormalizedMessage
): Promise<TriggerResult> {
    // Only text messages can trigger flows
    if (msg.type !== 'text') return { matched: false };

    const input = msg.value; // already lowercased by normalizer

    // ----------------------------------------------------------------
    // Step 1: Load all active AutoResponders for this workspace
    // ----------------------------------------------------------------
    const responders = await (prisma as any).autoResponder.findMany({
        where: { workspace_id: workspaceId, status: true },
        include: { flow: true },
        orderBy: { created_at: 'asc' },
    });

    // ----------------------------------------------------------------
    // Step 2: Priority matching — EXACT first, STARTS_WITH second, CONTAINS last
    // ----------------------------------------------------------------
    const priorities: Array<'EXACT' | 'STARTS_WITH' | 'CONTAINS'> = [
        'EXACT',
        'STARTS_WITH',
        'CONTAINS',
    ];

    for (const priority of priorities) {
        const match = responders.find((r: any) => {
            if (r.match_type !== priority) return false;
            const keyword = r.keyword.toLowerCase().trim();
            if (priority === 'EXACT') return input === keyword;
            if (priority === 'STARTS_WITH') return input.startsWith(keyword);
            if (priority === 'CONTAINS') return input.includes(keyword);
            return false;
        });

        if (match) {
            console.log(
                `[TriggerEngine] ✅ AutoResponder match [${priority}]: ` +
                `"${input}" → ${match.reply_type} (${match.id})`
            );

            if (match.reply_type === 'TEXT' && match.reply_text) {
                return { matched: true, type: 'TEXT_REPLY', text: match.reply_text };
            }

            if (match.reply_type === 'FLOW' && match.flow_id) {
                return { matched: true, type: 'FLOW', flowId: match.flow_id };
            }
        }
    }

    // ----------------------------------------------------------------
    // Step 3: Fallback — Legacy Flow trigger_keyword (EXACT only)
    // ----------------------------------------------------------------
    const legacyFlow = await prisma.flow.findFirst({
        where: {
            workspace_id: workspaceId,
            status: 'PUBLISHED',
            trigger_keyword: { equals: msg.value, mode: 'insensitive' },
        },
        select: { id: true, name: true, trigger_keyword: true },
    });

    if (legacyFlow) {
        console.log(
            `[TriggerEngine] ✅ Legacy flow keyword match: ` +
            `"${input}" → ${legacyFlow.name} (${legacyFlow.id})`
        );
        return { matched: true, type: 'FLOW', flowId: legacyFlow.id };
    }

    console.log(`[TriggerEngine] ❌ No trigger matched for: "${input}"`);
    return { matched: false };
}
