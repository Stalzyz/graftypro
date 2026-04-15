
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { access, mkdir, constants } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

async function checkHealth() {
    console.log("==========================================");
    console.log("   GRAFTY BSP MASTER DIAGNOSTIC TOOL      ");
    console.log("==========================================\n");

    // 1. ENVIRONMENT CHECK
    console.log("1. Environment Check:");
    const requiredEnv = ["DATABASE_URL", "REDIS_URL", "JWT_SECRET", "ADMIN_JWT_SECRET"];
    requiredEnv.forEach(env => {
        const status = process.env[env] ? "✅ SET" : "❌ MISSING";
        console.log(`   - ${env.padEnd(20)}: ${status}`);
    });
    console.log("");

    // 2. DATABASE CHECK
    console.log("2. Database Connection:");
    try {
        await prisma.$connect();
        const vendorCount = await prisma.user.count();
        const resellerCount = await prisma.reseller.count();
        console.log("   - Prisma Connectivity : ✅ OK");
        console.log(`   - Data Audit          : ${vendorCount} Users, ${resellerCount} Partners found.`);
    } catch (e: any) {
        console.log(`   - Database Connection : ❌ FAILED (${e.message})`);
    } finally {
        await prisma.$disconnect();
    }
    console.log("");

    // 3. REDIS CHECK
    console.log("3. Redis Connection:");
    if (!process.env.REDIS_URL) {
        console.log("   - Redis Status        : ⚠️ SKIPPED (No REDIS_URL)");
    } else {
        try {
            const redis = new Redis(process.env.REDIS_URL);
            const ping = await redis.ping();
            console.log(`   - Redis Status        : ✅ OK (Ping: ${ping})`);
            await redis.quit();
        } catch (e: any) {
            console.log(`   - Redis Status        : ❌ FAILED (${e.message})`);
        }
    }
    console.log("");

    // 4. FILESYSTEM CHECK
    console.log("4. Filesystem & Uploads:");
    const uploadPaths = ["public/uploads", "public/uploads/branding", "public/uploads/whitelabel", "public/uploads/general"];
    for (const p of uploadPaths) {
        const fullPath = join(process.cwd(), p);
        try {
            await mkdir(fullPath, { recursive: true });
            await access(fullPath, constants.W_OK);
            console.log(`   - ${p.padEnd(25)} : ✅ WRITABLE`);
        } catch (e: any) {
            console.log(`   - ${p.padEnd(25)} : ❌ ERROR (${e.message})`);
        }
    }
    console.log("");

    // 5. SECURITY PROTOCOLS
    console.log("5. Security Protocol Scan:");
    try {
        const admins = await new PrismaClient().adminUser.findMany();
        if (admins.length > 0) {
            console.log(`   - Super Admin Active  : ✅ YES (${admins.length} Root Admin Found)`);
        } else {
            console.log("   - Super Admin Active  : ⚠️ NO ROOT ADMIN DETECTED");
        }
    } catch (e) {
        console.log("   - Super Admin Check   : ❌ FAILED");
    }

    console.log("\n==========================================");
    console.log("        DIAGNOSTIC SCAN COMPLETE          ");
    console.log("==========================================");
}

checkHealth().catch(console.error);
