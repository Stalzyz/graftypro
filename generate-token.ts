
import { signToken } from "./lib/auth";
import { prisma } from "./lib/db";

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found");
            return;
        }

        const token = await signToken({
            userId: user.id,
            workspaceId: user.workspace_id,
            role: user.role
        });

        console.log(token);
    } catch (error) {
        console.error("Error generating token:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
