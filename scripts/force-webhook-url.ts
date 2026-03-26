import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

/**
 * 🚀 NUCLEAR WEBHOOK OVERRIDE (PORTAL BYPASS)
 * Fetches App Credentials directly from the database (decrypting them on the fly)
 * and overrides the Meta Graph API webhook subscription.
 * 
 * Run with: npx tsx scripts/force-webhook-url.ts
 */

const prisma = new PrismaClient();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const ALGORITHM = "aes-256-gcm";

// Minimal decryption function
function decrypt(cipherText: string): string {
    if (!cipherText || cipherText === "SYSTEM") return "SYSTEM";
    if (!ENCRYPTION_KEY) throw new Error("Missing ENCRYPTION_KEY in .env");

    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const [ivHex, tagHex, encryptedData] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

async function updateMetaWebhooks() {
    console.log("🚀 Starting DB-Powered Nuclear Webhook Override...");

    const accounts = await prisma.whatsAppAccount.findMany({
        where: { status: "CONNECTED", app_id: { not: "SYSTEM" } }
    });

    if (accounts.length === 0) {
        console.log("⚠️ No active DIRECT-billed WhatsApp accounts found. Nothing to override.");
        return;
    }

    const callbackUrl = "https://grafty.pro/api/whatsapp/webhook";
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "grafty_secure_token";

    console.log(`📡 Target Webhook: ${callbackUrl}`);
    console.log(`🔑 Verify Token:  ${verifyToken}`);

    for (const account of accounts) {
        if (!account.app_id || !account.app_secret) continue;

        console.log(`\n🌐 Processing Account: ${account.display_name} (App: ${account.app_id})`);

        try {
            const rawSecret = decrypt(account.app_secret);
            const appToken = `${account.app_id}|${rawSecret}`;
            const graphApiUrl = `https://graph.facebook.com/v20.0/${account.app_id}/subscriptions`;

            console.log(`   🔄 Sending override payload to Meta Graph API...`);
            
            const response = await axios.post(graphApiUrl, {
                object: "whatsapp_business_account",
                callback_url: callbackUrl,
                verify_token: verifyToken,
                fields: "messages,message_template_status_update,message_template_quality_update,account_review_update,account_alerts,business_capability_update,security,template_category_update"
            }, {
                headers: { Authorization: `Bearer ${appToken}` }
            });

            if (response.data && response.data.success) {
                console.log(`   ✅ [SUCCESS] Webhook Override Applied!`);
            } else {
                console.log(`   ⚠️ [WARNING] Unexpected Response:`, response.data);
            }
        } catch (error: any) {
            console.error(`   ❌ [ERROR] Meta rejected the override.`);
            console.error(`      Reason:`, error.response?.data?.error?.message || error.message);
        }
    }

    await prisma.$disconnect();
    console.log("\n✅ Webhook Sweep Complete!");
}

updateMetaWebhooks().catch(e => {
    console.error("Fatal Error:", e);
    process.exit(1);
});

