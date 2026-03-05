/**
 * GST Report Service - Monthly GST Report Generation
 * 
 * Handles:
 * - Monthly GST report generation
 * - Report finalization
 * - PDF export (placeholder)
 * - Excel export (placeholder)
 */

import { prisma } from "../db";
import { GSTService } from "./gst-service";

export class GSTReportService {
    /**
     * Generate monthly GST report
     * Wrapper around GSTService.generateMonthlyReport with additional features
     */
    static async generateReport(month: number, year: number, adminId?: string) {
        return await GSTService.generateMonthlyReport(month, year, adminId);
    }

    /**
     * Get report by ID
     */
    static async getReport(reportId: string) {
        return await prisma.gSTReport.findUnique({
            where: { id: reportId }
        });
    }

    /**
     * Get report by month and year
     */
    static async getReportByPeriod(month: number, year: number) {
        return await prisma.gSTReport.findUnique({
            where: {
                month_year: {
                    month,
                    year
                }
            }
        });
    }

    /**
     * Get all reports
     */
    static async getAllReports(options?: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (options?.status) {
            where.status = options.status;
        }

        const [reports, total] = await Promise.all([
            prisma.gSTReport.findMany({
                where,
                orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.gSTReport.count({ where })
        ]);

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Finalize a report
     */
    static async finalizeReport(reportId: string, adminId: string) {
        return await GSTService.finalizeReport(reportId, adminId);
    }

    /**
     * Add notes to a report
     */
    static async addNotes(reportId: string, notes: string, adminId: string) {
        const report = await prisma.gSTReport.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            throw new Error('Report not found');
        }

        return await prisma.gSTReport.update({
            where: { id: reportId },
            data: {
                notes,
                generated_by: adminId
            }
        });
    }

    /**
     * Get detailed invoice breakdown for a report
     */
    static async getReportInvoices(reportId: string) {
        const report = await this.getReport(reportId);

        if (!report) {
            throw new Error('Report not found');
        }

        const startDate = new Date(report.year, report.month - 1, 1);
        const endDate = new Date(report.year, report.month, 0, 23, 59, 59);

        return await prisma.invoice.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'ACTIVE',
                payment_status: 'PAID'
            },
            include: {
                workspace: {
                    select: {
                        name: true,
                        business_name: true
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });
    }

    /**
     * Generate PDF for report (Placeholder)
     * 
     * TODO: Implement actual PDF generation
     */
    static async generatePDF(reportId: string): Promise<string> {
        const report = await this.getReport(reportId);

        if (!report) {
            throw new Error('Report not found');
        }

        // TODO: Implement actual PDF generation
        const pdfUrl = `/reports/GST-${report.year}-${String(report.month).padStart(2, '0')}.pdf`;

        await prisma.gSTReport.update({
            where: { id: reportId },
            data: {
                pdf_url: pdfUrl
            }
        });

        console.log(`📄 GST Report PDF generated: ${pdfUrl}`);

        return pdfUrl;
    }

    /**
     * Export report to Excel (Placeholder)
     * 
     * TODO: Implement actual Excel export using exceljs or similar
     */
    static async exportToExcel(reportId: string): Promise<string> {
        const report = await this.getReport(reportId);

        if (!report) {
            throw new Error('Report not found');
        }

        // TODO: Implement actual Excel export
        const excelUrl = `/reports/GST-${report.year}-${String(report.month).padStart(2, '0')}.xlsx`;

        console.log(`📊 GST Report Excel generated: ${excelUrl}`);

        return excelUrl;
    }

    /**
     * Get report HTML for preview
     */
    static getReportHTML(report: any, invoices?: any[]): string {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthName = monthNames[report.month - 1];

        let invoiceRows = '';
        if (invoices && invoices.length > 0) {
            invoiceRows = invoices.map((inv, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${inv.invoice_number}</td>
          <td>${new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
          <td>${inv.billing_name}</td>
          <td>${inv.billing_gstin || 'N/A'}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.net_amount))}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.cgst_amount))}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.sgst_amount))}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.igst_amount))}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.gst_amount))}</td>
          <td style="text-align: right;">${GSTService.formatINR(Number(inv.total_amount))}</td>
        </tr>
      `).join('');
        }

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>GST Report - ${monthName} ${report.year}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background-color: #f9f9f9; padding: 20px; margin-bottom: 30px; border-radius: 5px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .summary-item { padding: 10px; }
          .summary-item label { font-weight: bold; display: block; margin-bottom: 5px; }
          .summary-item value { font-size: 1.2em; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total-row { background-color: #e5e7eb; font-weight: bold; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .status-draft { background-color: #fef3c7; color: #92400e; }
          .status-finalized { background-color: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GST REPORT</h1>
          <h2>${monthName} ${report.year}</h2>
          <p>
            <span class="status-badge status-${report.status.toLowerCase()}">
              ${report.status}
            </span>
          </p>
          <p>Generated on: ${new Date(report.generated_at).toLocaleDateString('en-IN')}</p>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <label>Total Sales (Before GST):</label>
              <value>${GSTService.formatINR(Number(report.total_sales))}</value>
            </div>
            <div class="summary-item">
              <label>Total GST Collected:</label>
              <value>${GSTService.formatINR(Number(report.total_gst))}</value>
            </div>
            <div class="summary-item">
              <label>CGST (9%):</label>
              <value>${GSTService.formatINR(Number(report.total_cgst))}</value>
            </div>
            <div class="summary-item">
              <label>SGST (9%):</label>
              <value>${GSTService.formatINR(Number(report.total_sgst))}</value>
            </div>
            <div class="summary-item">
              <label>IGST (18%):</label>
              <value>${GSTService.formatINR(Number(report.total_igst))}</value>
            </div>
            <div class="summary-item">
              <label>Total Invoices:</label>
              <value>${report.invoice_count}</value>
            </div>
          </div>
        </div>
        
        ${invoices && invoices.length > 0 ? `
          <h3>Invoice Details</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th>GSTIN</th>
                <th>Taxable Amount</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>IGST</th>
                <th>Total GST</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceRows}
              <tr class="total-row">
                <td colspan="5" style="text-align: right;">TOTAL:</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_sales))}</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_cgst))}</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_sgst))}</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_igst))}</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_gst))}</td>
                <td style="text-align: right;">${GSTService.formatINR(Number(report.total_sales) + Number(report.total_gst))}</td>
              </tr>
            </tbody>
          </table>
        ` : ''}
        
        ${report.notes ? `
          <div style="margin-top: 30px;">
            <h3>Notes:</h3>
            <p>${report.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
          <p>This is a system-generated report for ${GSTService.COMPANY_NAME}</p>
          <p>GSTIN: ${GSTService.COMPANY_GSTIN}</p>
        </div>
      </body>
      </html>
    `;
    }
}
