
import { prisma } from "../lib/db";

async function clearConfig() {
    console.log("Clearing SystemConfig to enforce .env fallback...");
    try {
        await prisma.systemConfig.update({
            where: { id: "global" },
            data: {
                smtp_host: null,
                smtp_port: null,
                smtp_user: null,
                smtp_pass_enc: null,
                smtp_from_email: null,
                smtp_from_name: null,
                smtp_encryption: "TLS"
            }
        });
        console.log("SystemConfig cleared successfully!");
    } catch (error) {
        console.error("Failed to clear config:", error);
    }
}

clearConfig();
