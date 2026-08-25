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
    // Only text/button/interactive messages can trigger flows
    if (!['text', 'button', 'interactive', 'list'].includes(msg.type)) return { matched: false };

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
    // Step 3: Fallback — Flow trigger_keyword (Flexible Matching)
    // Supports: Comma-separated keywords ("quote, ecommerce, price"), EXACT, STARTS_WITH, and CONTAINS
    // ----------------------------------------------------------------
    const activeFlows = await prisma.flow.findMany({
        where: {
            workspace_id: workspaceId,
            status: 'PUBLISHED',
        },
        select: { id: true, name: true, trigger_keyword: true },
    });

    for (const flow of activeFlows) {
        if (!flow.trigger_keyword) continue;

        // Split comma-separated keywords e.g. "get quote, ecommerce, price, shopify, atlas"
        const keywords = flow.trigger_keyword.split(',').map(k => k.toLowerCase().trim()).filter(Boolean);

        for (const kw of keywords) {
            // FIX: Removed `kw.includes(input)` — it caused reverse substring matches
            // where single-char inputs like "e" matched keywords like "ecommerce".
            // Correct priority order:
            // 1. EXACT: "join" matches keyword "join"
            // 2. STARTS_WITH: "join now" matches keyword "join"
            // 3. CONTAINS (input contains kw): "please join" matches keyword "join"
            //    BUT only if keyword is >= 3 chars to prevent single-char matches
            const isExact = input === kw;
            const isStartsWith = input.startsWith(kw + ' ') || input.startsWith(kw);
            const isContains = kw.length >= 3 && input.includes(kw);

            if (isExact || isStartsWith || isContains) {
                console.log(
                    `[TriggerEngine] ✅ Flow keyword match: ` +
                    `"${input}" matched "${kw}" → ${flow.name} (${flow.id})`
                );
                return { matched: true, type: 'FLOW', flowId: flow.id };
            }
        }
    }

    console.log(`[TriggerEngine] ❌ No trigger matched for: "${input}"`);
    return { matched: false };
}
