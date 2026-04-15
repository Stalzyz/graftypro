
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log("🧹 Starting Production Database Cleanup...");
    console.log("📅 Date:", new Date().toISOString());

    try {
        // 1. Remove expired Remember Me tokens
        const deletedTokens = await prisma.rememberMeToken.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        });
        console.log(`✅ Deleted ${deletedTokens.count} expired remember_me tokens.`);

        // 2. Remove expired OTP codes
        const deletedOtp = await prisma.verificationOTP.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        });
        console.log(`✅ Deleted ${deletedOtp.count} expired verification_otps.`);

        // 3. Cleanup Auth Audit Logs older than 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        const deletedAuthLogs = await prisma.authAuditLog.deleteMany({
            where: {
                created_at: {
                    lt: sixtyDaysAgo
                }
            }
        });
        console.log(`✅ Deleted ${deletedAuthLogs.count} auth_audit_logs older than 60 days.`);

        // 4. Cleanup Security Audit Logs older than 60 days (If table exists)
        // Check schema to see if we have security_audit_logs - We have AuditLog
        try {
            const deletedGenericLogs = await (prisma as any).auditLog.deleteMany({
                where: {
                    created_at: {
                        lt: sixtyDaysAgo
                    }
                }
            });
            console.log(`✅ Deleted ${deletedGenericLogs.count} generic audit_logs older than 60 days.`);
        } catch (e) {
            // Table might not exist or be named differently
        }

        // 5. Cleanup test users (Identify first)
        const testUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'test@' } },
                    { email: { contains: 'demo@' } },
                    { email: { contains: 'example.com' } }
                ]
            },
            select: { email: true }
        });

        if (testUsers.length > 0) {
            console.log(`⚠️ Found ${testUsers.length} potential test/demo users: ${testUsers.map(u => u.email).join(', ')}`);
        } else {
            console.log("✅ No test/demo users found.");
        }

        console.log("🏁 Database Cleanup Complete.");

    } catch (error) {
        console.error("❌ Cleanup failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
