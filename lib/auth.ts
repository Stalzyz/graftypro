import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key-change-this-in-prod-12345";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface UserPayload {
    userId: string;
    workspaceId: string;
    role: string;
    [key: string]: any; // Allow extra claims
}

// Sign Token (Edge Compatible)
export async function signToken(payload: UserPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

// Verify Token (Edge Compatible)
export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload as unknown as UserPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

/**
 * Middleware helper to get current user. 
 * Checks injected headers (from middleware) first, then falls back to Authorization header.
 */
export async function getCurrentUser(request: Request): Promise<UserPayload | null> {
    // 1. Check injected headers from middleware
    const userId = request.headers.get("x-user-id");
    const workspaceId = request.headers.get("x-workspace-id");
    const role = request.headers.get("x-user-role");

    if (userId && workspaceId) {
        return {
            userId,
            workspaceId,
            role: role || 'AGENT'
        };
    }

    // 2. Fallback to Authorization Header (if direct API call)
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        return await verifyToken(token);
    }

    return null;
}
