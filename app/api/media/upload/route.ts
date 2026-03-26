import { NextResponse } from "next/server";
import { ImageUploadService, UploadModule } from "../../../../lib/services/upload";

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ message: "Upload endpoint ready. Use POST to upload files." });
}

/**
 * UNIVERSAL UPLOAD ENDPOINT
 * 
 * Supports ALL user types: Vendors, Partners/Resellers, Super Admins.
 * Auth priority: 
 *   1. x-user-id header (injected by middleware for vendors)
 *   2. admin_token cookie (Super Admin)
 *   3. partner_token cookie (Reseller/Partner)
 *   4. token cookie (Vendor — fallback if middleware didn't inject header)
 */
export async function POST(req: Request) {
    let stage = "AUTH_INIT";
    try {
        stage = "AUTH_CHECK";

        let userId = "";
        let workspaceId = "";

        // ── Path 1: Middleware-injected headers (most common — vendors) ──
        const headerUserId = req.headers.get("x-user-id");
        const headerWorkspaceId = req.headers.get("x-workspace-id");
        if (headerUserId && headerWorkspaceId) {
            userId = headerUserId;
            workspaceId = headerWorkspaceId;
        }

        // ── Path 2: Direct cookie auth (Super Admin, Partner, Vendor fallback) ──
        if (!userId) {
            const { cookies } = await import("next/headers");
            const cookieStore = cookies();

            // Try admin_token (Super Admin)
            const adminToken = cookieStore.get("admin_token")?.value;
            console.log(`[Upload-Auth] Checking admin_token: ${adminToken ? "Present" : "Missing"}`);
            if (adminToken) {
                const { verifyAdminToken } = await import("../../../../lib/admin-auth");
                const adminPayload = await verifyAdminToken(adminToken);
                console.log(`[Upload-Auth] admin_token verify: ${adminPayload ? "SUCCESS (" + adminPayload.role + ")" : "FAIL"}`);
                if (adminPayload) {
                    userId = adminPayload.id;
                    workspaceId = "admin_root";
                }
            }

            // Try partner_token (Reseller/Partner)
            if (!userId) {
                const partnerToken = cookieStore.get("partner_token")?.value;
                console.log(`[Upload-Auth] Checking partner_token: ${partnerToken ? "Present" : "Missing"}`);
                if (partnerToken) {
                    const { verifyToken } = await import("../../../../lib/auth");
                    const payload = await verifyToken(partnerToken);
                    console.log(`[Upload-Auth] partner_token verify: ${payload ? "SUCCESS" : "FAIL"}`);
                    if (payload?.userId) {
                        userId = payload.userId;
                        workspaceId = "partner_root";
                    }
                }
            }

            // Try vendor token cookie
            if (!userId) {
                const vendorToken = cookieStore.get("token")?.value;
                console.log(`[Upload-Auth] Checking vendor token: ${vendorToken ? "Present" : "Missing"}`);
                if (vendorToken) {
                    const { verifyToken } = await import("../../../../lib/auth");
                    const payload = await verifyToken(vendorToken);
                    console.log(`[Upload-Auth] vendor token verify: ${payload ? "SUCCESS" : "FAIL"}`);
                    if (payload?.userId) {
                        userId = payload.userId;
                        workspaceId = payload.workspaceId;
                    }
                }
            }

            // Try Authorization header (Bearer token)
            if (!userId) {
                const authHeader = req.headers.get("Authorization");
                const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
                if (token) {
                    const { verifyToken } = await import("../../../../lib/auth");
                    const payload = await verifyToken(token);
                    if (payload?.userId) {
                        userId = payload.userId;
                        workspaceId = payload.workspaceId;
                    }
                }
            }
        }

        // Final auth gate
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in and try again." },
                { status: 401 }
            );
        }

        console.log(`[Upload] Authenticated user: ${userId}, workspace: ${workspaceId}`);

        // ── Parse Form Data ──
        stage = "BODY_PARSING";
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch (e: any) {
            return NextResponse.json(
                { error: "Failed to parse form data. File may be too large." },
                { status: 400 }
            );
        }

        const file = formData.get("file");
        const module = (formData.get("module") as UploadModule) || "general";

        const isFile =
            file &&
            typeof (file as any).arrayBuffer === "function" &&
            typeof (file as any).name === "string";

        if (!isFile) {
            return NextResponse.json(
                { error: "No valid file provided in the 'file' field." },
                { status: 400 }
            );
        }

        // ── Upload ──
        stage = "SERVICE_UPLOAD";
        const result = await ImageUploadService.uploadImage(file as File, {
            module,
            tenantId: workspaceId,
            maxSize: 50 * 1024 * 1024,
        });

        return NextResponse.json({
            success: true,
            url: result.url,
            filename: result.filename,
            originalName: result.originalName,
            mime: result.mimeType,
            size: result.size,
        });

    } catch (error: any) {
        console.error(`[Upload] CRITICAL ERROR at stage ${stage}:`, error);
        return NextResponse.json(
            { error: "Internal Server Error during upload.", message: error.message },
            { status: 500 }
        );
    }
}
