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
 * Middleware helper to get current user from Request headers (Converted to async for jose)
 */
export async function getCurrentUser(request: Request): Promise<UserPayload | null> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    return await verifyToken(token);
}
