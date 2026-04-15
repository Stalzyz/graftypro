
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const targetEmail = process.argv[2];
    const targetWabaId = process.argv[3];

    if (!targetEmail || !targetWabaId) {
        console.error("Usage: node scripts/move_waba.js <email> <targetWabaId>");
        process.exit(1);
    }

    console.log(`Searching for user: ${targetEmail}`);
    const user = await prisma.user.findFirst({
        where: { email: targetEmail },
        include: { workspace: true }
    });

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    const targetWorkspaceId = user.workspace_id;
    console.log(`Found User Workspace: ${user.workspace.name} (${targetWorkspaceId})`);

    // Find the current WABA
    const waba = await prisma.whatsAppAccount.findUnique({
        where: { phone_number_id: targetWabaId }
    });

    if (!waba) {
        console.error("WABA not found!");
        process.exit(1);
    }

    console.log(`Moving WABA ${waba.id} from Workspace ${waba.workspace_id} to ${targetWorkspaceId}`);

    // Update WABA
    try {
        await prisma.whatsAppAccount.update({
            where: { id: waba.id },
            data: { workspace_id: targetWorkspaceId }
        });

        console.log("SUCCESS: WhatsApp moved to your workspace!");

        // Also move contacts/conversations created in the temporary workspace to the new one
        await prisma.contact.updateMany({
            where: { workspace_id: waba.workspace_id },
            data: { workspace_id: targetWorkspaceId }
        });

        await prisma.conversation.updateMany({
            where: { workspace_id: waba.workspace_id },
            data: { workspace_id: targetWorkspaceId }
        });

        await prisma.message.updateMany({
            where: { workspace_id: waba.workspace_id },
            data: { workspace_id: targetWorkspaceId }
        });

        console.log("SUCCESS: History moved to your workspace!");

    } catch (e) {
        console.error("Error moving WABA (Workspace might already have a WABA?):", e.message);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
