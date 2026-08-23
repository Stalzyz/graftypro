import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 📸 INSTAGRAM MESSENGER WEBHOOK
 * Handles Meta Instagram Messaging Webhook Verification & Events.
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
        console.log('[InstagramWebhook] Event Received:', JSON.stringify(body).substring(0, 300));

        if (body.object === 'instagram') {
            for (const entry of body.entry || []) {
                const igId = entry.id;

                for (const messagingEvent of entry.messaging || []) {
                    const senderId = messagingEvent.sender?.id;
                    const message = messagingEvent.message;

                    if (senderId && message) {
                        console.log(`[InstagramWebhook] Inbound DM from ${senderId}: ${message.text || '[Media]'}`);

                        // Execute Flow Engine matching trigger keywords if text exists
                        if (message.text) {
                            // Find flow matching keyword or active workspace
                            console.log(`[InstagramWebhook] Triggering flow engine for text: "${message.text}"`);
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
