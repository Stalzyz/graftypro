import { prisma } from "../db";
import { encrypt, decrypt } from "../security/encryption";

export class SystemConfigService {
    static async getConfig() {
        let config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        if (!config) {
            config = await prisma.systemConfig.create({
                data: { id: "global" }
            });
        }

        return config;
    }

    static async updateConfig(data: any) {
        // Enforce encryption for sensitive fields
        const encryptedData = { ...data };

        // Sanitize data: Remove non-updatable fields and potential frontend pollution
        const nonUpdatableFields = ['id', 'created_at', 'updated_at', 'error'];
        nonUpdatableFields.forEach(field => delete encryptedData[field]);

        if (data.meta_app_secret) {
            encryptedData.meta_app_secret_enc = encrypt(data.meta_app_secret);
            delete encryptedData.meta_app_secret;
        }

        if (data.meta_system_token) {
            encryptedData.meta_system_token_enc = encrypt(data.meta_system_token);
            delete encryptedData.meta_system_token;
        }

        if (data.meta_permanent_token) {
            encryptedData.meta_permanent_token_enc = encrypt(data.meta_permanent_token);
            delete encryptedData.meta_permanent_token;
        }

        if (data.smtp_pass) {
            encryptedData.smtp_pass_enc = encrypt(data.smtp_pass);
            delete encryptedData.smtp_pass;
        }

        if (data.google_client_secret) {
            encryptedData.google_client_secret_enc = encrypt(data.google_client_secret);
            delete encryptedData.google_client_secret;
        }

        if (data.facebook_client_secret) {
            encryptedData.facebook_client_secret_enc = encrypt(data.facebook_client_secret);
            delete encryptedData.facebook_client_secret;
        }

        if (data.pusher_secret) {
            encryptedData.pusher_secret_enc = encrypt(data.pusher_secret);
            delete encryptedData.pusher_secret;
        }

        return await prisma.systemConfig.update({
            where: { id: "global" },
            data: encryptedData
        });
    }

    static async getDecryptedSecrets() {
        const config = await this.getConfig();
        return {
            meta_app_secret: config.meta_app_secret_enc ? decrypt(config.meta_app_secret_enc) : null,
            meta_system_token: config.meta_system_token_enc ? decrypt(config.meta_system_token_enc) : null,
            meta_permanent_token: config.meta_permanent_token_enc ? decrypt(config.meta_permanent_token_enc) : null,
            smtp_pass: config.smtp_pass_enc ? decrypt(config.smtp_pass_enc) : null,
            google_client_secret: config.google_client_secret_enc ? decrypt(config.google_client_secret_enc) : null,
            facebook_client_secret: config.facebook_client_secret_enc ? decrypt(config.facebook_client_secret_enc) : null,
            pusher_secret: config.pusher_secret_enc ? decrypt(config.pusher_secret_enc) : null
        };
    }

    static async getPublicConfig() {
        const config = await this.getConfig();
        return {
            platform_name: config.platform_name,
            platform_tagline: config.platform_tagline,
            logo_url: config.logo_url,
            dark_logo_url: config.dark_logo_url,
            favicon_url: config.favicon_url,
            primary_color: config.primary_color,
            secondary_color: config.secondary_color,
            theme_mode: config.theme_mode,
            landing_page_config: config.landing_page_config,
            social_links: config.social_links,
            features: config.features,
            support_email: config.support_email,
            support_whatsapp: config.support_whatsapp,
            meta_phone_id: config.meta_phone_id,
            meta_app_id: config.meta_app_id,
            meta_config_id: config.meta_config_id,
            google_client_id: config.google_client_id,
            facebook_client_id: config.facebook_client_id,
            pusher_app_id: config.pusher_app_id,
            pusher_key: config.pusher_key,
            pusher_cluster: config.pusher_cluster
        };
    }
}
