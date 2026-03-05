import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "super-secret-admin-key-change-me";
const key = new TextEncoder().encode(ADMIN_JWT_SECRET);

export interface AdminPayload {
    id: string;
    email: string;
    role: string;
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as unknown as AdminPayload;
    } catch (e) {
        return null;
    }
}
