
/**
 * Ensures a media URL is absolute for external services like Meta Cloud API.
 * If the URL is relative (starts with /), it prefixes it with the application's base URL.
 */
export function getAbsoluteMediaUrl(url: string | null | undefined, request?: Request): string {
    if (!url) return "";

    // Use environment variable if available
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Safety check: if baseUrl exists but lacks protocol, prepend https://
    if (baseUrl && !baseUrl.startsWith("http")) {
        baseUrl = `https://${baseUrl}`;
    }

    // Clean up baseUrl: remove trailing slash
    const cleanBase = baseUrl?.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // If it's already an absolute URL...
    if (url.startsWith("http")) {
        // FORCE HTTPS for production security (Prevent Mixed Content)
        let secureUrl = url;
        if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
            secureUrl = url.replace("http://", "https://");
        }

        // ...but it's a localhost or internal IP that Meta can't reach, we must fix it
        if (cleanBase && (secureUrl.includes("localhost") || secureUrl.includes("127.0.0.1") || secureUrl.includes("0.0.0.0"))) {
            const relativePart = secureUrl.split("/").slice(3).join("/");
            const fixed = `${cleanBase}/${relativePart}`;
            console.log(`[URL_RESOLVE] Local-to-Public: ${secureUrl} -> ${fixed}`);
            return fixed;
        }
        return secureUrl;
    }

    if (cleanBase) {
        const absolute = `${cleanBase}${url.startsWith("/") ? url : "/" + url}`;
        console.log(`[URL_RESOLVE] Env-based: ${url} -> ${absolute}`);
        return absolute;
    }

    // 3. Fallback to request-based discovery (Most accurate for dynamic domains)
    if (request) {
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
        if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
            const absolute = `${protocol}://${host}${url.startsWith("/") ? url : "/" + url}`;
            console.log(`[URL_RESOLVE] Dynamic-Request: ${url} -> ${absolute}`);
            return absolute;
        }
    }

    // 4. Final Hardcoded Fallback for Production
    const finalBase = cleanBase || "https://grafty.pro";
    const fallback = `${finalBase}${url.startsWith("/") ? url : "/" + url}`;
    console.log(`[URL_RESOLVE] Final-Fallback: ${url} -> ${fallback}`);
    return fallback;
}
