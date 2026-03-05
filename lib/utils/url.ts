
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
        // ...but it's a localhost or internal IP that Meta can't reach, we must fix it
        if (cleanBase && (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("0.0.0.0"))) {
            const relativePart = url.split("/").slice(3).join("/");
            const fixed = `${cleanBase}/${relativePart}`;
            console.log(`[URL_RESOLVE] Local-to-Public: ${url} -> ${fixed}`);
            return fixed;
        }
        return url;
    }

    if (cleanBase) {
        const absolute = `${cleanBase}${url.startsWith("/") ? url : "/" + url}`;
        console.log(`[URL_RESOLVE] Env-based: ${url} -> ${absolute}`);
        return absolute;
    }

    // fallback to request headers if available (only in edge/node runtime with request object)
    if (request) {
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("host");
        if (host) {
            const absolute = `${protocol}://${host}${url.startsWith("/") ? url : "/" + url}`;
            console.log(`[URL_RESOLVE] Request-based: ${url} -> ${absolute}`);
            return absolute;
        }
    }

    // Final Hardcoded Fallback for Production
    const fallback = `https://grafty.pro${url.startsWith("/") ? url : "/" + url}`;
    console.log(`[URL_RESOLVE] Fallback-based: ${url} -> ${fallback}`);
    return fallback;
}
