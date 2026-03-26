import { NextResponse } from "next/server";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";
import { ImageUploadService, UploadModule } from "../../../../../lib/services/upload";

export const dynamic = 'force-dynamic';

/**
 * DEDICATED Super Admin Media Upload Endpoint.
 * 
 * WHY SEPARATE: The shared /api/media/upload relies on middleware header injection
 * which can be unreliable with some proxies. This route uses requireSuperAdmin()
 * which reads the admin_token cookie DIRECTLY via Next.js cookies(), making it
 * completely independent of middleware — 100% reliable for Super Admin.
 */
export async function POST(req: Request) {
    let stage = "AUTH_INIT";
    try {
        // Direct cookie-based auth — no middleware dependency
        stage = "AUTH_CHECK";
        let session: { id: string; email: string; role: string };
        try {
            session = await requireSuperAdmin();
        } catch (authErr: any) {
            console.error("[SA Upload] Auth failed:", authErr.message);
            return NextResponse.json(
                { error: "Unauthorized. You must be logged in as a Super Admin." },
                { status: 401 }
            );
        }

        console.log(`[SA Upload] Authenticated as Super Admin: ${session.email}`);

        // Parse form data
        stage = "BODY_PARSING";
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch (e: any) {
            return NextResponse.json(
                { error: "Failed to parse form data. The file may be too large." },
                { status: 400 }
            );
        }

        const file = formData.get("file");
        const module = (formData.get("module") as UploadModule) || "branding";

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

        const validFile = file as File;
        console.log(`[SA Upload] Processing: ${validFile.name} (${validFile.size} bytes), Module: ${module}`);

        // Upload using shared service
        stage = "SERVICE_UPLOAD";
        const result = await ImageUploadService.uploadImage(validFile, {
            module,
            tenantId: "admin_root",
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
        console.error(`[SA Upload] CRITICAL ERROR at stage ${stage}:`, error);
        return NextResponse.json(
            {
                error: "Internal Server Error during upload.",
                stage,
                message: error.message,
            },
            { status: 500 }
        );
    }
}
