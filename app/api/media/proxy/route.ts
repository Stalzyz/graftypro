import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');

    if (!mediaUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(mediaUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.META_SYSTEM_TOKEN}`
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
