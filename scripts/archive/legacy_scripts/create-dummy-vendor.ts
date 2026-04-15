import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating Dummy Vendor User Profile...');

    // 1. Create a dummy reseller if there isn't one
    let reseller = await prisma.reseller.findFirst({
        where: { email: 'dummy_reseller@example.com' }
    });

    if (!reseller) {
        reseller = await prisma.reseller.findFirst();
    }

    if (!reseller) {
        const tier = await prisma.resellerTier.findFirst() || await prisma.resellerTier.create({
            data: { name: 'Starter Tier', min_vendors: 0, commission_rate: 10, monthly_revenue_threshold: 0, bonus_percentage: 0 }
        });

        reseller = await prisma.reseller.create({
            data: {
                name: 'Dummy Reseller',
                email: 'dummy_reseller@example.com',
                password_hash: await bcrypt.hash('Reseller123!', 10),
                business_name: 'Dummy Reseller Inc',
                status: 'ACTIVE',
                tier_id: tier.id,
            }
        });
        console.log('Created dummy reseller:', reseller.email);
    } else {
        console.log('Using existing reseller:', reseller.email);
    }

    // 2. Create Workspace (Vendor)
    const workspaceEmail = `vendor_${Date.now()}@example.com`;

    const workspace = await prisma.workspace.create({
        data: {
            name: 'Dummy Vendor Workspace',
            business_name: 'Dummy Vendor Inc',
            status: 'ACTIVE',
            plan: 'PRO',
            timezone: 'UTC',
            reseller_id: reseller.id,
        }
    });

    console.log('Created Workspace:', workspace.id);

    // 3. Map Vendor to Reseller
    await prisma.resellerVendorMap.create({
        data: {
            reseller_id: reseller.id,
            workspace_id: workspace.id,
        }
    });

    // 4. Create User (Vendor Profile) for the Workspace
    const plainPassword = 'password123';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
        data: {
            workspace_id: workspace.id,
            email: workspaceEmail,
            password_hash: passwordHash,
            role: 'OWNER',
            first_name: 'Vendor',
            last_name: 'Test',
            email_verified: new Date(),
        }
    });

    // 5. Create a wallet for the vendor
    await prisma.vendorWallet.create({
        data: {
            workspace_id: workspace.id,
            balance: 100.0,
        }
    });

    console.log('--- SUCCESS ---');
    console.log('Vendor User Login Details:');
    console.log(`Email: ${workspaceEmail}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Workspace ID: ${workspace.id}`);
    console.log(`Reseller ID: ${reseller.id}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
