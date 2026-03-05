
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Initializing 2026 Meta Credit Ledger System...");

    // 1. Seed Credit Pricing (2026 India Rates)
    const pricing = [
        { message_type: "MARKETING", country: "India", country_code: "91", meta_cost: 0.88, plat_margin: 0.10, res_margin: 0.10 },
        { message_type: "UTILITY", country: "India", country_code: "91", meta_cost: 0.13, plat_margin: 0.05, res_margin: 0.05 },
        { message_type: "AUTHENTICATION", country: "India", country_code: "91", meta_cost: 0.13, plat_margin: 0.05, res_margin: 0.05 },
        { message_type: "SERVICE", country: "India", country_code: "91", meta_cost: 0.00, plat_margin: 0.05, res_margin: 0.05 },
        // Fallbacks
        { message_type: "GLOBAL_DEFAULT", country: "GLOBAL", country_code: "*", meta_cost: 5.00, plat_margin: 1.00, res_margin: 1.00 },
    ];

    for (const p of pricing) {
        await prisma.creditPricing.upsert({
            where: {
                id: `${p.message_type}_${p.country_code}` // Custom ID for upsert logic if needed or use unique constraint
            },
            update: {
                meta_cost: p.meta_cost,
                platform_margin: p.plat_margin,
                reseller_margin: p.res_margin,
                final_vendor_price: p.meta_cost + p.plat_margin + p.res_margin
            },
            create: {
                id: `${p.message_type}_${p.country_code}`,
                message_type: p.message_type,
                country: p.country,
                country_code: p.country_code,
                meta_cost: p.meta_cost,
                platform_margin: p.plat_margin,
                reseller_margin: p.res_margin,
                final_vendor_price: p.meta_cost + p.plat_margin + p.res_margin
            }
        });
    }
    console.log("✅ Credit Pricing Seeded.");

    // 2. Initialize Wallets & Grant Welcome Credits
    const workspaces = await prisma.workspace.findMany();
    console.log(`🌍 Processing ${workspaces.length} workspaces...`);

    for (const ws of workspaces) {
        const wallet = await prisma.vendorWallet.upsert({
            where: { workspace_id: ws.id },
            update: {},
            create: {
                workspace_id: ws.id,
                current_balance: 1000.00, // Grant 1,000 Credits as requested
                total_purchased: 1000.00,
                billing_name: ws.name,
                billing_email: "support@grafty.pro" // Fallback since workspace has no email
            }
        });

        // Add to ledger
        const existingTx = await prisma.creditTransaction.findFirst({
            where: {
                workspace_id: ws.id,
                type: 'PURCHASE',
                description: 'Welcome Credits Integration'
            }
        });

        if (!existingTx) {
            await prisma.creditTransaction.create({
                data: {
                    workspace_id: ws.id,
                    wallet_id: wallet.id,
                    type: 'PURCHASE',
                    amount: 1000.00,
                    balance_before: 0.00,
                    balance_after: 1000.00,
                    description: 'Welcome Credits Integration',
                    status: 'COMPLETED'
                }
            });
        }
    }

    console.log("✨ Credit Ledger System Activated with 1,000 Welcome Credits per user!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
