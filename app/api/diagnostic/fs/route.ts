
import { NextResponse } from "next/server";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

export const dynamic = 'force-dynamic';

function getDirectoryTree(dirPath: string) {
    if (!existsSync(dirPath)) return { error: "Path does not exist", path: dirPath };

    try {
        const items = readdirSync(dirPath).map(item => {
            const fullPath = join(dirPath, item);
            const stats = statSync(fullPath);
            return {
                name: item,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                path: fullPath
            };
        });
        return items;
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const subDir = searchParams.get("dir") || "";

        const cwd = process.cwd();
        const baseDir = join(cwd, "public", "uploads");
        const targetDir = join(baseDir, subDir);

        // Safety check to stay within uploads
        if (!targetDir.startsWith(baseDir)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const files = getDirectoryTree(targetDir);

        return NextResponse.json({
            cwd,
            targetDir,
            files
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
