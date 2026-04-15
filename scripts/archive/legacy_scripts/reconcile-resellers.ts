
import { prisma } from "../lib/db";
import { ResellerFinanceEngine } from "../lib/reseller/finance-engine";

async function main() {
    console.log("🔍 Starting Reseller Financial Reconciliation...");

    const resellers = await prisma.reseller.findMany({
        select: { id: true, name: true }
    });

    let errors = 0;

    for (const reseller of resellers) {
        const result = await ResellerFinanceEngine.reconcileWallet(reseller.id);

        if (!result.isConsistent) {
            console.error(`❌ DISCREPANCY FOUND: Reseller ${reseller.name} (${reseller.id})`);
            console.error(`   Ledger Sum: ₹${result.ledgerSum}`);
            console.error(`   Wallet Balance: ₹${result.walletBalance}`);
            console.error(`   Difference: ₹${result.difference}`);
            errors++;
        } else {
            console.log(`✅ ${reseller.name.padEnd(20)}: In Sync (₹${result.walletBalance})`);
        }
    }

    if (errors === 0) {
        console.log("\n✨ All reseller wallets are consistent with the ledger.");
    } else {
        console.error(`\n🚨 Reconciliation failed with ${errors} discrepancies.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
