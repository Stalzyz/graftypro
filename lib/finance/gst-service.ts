import { prisma } from "../db";
import { SystemConfigService } from "../services/system-config-service";

export class GSTService {
    // Default / Fallback Rates
    static readonly GST_RATE = 0.18;
    static readonly CGST_RATE = 0.09;
    static readonly SGST_RATE = 0.09;
    static readonly IGST_RATE = 0.18;

    /**
     * Calculate GST breakdown based on customer state
     */
    static async calculateGST(netAmount: number, customerState: string) {
        const config = await SystemConfigService.getConfig();
        const companyState = config.company_state || "Karnataka";

        // Dynamic Tax Configuration
        const taxConfig = (config as any).tax_config || {};
        const GST_RATE = Number(taxConfig.gst_rate) || 0.18;
        const CGST_RATE = Number(taxConfig.cgst_rate) || 0.09;
        const SGST_RATE = Number(taxConfig.sgst_rate) || 0.09;
        const IGST_RATE = Number(taxConfig.igst_rate) || 0.18;

        const isSameState = customerState.toLowerCase().trim() === companyState.toLowerCase().trim();
        const gstAmount = netAmount * GST_RATE;

        if (isSameState) {
            return {
                net_amount: netAmount,
                cgst: netAmount * CGST_RATE,
                sgst: netAmount * SGST_RATE,
                igst: 0,
                cgst_rate: CGST_RATE,
                sgst_rate: SGST_RATE,
                igst_rate: 0,
                gst_total: gstAmount,
                total_amount: netAmount + gstAmount,
                is_same_state: true
            };
        } else {
            return {
                net_amount: netAmount,
                cgst: 0,
                sgst: 0,
                igst: netAmount * IGST_RATE,
                cgst_rate: 0,
                sgst_rate: 0,
                igst_rate: IGST_RATE,
                gst_total: gstAmount,
                total_amount: netAmount + gstAmount,
                is_same_state: false
            };
        }
    }

    static validateGSTIN(gstin: string): boolean {
        if (!gstin) return false;
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstinRegex.test(gstin.replace(/\s/g, '').toUpperCase());
    }

    static formatINR(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    static numberToWords(amount: number): string {
        // Implementation remains similar but simplified
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (amount === 0) return 'Zero Rupees Only';

        let rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);

        let words = '';
        if (rupees >= 10000000) { words += ones[Math.floor(rupees / 10000000)] + ' Crore '; rupees %= 10000000; }
        if (rupees >= 100000) { words += ones[Math.floor(rupees / 100000)] + ' Lakh '; rupees %= 100000; }
        if (rupees >= 1000) { words += ones[Math.floor(rupees / 1000)] + ' Thousand '; rupees %= 1000; }
        if (rupees >= 100) { words += ones[Math.floor(rupees / 100)] + ' Hundred '; rupees %= 100; }
        if (rupees >= 20) { words += tens[Math.floor(rupees / 10)] + ' '; rupees %= 10; }
        if (rupees >= 10) { words += teens[rupees - 10] + ' '; rupees = 0; }
        if (rupees > 0) { words += ones[rupees] + ' '; }

        words += 'Rupees';
        if (paise > 0) words += ' and ' + paise + ' Paise';
        words += ' Only';

        return words.trim();
    }
}
