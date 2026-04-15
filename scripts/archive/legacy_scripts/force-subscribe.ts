import { prisma } from '@/lib/db';
import { WhatsAppService } from '@/lib/whatsapp/service';
import { decrypt } from '@/lib/security/encryption';

/**
 * ⚛️ ATOMIC HANDSHAKE (Safe Raw SQL)
 * This script uses Raw SQL to bypass Prisma model validation errors.
 */
async function sync() {
    console.log("⚛️ Starting Atomic Raw Handshake...");

    try {
        // Surgically fetch only the columns we need via Raw SQL to avoid 'billing_model' errors
        const accounts: any[] = await prisma.$queryRaw`
            SELECT id, waba_id, access_token, workspace_id, display_name 
            FROM whatsapp_accounts
        `;
        
        console.log(`📡 Found ${accounts.length} accounts to process.`);

        for (const acc of accounts) {
            console.log(`🔗 Checking WABA: ${acc.waba_id} (${acc.display_name})...`);
            
            try {
                // 🛡️ Vault Safety: Catch junk/unencrypted tokens
                let token;
                try {
                    token = decrypt(acc.access_token);
                } catch (vaultErr) {
                    console.warn(`⚠️  [SKIP] ${acc.display_name}: Invalid or Unencrypted token found. Skipping.`);
                    continue;
                }

                const res = await WhatsAppService.subscribeToWebhooks(acc.waba_id, token);
                
                if (res.success) {
                    console.log(`✅ [SUCCESS] Meta is now streaming messages for ${acc.display_name}`);
                    console.log("Meta Response Data:", res.data);
                    
                    // Log the audit event so the diagnostic tool sees it (Safe variant)
                    try {
                        await (prisma.integrationAuditLog as any).create({
                            data: {
                                whatsapp_account_id: acc.id,
                                workspace_id: acc.workspace_id,
                                action: 'VALIDATION_PASSED',
                                details: {
                                    handshake: 'FORCE_SUBSCRIBE_V2',
                                    meta_response: res.data
                                }
                            }
                        });
                        console.log(`📝 [AUDIT] Logged success for ${acc.display_name}`);
                    } catch (auditErr: any) {
                        console.warn(`⚠️  [AUDIT_FAIL] Could not write log (Schema Mismatch?), but handshake SUCCESS.`);
                    }
                } else {
                    console.error(`❌ [FAILED] ${acc.display_name}:`, res.error);
                }
            } catch (err: any) {
                console.error(`🚨 [CRITICAL] Internal Error for ${acc.display_name}:`, err.message);
            }
        }
    } catch (dbErr: any) {
        console.error("❌ Database Fetch Failed:", dbErr.message);
    }

    console.log("🏁 Atomic Handshake finished.");
}

sync().catch(console.error);
