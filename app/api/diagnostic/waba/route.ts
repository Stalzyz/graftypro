
import { prisma } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { decrypt } from "../../../../lib/security/encryption";

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

        return NextResponse.json({
            waba: {
                id: waba.id,
                phone_number_id: waba.phone_number_id,
                phone_number: waba.phone_number,
                tokenLength: token?.length,
                wasEncrypted,
                decryptedLength: decryptedToken?.length,
                tokenStart: decryptedToken?.substring(0, 7),
                tokenEnd: decryptedToken?.substring(decryptedToken?.length - 7)
            },
            validation: result,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
