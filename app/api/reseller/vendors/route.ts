import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resellerId = session.userId;

        const vendors = await prisma.workspace.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                name: true,
                business_name: true,
                status: true,
                created_at: true,
                plan: true,
                wallet: {
                    select: { current_balance: true }
                },
                _count: {
                    select: {
                        messages: true,
                        campaigns: true
                    }
                }
            }
        });

        const formattedVendors = vendors.map(v => ({
            id: v.id,
            workspace_id: v.id,
            mapped_at: v.created_at,
            name: v.name,
            business_name: v.business_name,
            status: v.status,
            balance: Number(v.wallet?.current_balance || 0),
            stats: {
                total_messages: v._count.messages,
                total_campaigns: v._count.campaigns
            }
        }));

        return NextResponse.json({ success: true, data: formattedVendors });
    } catch (error: any) {
        console.error("Reseller Vendors GET Error:", error);
        return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId }
        });

        if (!reseller || reseller.role !== "PLATFORM") {
            return NextResponse.json({ error: "Only Platform Partners can create vendors directly." }, { status: 403 });
        }

        const { business_name, email, password, plan } = await req.json();

        if (!business_name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
                    plan: (plan || "FREE") as any,
                    status: "ACTIVE",
                    reseller_id: reseller.id,
                    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            });

            const hash = await bcrypt.hash(password, 10);

            await tx.user.create({
                data: {
                    workspace_id: workspace.id,
                    email,
                    password_hash: hash,
                    role: "OWNER",
                    first_name: "Admin"
                }
            });

            // Initialize Wallet
            await tx.vendorWallet.create({
                data: {
                    workspace_id: workspace.id,
                    current_balance: 500.00
                }
            });

            // Create Mapping
            await tx.resellerVendorMap.create({
                data: {
                    reseller_id: reseller.id,
                    workspace_id: workspace.id,
                    referral_source: "PLATFORM_DIRECT",
                    is_permanent: true
                }
            });

            return workspace;
        });

        return NextResponse.json({ success: true, workspaceId: result.id });

    } catch (error: any) {
        console.error("Reseller Vendor Create Error:", error);
        return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }
}
