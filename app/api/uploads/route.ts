import { NextResponse } from "next/server";
import { ImageUploadService, UploadModule } from "../../../lib/services/upload";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const module = (formData.get("module") as UploadModule) || "general";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const result = await ImageUploadService.uploadImage(file, {
            module,
            tenantId: user.workspaceId,
            maxSize: 10 * 1024 * 1024
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
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
