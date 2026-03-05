
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const pages = await prisma.landingPage.findMany({
            include: {
                sections: true
            }
        });

        return NextResponse.json({
            pages: pages.map(p => ({
                id: p.id,
                slug: p.slug,
                status: p.status,
                sections: p.sections.map(s => ({
                    id: s.id,
                    type: s.type,
                    content: s.content
                }))
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
