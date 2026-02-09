import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * AGGRESSIVE FIX: 
 * Prisma sometimes prioritizes a broken environment variable over the constructor URL.
 * We manually override the environment variable to ensure consistency.
 */
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url || url.includes('${') || url.trim() === '') {
        // Fallback for local development or if env is missing
        return "postgresql://postgres:password@postgres:5432/wabot_bsp?schema=public";
    }
    return url;
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: getDatabaseUrl(),
            },
        },
        log: ["error", "warn"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
