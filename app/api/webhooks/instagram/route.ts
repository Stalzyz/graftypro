import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { InstagramService } from '@/lib/instagram/service';

/**
 * 📸 INSTAGRAM MESSENGER WEBHOOK
 * Real-time processing for Meta Instagram Direct Messages, Story Mentions, and Reel Comments.
 */

// GET: Meta Webhook Verification
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'grafty_webhook_verify';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[InstagramWebhook] Verification Successful');
        return new NextResponse(challenge, { status: 200 });
    }

    console.warn('[InstagramWebhook] Verification Failed - Invalid Token');
    return new NextResponse('Forbidden', { status: 403 });
}

// POST: Real-Time Inbound Instagram DM & Comment Events
export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[InstagramWebhook] Event Received:', JSON.stringify(body).substring(0, 400));

        if (body.object === 'instagram' || body.object === 'page') {
            for (const entry of body.entry || []) {
                const igPageId = entry.id;

                for (const messagingEvent of entry.messaging || []) {
                    const senderId = messagingEvent.sender?.id;
                    const message = messagingEvent.message;

                    if (senderId && message && message.text) {
                        const incomingText = message.text.toLowerCase().trim();
                        console.log(`[InstagramWebhook] Inbound message from ${senderId}: "${incomingText}"`);

                        // 1. Fetch integration credentials for this IG Page ID or fallback workspace
                        let integration = await (prisma as any).integration.findFirst({
                            where: {
                                type: 'INSTAGRAM',
                                is_active: true
                            }
                        });

                        let accessToken = integration?.credentials?.access_token;
                        let pageId = integration?.credentials?.page_id || igPageId;

                        // Fallback: Check Workspace Settings JSON
                        if (!accessToken) {
                            const workspaces = await prisma.workspace.findMany();
                            for (const ws of workspaces) {
                                const igCreds = (ws.settings as any)?.integrations?.INSTAGRAM?.credentials;
                                if (igCreds?.access_token) {
                                    accessToken = igCreds.access_token;
                                    pageId = igCreds.page_id || igPageId;
                                    break;
                                }
                            }
                        }

                        if (!accessToken) {
                            console.warn(`[InstagramWebhook] No Meta Access Token configured for Page ID ${igPageId}. DM skipped.`);
                            continue;
                        }

                        // 2. Trigger Flow Matching
                        const isQuoteOrEcommerce = /quote|ecommerce|price|shopify|atlas|package|info|hi|hello|get quote/i.test(incomingText);

                        if (isQuoteOrEcommerce) {
                            const responseText = `👋 Hello from Grekam Academy!

Here are our official E-Commerce & Web Development packages:

🛒 1. Shopify Standard Solution
• Price: ₹25,000
• Complete online store setup with payment gateway & WhatsApp order alerts.

🛍️ 2. Custom E-Commerce Platform
• Price: ₹45,000
• Full custom branding, inventory manager, GST invoicing & abandoned cart recovery.

⚡ 3. Atlas Enterprise Web Development
• Starting at: ₹75,000
• Custom high-performance web app with full admin control.
🌐 Live Demo: https://atlasadmin.grekam.in/login

📞 Have questions? Call our executive directly at +91 9789359407!`;

                            await InstagramService.sendDirectMessage(
                                pageId,
                                accessToken,
                                senderId,
                                responseText,
                                [
                                    { title: 'Shopify ₹25k', payload: 'SHOPIFY' },
                                    { title: 'E-Commerce ₹45k', payload: 'ECOMMERCE' },
                                    { title: 'Atlas Demo', payload: 'ATLAS' }
                                ]
                            );
                        } else {
                            // Default help message
                            const defaultReply = `Thanks for reaching out to Grekam Academy! Reply "Get Quote" or "Ecommerce" to view package details and live demos, or call us at +91 9789359407.`;
                            await InstagramService.sendDirectMessage(
                                pageId,
                                accessToken,
                                senderId,
                                defaultReply
                            );
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: 'EVENT_RECEIVED' });
    } catch (error: any) {
        console.error('[InstagramWebhook] Error:', error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
