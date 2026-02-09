
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads
        const filename = `${uuidv4()}_${file.name}`;
        const uploadDir = join(process.cwd(), "public", "uploads");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        // In a real production app we'd use S3/Cloudinary. 
        // For local we return the public URL.
        const url = `/uploads/${filename}`;

        return NextResponse.json({ url, filename: file.name, type: file.type });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
