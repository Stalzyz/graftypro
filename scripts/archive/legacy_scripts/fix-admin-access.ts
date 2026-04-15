import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 STARTING EMERGENCY ADMIN ACCESS RECOVERY...");

  const email = "admin@grafty.com";
  const password = "AdminPassword@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log(`Checking for AdminUser model...`);
    // @ts-ignore
    const adminModel = prisma.adminUser;
    
    if (!adminModel) {
      console.error("❌ CRITICAL: AdminUser model not found in Prisma Client!");
      console.log("Tip: Run 'npx prisma generate' then try again.");
      process.exit(1);
    }

    console.log(`Upserting Super Admin: ${email}...`);
    const admin = await adminModel.upsert({
      where: { email },
      update: {
        password_hash: hashedPassword,
        role: "SUPER_ADMIN",
      },
      create: {
        email,
        password_hash: hashedPassword,
        role: "SUPER_ADMIN",
        name: "Grafty Root",
      },
    });

    console.log(`✅ SUCCESS: Admin user ${admin.email} is now active.`);
    console.log(`🔑 Login at: https://grafty.pro/super-admin/login`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔓 Pass: ${password}`);

  } catch (error: any) {
    console.error("❌ FAILED to recover admin access:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
