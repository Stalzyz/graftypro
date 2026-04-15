
import { PrismaClient } from "../lib/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Resetting Super Admin Password...");
    const email = "admin@grafty.com";
    const password = "AdminPassword@123";

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Check if exists
    // @ts-ignore
    const existing = await prisma.adminUser?.findUnique({ where: { email } });

    if (existing) {
        console.log(`Admin user found (ID: ${existing.id}). Updating password...`);
        // @ts-ignore
        await prisma.adminUser.update({
            where: { email },
            data: { password_hash: hash }
        });
        console.log("✅ Password updated successfully.");
    } else {
        console.log("Admin user not found. Creating new admin...");
        // @ts-ignore
        await prisma.adminUser.create({
            data: {
                email,
                password_hash: hash,
                role: "SUPER_ADMIN",
                name: "Root Admin",
            },
        });
        console.log("✅ New Admin user created successfully.");
    }

    console.log(`\n------------------------------------------------`);
    console.log(`Unknown state resolved.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`------------------------------------------------\n`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
