import { prisma } from '../lib/db';

async function checkAddons() {
    const addons = await prisma.workspaceAddon.findMany({
        include: { addon: true }
    });

    console.log(`🔌 Found ${addons.length} workspace addons in DB:`);
    addons.forEach((wa: any) => {
        console.log(`- ID: ${wa.id}, Workspace: ${wa.workspace_id}, Status: ${wa.status}`);
        console.log(`  Addon ID: ${wa.addon_id}, Addon Loaded:`, !!wa.addon);
        if (wa.addon) {
            console.log(`  Addon Name: ${wa.addon.name}`);
        } else {
            console.log(`  🚨 WARNING: addon relation is null!`);
        }
    });
}

checkAddons()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
