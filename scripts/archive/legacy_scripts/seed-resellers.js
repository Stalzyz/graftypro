
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting Reseller Management Nuclear Seed...");

    // 1. CLEAR EXISTING DATA
    console.log("☢️  Clearing existing resellers...");
    try {
        await prisma.resellerMonthlyStats.deleteMany({});
        await prisma.reseller.deleteMany({});
        // Note: We avoid deleting Tiers to keep IDs stable if possible, but for nuclear test we can recreate.
        await prisma.resellerTier.deleteMany({});
        console.log("✅ Cleared reseller tables.");
    } catch (e) {
        console.warn("⚠️  Table might be empty or constrained:", e);
    }

    // 2. CREATE TIERS
    console.log("🏆 Creating Reseller Tiers...");
    const tiers = [
        { name: "Starter", min_vendors: 0, commission_rate: 10.0, monthly_revenue_threshold: 0, bonus_percentage: 0 },
        { name: "Growth", min_vendors: 5, commission_rate: 15.0, monthly_revenue_threshold: 50000, bonus_percentage: 2.0 },
        { name: "Empire", min_vendors: 20, commission_rate: 25.0, monthly_revenue_threshold: 200000, bonus_percentage: 5.0 }
    ];

    const createdTiers = [];
    for (const tier of tiers) {
        const t = await prisma.resellerTier.create({ data: tier });
        createdTiers.push(t);
    }
    console.log("✅ Created 3 Tiers.");

    // 3. GENERATE 500 RESELLERS
    console.log("👥 Generating 500 Resellers...");

    const statuses = ["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"];
    const kycStatuses = ["VERIFIED", "SUBMITTED", "NONE", "REJECTED"];
    const names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Omega", "Prime", "Elite", "Pro"];
    const industries = ["Marketing", "Tech", "Retail", "Services", "Agency", "Consulting"];

    const batchSize = 50;
    const resellers = [];

    for (let i = 0; i < 500; i++) {
        const tier = createdTiers[Math.floor(Math.random() * createdTiers.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const kyc = kycStatuses[Math.floor(Math.random() * kycStatuses.length)];

        const companyBase = names[Math.floor(Math.random() * names.length)];
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const companyName = `${companyBase} ${industry} ${i + 1}`;

        // Random Risk Score (skewed towards low risk)
        let riskScore = Math.floor(Math.random() * 20); // Mostly safe
        if (Math.random() > 0.9) riskScore = Math.floor(Math.random() * 80) + 20; // Some risky

        // Random Revenue
        const walletBalance = Math.floor(Math.random() * 50000);

        resellers.push({
            name: `Partner ${i + 1}`,
            email: `partner${i + 1}@nuclear-test.com`,
            password_hash: "$2b$10$EpMq.j/w0/T/k/e.g/e.g/e.g/e.g/e.g/e.g/e.g/e.g/e.g", // Dummy hash
            business_name: companyName,
            status: status,
            kyc_status: kyc,
            referral_code: `REF${i + 1}-${Math.floor(Math.random() * 1000)}`,
            wallet_balance: walletBalance,
            risk_score: riskScore,
            tier_id: tier.id,
            brand_name: companyName,
            primary_color: Math.random() > 0.5 ? "#0F172A" : "#3B82F6",
            // custom_domain: i % 10 === 0 ? `partner${i+1}.white-label.com` : null, // 10% have domains
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
        });

        if (resellers.length >= batchSize) {
            // Processing batch
            // Note: relations like 'monthly_stats' are hard to batch create with 'createMany' if checking relations.
            // But we can create resellers first.
            await prisma.reseller.createMany({ data: resellers });
            resellers.length = 0;
            process.stdout.write(`\r✅ Forged ${i + 1} resellers...`);
        }
    }

    // Remaining
    if (resellers.length > 0) {
        await prisma.reseller.createMany({ data: resellers });
    }

    console.log(`\n🎉 SEED COMPLETE! Created 500 Resellers.`);

    // 4. GENERATE MONTHLY STATS (for dashboard charts)
    // We need ids of created resellers.
    console.log("📊 Generating Monthly Stats...");
    const allResellers = await prisma.reseller.findMany({ select: { id: true, business_name: true } });

    const statsData = [];
    const currentYear = new Date().getFullYear();

    for (const res of allResellers) {
        // Generate stats for last 6 months
        for (let m = 1; m <= 6; m++) {
            // 50% chance to have stats
            if (Math.random() > 0.5) {
                statsData.push({
                    reseller_id: res.id,
                    month: m,
                    year: currentYear,
                    total_revenue: Math.floor(Math.random() * 100000),
                    net_profit: Math.floor(Math.random() * 20000),
                    bonus_earned: Math.floor(Math.random() * 5000)
                });
            }
        }

        if (statsData.length >= 500) {
            await prisma.resellerMonthlyStats.createMany({ data: statsData });
            statsData.length = 0;
        }
    }

    if (statsData.length > 0) {
        await prisma.resellerMonthlyStats.createMany({ data: statsData });
    }

    console.log("✅ Stats Generated.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
