
import { prisma } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { decrypt } from "../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const waba = await (prisma as any).whatsAppAccount.findFirst();
        if (!waba) return NextResponse.json({ error: "No WABA found" });

        const token = waba.access_token;
        let decryptedToken = token;
        let wasEncrypted = false;

        if (token && token.includes(":")) {
            try {
                decryptedToken = decrypt(token);
                wasEncrypted = true;
            } catch (e: any) {
                console.warn("Decryption attempt failed for token:", e.message);
            }
        }

        const result = await WhatsAppService.validateCredentials(waba.phone_number_id, decryptedToken);

        // Fetch list of available WABAs to help debugging
        let availableWabas: any[] = [];
        try {
            const res = await axios.get(`https://graph.facebook.com/v20.0/me`, {
                params: {
                    access_token: decryptedToken,
                    fields: "id,name,businesses{id,name,owned_whatsapp_business_accounts{id,name,currency}}"
                }
            });
            const businesses = res.data.businesses?.data || [];
            businesses.forEach((biz: any) => {
                if (biz.owned_whatsapp_business_accounts?.data) {
                    biz.owned_whatsapp_business_accounts.data.forEach((acc: any) => {
                        availableWabas.push({
                            id: acc.id,
                            name: acc.name,
                            businessName: biz.name
                        });
                    });
                }
            });
        } catch (e: any) {
            console.warn("Failed to fetch WABA list during diagnostic:", e.message);
        }

        return NextResponse.json({
            waba: {
                id: waba.id,
                waba_id: waba.waba_id,
                phone_number_id: waba.phone_number_id,
                phone_number: waba.phone_number,
                tokenLength: token?.length,
                wasEncrypted,
                decryptedLength: decryptedToken?.length,
            },
            availableWabas,
            validation: result,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
