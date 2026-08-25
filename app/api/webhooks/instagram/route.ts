import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { InstagramService } from '@/lib/instagram/service';

/**
 * 📸 INSTAGRAM MESSENGER WEBHOOK v2.0
 * Handles Meta Instagram Messaging Webhook Verification & Real-time DM/Comment Events.
 *
 * FLOW: Instagram DM → Match igPageId to Workspace → Find PUBLISHED Flow via Trigger Engine → Reply
 */

// GET: Meta Webhook Verification
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'grafty_webhook_verify';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[InstagramWebhook] ✅ Verification Successful');
        return new NextResponse(challenge, { status: 200 });
    }

    console.warn('[InstagramWebhook] ❌ Verification Failed - Invalid Token');
    return new NextResponse('Forbidden', { status: 403 });
}

// POST: Real-Time Inbound Instagram DM & Comment Events
export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[InstagramWebhook] Event Received:', JSON.stringify(body).substring(0, 500));

        if (body.object === 'instagram' || body.object === 'page') {
            for (const entry of body.entry || []) {
                const igPageId = entry.id;

                // ----------------------------------------------------
                // 1. Process Direct Messages & Postbacks
                // ----------------------------------------------------
                for (const messagingEvent of entry.messaging || []) {
                    // Skip echo messages sent by the page/account itself
                    if (messagingEvent.message?.is_echo) {
                        console.log('[InstagramWebhook] Ignoring outbound echo message');
                        continue;
                    }

                    const senderId = messagingEvent.sender?.id;
                    if (!senderId || senderId === igPageId) continue;

                    let incomingText = '';
                    if (messagingEvent.message?.text) {
                        incomingText = messagingEvent.message.text.trim();
                    } else if (messagingEvent.postback?.payload) {
                        incomingText = messagingEvent.postback.payload.trim();
                    } else if (messagingEvent.postback?.title) {
                        incomingText = messagingEvent.postback.title.trim();
                    }

                    if (incomingText) {
                        console.log(`[InstagramWebhook] Inbound DM from ${senderId}: "${incomingText}"`);
                        await handleIncomingInstagramMessage(igPageId, senderId, incomingText);
                    }
                }

                // ----------------------------------------------------
                // 2. Process Reel & Post Comments (Feed Changes)
                // ----------------------------------------------------
                for (const change of entry.changes || []) {
                    if (change.field === 'comments' && change.value) {
                        const commentValue = change.value;
                        const senderId = commentValue.from?.id;
                        const commentText = commentValue.text?.trim();

                        if (senderId && commentText && senderId !== igPageId) {
                            console.log(`[InstagramWebhook] Inbound Reel Comment from ${senderId}: "${commentText}"`);
                            await handleIncomingInstagramMessage(igPageId, senderId, commentText);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: 'EVENT_RECEIVED' });
    } catch (error: any) {
        console.error('[InstagramWebhook] Webhook Error:', error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

/**
 * Core handler: Resolves workspace by igPageId, finds matching flow via trigger keywords,
 * and replies using InstagramService.
 */
async function handleIncomingInstagramMessage(igPageId: string, senderId: string, incomingText: string) {
    try {
        // ----------------------------------------------------------------
        // STEP 1: Find workspace & credentials by Instagram Page ID
        // Try Integration table first (scoped by page_id), then workspace settings fallback.
        // ----------------------------------------------------------------
        let accessToken: string | null = null;
        let workspaceId: string | null = null;
        let resolvedPageId = igPageId;

        // Strategy A: Integration table — find by page_id in credentials JSON
        const allIntegrations = await (prisma as any).integration.findMany({
            where: { type: 'INSTAGRAM', is_active: true },
        });

        for (const integration of allIntegrations) {
            const creds = integration.credentials as any;
            if (
                creds?.page_id === igPageId ||
                creds?.instagram_page_id === igPageId ||
                // Fallback: if only one integration exists, use it
                allIntegrations.length === 1
            ) {
                accessToken = creds?.access_token;
                workspaceId = integration.workspace_id;
                resolvedPageId = creds?.page_id || igPageId;
                break;
            }
        }

        // Strategy B: Workspace settings JSON fallback
        if (!accessToken) {
            const workspaces = await prisma.workspace.findMany();
            for (const ws of workspaces) {
                const igCreds = (ws.settings as any)?.integrations?.INSTAGRAM?.credentials;
                if (
                    igCreds?.access_token &&
                    (igCreds?.page_id === igPageId || !igCreds?.page_id)
                ) {
                    accessToken = igCreds.access_token;
                    workspaceId = ws.id;
                    resolvedPageId = igCreds.page_id || igPageId;
                    break;
                }
            }
        }

        if (!accessToken || !workspaceId) {
            console.warn(
                `[InstagramWebhook] ❌ No Instagram credentials found for Page ID "${igPageId}". ` +
                `Make sure you connected your Instagram account in Settings → Integrations.`
            );
            return;
        }

        console.log(`[InstagramWebhook] ✅ Resolved workspace: ${workspaceId} for page: ${resolvedPageId}`);

        // ----------------------------------------------------------------
        // STEP 1.5: Exchange User Access Token for Page Access Token dynamically
        // Instagram Messaging API requires sending to POST /PAGE_ID/messages with a Page Access Token.
        // ----------------------------------------------------------------
        let finalPageAccessToken = accessToken;
        let finalFacebookPageId = resolvedPageId;

        console.log(`[InstagramWebhook] 🔑 Resolved access token starts with: ${accessToken ? accessToken.substring(0, 15) : 'null'}`);

        try {
            console.log(`[InstagramWebhook] 🔑 Exchanging token for Instagram Account ID: ${igPageId}...`);
            const accountsRes = await fetch(
                `https://graph.facebook.com/v21.0/me/accounts?fields=access_token,instagram_business_account&access_token=${accessToken}`
            );
            if (accountsRes.ok) {
                const accountsData = await accountsRes.json();
                console.log(`[InstagramWebhook] 🔑 Meta Accounts Response:`, JSON.stringify(accountsData, null, 2));
                const matchingPage = accountsData.data?.find(
                    (p: any) => p.instagram_business_account?.id === igPageId
                );
                if (matchingPage) {
                    finalPageAccessToken = matchingPage.access_token;
                    finalFacebookPageId = matchingPage.id;
                    console.log(
                        `[InstagramWebhook] 🔑 Successfully resolved Facebook Page ID: ${finalFacebookPageId} and Page Access Token for Instagram Account: ${igPageId}`
                    );
                } else {
                    console.warn(
                        `[InstagramWebhook] ⚠️ Instagram Account ID "${igPageId}" was not found in linked accounts of this token. Using credentials as-is.`
                    );
                }
            } else {
                const errData = await accountsRes.json().catch(() => ({}));
                console.error(`[InstagramWebhook] ❌ Failed to fetch accounts from Meta:`, JSON.stringify(errData));
            }
        } catch (tokenErr: any) {
            console.error(`[InstagramWebhook] ❌ Error resolving Page Access Token:`, tokenErr.message);
        }

        // ----------------------------------------------------------------
        // STEP 2: Match trigger keyword against PUBLISHED flows in this workspace
        // Uses the same flexible matching logic as trigger-engine.ts:
        //   - Exact match
        //   - StartsWith match
        //   - Contains match (any comma-separated keyword)
        // ----------------------------------------------------------------
        const textLower = incomingText.toLowerCase().trim();

        const publishedFlows = await prisma.flow.findMany({
            where: { workspace_id: workspaceId, status: 'PUBLISHED' },
            select: { id: true, name: true, trigger_keyword: true, nodes: true },
        });

        let matchedFlow: { id: string; name: string; trigger_keyword: string | null; nodes: any } | null = null;

        for (const flow of publishedFlows) {
            if (!flow.trigger_keyword) continue;

            // Support comma-separated keywords: "hi, hello, ecommerce, quote"
            const keywords = flow.trigger_keyword
                .split(',')
                .map((k) => k.toLowerCase().trim())
                .filter(Boolean);

            for (const kw of keywords) {
                if (textLower === kw || textLower.startsWith(kw) || textLower.includes(kw) || kw.includes(textLower)) {
                    matchedFlow = flow;
                    console.log(
                        `[InstagramWebhook] 🎯 Flow matched: "${kw}" → ${flow.name} (${flow.id})`
                    );
                    break;
                }
            }

            if (matchedFlow) break;
        }

        // ----------------------------------------------------------------
        // STEP 3: Execute — either send flow's first message or a default reply
        // ----------------------------------------------------------------
        if (matchedFlow) {
            // Extract the first message node content from the flow
            const nodes: any[] = Array.isArray(matchedFlow.nodes) ? matchedFlow.nodes : [];
            const firstMessageNode = nodes.find(
                (n: any) => n.type === 'message' || n.type === 'list'
            );
            const replyText =
                firstMessageNode?.data?.text ||
                `✅ Flow "${matchedFlow.name}" started! We'll guide you through the next steps.`;

            // Extract quick replies (buttons) from the first message node
            const rawButtons = firstMessageNode?.data?.buttons || [];
            const quickReplies = rawButtons.map((b: any) => ({
                title: b.title || b.text || '',
                payload: b.id || b.payload || ''
            })).filter((b: any) => b.title);

            // IMPORTANT: Use finalFacebookPageId (resolved from Meta) and finalPageAccessToken.
            await InstagramService.sendDirectMessage(
                finalFacebookPageId,
                finalPageAccessToken,
                senderId,
                replyText,
                quickReplies.length > 0 ? quickReplies : undefined
            );

            console.log(`[InstagramWebhook] ✅ Replied using flow "${matchedFlow.name}" with ${quickReplies.length} buttons`);
        } else {
            // No flow matched — send a generic fallback
            const autoResponders = await (prisma as any).autoResponder.findMany({
                where: { workspace_id: workspaceId, status: true },
            });

            let fallbackText: string | null = null;
            for (const ar of autoResponders) {
                const kw = ar.keyword?.toLowerCase().trim();
                if (!kw) continue;
                if (
                    textLower === kw ||
                    textLower.startsWith(kw) ||
                    textLower.includes(kw)
                ) {
                    if (ar.reply_type === 'TEXT' && ar.reply_text) {
                        fallbackText = ar.reply_text;
                    }
                    break;
                }
            }

            if (fallbackText) {
                await InstagramService.sendDirectMessage(
                    finalFacebookPageId,
                    finalPageAccessToken,
                    senderId,
                    fallbackText
                );
                console.log(`[InstagramWebhook] ✅ AutoResponder reply sent`);
            } else {
                // Generic default — get workspace name
                const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
                const wsName = workspace?.name || 'us';
                const defaultReply = `👋 Hi! Thanks for reaching out to ${wsName}. Reply with a keyword to explore our services, or we'll get back to you shortly!`;
                await InstagramService.sendDirectMessage(
                    finalFacebookPageId,
                    finalPageAccessToken,
                    senderId,
                    defaultReply
                );
                console.log(`[InstagramWebhook] 💬 Generic default reply sent (no trigger matched for: "${incomingText}")`);
            }
        }
    } catch (err: any) {
        console.error(`[InstagramWebhook] ❌ Failed to process message from ${senderId}:`, err.message);
    }
}
