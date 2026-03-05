
import { prisma } from "../db";
import { parse } from "json2csv";

export class FinanceReportService {
    /**
     * Generate B2B GST Report (Customers with GSTIN)
     */
    static async generateB2BReport(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const invoices = await prisma.invoice.findMany({
            where: {
                created_at: { gte: startDate, lte: endDate },
                billing_gstin: { not: null },
                status: "ACTIVE"
            },
            include: { items: true }
        });

        if (invoices.length === 0) {
            return "Invoice Number,Invoice Date,Customer Name,Customer GSTIN,Place of Supply,Reverse Charge,Taxable Value,CGST Amount,SGST Amount,IGST Amount,Total Invoice Value";
        }

        const data = invoices.map(inv => ({
            "Invoice Number": inv.invoice_number,
            "Invoice Date": inv.created_at.toISOString().split('T')[0],
            "Customer Name": inv.billing_name,
            "Customer GSTIN": inv.billing_gstin || "-",
            "Place of Supply": inv.place_of_supply,
            "Reverse Charge": inv.is_reverse_charge ? "Y" : "N",
            "Taxable Value": Number(inv.net_amount),
            "CGST Amount": Number(inv.cgst_amount),
            "SGST Amount": Number(inv.sgst_amount),
            "IGST Amount": Number(inv.igst_amount),
            "Total Invoice Value": Number(inv.total_amount)
        }));

        const fields = ["Invoice Number", "Invoice Date", "Customer Name", "Customer GSTIN", "Place of Supply", "Reverse Charge", "Taxable Value", "CGST Amount", "SGST Amount", "IGST Amount", "Total Invoice Value"];
        return parse(data, { fields });
    }

    /**
     * Generate B2C GST Report (Customers without GSTIN)
     */
    static async generateB2CReport(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const invoices = await prisma.invoice.findMany({
            where: {
                created_at: { gte: startDate, lte: endDate },
                billing_gstin: null,
                status: "ACTIVE"
            }
        });

        if (invoices.length === 0) {
            return "Invoice Number,Invoice Date,Place of Supply,Taxable Value,CGST Amount,SGST Amount,IGST Amount,Total Invoice Value";
        }

        const data = invoices.map(inv => ({
            "Invoice Number": inv.invoice_number,
            "Invoice Date": inv.created_at.toISOString().split('T')[0],
            "Place of Supply": inv.place_of_supply,
            "Taxable Value": Number(inv.net_amount),
            "CGST Amount": Number(inv.cgst_amount),
            "SGST Amount": Number(inv.sgst_amount),
            "IGST Amount": Number(inv.igst_amount),
            "Total Invoice Value": Number(inv.total_amount)
        }));

        const fields = ["Invoice Number", "Invoice Date", "Place of Supply", "Taxable Value", "CGST Amount", "SGST Amount", "IGST Amount", "Total Invoice Value"];
        return parse(data, { fields });
    }

    /**
     * HSN Summary Report
     */
    static async generateHSNSummary(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const [items, config] = await Promise.all([
            prisma.invoiceItem.findMany({
                where: {
                    invoice: {
                        created_at: { gte: startDate, lte: endDate },
                        status: "ACTIVE"
                    }
                }
            }),
            prisma.systemConfig.findUnique({ where: { id: "global" } })
        ]);

        const defHsn = (config?.tax_config as any)?.hsn_code || "998311";

        // Group by HSN
        const hsnGroup: any = {};
        items.forEach(item => {
            const hsn = item.hsn_code || defHsn;
            if (!hsnGroup[hsn]) {
                hsnGroup[hsn] = {
                    "HSN/SAC": hsn,
                    "Description": item.description,
                    "UQC": "OTH",
                    "Total Quantity": 0,
                    "Total Taxable Value": 0,
                    "Total CGST": 0,
                    "Total SGST": 0,
                    "Total IGST": 0,
                    "Total GST": 0
                };
            }
            hsnGroup[hsn]["Total Quantity"] += Number(item.quantity);
            hsnGroup[hsn]["Total Taxable Value"] += Number(item.taxable_value);
            hsnGroup[hsn]["Total CGST"] += Number(item.cgst_amount);
            hsnGroup[hsn]["Total SGST"] += Number(item.sgst_amount);
            hsnGroup[hsn]["Total IGST"] += Number(item.igst_amount);
            hsnGroup[hsn]["Total GST"] += Number(item.cgst_amount) + Number(item.sgst_amount) + Number(item.igst_amount);
        });

        const rows = Object.values(hsnGroup);
        if (rows.length === 0) {
            return "HSN/SAC,Description,UQC,Total Quantity,Total Taxable Value,Total CGST,Total SGST,Total IGST,Total GST";
        }

        const fields = ["HSN/SAC", "Description", "UQC", "Total Quantity", "Total Taxable Value", "Total CGST", "Total SGST", "Total IGST", "Total GST"];
        return parse(rows, { fields });
    }

    /**
     * Lock accounting month to prevent modifications
     */
    static async lockMonth(month: number, year: number) {
        return await prisma.financeConfig.upsert({
            where: { id: "global" },
            update: {
                last_locked_month: month,
                last_locked_year: year
            },
            create: {
                id: "global",
                last_locked_month: month,
                last_locked_year: year
            }
        });
    }

    static async isMonthLocked(date: Date) {
        const config = await prisma.financeConfig.findUnique({ where: { id: "global" } });
        if (!config || !config.last_locked_month || !config.last_locked_year) return false;

        const lockedDate = new Date(config.last_locked_year, config.last_locked_month - 1, 1);
        // If the date is in or before the locked month, it's locked
        return date < new Date(config.last_locked_year, config.last_locked_month, 1);
    }

    static async getLastLockedMonth() {
        return await prisma.financeConfig.findUnique({ where: { id: "global" } });
    }
}
