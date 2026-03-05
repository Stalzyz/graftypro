import { NextResponse } from "next/server";
import { ImageUploadService, UploadModule } from "../../../../lib/services/upload";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ message: "Upload endpoint ready. Use POST to upload files." });
}

export async function POST(req: Request) {
    let stage = "AUTH_INIT";
    try {
        const headersObj = Object.fromEntries(req.headers.entries());
        console.log(`[API Upload] Start POST request. Headers:`, {
            "x-user-id": headersObj["x-user-id"],
            "x-workspace-id": headersObj["x-workspace-id"],
            "content-type": headersObj["content-type"]
        });

        // 1. Auth Guard
        stage = "AUTH_CHECK";
        const user = await getCurrentUser(req);
        if (!user) {
            console.error(`[API Upload] Unauthorized access attempt - No user found in request context`);
            return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
        }
        console.log(`[API Upload] User context established: User=${user.userId}, Workspace=${user.workspaceId}`);

        // 2. Body Parsing
        stage = "BODY_PARSING";
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch (e: any) {
            console.error(`[API Upload] FormData parsing failed at stage ${stage}:`, e);
            return NextResponse.json({
                error: "Failed to parse form data. The request might be malformed or too large.",
                details: e.message
            }, { status: 400 });
        }

        const file = formData.get("file");
        const module = (formData.get("module") as UploadModule) || "general";

        // Hybrid check for File objects (instanceof can sometimes fail in certain Node environments)
        const isFile = file && typeof (file as any).arrayBuffer === 'function' && typeof (file as any).name === 'string';

        if (!isFile) {
            console.error(`[API Upload] Validation failed: Field 'file' is missing or not a valid File object. Received:`, typeof file);
            return NextResponse.json({ error: "No valid file provided in the 'file' field" }, { status: 400 });
        }

        const validFile = file as File;
        console.log(`[API Upload] Processing file: ${validFile.name}, Size: ${validFile.size}, Module: ${module}`);

        // 3. Service-Layer Upload
        stage = "SERVICE_UPLOAD";
        try {
            const result = await ImageUploadService.uploadImage(validFile, {
                module: module,
                tenantId: user.workspaceId,
                maxSize: 50 * 1024 * 1024
            });

            return NextResponse.json({
                success: true,
                url: result.url,
                filename: result.filename,
                originalName: result.originalName,
                mime: result.mimeType,
                size: result.size
            });

        } catch (error: any) {
            console.error(`[API Upload] Service layer error (stage: ${stage}):`, error.message);
            return NextResponse.json({ error: error.message }, { status: 422 });
        }

    } catch (error: any) {
        console.error(`[API Upload] CRITICAL EXCEPTION at stage ${stage}:`, error);
        return NextResponse.json({
            error: "Internal Server Error during upload processing",
            stage: stage,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
