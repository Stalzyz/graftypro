import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'GraftyAdmin2026!';
    const password_hash = await bcrypt.hash(password, 10);

    let admin = await prisma.adminUser.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (!admin) {
        // Create one if it doesn't exist
        admin = await prisma.adminUser.create({
            data: {
                email: 'admin@grafty.pro',
                name: 'Super Admin',
                password_hash,
                role: 'SUPER_ADMIN'
            }
        });
        console.log(`[+] Created new Super Admin!`);
        console.log(`[>] Email: ${admin.email}`);
        console.log(`[>] Password: ${password}`);
    } else {
        // Reset existing
        await prisma.adminUser.update({
            where: { id: admin.id },
            data: { password_hash }
        });
        console.log(`[+] Password reset successful for existing Super Admin!`);
        console.log(`[>] Email: ${admin.email}`);
        console.log(`[>] New Password: ${password}`);
    }
}

main()
    .catch((e) => {
        console.error("[-] Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
