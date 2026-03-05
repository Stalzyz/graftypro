
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspaceId = "efddb528-b271-4e80-b6c6-b2633be29bd6";
    console.log(`Granting Credits to ${workspaceId}...`);

    // Check if wallet exists
    let wallet = await prisma.vendorWallet.findUnique({
        where: { workspace_id: workspaceId }
    });

    if (!wallet) {
        console.log("Creating Wallet...");
        wallet = await prisma.vendorWallet.create({
            data: {
                workspace_id: workspaceId,
                current_balance: 1000000, // 1 Million
                total_used: 0
            }
        });
    } else {
        console.log("Updating Wallet... Current:", wallet.current_balance);
        await prisma.vendorWallet.update({
            where: { id: wallet.id },
            data: { current_balance: { increment: 1000000 } }
        });
    }

    console.log("Credits Granted! 1,000,000 added.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
