import { PrismaClient } from '@prisma/client';
import { decrypt } from './lib/security/encryption';

const prisma = new PrismaClient();

async function main() {
    const config = await prisma.systemConfig.findUnique({
        where: { id: 'global' },
    });

    if (!config) {
        console.log('No global system config found.');
        return;
    }

    console.log('--- Super Admin Meta Architecture Credentials ---');
    console.log('Meta App ID:', config.meta_app_id || 'Not Set');
    console.log('Meta App Secret (Enc):', config.meta_app_secret_enc ? '******' : 'Not Set');
    console.log('Meta Business ID:', config.meta_business_id || 'Not Set');
    console.log('Primary WABA ID:', config.meta_waba_id || 'Not Set');
    console.log('Permanent Token (Enc):', config.meta_permanent_token_enc ? '******' : 'Not Set');
    console.log('Meta Phone ID:', config.meta_phone_id || 'Not Set');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
