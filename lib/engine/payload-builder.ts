/**
 * 🔥 META PAYLOAD BUILDER + VALIDATOR
 * Builds validated WhatsApp Cloud API payloads.
 * 
 * Rules:
 * - NEVER sends a message without validation
 * - Enforces Meta constraints (text not empty, max buttons, etc.)
 * - Returns null on validation failure instead of throwing
 * - All validation errors are logged for debuggability
 */

import { getAbsoluteMediaUrl } from '../utils/url';

export type MetaPayloadType =
    | 'text'
    | 'image'
    | 'video'
    | 'document'
    | 'audio'
    | 'interactive_buttons'
    | 'interactive_list'
    | 'interactive_cta_url'
    | 'interactive_flow'
    | 'location'
    | 'location_request_message';

interface ValidationError {
    field: string;
    message: string;
}

function validate(errors: ValidationError[]): boolean {
    if (errors.length > 0) {
        console.error('[PayloadBuilder] ❌ Validation failed:');
        errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
        return false;
    }
    return true;
}

function sanitizeText(text: string | undefined | null, fallback: string = '...'): string {
    if (!text || text.trim() === '') return fallback;
    return text.trim().substring(0, 4096); // Meta max body text
}

function sanitizeButtonTitle(title: string): string {
    return title.trim().substring(0, 20); // Meta max button title = 20 chars
}

function resolveMediaUrl(raw: any): string | null {
    const url = raw?.mediaUrl || raw?.headerUrl || raw?.imageUrl || raw?.videoUrl || raw?.docUrl;
    if (!url) return null;
    return getAbsoluteMediaUrl(url);
}

// -----------------------------------------------------------------------
// TEXT
// -----------------------------------------------------------------------
export function buildTextPayload(to: string, text: string): any | null {
    const body = sanitizeText(text);
    const errors: ValidationError[] = [];

    if (!to) errors.push({ field: 'to', message: 'Phone number is required' });
    if (body === '...') errors.push({ field: 'text', message: 'Text body cannot be empty' });

    if (!validate(errors)) return null;

    return { to, type: 'text', text: { body } };
}

// -----------------------------------------------------------------------
// IMAGE / VIDEO / DOCUMENT / AUDIO
// -----------------------------------------------------------------------
export function buildMediaPayload(
    to: string,
    type: 'image' | 'video' | 'document' | 'audio',
    url: string,
    caption?: string,
    filename?: string,
    mediaId?: string  // Nuclear Fix: prefer Meta media_id over link
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone number required' });
    if (!url && !mediaId) errors.push({ field: 'url', message: `${type} URL or mediaId is required` });
    if (!validate(errors)) return null;

    const absUrl = getAbsoluteMediaUrl(url);
    const mediaRef = mediaId ? { id: mediaId } : { link: absUrl };

    if (type === 'document') {
        return {
            to,
            type: 'document',
            document: {
                ...mediaRef,
                filename: filename || caption || 'Document',
            },
        };
    }
    if (type === 'audio') {
        return { to, type: 'audio', audio: mediaRef };
    }
    return {
        to,
        type,
        [type]: { ...mediaRef, ...(caption ? { caption } : {}) },
    };
}

// -----------------------------------------------------------------------
// INTERACTIVE BUTTONS (Reply buttons, up to 3)
// -----------------------------------------------------------------------
export function buildInteractiveButtonsPayload(
    to: string,
    body: string,
    buttons: { id: string; title: string }[],
    header?: { type: 'image' | 'video' | 'document'; link: string } | { type: 'text'; text: string },
    footer?: string
): any | null {
    const errors: ValidationError[] = [];
    const bodyText = sanitizeText(body, 'Please choose an option:');

    if (!to) errors.push({ field: 'to', message: 'Phone number required' });
    if (buttons.length === 0) errors.push({ field: 'buttons', message: 'At least one button required' });
    if (buttons.length > 3) errors.push({ field: 'buttons', message: 'Max 3 reply buttons allowed' });

    const validButtons = buttons
        .filter(b => b.id && b.title)
        .slice(0, 3)
        .map(b => ({
            type: 'reply',
            reply: { id: b.id, title: sanitizeButtonTitle(b.title) },
        }));

    if (validButtons.length === 0) {
        errors.push({ field: 'buttons', message: 'No valid buttons (missing id or title)' });
    }

    if (!validate(errors)) return null;

    const payload: any = {
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: bodyText },
            action: { buttons: validButtons },
        },
    };

    if (header) {
        if (header.type === 'text') {
            payload.interactive.header = { type: 'text', text: sanitizeText((header as any).text, 'Info') };
        } else {
            payload.interactive.header = {
                type: header.type,
                [header.type]: { link: (header as any).link },
            };
        }
    }

    if (footer && footer.trim()) {
        payload.interactive.footer = { text: footer.trim().substring(0, 60) };
    }

    return payload;
}

// -----------------------------------------------------------------------
// INTERACTIVE LIST MENU
// -----------------------------------------------------------------------
export function buildInteractiveListPayload(
    to: string,
    body: string,
    buttonText: string,
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
    footer?: string
): any | null {
    const errors: ValidationError[] = [];
    const bodyText = sanitizeText(body, 'Please select an option:');
    const btnText = sanitizeText(buttonText, 'Open Menu').substring(0, 20);

    if (!to) errors.push({ field: 'to', message: 'Phone number required' });
    if (sections.length === 0) errors.push({ field: 'sections', message: 'At least one section required' });

    // Validate rows
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
    if (totalRows === 0) errors.push({ field: 'sections.rows', message: 'At least one row required' });
    if (totalRows > 10) errors.push({ field: 'sections.rows', message: 'Max 10 rows across all sections' });

    if (!validate(errors)) return null;

    const cleanSections = sections.map(s => ({
        title: s.title.trim().substring(0, 24) || 'Options',
        rows: s.rows
            .filter(r => r.id && r.title)
            .map(r => ({
                id: r.id,
                title: r.title.trim().substring(0, 24),
                description: (r.description || '').trim().substring(0, 72),
            })),
    }));

    const payload: any = {
        to,
        type: 'interactive',
        interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
                button: btnText,
                sections: cleanSections,
            },
        },
    };

    if (footer && footer.trim()) {
        payload.interactive.footer = { text: footer.trim().substring(0, 60) };
    }

    return payload;
}

// -----------------------------------------------------------------------
// CTA URL BUTTON
// -----------------------------------------------------------------------
export function buildCTAUrlPayload(
    to: string,
    body: string,
    button: { title: string; value: string },
    header?: { type: 'image' | 'video' | 'document'; link: string },
    footer?: string
): any | null {
    const errors: ValidationError[] = [];
    const bodyText = sanitizeText(body, 'Action required:');

    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!button.value) errors.push({ field: 'value', message: 'URL required' });
    if (!button.title) errors.push({ field: 'title', message: 'Button label required' });

    if (!validate(errors)) return null;

    const payload: any = {
        to,
        type: 'interactive',
        interactive: {
            type: 'cta_url',
            body: { text: bodyText },
            action: {
                name: 'cta_url',
                parameters: {
                    display_text: sanitizeButtonTitle(button.title),
                    url: button.value.startsWith('http') ? button.value : `https://${button.value}`
                },
            },
        },
    };

    if (header) {
        payload.interactive.header = {
            type: header.type,
            [header.type]: { link: header.link },
        };
    }

    if (footer && footer.trim()) {
        payload.interactive.footer = { text: footer.trim().substring(0, 60) };
    }

    return payload;
}

// -----------------------------------------------------------------------
// CLOUD TEMPLATE
// -----------------------------------------------------------------------
export function buildTemplatePayload(
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = []
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!templateName) errors.push({ field: 'templateName', message: 'Template Name is required' });
    if (!validate(errors)) return null;

    return {
        to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode
            },
            components: components.length > 0 ? components : undefined
        }
    };
}

// -----------------------------------------------------------------------
// PRODUCT LIST (Multi-Product Catalog)
// -----------------------------------------------------------------------
export function buildProductListPayload(
    to: string,
    catalogId: string,
    headerText: string,
    bodyText: string,
    footerText: string,
    sections: { title: string; product_retailer_ids: string[] }[]
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!catalogId) errors.push({ field: 'catalogId', message: 'Catalog ID required' });
    if (sections.length === 0) errors.push({ field: 'sections', message: 'At least one section required' });
    if (!validate(errors)) return null;

    return {
        to,
        type: 'interactive',
        interactive: {
            type: 'product_list',
            header: { type: 'text', text: sanitizeText(headerText, 'Catalog').substring(0, 60) },
            body: { text: sanitizeText(bodyText, 'Browse our products below:') },
            footer: { text: sanitizeText(footerText, '').substring(0, 60) },
            action: {
                catalog_id: catalogId,
                sections: sections.map(s => ({
                    title: s.title.substring(0, 24),
                    product_items: s.product_retailer_ids.map(id => ({ product_retailer_id: id }))
                }))
            }
        }
    };
}

// -----------------------------------------------------------------------
// META FLOW (Form)
// -----------------------------------------------------------------------
export function buildMetaFlowPayload(
    to: string,
    flowId: string,
    ctaText: string,
    header: string,
    body: string,
    footer: string,
    initialScreen: string = 'QUESTION_1',
    flowToken: string = `token_${Date.now()}`,
    headerType: 'text' | 'image' = 'text',
    headerUrl?: string,
    mediaId?: string
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!flowId) errors.push({ field: 'flowId', message: 'Meta Flow ID required' });
    if (!validate(errors)) return null;

    let interactiveHeader: any;
    if (headerType === 'image') {
        if (mediaId) {
            interactiveHeader = { type: 'image', image: { id: mediaId } };
        } else if (headerUrl) {
            interactiveHeader = { type: 'image', image: { link: headerUrl } };
        } else {
            interactiveHeader = { type: 'text', text: sanitizeText(header, 'Form') };
        }
    } else {
        interactiveHeader = { type: 'text', text: sanitizeText(header, 'Form') };
    }

    return {
        to,
        type: 'interactive',
        interactive: {
            type: 'flow',
            header: interactiveHeader,
            body: { text: sanitizeText(body, 'Please fill in the details below.') },
            footer: { text: sanitizeText(footer, '') },
            action: {
                name: 'flow',
                parameters: {
                    flow_message_version: '3',
                    flow_token: flowToken,
                    flow_id: flowId,
                    flow_cta: sanitizeText(ctaText, 'Open'),
                    flow_action: 'navigate',
                    flow_action_payload: { screen: initialScreen },
                },
            },
        },
    };
}

// -----------------------------------------------------------------------
// LOCATION (Static Pin)
// -----------------------------------------------------------------------
export function buildLocationPayload(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!latitude || !longitude) errors.push({ field: 'coordinates', message: 'Latitude and Longitude required' });
    if (!validate(errors)) return null;

    return {
        to,
        type: 'location',
        location: {
            latitude,
            longitude,
            name: name?.substring(0, 1000),
            address: address?.substring(0, 1000),
        },
    };
}

// -----------------------------------------------------------------------
// LOCATION REQUEST (Interactive)
// -----------------------------------------------------------------------
export function buildLocationRequestPayload(
    to: string,
    body: string
): any | null {
    const errors: ValidationError[] = [];
    if (!to) errors.push({ field: 'to', message: 'Phone required' });
    if (!validate(errors)) return null;

    return {
        to,
        type: 'interactive',
        interactive: {
            type: 'location_request_message',
            body: {
                text: sanitizeText(body, 'Please share your location to continue.').substring(0, 1024),
            },
            action: {
                name: 'send_location',
            },
        },
    };
}

// -----------------------------------------------------------------------
// SMART BUILDER — called by Flow Executor with raw node data
// Resolves the best payload type from a node's data automatically.
// -----------------------------------------------------------------------
export function buildNodePayload(
    to: string,
    nodeType: string,
    data: any
): { payloads: any[]; isInteractive: boolean } {
    const payloads: any[] = [];
    let isInteractive = false;
    console.log(`[PayloadBuilder v3.0] 🚀 Stealth Link Engine: Building payloads for ${to}`);

    // 1. Resolve Media & Basic Content
    const mediaUrl = data.mediaUrl || data.headerUrl || data.imageUrl || data.videoUrl;
    const absMediaUrl = mediaUrl ? getAbsoluteMediaUrl(mediaUrl) : null;
    let bodyText = sanitizeText(data.text || data.label, 'Please read carefully:');

    const contentType: string = data.contentType ||
        (mediaUrl?.match(/\.(jpg|jpeg|png|webp)/i) ? 'IMAGE' :
            mediaUrl?.match(/\.(mp4|mov|avi)/i) ? 'VIDEO' :
                mediaUrl?.match(/\.(pdf|doc|docx)/i) ? 'DOCUMENT' :
                    mediaUrl?.match(/\.(ogg|opus|mp3)/i) ? 'VOICE' : 'TEXT');

    // 2. Resolve Buttons & Decide Strategy (PRIORITY: Reply > CTA > List)
    // PRESERVE ORIGINAL ORDER for processing
    const allButtons: any[] = (data.buttons || []).filter((b: any) =>
        (b.type === 'reply' && b.id && b.title) ||
        (b.type === 'url' && b.value && b.title)
    );

    const replyButtons = allButtons.filter(b => b.type === 'reply');
    // Meta renders buttons in the order they are in the array.
    // We will preserve the original order created by the user in the Flow Builder.
    const orderedReplyButtons = [...replyButtons];

    const urlButtons = allButtons.filter(b => b.type === 'url');

    let primaryActionType: 'reply' | 'url' | 'list' | 'none' = 'none';

    // 3. Resolve Header
    let unifiedHeader: any = undefined;
    if (absMediaUrl && (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(contentType))) {
        unifiedHeader = { type: contentType.toLowerCase() as any, link: absMediaUrl };
    }

    // 4. Resolve Extra Buttons (The "Stealth Link" Core)
    // Rule: One native interactive allowed. URL Button always takes priority to keep link hidden.
    let extraText = "";
    let buttonsToText: any[] = [];

    if (urlButtons.length > 0) {
        // Option A: Primary is URL button. All replies become text.
        primaryActionType = 'url';
        buttonsToText = replyButtons;
    } else if (replyButtons.length > 0) {
        // Option B: No URL buttons. Up to 3 replies stay native.
        primaryActionType = 'reply';
        if (replyButtons.length > 3) {
            buttonsToText = replyButtons.slice(3);
        }
    } else if (nodeType === 'list') {
        primaryActionType = 'list';
        buttonsToText = allButtons;
    }

    // Build the "Numbered Reply" text for the body to keep it clickable via typing
    if (buttonsToText.length > 0) {
        extraText += "\n";
        buttonsToText.forEach((btn, idx) => {
            const num = idx + 1;
            extraText += `\n*${num}.* ${btn.title}`;
        });
    }

    if (extraText) bodyText += extraText;

    // 5. Build ONE SINGLE Payload
    try {
        let finalPayload: any = null;

        if (primaryActionType === 'list') {
            const rows = (data.items || [])
                .filter((i: any) => i.id && i.title)
                .map((i: any) => ({ id: i.id, title: i.title, description: i.description || '' }));
            if (rows.length > 0) {
                // If the user attached an image to a List node, Meta strictly FORBIDS it. 
                // We must send the image as a separate message first, then send the list!
                if (absMediaUrl || data._mediaId) {
                    const type = contentType === 'VIDEO' ? 'video' : contentType === 'DOCUMENT' ? 'document' : 'image';
                    const mediaPrePayload = buildMediaPayload(to, type as any, absMediaUrl || '', '', data.filename, data._mediaId);
                    if (mediaPrePayload) payloads.push(mediaPrePayload);
                }

                finalPayload = buildInteractiveListPayload(to, bodyText, data.buttonText || 'Open Menu', [{ title: data.sectionTitle || 'Options', rows }], data.footer);
                isInteractive = true;
            }
        } else if (primaryActionType === 'reply') {
            finalPayload = buildInteractiveButtonsPayload(to, bodyText, orderedReplyButtons.slice(0, 3).map((b: any) => ({ id: b.id, title: b.title })), unifiedHeader, data.footer);
            isInteractive = true;
        } else if (primaryActionType === 'url') {
            const targetBtn = urlButtons[0];
            finalPayload = buildCTAUrlPayload(to, bodyText, { title: targetBtn.title, value: targetBtn.value }, unifiedHeader, data.footer);
            isInteractive = true;
        } else if (nodeType === 'location') {
            if (data.locationType === 'REQUEST') {
                finalPayload = buildLocationRequestPayload(to, bodyText);
                isInteractive = true;
            } else {
                if (data.latitude && data.longitude) {
                    finalPayload = buildLocationPayload(to, parseFloat(data.latitude), parseFloat(data.longitude), data.name, data.address);
                } else {
                    finalPayload = buildTextPayload(to, `📍 *${data.name || 'Location'}*\n${data.address || ''}`);
                }
            }
        } else {
            // No interactives -> Media or Text
            if (absMediaUrl || data._mediaId) {
                const type = contentType === 'VIDEO' ? 'video' : contentType === 'DOCUMENT' ? 'document' : contentType === 'VOICE' ? 'audio' : 'image';
                finalPayload = buildMediaPayload(to, type as any, absMediaUrl || '', bodyText, data.filename, data._mediaId);
            } else {
                finalPayload = buildTextPayload(to, bodyText);
            }
        }

        if (finalPayload) payloads.push(finalPayload);

    } catch (err: any) {
        console.error(`[PayloadBuilder] Error during build: ${err.message}`);
    }

    if (payloads.length === 0) {
        const fallback = buildTextPayload(to, bodyText);
        if (fallback) payloads.push(fallback);
    }

    return { payloads, isInteractive };
}
