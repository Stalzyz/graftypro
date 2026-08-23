import axios from 'axios';

const META_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class InstagramService {
    /**
     * Send Instagram Direct Message via Meta Graph API
     */
    static async sendDirectMessage(
        pageId: string,
        accessToken: string,
        recipientId: string,
        text: string,
        quickReplies?: { title: string; payload: string }[]
    ) {
        try {
            console.log(`[InstagramService] Sending DM to ${recipientId} via Page ${pageId}...`);

            const messagePayload: any = { text };

            if (quickReplies && quickReplies.length > 0) {
                messagePayload.quick_replies = quickReplies.map(qr => ({
                    content_type: 'text',
                    title: qr.title.substring(0, 20),
                    payload: qr.payload
                }));
            }

            const response = await axios.post(
                `${BASE_URL}/${pageId}/messages`,
                {
                    recipient: { id: recipientId },
                    message: messagePayload
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`[InstagramService] DM sent successfully. Message ID:`, response.data?.message_id);
            return response.data;
        } catch (error: any) {
            console.error(`[InstagramService] Error sending IG DM:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || error.message);
        }
    }
}
