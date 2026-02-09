
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Super Admin...");
    const email = "admin@wabot.com";
    const password = "AdminPassword@123"; // Default strong password

    // Check if exists
    // @ts-ignore
    const existing = await prisma.adminUser?.findUnique({ where: { email } });

    if (existing) {
        console.log("Admin already exists.");
        return;
    }

    const hash = await bcrypt.hash(password, 10);

    // @ts-ignore
    const admin = await prisma.adminUser.create({
        data: {
            email,
            password_hash: hash,
            role: "SUPER_ADMIN",
            name: "Root Admin",
        },
    });

    console.log(`✅ Super Admin created: ${email}`);
    console.log(`🔑 Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
