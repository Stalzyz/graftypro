import jwt from "jsonwebtoken";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-this";

export interface UserPayload {
    userId: string;
    workspaceId: string;
    role: string;
}

export function signToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Middleware helper to get current user from Request headers
 */
export async function getCurrentUser(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) return null;

    // Optional: Fetch fresh user from DB if needed
    // const user = await prisma.user.findUnique(...) 

    return payload;
}
