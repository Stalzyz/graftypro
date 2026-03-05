
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting Nuclear Finance Seed (JS Version)...");

    // 1. CLEAR EXISTING FINANCIAL DATA
    console.log("☢️  Clearing existing invoices and ledgers...");
    try {
        await prisma.invoiceItem.deleteMany({});
        await prisma.invoice.deleteMany({});
        await prisma.resellerLedger.deleteMany({});
        // Optional: clear sequences to reset invoice numbers
        await prisma.invoiceSequence.deleteMany({});
        console.log("✅ Cleared financial tables.");
    } catch (e) {
        console.warn("⚠️  Tables might be empty or locked:", e);
    }

    // 2. ENSURE BASE ENTITIES (Resellers & Workspaces)
    console.log("🔍 Verifying base entities...");
    let resellers = await prisma.reseller.findMany();
    if (resellers.length < 5) {
        console.log("🌱 Seeding Resellers...");
        // Create 10 resellers if not enough
        for (let i = 0; i < 10; i++) {
            resellers.push(await prisma.reseller.create({
                data: {
                    name: `Reseller ${i + 1}`,
                    email: `reseller${i + 1}@example.com`,
                    referral_code: `RES${i + 1}${Math.floor(Math.random() * 1000)}`,
                    status: "ACTIVE",
                    kyc_status: "VERIFIED"
                }
            }));
        }
    }

    let workspaces = await prisma.workspace.findMany();
    if (workspaces.length < 10) {
        console.log("🌱 Seeding Workspaces...");
        // Create 20 workspaces
        for (let i = 0; i < 20; i++) {
            workspaces.push(await prisma.workspace.create({
                data: {
                    name: `Vendor Corp ${i + 1}`,
                    id: randomUUID(), // using uuid default in schema but ensuring manual creation implies id
                    // minimal required fields
                    owner_id: "SYSTEM", // Placeholder if owner required, usually handled via relation
                }
            }));
        }
        // Refetch to be safe about required fields structure (assuming minimal seeding passed)
        workspaces = await prisma.workspace.findMany();
    }

    // Fallback if workspace creation failed due to required fields I missed in quick look
    // effectively we need at least one workspace.
    if (workspaces.length === 0) {
        console.error("❌ No Workspaces found. Please seed basic user/workspace data first.");
        return;
    }

    // 3. GENERATE 5000 INVOICES
    console.log("💸 Generating 5000 Invoices (Monster Load)...");

    // Configurations
    const currentYear = new Date().getFullYear();
    const states = ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat", "Telangana"];
    const companyState = "Maharashtra"; // Origin state (for IGST logic)

    const invoices = [];
    const BATCH_SIZE = 100;

    // We will generate invoices for 2024, 2025, 2026
    const years = [currentYear - 1, currentYear];

    let grandTotal = 0;

    for (let i = 0; i < 5000; i++) {
        const workspace = workspaces[Math.floor(Math.random() * workspaces.length)];
        const reseller = Math.random() > 0.7 ? resellers[Math.floor(Math.random() * resellers.length)] : null;

        // Random Date Distribution
        const year = years[Math.floor(Math.random() * years.length)];
        const month = Math.floor(Math.random() * 12); // 0-11
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(year, month, day);

        // financials
        const baseAmount = Math.floor(Math.random() * 50000) + 1000; // 1k to 51k
        const isInterState = Math.random() > 0.4; // 60% chance same state
        const customerState = isInterState ? states[Math.floor(Math.random() * states.length)] : companyState;

        let cgst = 0, sgst = 0, igst = 0;

        if (customerState === companyState) {
            cgst = Number((baseAmount * 0.09).toFixed(2));
            sgst = Number((baseAmount * 0.09).toFixed(2));
        } else {
            igst = Number((baseAmount * 0.18).toFixed(2));
        }

        const gstTotal = cgst + sgst + igst;
        const totalAmount = baseAmount + gstTotal;
        grandTotal += totalAmount;

        const invNumber = `INV-${year}-${(i + 1).toString().padStart(6, '0')}`;
        const invHash = Buffer.from(invNumber + totalAmount).toString('base64');

        // B2B vs B2C
        const isB2B = Math.random() > 0.3;
        const gstin = isB2B ? `27ABCDE${Math.floor(Math.random() * 1000)}F1Z5` : null;

        invoices.push({
            invoice_number: invNumber,
            workspace_id: workspace.id,
            reseller_id: reseller?.id || null,

            net_amount: baseAmount,
            gst_amount: gstTotal,
            cgst_amount: cgst,
            sgst_amount: sgst,
            igst_amount: igst,
            total_amount: totalAmount,

            hsn_code: "998311",
            place_of_supply: customerState,

            billing_name: workspace.name,
            billing_address: "123 Business Park, Sector 4",
            billing_state: customerState,
            billing_pincode: "400001",
            billing_gstin: gstin,
            customer_type: isB2B ? "B2B" : "B2C",

            company_name: "Grekam Academy",
            company_state: companyState,

            invoice_hash: invHash,
            payment_status: "PAID",
            status: "ACTIVE",
            created_at: date,
            updated_at: date
        });

        if (invoices.length >= BATCH_SIZE) {
            await prisma.invoice.createMany({ data: invoices });
            process.stdout.write(`\r✅ Injected ${i + 1} invoices...`);
            invoices.length = 0;
        }
    }

    // Flush remaining
    if (invoices.length > 0) {
        await prisma.invoice.createMany({ data: invoices });
    }

    console.log(`\n🎉 SEED COMPLETE! Generated ~5000 invoices with Total Revenue: ₹${grandTotal.toLocaleString()}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
