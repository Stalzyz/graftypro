import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = 'https://grafty.pro/api';

async function generateTestReport() {
    console.log("🔥 STARTING MONSTER VENDOR DASHBOARD AGGRESSIVE TEST 🔥\n");

    const email = 'vendor_1772014366294@example.com';
    let passed = 0;
    let failed = 0;

    const report = {
        auth: 'PENDING',
        workspace: 'PENDING',
        contacts: 'PENDING',
        campaigns: 'PENDING',
        flows: 'PENDING',
        drips: 'PENDING',
        commerce: 'PENDING',
        wallet: 'PENDING'
    };

    function assert(condition: any, message: string) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.log(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        // [PHASE 1 & 2] DB Verification of Vendor
        console.log("--- PHASE 1 & 2: VENDOR AUTH & WORKSPACE INITIALIZATION ---");
        const user = await prisma.user.findFirst({ where: { email } });
        assert(user !== null, "User exists in DB");

        const workspace = await prisma.workspace.findUnique({ where: { id: user?.workspace_id } });
        assert(workspace !== null, "Workspace exists and is linked properly");

        const wallet = await prisma.vendorWallet.findFirst({ where: { workspace_id: workspace?.id } });
        assert(wallet !== null, "Vendor wallet initialized correctly");
        assert(wallet?.current_balance >= 0, "Wallet balance is valid");
        report.auth = 'PASS';
        report.workspace = 'PASS';

        // [PHASE 3] Flow Builder backend save verification
        console.log("\n--- PHASE 3: FLOW ENGINE DB CHECK ---");
        const flow = await prisma.flow.create({
            data: {
                workspace_id: workspace!.id,
                name: 'Test QA Flow',
                trigger_keyword: 'test_keyword',
                nodes: {},
                edges: {},
                status: 'PUBLISHED'
            }
        });
        assert(flow.id !== undefined, "Flow created successfully");
        report.flows = 'PASS';

        // [PHASE 4] Broadcast Engine
        console.log("\n--- PHASE 4: CONTACTS & BROADCAST ENGINE ---");
        const contact = await prisma.contact.create({
            data: {
                workspace_id: workspace!.id,
                name: 'QA Test Contact',
                phone: '919000000000',
                opt_in: true
            }
        });
        assert(contact.id !== undefined, "Contact created successfully");
        report.contacts = 'PASS';

        const campaign = await prisma.campaign.create({
            data: {
                workspace_id: workspace!.id,
                name: 'Test QA Campaign',
                template_name: 'test_hello',
                status: 'DRAFT',
                scheduled_at: new Date(),
                filters: {}
            }
        });
        assert(campaign.id !== undefined, "Campaign created in DRAFT");
        report.campaigns = 'PASS';

        // [PHASE 8] Commerce Module Test
        console.log("\n--- PHASE 8: COMMERCE ENGINE TEST ---");
        const store = await prisma.commerceStore.create({
            data: {
                workspace_id: workspace!.id,
                name: 'Test Store'
            }
        });
        assert(store.id !== undefined, "Commerce store initialized");

        const product = await prisma.commerceProduct.create({
            data: {
                store_id: store.id,
                name: 'QA Test Item',
                price: 500,
                stock: 10,
                is_active: true
            }
        });
        assert(product.id !== undefined, "Commerce product created");
        report.commerce = 'PASS';

        // Summary
        console.log("\n🏁 TEST RUN COMPLETE");
        console.log(`Passed: ${passed} | Failed: ${failed}`);
        console.table(report);

    } catch (e: any) {
        console.error("🚨 UNHANDLED EXCEPTION DURING TEST SUITE RUN:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

generateTestReport();
