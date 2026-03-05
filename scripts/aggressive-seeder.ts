
import { PrismaClient, ResellerStatus, UserRole, WorkspaceStatus } from '../lib/generated/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting AGGRESSIVE SEEDER for Production-Level Audit...");

    // 1. Tiers
    const tiers = [
        { name: "Starter", min_vendors: 0, commission_rate: 20 },
        { name: "Growth", min_vendors: 10, commission_rate: 25 },
        { name: "Empire", min_vendors: 50, commission_rate: 30 }
    ];

    for (const t of tiers) {
        await prisma.resellerTier.upsert({
            where: { name: t.name },
            update: { min_vendors: t.min_vendors, commission_rate: t.commission_rate },
            create: t
        });
    }

    const starterTier = await prisma.resellerTier.findUnique({ where: { name: "Starter" } });

    // 2. Resellers
    const password = await hash("Testing123!", 12);

    const mainReseller = await prisma.reseller.upsert({
        where: { email: "war-partner@test.com" },
        update: { status: "ACTIVE", is_frozen: false },
        create: {
            email: "war-partner@test.com",
            name: "War Partner",
            password_hash: password,
            referral_code: "WAR-PARTNER-1",
            status: "ACTIVE",
            tier_id: starterTier?.id,
            wallet_balance: 0,
            total_earned: 0
        }
    });

    const frozenReseller = await prisma.reseller.upsert({
        where: { email: "frozen-partner@test.com" },
        update: {},
        create: {
            email: "frozen-partner@test.com",
            name: "Frozen Partner",
            password_hash: password,
            referral_code: "FROZEN-1",
            status: "ACTIVE",
            is_frozen: true,
            freeze_reason: "Simulated Fraud for Audit"
        }
    });

    const maliciousReseller = await prisma.reseller.upsert({
        where: { email: "attacker@test.com" },
        update: {},
        create: {
            email: "attacker@test.com",
            name: "Malicious Partner",
            password_hash: password,
            referral_code: "ATTACK-1",
            status: "ACTIVE"
        }
    });

    // 3. Workspaces (Vendors)
    for (let i = 1; i <= 5; i++) {
        const wsId = `war-vendor-${i}`;
        await prisma.workspace.upsert({
            where: { id: wsId },
            update: { reseller_id: i === 1 ? mainReseller.id : undefined },
            create: {
                id: wsId,
                name: `War Vendor ${i}`,
                business_name: `War Business ${i}`,
                status: "ACTIVE",
                reseller_id: i === 1 ? mainReseller.id : undefined
            }
        });

        if (i === 1) {
            await prisma.resellerVendorMap.upsert({
                where: { workspace_id: wsId },
                update: { reseller_id: mainReseller.id },
                create: {
                    reseller_id: mainReseller.id,
                    workspace_id: wsId,
                    referral_source: "SEED",
                    is_permanent: true
                }
            });
        }

        // Add an owner user for risk signals check (camelCase: prisma.user)
        try {
            await prisma.user.upsert({
                where: { workspace_id_email: { workspace_id: wsId, email: `owner-${i}@vendor.com` } },
                update: {},
                create: {
                    workspace_id: wsId,
                    email: `owner-${i}@vendor.com`,
                    password_hash: password,
                    role: "OWNER"
                }
            });
        } catch (e) {
            // If unique name is different, try generic find/create
            console.log(`User ${i} might already exist or name mismatch.`);
        }
    }

    // 4. Coupons (camelCase: prisma.resellerCoupon)
    await prisma.resellerCoupon.upsert({
        where: { code: "WARCODE50" },
        update: {},
        create: {
            reseller_id: mainReseller.id,
            code: "WARCODE50",
            discount_type: "PERCENTAGE",
            discount_value: 50,
            usage_limit: 10,
            is_active: true
        }
    });

    console.log("✅ SEEDING COMPLETE. Ready for assault.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
