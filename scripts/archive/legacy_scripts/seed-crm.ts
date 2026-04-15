
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STAGES = [
    "LEAD_CAPTURED", "CONTACTED", "DEMO_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"
];

const TYPES = ["VENDOR", "RESELLER", "WHITE_LABEL"];

const ACTIONS = ["CALL", "EMAIL", "DEMO", "NOTE", "STAGE_CHANGE", "PROPOSAL_GENERATED"];

const EMAILS = ["gmail.com", "yahoo.com", "outlook.com", "corp.com", "tech.io"];

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log("🚀 Starting CRM Seed / Stress Test...");

    // 1. Get or Create Admin User
    let admin = await prisma.adminUser.findFirst();
    if (!admin) {
        console.log("⚠️ No Admin User found. Creating dummy admin...");
        admin = await prisma.adminUser.create({
            data: {
                email: "admin@grafty.pro",
                password_hash: "dummy_hash",
                name: "Super Admin",
                role: "SUPER_ADMIN"
            }
        });
    }
    console.log(`✅ Using Admin: ${admin.id} (${admin.email})`);

    // 2. Create 50 Dummy Leads
    console.log("Creating 50 Dummy Leads...");
    const leadsData = Array.from({ length: 50 }).map((_, i) => {
        const stage = randomElement(STAGES);
        const type = randomElement(TYPES);
        const value = Math.floor(Math.random() * 50000); // Deal value up to 50k

        return {
            name: `Lead ${i + 1} ${type}`,
            email: `lead${i + 1}@${randomElement(EMAILS)}`,
            phone: `+1555000${i.toString().padStart(4, '0')}`,
            company_name: `Company ${i + 1} Corp`,
            type,
            stage,
            deal_value: value,
            probability: stage === 'WON' ? 100 : stage === 'LOST' ? 0 : Math.floor(Math.random() * 100),
            assigned_to: Math.random() > 0.3 ? admin!.id : null, // 70% assigned
            source: randomElement(["Website", "Referral", "LinkedIn", "Cold Call"]),
            notes: `Generated dummy lead via stress test script.`
        };
    });

    // Bulk create leads? created_at randomization is hard with createMany.
    // We'll loop to randomize created_at for better charts.
    const leads = [];
    for (const data of leadsData) {
        const lead = await prisma.cRMLead.create({
            data: {
                ...data,
                created_at: randomDate(new Date(2025, 0, 1), new Date()), // random date in 2025/2026
            }
        });
        leads.push(lead);
        process.stdout.write(".");
    }
    console.log("\n✅ Created 50 Leads.");

    // 3. Create 200 Activities
    console.log("Creating 200 Activities...");
    for (let i = 0; i < 200; i++) {
        const lead = randomElement(leads);
        const action = randomElement(ACTIONS);

        await prisma.cRMActivity.create({
            data: {
                lead_id: lead.id,
                admin_id: admin!.id,
                action,
                description: `Dummy activity ${i + 1}: ${action} performed on ${lead.name}`,
                created_at: randomDate(lead.created_at, new Date()) // Activity after lead creation
            }
        });
        process.stdout.write("*");
    }
    console.log("\n✅ Created 200 Activities.");

    console.log("🎉 Seeding / Stress Test Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
