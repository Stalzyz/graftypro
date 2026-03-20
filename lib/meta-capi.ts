import crypto from 'crypto';

/**
 * Meta Conversions API (CAPI) Service for Grafty
 * Allows server-side event tracking for optimal ad attribution.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1428144328790099';
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;
const API_VERSION = 'v19.0';

interface UserData {
  em?: string; // email (hashed)
  ph?: string; // phone (hashed)
  fbc?: string; // click id
  fbp?: string; // browser id
  client_ip_address?: string;
  client_user_agent?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
}

/**
 * Hash data using SHA-256 for Meta compliance
 */
export function hashData(data: string | undefined): string | null {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Send a server-side event to Meta CAPI
 */
export async function sendMetaEvent(
  eventName: string,
  userData: UserData,
  customData: CustomData = {},
  sourceUrl: string = 'https://grafty.pro'
) {
  if (!ACCESS_TOKEN) {
    console.warn('[Meta CAPI] Skipping event: FB_CAPI_ACCESS_TOKEN not set');
    return;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: sourceUrl,
        user_data: {
          ...userData,
        },
        custom_data: {
          ...customData,
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (result.error) {
       console.error('[Meta CAPI] Error:', result.error);
    } else {
       console.log(`[Meta CAPI] Success: ${eventName} tracked`);
    }
    return result;
  } catch (error) {
    console.error('[Meta CAPI] Network Error:', error);
  }
}
