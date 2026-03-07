/**
 * 🔥 MESSAGE NORMALIZER ENGINE
 * Converts any raw Meta Cloud API event into a deterministic NormalizedMessage.
 * All downstream engines work ONLY with NormalizedMessage — never raw payloads.
 */

export type MessageType =
    | 'text'
    | 'button'      // Quick-reply button (from template)
    | 'list'        // List menu selection
    | 'interactive' // Generic interactive (button_reply / list_reply)
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'order'
    | 'unknown';

export interface NormalizedMessage {
    /** Raw phone number e.g. "919876543210" */
    phone: string;
    /** Message type */
    type: MessageType;
    /** 
     * Canonical value used for trigger matching and flow routing.
     * - text: the message body (lowercased)
     * - button: the button payload
     * - list: "LIST_SELECT_ID:<item_id>"
     * - interactive button_reply: the button id
     */
    value: string;
    /** Original raw Meta message object for edge cases */
    raw: any;
    /** Meta message ID (wamid) */
    metaId: string;
    /** Timestamp from Meta */
    timestamp: Date;
    /** Phone number ID of the receiving WhatsApp channel */
    phoneNumberId: string;
    /** Contact display name from Meta payload */
    contactName: string | null;
}

/**
 * Normalizes a raw Meta Cloud API `value.messages[0]` object into a NormalizedMessage.
 */
export function normalizeMessage(
    rawMessage: any,
    metaValue: any
): NormalizedMessage {
    const phone = rawMessage.from;
    const metaId = rawMessage.id;
    const timestamp = rawMessage.timestamp
        ? new Date(parseInt(rawMessage.timestamp) * 1000)
        : new Date();
    const phoneNumberId = metaValue?.metadata?.phone_number_id || '';
    const contactName = metaValue?.contacts?.[0]?.profile?.name || null;

    let type: MessageType = 'unknown';
    let value = '';

    if (rawMessage.text) {
        type = 'text';
        value = rawMessage.text.body.trim().toLowerCase();
    } else if (rawMessage.interactive) {
        const interactive = rawMessage.interactive;
        if (interactive.type === 'list_reply') {
            type = 'list';
            value = `LIST_SELECT_ID:${interactive.list_reply.id}`;
        } else if (interactive.type === 'button_reply') {
            type = 'interactive';
            value = interactive.button_reply.id;
        } else if (interactive.type === 'nfm_reply') {
            type = 'interactive';
            value = interactive.nfm_reply.response_json || 'FLOW_SUBMITTED_SUCCESSFULLY';
        } else {
            type = 'interactive';
            value = JSON.stringify(interactive);
        }
    } else if (rawMessage.button) {
        // Quick reply from template
        type = 'button';
        value = rawMessage.button.payload || rawMessage.button.text;
    } else if (rawMessage.image) {
        type = 'image';
        value = rawMessage.image.id;
    } else if (rawMessage.video) {
        type = 'video';
        value = rawMessage.video.id;
    } else if (rawMessage.audio) {
        type = 'audio';
        value = rawMessage.audio.id;
    } else if (rawMessage.document) {
        type = 'document';
        value = rawMessage.document.id;
    } else if (rawMessage.order) {
        type = 'order';
        value = 'CART_SUBMITTED';
    } else {
        type = 'unknown';
        value = '';
    }

    return {
        phone,
        type,
        value,
        raw: rawMessage,
        metaId,
        timestamp,
        phoneNumberId,
        contactName,
    };
}
