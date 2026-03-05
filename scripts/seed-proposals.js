
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting Proposal Forge Nuclear Seed...");

    // 1. CLEAR EXISTING PROPOSALS
    console.log("☢️  Clearing existing proposals...");
    try {
        await prisma.proposal.deleteMany({});
        console.log("✅ Cleared proposals table.");
    } catch (e) {
        console.warn("⚠️  Table might be empty:", e);
    }

    // 2. GENERATE 1000 PROPOSALS
    console.log("🔨 Forging 1000 Proposals...");

    const statuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
    const companies = ["TechCorp", "InnovateX", "GlobalSolutions", "AlphaDynamics", "OmegaSystems", "CloudNine", "DataFlow"];
    const services = [
        { desc: "WhatsApp API Integration", price: 5000 },
        { desc: "Chatbot Development", price: 15000 },
        { desc: "CRM Setup", price: 8000 },
        { desc: "Monthly Retainer", price: 2000 },
        { desc: "Custom Flow Design", price: 4000 }
    ];

    const proposals = [];
    const BATCH_SIZE = 100;
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 1000; i++) {
        const id = (i + 1).toString().padStart(3, '0');
        const protocol_id = `PROP-${currentYear}-${id}`;

        const company = companies[Math.floor(Math.random() * companies.length)] + " " + Math.floor(Math.random() * 100);
        const clientName = `Client ${i + 1}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Generate Items
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let totalAmount = 0;

        for (let j = 0; j < itemCount; j++) {
            const service = services[Math.floor(Math.random() * services.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            const total = service.price * qty;
            items.push({
                description: service.desc,
                quantity: qty,
                price: service.price,
                total: total
            });
            totalAmount += total;
        }

        proposals.push({
            protocol_id,
            client_name: clientName,
            client_company: company,
            client_email: `client${i + 1}@${company.replace(/\s/g, '').toLowerCase()}.com`,
            amount: totalAmount,
            status: status,
            items: items, // JSON
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past date
        });

        if (proposals.length >= BATCH_SIZE) {
            await prisma.proposal.createMany({ data: proposals });
            process.stdout.write(`\r✅ Forged ${i + 1} proposals...`);
            proposals.length = 0;
        }
    }

    if (proposals.length > 0) {
        await prisma.proposal.createMany({ data: proposals });
    }

    console.log(`\n🎉 SEED COMPLETE! Forged 1000 Proposals.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
