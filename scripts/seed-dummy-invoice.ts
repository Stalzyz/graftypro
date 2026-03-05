
import { prisma } from "../lib/db";
import { InvoiceService } from "../lib/finance/invoice-service";

async function seedDummyInvoice() {
    console.log("🌱 Seeding Dummy Invoice...");

    try {
        const workspace = await prisma.workspace.findFirst({
            select: { id: true }
        });

        if (!workspace) {
            console.error("❌ No workspace found. Please create a vendor first.");
            process.exit(1);
        }

        const invoice = await InvoiceService.createInvoice({
            workspaceId: workspace.id,
            billingDetails: {
                name: "Acme Corp (Dummy Customer)",
                address: "123 Business Road, Mumbai, Maharashtra",
                state: "Maharashtra",
                pincode: "400001",
                gstin: "27AAAAA0000A1Z5"
            },
            items: [
                {
                    description: "Enterprise Subscription - 1 Year",
                    hsn_code: "998311",
                    quantity: 1,
                    rate: 45000,
                    taxable_value: 45000
                },
                {
                    description: "Onboarding & Training",
                    hsn_code: "998311",
                    quantity: 1,
                    rate: 5000,
                    taxable_value: 5000
                }
            ],
            paymentMethod: "BANK_TRANSFER",
            status: "PAID"
        });

        console.log(`✅ Dummy Invoice Created: ${invoice.invoice_number}`);
        console.log(`🔗 Preview: http://localhost:3000/api/super-admin/finance/invoices/${encodeURIComponent(invoice.invoice_number)}/preview`);
        console.log(`📥 PDF: http://localhost:3000/api/super-admin/finance/invoices/${encodeURIComponent(invoice.invoice_number)}/pdf`);

    } catch (error) {
        console.error("❌ Error seeding invoice:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDummyInvoice();
