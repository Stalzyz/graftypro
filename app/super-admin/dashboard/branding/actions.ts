"use server";

import { requireSuperAdmin } from "../../../../lib/admin-auth";
import { ImageUploadService } from "../../../../lib/services/upload";
import { SystemConfigService } from "../../../../lib/services/system-config-service";

/**
 * SERVER ACTION: Upload branding image for Super Admin.
 * 
 * WHY A SERVER ACTION:
 * Server Actions run entirely on the server, read cookies() natively via Next.js,
 * and bypass all middleware auth complexity. This is the most atomic, reliable
 * approach — no fetch(), no tokens in headers, no middleware dependencies.
 */
export async function uploadBrandingImage(formData: FormData): Promise<{
    success: boolean;
    url?: string;
    error?: string;
}> {
    console.log("[SERVER-ACTION] uploadBrandingImage Triggered");
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = cookies();
        const adminToken = cookieStore.get("admin_token")?.value;
        console.log(`[SERVER-ACTION] admin_token cookie: ${adminToken ? "PRESENT (size: " + adminToken.length + ")" : "MISSING"}`);
        
        // Auth: reads admin_token cookie directly from the server request context
        await requireSuperAdmin();
        console.log("[SERVER-ACTION] requireSuperAdmin passed");
    } catch (e: any) {
        console.error("[SERVER-ACTION] requireSuperAdmin FAILED:", e.message || e);
        return { success: false, error: `Unauthorized: ${e.message || "Please log in"}` };
    }

    const file = formData.get("file");
    if (!file || typeof (file as any).arrayBuffer !== "function") {
        return { success: false, error: "No valid file provided." };
    }

    try {
        const result = await ImageUploadService.uploadImage(file as File, {
            module: "branding",
            tenantId: "admin_root",
            maxSize: 50 * 1024 * 1024,
        });
        return { success: true, url: result.url };
    } catch (err: any) {
        return { success: false, error: err.message || "Upload failed." };
    }
}

/**
 * SERVER ACTION: Save Super Admin branding config.
 */
export async function saveBrandingConfig(config: Record<string, any>): Promise<{
    success: boolean;
    error?: string;
}> {
    console.log("[SERVER-ACTION] saveBrandingConfig Triggered");
    try {
        await requireSuperAdmin();
        console.log("[SERVER-ACTION] saveBrandingConfig Auth PASSED");
    } catch (e: any) {
        console.error("[SERVER-ACTION] saveBrandingConfig Auth FAILED:", e.message || e);
        return { success: false, error: `Unauthorized: ${e.message || "Please log in"}` };
    }

    try {
        await SystemConfigService.updateConfig(config);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Save failed." };
    }
}

/**
 * SERVER ACTION: Load branding config.
 */
export async function loadBrandingConfig(): Promise<Record<string, any>> {
    console.log("[SERVER-ACTION] loadBrandingConfig Triggered");
    try {
        await requireSuperAdmin();
        console.log("[SERVER-ACTION] loadBrandingConfig Auth PASSED");
        return await SystemConfigService.getConfig();
    } catch (e: any) {
        console.error("[SERVER-ACTION] loadBrandingConfig Auth FAILED:", e || "Unauthorized");
        return {};
    }
}
