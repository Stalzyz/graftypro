
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding System Config...");

    const config = await prisma.systemConfig.upsert({
        where: { id: "global" },
        update: {},
        create: {
            id: "global",
            platform_name: "WAVO",
            platform_tagline: "Enterprise Grade WhatsApp BSP",
            primary_color: "#27954D",
            secondary_color: "#042F94",
            support_email: "support@grekam.in",
            modules: {
                commerce: true,
                drips: true,
                reseller: true,
                white_label: true,
                api_access: true
            }
        },
    });

    console.log("✅ System Config initialized:", config.platform_name);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
