
import { PrismaClient } from "@prisma/client";
import { encrypt } from "../lib/security/encryption";

const prisma = new PrismaClient();

async function seedSmtp() {
    console.log("Seeding SMTP Configuration...");

    const smtpPass = "Wabot@1234";
    const encryptedPass = encrypt(smtpPass);

    await prisma.systemConfig.upsert({
        where: { id: "global" },
        update: {
            smtp_host: "mail.privateemail.com",
            smtp_port: 465,
            smtp_user: "support@grafty.pro",
            smtp_pass_enc: encryptedPass,
            smtp_from_email: "support@grafty.pro",
            smtp_from_name: "Team Grafty",
            smtp_encryption: "SSL"
        },
        create: {
            id: "global",
            smtp_host: "mail.privateemail.com",
            smtp_port: 465,
            smtp_user: "support@grafty.pro",
            smtp_pass_enc: encryptedPass,
            smtp_from_email: "support@grafty.pro",
            smtp_from_name: "Team Grafty",
            smtp_encryption: "SSL"
        }
    });

    console.log("✅ SMTP Configuration Seeded successfully!");
}

seedSmtp()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
