import { BrandingService } from "../lib/branding/service";
import { prisma } from "../lib/db";

async function testBranding() {
    console.log("Testing Branding Resolution...");

    try {
        // 1. Test System Defaults
        console.log("\n1. Testing System Defaults...");
        const systemFallback = await BrandingService.getBrandingForWorkspace();
        console.log("Global Fallback Branding:", systemFallback.brand_name);

        const domainBranding = await BrandingService.getBrandingByDomain("non-existent-domain.com");
        console.log("Domain Fallback Result:", domainBranding === null ? "Correct (null)" : "Error");

        // 2. Test Reseller Branding (if exists)
        const reseller = await prisma.reseller.findFirst();
        if (reseller) {
            console.log(`\n2. Testing Branding for Reseller: ${reseller.name} (${reseller.id})`);

            // Map a dummy workspace to this reseller for testing
            let workspace = await prisma.workspace.findFirst();
            if (!workspace) {
                console.log("Creating test workspace...");
                workspace = await prisma.workspace.create({
                    data: {
                        name: "Test Workspace",
                        reseller_id: reseller.id
                    }
                });
            } else {
                console.log(`Using Existing Workspace: ${workspace.name} (${workspace.id})`);
                await prisma.workspace.update({
                    where: { id: workspace.id },
                    data: { reseller_id: reseller.id }
                });
            }

            const branding = await BrandingService.getBrandingForWorkspace(workspace.id);
            console.log("Resolved Branding Name:", branding.brand_name);
            console.log("Branding Details:", JSON.stringify(branding, null, 2));
        } else {
            console.log("No reseller found to test branding resolution.");
        }

    } catch (e: any) {
        console.error("Branding test failed:", e.message);
        if (e.stack) console.error(e.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testBranding();
