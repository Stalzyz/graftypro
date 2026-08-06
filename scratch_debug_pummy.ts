import { PrismaClient } from '@prisma/client';
import { decrypt } from './lib/security/encryption';

const prisma = new PrismaClient();

async function run() {
    const workspaceId = '41979a04-0f78-4236-9f1f-2687d44c4501';
    const account = await prisma.whatsAppAccount.findFirst({
        where: { workspace_id: workspaceId }
    });

    if (!account) {
        console.error("Account not found in database for workspace:", workspaceId);
        return;
    }

    const token = decrypt(account.access_token);
    const appSecret = account.app_secret ? decrypt(account.app_secret) : null;
    
    console.log("=== STRING INTEGRITY TEST ===");
    console.log("DB App ID:", account.app_id);
    
    console.log("DB App Secret:", appSecret);
    console.log("DB App Secret length:", appSecret?.length);
    if (appSecret) {
        console.log("DB App Secret charCodes:", Array.from(appSecret).map(c => c.charCodeAt(0)));
    }

    console.log("Access Token length:", token?.length);
    if (token) {
        console.log("Access Token first 10 chars:", token.substring(0, 10));
        console.log("Access Token first 10 charCodes:", Array.from(token.substring(0, 10)).map(c => c.charCodeAt(0)));
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
