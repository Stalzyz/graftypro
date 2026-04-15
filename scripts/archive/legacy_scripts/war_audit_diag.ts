
import { prisma } from "../lib/db";
import { AuthSecurityService } from "../lib/security/auth-utils";

async function diagnose() {
    console.log("--- VENDOR DIAGNOSIS ---");
    const vendors = await prisma.user.findMany({
        where: { email: { contains: "vendor3@test.com" } }
    });
    console.log("Found Vendors:", vendors.length);
    for (const v of vendors) {
        console.log(`Vendor: ${v.email} | ID: ${v.id} | Role: ${v.role} | Verified: ${v.email_verified}`);

        // Reset Password Check
        const passwordHash = await AuthSecurityService.hashPassword("Password123!");
        await prisma.user.update({
            where: { id: v.id },
            data: { password_hash: passwordHash }
        });
        console.log("-> Password reset to 'Password123!'");
    }

    console.log("\n--- RESELLER DIAGNOSIS ---");
    const resellers = await prisma.reseller.findMany({
        where: { email: { contains: "reseller_monster@test.com" } }
    });
    console.log("Found Resellers:", resellers.length);
    for (const r of resellers) {
        console.log(`Reseller: ${r.email} | ID: ${r.id} | Status: ${r.status}`);

        // Approve Reseller
        if (r.status !== "ACTIVE") {
            await prisma.reseller.update({
                where: { id: r.id },
                data: { status: "ACTIVE" }
            });
            console.log("-> Activated Reseller");
        }
    }
}

diagnose()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
