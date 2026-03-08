import crypto from 'crypto';
import { prisma } from '../db';

export interface PhonePeConfig {
    merchantId: string;
    saltKey: string;
    saltIndex: string;
    env?: 'UAT' | 'PROD';
}

export class PhonePeManager {
    private static getBaseUrl(env: 'UAT' | 'PROD' = 'PROD') {
        return env === 'UAT'
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
            : 'https://api.phonepe.com/apis/hermes';
    }

    /**
     * Generate SHA256 Checksum for PhonePe API
     */
    private static generateChecksum(payload: string, saltKey: string, saltIndex: string, endpoint: string) {
        const data = payload + endpoint + saltKey;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        return `${hash}###${saltIndex}`;
    }

    /**
     * Fetch PhonePe config for a workspace from Integration table
     */
    static async getConfigForWorkspace(workspaceId: string): Promise<PhonePeConfig> {
        const integration = await prisma.integration.findUnique({
            where: {
                workspace_id_type: {
                    workspace_id: workspaceId,
                    type: 'PHONEPE' as any
                }
            }
        });

        if (!integration || !integration.is_active) {
            throw new Error('PhonePe integration not found or inactive for this workspace.');
        }

        const { merchant_id, salt_key, salt_index, env } = integration.credentials as any;
        return { merchantId: merchant_id, saltKey: salt_key, saltIndex: salt_index, env: env || 'PROD' };
    }

    /**
     * Create a payment link using workspace credentials (for Flow executor)
     */
    static async createPaymentLinkForWorkspace(
        workspaceId: string,
        amount: number,
        merchantTransactionId: string,
        merchantUserId: string,
        callbackUrl: string,
        redirectUrl: string,
        mobileNumber?: string
    ) {
        const config = await this.getConfigForWorkspace(workspaceId);
        return this.createPaymentLink(config, amount, merchantTransactionId, merchantUserId, callbackUrl, redirectUrl, mobileNumber);
    }

    /**
     * Create a Standard Payment Link (Redirect Flow)
     */
    static async createPaymentLink(
        config: PhonePeConfig,
        amount: number, // In Rupee
        merchantTransactionId: string,
        merchantUserId: string,
        callbackUrl: string,
        redirectUrl: string,
        mobileNumber?: string
    ) {
        const endpoint = '/pg/v1/pay';
        const payload = {
            merchantId: config.merchantId,
            merchantTransactionId,
            merchantUserId,
            amount: Math.round(amount * 100), // Convert to paise
            redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl,
            mobileNumber,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const checksum = this.generateChecksum(base64Payload, config.saltKey, config.saltIndex, endpoint);

        const response = await fetch(`${this.getBaseUrl(config.env)}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            body: JSON.stringify({ request: base64Payload })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'PhonePe Payment Initiation Failed');
        }

        return {
            transactionId: result.data.merchantTransactionId,
            redirectUrl: result.data.instrumentResponse.redirectInfo.url
        };
    }

    /**
     * Verify Payment Status
     */
    static async verifyStatus(config: PhonePeConfig, merchantTransactionId: string) {
        const endpoint = `/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
        const checksum = this.generateChecksum('', config.saltKey, config.saltIndex, endpoint);

        const response = await fetch(`${this.getBaseUrl(config.env)}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': config.merchantId
            }
        });

        const result = await response.json();
        return result;
    }
}
