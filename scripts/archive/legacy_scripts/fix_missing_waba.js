
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const phoneNumberId = process.argv[2];
    if (!phoneNumberId) {
        console.error("Please provide a phone number ID");
        process.exit(1);
    }

    console.log(`Checking for WABA with phone_number_id: ${phoneNumberId}`);

    // Check if account exists
    const account = await prisma.whatsAppAccount.findUnique({
        where: { phone_number_id: phoneNumberId }
    });

    if (account) {
        console.log("Found account:", account);
    } else {
        console.log("Account not found. Creating placeholder...");

        // Find a workspace to attach to (or create one)
        let workspace = await prisma.workspace.findFirst({
            where: { name: "Default Test Workspace" }
        });

        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    name: "Default Test Workspace",
                    business_name: "Test Business"
                }
            });
            console.log("Created test workspace:", workspace.id);
        }

        // Create WABA
        const newAccount = await prisma.whatsAppAccount.create({
            data: {
                workspace_id: workspace.id,
                phone_number_id: phoneNumberId,
                waba_id: "PLACEHOLDER_WABA_ID_" + Date.now(),
                phone_number: "UNKNOWN",
                access_token: "PLACEHOLDER",
                integration_status: "ACTIVE",
                status: "CONNECTED"
            }
        });
        console.log("Created new WABA account:", newAccount);
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
