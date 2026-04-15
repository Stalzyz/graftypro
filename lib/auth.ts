
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET || "fallback-dev-secret-40-chars-min-security-fix-12345");

function checkSecret() {
    if (!JWT_SECRET) {
        // Don't throw — allow login to still work but scream loudly in logs
        console.error("[CRITICAL] JWT_SECRET is not defined! Using fallback secret. Set JWT_SECRET in your .env file on the VPS immediately!");
    }
}

export interface UserPayload {
    userId: string;
    workspaceId: string;
    role: string;
    [key: string]: any; // Allow extra claims
}

// Sign Token (Edge Compatible)
export async function signToken(payload: UserPayload): Promise<string> {
    checkSecret();
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

// Verify Token (Edge Compatible)
export async function verifyToken(token: string | undefined): Promise<UserPayload | null> {
    if (!token) return null;
    try {
        checkSecret();
        const { payload } = await jwtVerify(token, secretKey);
        return payload as unknown as UserPayload;
    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.warn("[AUTH TRACE] VERIFICATION FAILED: Token expired");
        } else if (error.code === 'ERR_JWS_INVALID') {
            console.error("[AUTH TRACE] VERIFICATION FAILED: Invalid signature (JWT_SECRET mismatch?)");
        } else {
            console.error("[AUTH TRACE] VERIFICATION FAILED: ", error.message || error);
        }
        return null;
    }
}

/**
 * Middleware helper to get current user. 
 * Checks injected headers (from middleware) first, then falls back to Authorization header,
 * and finally performs a DIRECT COOKIE RESOLUTION (NUCLEAR OPTION).
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
        const payload = await verifyToken(token);
        return payload;
    }

    // 3. NUCLEAR FALLBACK: Direct Cookie Resolution (Handles middleware mismatch)
    try {
        const cookieStore = cookies();
        const tokenValue = cookieStore.get("token")?.value;
        if (tokenValue) {
            const payload = await verifyToken(tokenValue);
            if (payload) {
                console.log(`[AUTH] 🛡️ RECOVERED session via direct cookie resolution for ${payload.userId}`);
                return payload;
            }
        }
    } catch (e) {
        // next/headers might fail if not in a server context, ignore
    }

    return null;
}
