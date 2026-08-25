import { prisma } from '../lib/db';
import { BrandingService } from '../lib/branding/service';

async function checkBranding() {
    // Check global system config
    const config = await prisma.systemConfig.findUnique({
        where: { id: "global" }
    });
    console.log('--- SystemConfig in DB ---');
    console.log(config);

    // Check Resolved Branding for a normal user
    const res = await BrandingService.getBrandingForWorkspace('e8a77432-a550-4fbe-9687-4699c3fadb9b', 'localhost');
    console.log('\n--- Resolved Branding for Grekam Workspace ---');
    console.log(JSON.stringify(res, null, 2));
}

checkBranding()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
