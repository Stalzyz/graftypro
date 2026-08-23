import axios from 'axios';

const META_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class InstagramService {
    /**
     * Send Instagram Direct Message via Meta Graph API with automatic endpoint and payload retries
     */
    static async sendDirectMessage(
        pageId: string,
        accessToken: string,
        recipientId: string,
        text: string,
        quickReplies?: { title: string; payload: string }[]
    ) {
        console.log(`[InstagramService] Preparing DM for recipient ${recipientId} (Page ID: ${pageId})...`);

        // Clean token if Bearer prefix present
        const cleanToken = accessToken.replace(/^Bearer\s+/i, '').trim();

        const sendRequest = async (targetId: string, payloadMessage: any) => {
            return axios.post(
                `${BASE_URL}/${targetId}/messages`,
                {
                    recipient: { id: recipientId },
                    message: payloadMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        };

        const messagePayload: any = { text };

        if (quickReplies && quickReplies.length > 0) {
            messagePayload.quick_replies = quickReplies.map(qr => ({
                content_type: 'text',
                title: qr.title.substring(0, 20),
                payload: qr.payload
            }));
        }

        // Attempt 1: Try Page ID endpoint with quick replies
        try {
            const res = await sendRequest(pageId || 'me', messagePayload);
            console.log(`[InstagramService] DM sent successfully (Attempt 1). Message ID:`, res.data?.message_id);
            return res.data;
        } catch (err1: any) {
            console.warn(`[InstagramService] Attempt 1 failed (${err1.response?.data?.error?.message || err1.message}). Retrying with 'me' endpoint...`);
        }

        // Attempt 2: Try 'me' endpoint with quick replies
        try {
            const res = await sendRequest('me', messagePayload);
            console.log(`[InstagramService] DM sent successfully via 'me' (Attempt 2). Message ID:`, res.data?.message_id);
            return res.data;
        } catch (err2: any) {
            console.warn(`[InstagramService] Attempt 2 failed. Retrying with plain text...`);
        }

        // Attempt 3: Fallback to plain text message
        try {
            const res = await sendRequest('me', { text });
            console.log(`[InstagramService] Plain text DM sent successfully (Attempt 3). Message ID:`, res.data?.message_id);
            return res.data;
        } catch (err3: any) {
            console.error(`[InstagramService] All DM send attempts failed:`, err3.response?.data || err3.message);
            throw new Error(err3.response?.data?.error?.message || err3.message);
        }
    }
}
