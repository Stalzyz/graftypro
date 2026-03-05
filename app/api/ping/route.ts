
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ status: "pong", time: new Date().toISOString() });
}

export async function POST() {
    return NextResponse.json({ status: "pong_post", time: new Date().toISOString() });
}
