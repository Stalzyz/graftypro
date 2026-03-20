import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@grafty.com';
    const password = 'GraftyAdmin2026!';
    const password_hash = await bcrypt.hash(password, 10);

    console.log(`[!] UPSERTING SUPER ADMIN: ${email}`);

    const admin = await prisma.adminUser.upsert({
        where: { email },
        update: { 
            password_hash, 
            role: 'SUPER_ADMIN',
            name: 'Super Admin'
        },
        create: {
            email,
            name: 'Super Admin',
            password_hash,
            role: 'SUPER_ADMIN'
        }
    });

    console.log(`[+] Super Admin ${admin.email} has been reset/created.`);
    console.log(`[>] Login with: ${email} / ${password}`);
}

main()
    .catch((e) => {
        console.error("[-] Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
