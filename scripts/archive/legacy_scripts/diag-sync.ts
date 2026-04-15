import { prisma } from "../lib/db";

async function deepDive() {
    console.log("--- DEEP DIVE DIAGNOSTIC ---");
    try {
        const demoEmail = "demo@grafty.com";
        const user = await prisma.user.findFirst({
            where: { email: demoEmail }
        });

        if (!user) {
            console.error("❌ DEMO USER NOT FOUND");
            return;
        }

        console.log("✅ Demo User found:", user.id);

        console.log("🔍 Checking WhatsAppAccount...");
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspace_id }
        });

        if (!waba) {
            console.error("❌ NO WABA CONFIGURED FOR DEMO USER");
        } else {
            console.log("✅ WABA found:", waba.id);
            console.log("   - WABA ID:", waba.waba_id);
            console.log("   - Phone ID:", waba.phone_number_id);
            console.log("   - Billing Model:", waba.billing_model);
        }

        console.log("🔍 Testing Template Upsert with ALL fields...");
        const mt = {
            id: "diag_" + Date.now(),
            name: "diagnostic_test_" + Date.now(),
            language: "en_US",
            category: "UTILITY",
            status: "APPROVED",
            components: [{ type: "BODY", text: "Diagnostic test" }]
        };

        try {
            const result = await prisma.template.upsert({
                where: {
                    workspace_id_name_language: {
                        workspace_id: user.workspace_id,
                        name: mt.name,
                        language: mt.language
                    }
                },
                update: {
                    status: "APPROVED",
                    category: "UTILITY",
                    components: mt.components,
                    meta_id: mt.id
                },
                create: {
                    workspace_id: user.workspace_id,
                    name: mt.name,
                    language: mt.language,
                    category: "UTILITY",
                    status: "APPROVED",
                    components: mt.components,
                    meta_id: mt.id
                }
            });
            console.log("✅ Template Upsert SUCCESSFUL");
        } catch (upsertError: any) {
            console.error("❌ TEMPLATE UPSERT FAILED");
            console.error("Error Message:", upsertError.message);
            console.error("Prisma Code:", upsertError.code);
            console.error("Meta:", upsertError.meta);
        }

    } catch (e: any) {
        console.error("❌ CRITICAL DIAGNOSTIC ERROR:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

deepDive();
