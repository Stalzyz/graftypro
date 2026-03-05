import { PrismaClient } from "../lib/generated/client";

const prisma = new PrismaClient();

async function audit() {
    console.log("🔍 MONSTER MODE: Financial Reconciliation Audit Started...");

    // 1. Audit Vendor Wallets
    const wallets = await prisma.vendorWallet.findMany({
        include: {
            ledger_entries: true
        }
    });

    let inconsistencies = 0;

    for (const wallet of wallets) {
        const txSum = wallet.ledger_entries.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
        const currentBalance = Number(wallet.current_balance);

        if (Math.abs(txSum - currentBalance) > 0.01) {
            console.error(`❌ INCONSISTENCY: Wallet ${wallet.id} (Workspace: ${wallet.workspace_id})`);
            console.error(`   - Calculated Sum: ${txSum}`);
            console.error(`   - Stored Balance: ${currentBalance}`);
            console.error(`   - Diff: ${txSum - currentBalance}`);
            inconsistencies++;
        }

        if (currentBalance < 0) {
            console.warn(`⚠️ NEGATIVE BALANCE: Wallet ${wallet.id} has ${currentBalance}`);
        }
    }

    // 2. Audit Reseller Wallets
    const resellers = await prisma.reseller.findMany({
        include: {
            ledger_entries: true
        }
    });

    for (const reseller of resellers) {
        const ledgerSum = reseller.ledger_entries.reduce((acc: number, entry: any) => {
            return entry.type === 'CREDIT' ? acc + Number(entry.amount) : acc - Number(entry.amount);
        }, 0);

        const storedBalance = Number(reseller.wallet_balance);

        if (Math.abs(ledgerSum - storedBalance) > 0.01) {
            console.error(`❌ INCONSISTENCY: Reseller ${reseller.id} (${reseller.name})`);
            console.error(`   - Calculated Sum: ${ledgerSum}`);
            console.error(`   - Stored Balance: ${storedBalance}`);
            console.error(`   - Diff: ${ledgerSum - storedBalance}`);
            inconsistencies++;
        }
    }

    // 3. Check for Orphan Transactions
    const orphans = await prisma.creditTransaction.findMany({
        where: {
            wallet_id: { equals: "" } // Should technically use null check if optional
        }
    });

    if (orphans.length > 0) {
        console.error(`❌ ORPHAN TRANSACTIONS: Found ${orphans.length} transactions without wallet_id`);
        inconsistencies += orphans.length;
    }

    console.log("\n-------------------------------------------");
    if (inconsistencies === 0) {
        console.log("✅ AUDIT PASSED: All financial records are consistent.");
    } else {
        console.log(`🚨 AUDIT FAILED: Found ${inconsistencies} inconsistencies.`);
    }
    console.log("-------------------------------------------\n");
}

audit()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
