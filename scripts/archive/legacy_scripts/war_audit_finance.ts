
import { PrismaClient } from '@prisma/client';
import { CreditService } from '../lib/credits/service';
import { ResellerService } from '../lib/reseller/service'; // Assuming export

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting Financial Integrity Audit...");

    // 1. Setup Test Reseller with 20% Markup
    const email = `audit_reseller_${Date.now()}@test.com`;
    const reseller = await prisma.reseller.create({
        data: {
            email,
            name: "Audit Reseller",
            referral_code: `AUDIT${Date.now()}`,
            status: 'ACTIVE',
            markup_percentage: 20.00, // 20%
            wallet_balance: 0.00
        }
    });
    console.log(`✅ Reseller Created: ${reseller.email} (Markup: 20%)`);

    // 2. Setup Test Workspace (Vendor)
    const workspace = await prisma.workspace.create({
        data: {
            name: "Audit Workspace",
            plan: "PRO",
            reseller_id: reseller.id
        }
    });

    // 3. Create Vendor Wallet
    await prisma.vendorWallet.create({
        data: {
            workspace_id: workspace.id,
            current_balance: 100.00
        }
    });
    console.log(`✅ Vendor Workspace Created: ${workspace.id} (Balance: 100.00)`);

    // 4. Mock Credit Pricing (Marketing India = 10.00 Base)
    // We update the DB to ensure predictable base price
    await prisma.creditPricing.upsert({
        where: {
            message_type_country: {
                message_type: "MARKETING",
                country: "India"
            }
        },
        update: {
            final_vendor_price: 10.00, // BASE PRICE
            meta_cost: 6.00,
            platform_margin: 2.00,
            reseller_margin: 2.00
        },
        create: {
            message_type: "MARKETING",
            country: "India",
            country_code: "91",
            final_vendor_price: 10.00,
            meta_cost: 6.00,
            platform_margin: 2.00,
            reseller_margin: 2.00
        }
    });
    console.log("✅ Pricing Mocked: Base = 10.00");

    // 5. Calculate Cost
    // In service.ts: finalPrice = basePrice + (basePrice * markup / 100)
    // Expected: 10 + (10 * 0.20) = 12.00
    const cost = await CreditService.getMessageCost("MARKETING", "91", workspace.id);
    console.log(`💰 Calculated Cost for Vendor: ${cost}`);

    if (cost !== 12.00) {
        console.warn(`⚠️ Cost mismatch! Expected 12.00, got ${cost}`);
    }

    // 6. Deduct Credits
    // deductCreditsAtomic calls processUsageCommission
    const deduction = await CreditService.deductCreditsAtomic(
        workspace.id,
        cost,
        `MSG-${Date.now()}`,
        null,
        "MARKETING",
        "91",
        "Audit Message"
    );

    if (!deduction.success) {
        console.error("❌ Deduction Failed:", deduction.error);
        process.exit(1);
    }
    console.log("✅ Deduction Successful");

    // 7. Check Reseller Commission
    const updatedReseller = await prisma.reseller.findUnique({
        where: { id: reseller.id }
    });

    const balance = Number(updatedReseller?.wallet_balance);
    const expectedCommission = 2.00; // 20% of 10.00
    const flawedCommission = 2.40; // 20% of 12.00 (Current Logic Hypothesis)

    console.log(`📊 Reseller Wallet Balance: ${balance}`);
    console.log(`   Expected (Ideal): ${expectedCommission}`);
    console.log(`   Expected (Flawed): ${flawedCommission}`);

    if (Math.abs(balance - expectedCommission) < 0.01) {
        console.log("✅ Commission Logic is CORRECT.");
    } else if (Math.abs(balance - flawedCommission) < 0.01) {
        console.error("🚨 CRITICAL: Commission Logic is FLAWED. Platform is losing money.");
    } else {
        console.error(`❓ Unknown Commission Calculation. Got ${balance}`);
    }

    // Cleanup
    await prisma.creditTransaction.deleteMany({ where: { workspace_id: workspace.id } });
    await prisma.vendorWallet.deleteMany({ where: { workspace_id: workspace.id } });
    await prisma.workspace.delete({ where: { id: workspace.id } });
    await prisma.resellerLedger.deleteMany({ where: { reseller_id: reseller.id } });
    await prisma.reseller.delete({ where: { id: reseller.id } });
    console.log("🧹 Cleanup Done");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
