
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Build Filter
        const where: Prisma.WorkspaceWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { id: { equals: search } },
                {
                    users: {
                        some: { email: { contains: search, mode: "insensitive" } }
                    }
                }
            ]
        } : {};

        // Fetch Data
        const [workspaces, total] = await Promise.all([
            prisma.workspace.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    _count: {
                        select: {
                            users: true,
                            messages: true,
                            campaigns: true
                        }
                    },
                    waba: {
                        select: {
                            phone_number: true,
                            quality_rating: true,
                            status: true
                        }
                    }
                }
            }),
            prisma.workspace.count({ where })
        ]);

        return NextResponse.json({
            data: workspaces.map(w => ({
                id: w.id,
                name: w.name,
                plan: w.plan,
                status: w.status,
                joined_at: w.created_at,
                stats: {
                    users: w._count.users,
                    messages: w._count.messages,
                    campaigns: w._count.campaigns
                },
                waba_number: w.waba?.phone_number || "N/A",
                waba_quality: w.waba?.quality_rating || "UNKNOWN"
            })),
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (e) {
        console.error("Vendor List Error", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { business_name, email, password, plan } = await req.json();

        if (!business_name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Check if user exists
        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // 2. Transactional Create
        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: business_name,
                    business_name: business_name,
                    plan: plan || "FREE",
                    status: "ACTIVE"
                }
            });


            const hash = await bcrypt.hash(password, 10);

            const user = await tx.user.create({
                data: {
                    workspace_id: workspace.id,
                    email,
                    password_hash: hash,
                    role: "OWNER",
                    first_name: "Admin"
                }
            });

            return { workspace, user };
        });

        return NextResponse.json({ success: true, workspaceId: result.workspace.id });

    } catch (e) {
        console.error("Vendor Create Error", e);
        return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }
}
