import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("connection_limit")) {
    dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connection_limit=50&pool_timeout=30";
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: { db: { url: dbUrl } },
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

// Prevent multiple instances in development hot-reload
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
