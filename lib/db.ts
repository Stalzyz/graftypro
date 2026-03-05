import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };


export const prisma = globalForPrisma.prisma || new PrismaClient();

console.log("[DB-DEBUG] Prisma models:", Object.keys(prisma).filter(k => !k.startsWith('_')));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
