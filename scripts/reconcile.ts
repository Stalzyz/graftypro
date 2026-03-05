
import { PrismaClient } from '../lib/generated/client';
import { ResellerFinanceEngine } from '../lib/reseller/finance-engine';

const prisma = new PrismaClient();

async function runReconciliation() {
    console.log("📊 RUNNING FINANCIAL RECONCILIATION AUDIT...");

    const resellers = await prisma.reseller.findMany();
    let failureCount = 0;

    for (const partner of resellers) {
        const result = await ResellerFinanceEngine.reconcileWallet(partner.id);
        if (!result.isConsistent) {
            console.error(`❌ DISCREPANCY FOUND for Reseller: ${partner.name} (${partner.id})`);
            console.error(`   Ledger Sum: ${result.ledgerSum}`);
            console.error(`   Wallet Balance: ${result.walletBalance}`);
            console.error(`   Difference: ${result.difference}`);
            failureCount++;
        } else {
            console.log(`✅ RECONCILED: ${partner.name} - Balance: ${result.walletBalance}`);
        }
    }

    if (failureCount === 0) {
        console.log("\n🚀 ALL PARTNER WALLETS ARE 100% IN SYNC WITH LEDGER.");
    } else {
        console.error(`\n❌ AUDIT FAILED: ${failureCount} discrepancies found.`);
    }
}

runReconciliation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
