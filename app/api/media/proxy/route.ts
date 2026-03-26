import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { decrypt } from '../../../../lib/security/encryption';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');

    if (!mediaUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const user = await getCurrentUser(req);
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const account = await prisma.whatsAppAccount.findFirst({
            where: { workspace_id: user.workspaceId }
        });

        if (!account || !account.access_token) {
            return new NextResponse("WhatsApp account not configured", { status: 404 });
        }

        const token = decrypt(account.access_token);

        const response = await fetch(mediaUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Proxy fetch failed:", response.status, response.statusText);
            return new NextResponse("Failed to fetch media from Meta", { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Proxy Error", { status: 500 });
    }
}
