import { prisma } from '../lib/db';
import { SystemConfigService } from '../lib/services/system-config-service';

async function checkSmtpConfig() {
    const config = await SystemConfigService.getConfig();
    const secrets = await SystemConfigService.getDecryptedSecrets();

    console.log('--- System SMTP Configuration ---');
    console.log('smtp_host:', config.smtp_host);
    console.log('smtp_port:', config.smtp_port);
    console.log('smtp_user:', config.smtp_user);
    console.log('smtp_from_email:', config.smtp_from_email);
    console.log('smtp_from_name:', config.smtp_from_name);
    console.log('smtp_encryption:', config.smtp_encryption);
    console.log('Has smtp_pass:', !!secrets.smtp_pass);

    // Also look at Resellers
    const resellers = await prisma.reseller.findMany();
    console.log(`\n--- Resellers SMTP Configurations (${resellers.length} total) ---`);
    resellers.forEach((r: any) => {
        console.log(`- Reseller: ${r.brand_name} (${r.id})`);
        console.log(`  SMTP Config:`, JSON.stringify(r.smtp_config, null, 2));
    });
}

checkSmtpConfig()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
