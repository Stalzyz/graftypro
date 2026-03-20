// scripts/seed-master-demo.ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("🚀 STARTING NUCLEAR MASTER SEEDER...");

    try {
        // 1. IDENTITY & CONTEXT
        console.log("🔍 Checking Demo User...");
        const demoEmail = 'demo@grafty.com';
        const user = await db.user.findFirst({
            where: { email: demoEmail },
            include: { workspace: true }
        });

        if (!user || !user.workspace_id) {
            throw new Error(`Demo user (${demoEmail}) not found or has no workspace.`);
        }

        const wsId = user.workspace_id;
        const userId = user.id;
        console.log(`✅ Found Demo Identity: User=${userId}, Workspace=${wsId}`);

        // 2. CLEANUP (Idempotency)
        console.log("🧹 Cleaning up existing demo data...");
        await db.$executeRaw`DELETE FROM templates WHERE workspace_id = ${wsId}`;
        await db.$executeRaw`DELETE FROM universal_crm_leads WHERE workspace_id = ${wsId}`;
        await db.$executeRaw`DELETE FROM drip_sequences WHERE workspace_id = ${wsId}`;
        // We don't delete invoices to preserve revenue history for charts

        // 3. SEED TEMPLATES
        console.log("➕ Seeding Templates...");
        try {
            await db.template.create({
                data: {
                    workspace_id: wsId,
                    name: "welcome_onboarding",
                    language: "en_US",
                    category: "UTILITY",
                    status: "APPROVED",
                    components: [
                        { type: "BODY", text: "Welcome to Grafty! How can we assist you today?" }
                    ]
                }
            });
            await db.template.create({
                data: {
                    workspace_id: wsId,
                    name: "flash_sale",
                    language: "en_US",
                    category: "MARKETING",
                    status: "APPROVED",
                    components: [
                        { type: "BODY", text: "Flash Sale starts NOW! 50% discount for next 2 hours." }
                    ]
                }
            });
            console.log("   ✅ Templates Seeded.");
        } catch (e: any) {
            console.error("   ⚠️ Template Seed Error:", e.message);
        }

        // 4. SEED CRM LEADS
        console.log("➕ Seeding Universal CRM Leads...");
        try {
            const stages = ["NEW", "QUALIFIED", "WON"];
            for (let i = 0; i < 15; i++) {
                await db.universalCrmLead.create({
                    data: {
                        workspace_id: wsId,
                        name: `High Value Lead ${i + 1}`,
                        email: `lead${i}@demo.grafty.com`,
                        phone: `+9198765${1000 + i}`,
                        status: stages[i % stages.length],
                        deal_value: 5000 + (i * 1000),
                        custom_data: { source: "Instagram Ads", priority: i < 5 ? "High" : "Medium" }
                    }
                });
            }
            console.log("   ✅ CRM Leads Seeded.");
        } catch (e: any) {
            console.error("   ⚠️ CRM Lead Seed Error:", e.message);
        }

        // 5. SEED DRIP SEQUENCE
        console.log("➕ Seeding Drip Sequence...");
        try {
            await db.dripSequence.create({
                data: {
                    workspace_id: wsId,
                    name: "3-Day Prospecting Sequence",
                    status: "ACTIVE",
                    settings: { timezone: "UTC", logic: "aggressive" }
                }
            });
            console.log("   ✅ Drip Sequence Seeded.");
        } catch (e: any) {
            console.error("   ⚠️ Drip Seed Error:", e.message);
        }

        // 6. SEED PARTNER RECORD
        console.log("➕ Seeding Partner Portal Data...");
        try {
            await db.reseller.upsert({
                where: { id: userId },
                update: { status: "ACTIVE" },
                create: {
                    id: userId,
                    email: demoEmail,
                    name: "Master Partner",
                    referral_code: "GRAFTY_ALPHA",
                    status: "ACTIVE"
                }
            });
            console.log("   ✅ Partner Data Seeded.");
        } catch (e: any) {
            console.error("   ⚠️ Partner Seed Error:", e.message);
        }

        // 7. SEED GLOBAL REVENUE (INVOICES)
        console.log("➕ Seeding Revenue History...");
        try {
            for (let i = 0; i < 5; i++) {
                await db.invoice.create({
                    data: {
                        workspace_id: wsId,
                        invoice_number: `INV-DEMO-${Date.now()}-${i}`,
                        billing_name: `Enterprise Client ${i}`,
                        billing_address: "Tech Park, Segment A",
                        billing_state: "London",
                        billing_pincode: "EC1A 1BB",
                        net_amount: 1500 + (i * 500),
                        gst_amount: 0,
                        total_amount: 1500 + (i * 500),
                        status: "ACTIVE",
                        payment_status: "PAID"
                    }
                });
            }
            console.log("   ✅ Invoices Seeded.");
        } catch (e: any) {
            console.error("   ⚠️ Invoice Seed Error:", e.message);
        }

        console.log("🏁 NUCLEAR SEEDING SEQUENCE FINISHED!");

    } catch (error: any) {
        console.error("❌ CRITICAL SEEDER FAILURE:", error.message);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();
