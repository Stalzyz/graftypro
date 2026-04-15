
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("☢️  INITIATING NUCLEAR VENDOR OPS SEED...");

    // 1. Create Nuclear Workspace
    console.log("🏗️  Creating Nuclear Workspace...");
    const workspace = await prisma.workspace.create({
        data: {
            name: "Nuclear Test Ops",
            business_name: "Nuclear Ind.",
            status: "ACTIVE",
            plan: "ENTERPRISE",
            timezone: "Asia/Kolkata", // IST
            settings: { message_limit: "UNLIMITED" }
        }
    });
    const workspaceId = workspace.id;
    console.log(`✅ Default Workspace: ${workspaceId}`);

    // 2. Create Mock WABA
    console.log("🔗 Connecting Mock WABA...");
    await prisma.whatsAppAccount.create({
        data: {
            workspace_id: workspaceId,
            phone_number: `91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            phone_number_id: `1${Date.now()}`, // Random
            waba_id: `2${Date.now()}`,
            access_token: "test_token",
            status: "CONNECTED",
            health_status: "HEALTHY"
        }
    });

    // 3. Seed 10,000 Contacts (Batch Mode)
    console.log("👥 Generating 10,000 Contacts (Batch Mode)...");
    const BATCH_SIZE = 200; // REDUCED
    const TOTAL_CONTACTS = 10000;
    const batches = Math.ceil(TOTAL_CONTACTS / BATCH_SIZE);

    for (let i = 0; i < batches; i++) {
        const contacts = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            const num = i * BATCH_SIZE + j;
            contacts.push({
                workspace_id: workspaceId,
                name: `Test Subject ${num}`,
                phone: `91${(9000000000 + num).toString()}`, // 919000000000 onwards
                created_at: new Date()
            });
        }
        try {
            await prisma.contact.createMany({
                data: contacts,
                skipDuplicates: true
            });
            process.stdout.write(`\r✅ Batch ${i + 1}/${batches} Inserted...`);
        } catch (err) {
            console.error(`\n❌ Batch ${i} Failed: ${err.message}`);
        }
    }
    console.log("\n✅ 10,000 Contacts Seeded.");

    // 4. Create Massive Campaign (Draft)
    console.log("🚀 Creating 'Doomsday' Campaign...");
    const campaign = await prisma.campaign.create({
        data: {
            workspace_id: workspaceId,
            name: "Doomsday Broadcast (10k)",
            status: "DRAFT",
            template_name: "hello_world", // Standard Template
            scheduled_at: new Date(), // Ready to fire
            filters: {} // Required by Prisma
        }
    });
    console.log(`✅ Campaign Created: ${campaign.id}`);
    console.log(`MARKER_CAMPAIGN_ID: ${campaign.id}`);

    // 5. Create 1000 Drip Enrollments (Active)
    console.log("💧 Creating 1,000 Drip Enrollments...");

    // Create Dummy Drip & Steps
    const drip = await prisma.dripSequence.create({
        data: {
            workspace_id: workspaceId,
            name: "Nuclear Drip",
            status: "ACTIVE",
            steps: {
                create: [
                    { step_order: 1, delay_hours: 0, template_id: "dummy_tpl_id", type: "TEMPLATE", content: {} },
                    { step_order: 2, delay_hours: 24, template_id: "dummy_tpl_id_2", type: "TEMPLATE", content: {} }
                ]
            }
        },
        include: { steps: true }
    });

    // We need contact IDs for enrollments. Fetching first 1000.
    const first1kContacts = await prisma.contact.findMany({
        where: { workspace_id: workspaceId },
        take: 1000,
        select: { id: true }
    });

    const enrollments = first1kContacts.map(c => ({
        workspace_id: workspaceId,
        drip_id: drip.id,
        contact_id: c.id,
        current_step: 0,
        next_run_at: new Date(), // DUE NOW
        is_stopped: false,
        status: "ACTIVE"
    }));

    await prisma.dripEnrollment.createMany({ data: enrollments });
    console.log("✅ 1,000 Drip Enrollments Created (Due Now).");

    console.log("\n🎉 SEED COMPLETE! Ready for Nuclear Launch.");
    console.log(`ℹ️  Workspace ID: ${workspaceId}`);
    console.log(`ℹ️  Campaign ID: ${campaign.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
