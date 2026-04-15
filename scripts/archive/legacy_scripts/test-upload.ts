
import { ImageUploadService } from "../lib/services/upload";
import { readFile } from "fs/promises";
import { join } from "path";

async function runTest() {
    console.log("--- STARTING UPLOAD TEST ---");
    try {
        // Create a mock File-like object
        const filePath = join(process.cwd(), "public", "test.txt");
        const content = await readFile(filePath);

        // Mocking a File object for the service
        const mockFile = {
            size: content.length,
            type: "text/csv", // Allowed in MIME_MAP
            name: "test.csv",
            arrayBuffer: async () => content.buffer
        } as any;

        console.log("Invoking ImageUploadService.uploadImage...");
        const result = await ImageUploadService.uploadImage(mockFile, {
            module: "general"
        });

        console.log("UPLOAD SUCCESS!");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("UPLOAD FAILED!");
        console.error("Error:", error.message);
        if (error.stack) console.error(error.stack);
    }
}

runTest();
