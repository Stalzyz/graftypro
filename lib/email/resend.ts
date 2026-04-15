import { Resend } from 'resend';

/**
 * 🛰️ Grafty Signal Hub: Resend Initialization
 * We use Resend for high-performance marketing broadcasts to ensure
 * maximum deliverability and real-time engagement tracking.
 */

if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ [RE-SEND] MISSING API KEY: Bulk email features will be disabled.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
