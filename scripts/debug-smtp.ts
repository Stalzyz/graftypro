
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkSmtp() {
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
    console.log("Current SMTP Config:");
    console.log("Host:", config?.smtp_host);
    console.log("Port:", config?.smtp_port);
    console.log("User:", config?.smtp_user);
    console.log("From Email:", config?.smtp_from_email);
    console.log("From Name:", config?.smtp_from_name);
    console.log("Encryption:", config?.smtp_encryption);
    console.log("Has Pass:", !!config?.smtp_pass_enc);
}

checkSmtp().catch(console.error);
