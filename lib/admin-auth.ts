
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "super-secret-admin-key-change-me";
const key = new TextEncoder().encode(ADMIN_JWT_SECRET);

export interface AdminSession {
    id: string;
    email: string;
    role: string;
}

export async function signAdminToken(payload: AdminSession) {
    return new SignJWT(payload as any)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h") // 24 hour session
        .sign(key);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as unknown as AdminSession;
    } catch (e) {
        return null;
    }
}

export async function getAdminSession(): Promise<AdminSession | null> {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
}

export async function requireSuperAdmin() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    // Strict Role Enforcement
    if (session.role !== 'SUPER_ADMIN') {
        throw new Error("Permission Denied: Super Admin access required");
    }

    return session;
}
