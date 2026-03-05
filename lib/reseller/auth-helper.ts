import { cookies } from "next/headers";
import { verifyToken } from "../auth";
import { prisma } from "../db";

export async function getResellerSession() {
    const cookieStore = cookies();
    const token = cookieStore.get("partner_token")?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "RESELLER") return null;

    return payload;
}

export async function requireReseller() {
    const session = await getResellerSession();
    if (!session) {
        throw new Error("Reseller session required");
    }

    // Fetch fresh data from DB
    const reseller = await prisma.reseller.findUnique({
        where: { id: session.userId },
        include: { tier: true }
    });

    if (!reseller || reseller.is_frozen || reseller.status === "REJECTED" || reseller.status === "SUSPENDED") {
        throw new Error("Account restricted or deactivated");
    }

    // Skip email_verified check for super admin impersonation sessions
    const isImpersonation = (session as any).impersonation === true;

    // @ts-ignore
    if (!isImpersonation && !reseller.email_verified) {
        throw new Error("Email verification required");
    }

    return reseller;
}
