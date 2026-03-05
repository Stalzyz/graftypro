import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { redis } from "../lib/redis";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

async function runNuclearFix() {
    console.log("🚀 STARTING NUCLEAR SYSTEM INTEGRITY FIX V2...");

    // 0. CLEAR RATE LIMITS
    console.log("\n--- 🧱 SECTION 00: SECURITY RESET ---");
    try {
        const keys = await redis.keys("rate_limit:*");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`✅ Cleared ${keys.length} rate limit records from Redis.`);
        } else {
            console.log("✅ No rate limits to clear.");
        }
    } catch (e: any) {
        console.warn("⚠️ Failed to clear Redis rate limits:", e.message);
    }

    // 1. DISCOVER AND RESET ALL ADMINS
    console.log("\n--- 🔍 SECTION 0: DISCOVERY ---");
    try {
        // Find all Super Admins
        // @ts-ignore
        const allSuperAdmins = await prisma.adminUser?.findMany({
            where: { role: "SUPER_ADMIN" }
        });
        console.log(`Found ${allSuperAdmins?.length || 0} existing Super Admins.`);

        // Find all Workspace Admins
        const allWorkspaceAdmins = await prisma.user.findMany({
            where: { role: "ADMIN" }
        });
        console.log(`Found ${allWorkspaceAdmins?.length || 0} existing Workspace Admins.`);
    } catch (e: any) {
        console.warn("Discovery failed (likely missing tables):", e.message);
    }

    // 2. SYSTEM ADMIN (Console Access: /super-admin/login)
    console.log("\n--- 🔐 SECTION 1: SUPER ADMIN (Console Access) ---");
    const superAdminEmail = "admin@grafty.com";
    const superAdminPass = "AdminPassword@123";
    const superAdminHash = await bcrypt.hash(superAdminPass, 10);

    try {
        // Force sync AdminUser table if it exists
        // @ts-ignore
        await prisma.adminUser?.upsert({
            where: { email: superAdminEmail },
            update: { password_hash: superAdminHash, role: "SUPER_ADMIN" },
            create: {
                email: superAdminEmail,
                password_hash: superAdminHash,
                role: "SUPER_ADMIN",
                name: "Root Administrator"
            }
        });
        console.log(`✅ Super Admin [${superAdminEmail}] is ready.`);
    } catch (e: any) {
        console.error("❌ Failed to set Super Admin:", e.message);
    }

    // 3. MAIN ADMIN (Portal Access: /login)
    console.log("\n--- 👤 SECTION 2: MAIN ADMIN (Portal Access) ---");
    const adminEmail = "admin@grafty.pro";
    const adminPass = "AdminPassword@123";
    const adminHash = await bcrypt.hash(adminPass, 10);

    try {
        let workspace = await prisma.workspace.findFirst();
        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: { name: "Grafty Default", plan: "PRO" }
            });
        }

        await prisma.user.upsert({
            where: { workspace_id_email: { workspace_id: workspace.id, email: adminEmail } },
            update: {
                password_hash: adminHash,
                role: "ADMIN",
                email_verified: new Date()
            },
            create: {
                email: adminEmail,
                password_hash: adminHash,
                role: "ADMIN",
                workspace_id: workspace.id,
                email_verified: new Date(),
                first_name: "System",
                last_name: "Admin"
            }
        });
        console.log(`✅ Main Admin [${adminEmail}] is ready in workspace [${workspace.name}].`);
    } catch (e: any) {
        console.error("❌ Failed to set Main Admin:", e.message);
    }

    // 4. SMTP TEST
    console.log("\n--- 📧 SECTION 3: SMTP DELIVERY TEST ---");
    const smtpConfig = {
        host: process.env.SMTP_HOST || "mail.privateemail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.error("❌ SMTP Credentials missing in .env!");
    } else {
        const transporter = nodemailer.createTransport(smtpConfig);
        try {
            await transporter.verify();
            console.log("✅ SMTP Connection: SUCCESS");

            const testRecipient = process.env.SMTP_USER || adminEmail;

            await transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'System'}" <${process.env.SMTP_FROM_EMAIL || smtpConfig.auth.user}>`,
                to: testRecipient,
                subject: "SYSTEM INTEGRITY FIX: SMTP TEST",
                html: "<b>✅ SMTP delivery is operational.</b>"
            });
            console.log(`✅ Test email sent to ${testRecipient}`);
        } catch (e: any) {
            console.error("❌ SMTP Failure:", e.message);
        }
    }

    console.log("------------------------------------------------\n");

    // 5. LANDING PAGE CMS SEEDING
    console.log("\n--- 🏗️ SECTION 4: LANDING CMS SEEDING ---");
    try {
        const p = prisma as any;
        if (!p.landingPage) {
            console.error("❌ prisma.landingPage is undefined. Regenerating client might be required.");
            // Try to force a re-generation or just error out gracefully
            throw new Error("LandingPage model not found in Prisma Client");
        }

        const home = await p.landingPage.upsert({
            where: { slug: 'home' },
            update: {},
            create: {
                title: 'Home Page',
                slug: 'home',
                status: 'PUBLISHED',
                seo_config: {
                    title: "Grafty | Enterprise WhatsApp Business Platform",
                    description: "Scale your business on WhatsApp with automated flows, drips, and commerce.",
                    keywords: "whatsapp api, bsp, automation, crm, bulk message, chatgpt whatsapp",
                    og_image: "https://grafty.pro/og-image.png"
                }
            }
        });

        console.log(`✅ Home Page ensured (ID: ${home.id})`);

        // Define initial sections
        const sections = [
            {
                type: 'HERO',
                order: 1,
                content: {
                    title: "Scale Your Business on <span class='text-gradient'>WhatsApp.</span>",
                    subtitle: "Grafty is a goal-driven WhatsApp Business Platform that helps you generate leads, collect payments, and scale revenue — without manual effort.",
                    primaryBtnText: "Start Free Trial",
                    primaryBtnLink: "/register",
                    secondaryBtnText: "View Solutions",
                    secondaryBtnLink: "/solutions"
                }
            },
            {
                type: 'INTEGRATIONS',
                order: 2,
                content: {
                    title: "Connects with the Apps You Love",
                    subtitle: "Full API support for custom CRM orchestration.",
                    apps: [
                        { name: "Shopify", logo: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" },
                        { name: "WooCommerce", logo: "https://www.vectorlogo.zone/logos/woocommerce/woocommerce-icon.svg" },
                        { name: "Zoho", logo: "https://www.vectorlogo.zone/logos/zoho/zoho-icon.svg" },
                        { name: "Zapier", logo: "https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg" },
                        { name: "Make", logo: "https://www.vectorlogo.zone/logos/make/make-icon.svg" },
                        { name: "n8n", logo: "https://www.vectorlogo.zone/logos/n8n/n8n-icon.svg" },
                        { name: "Razorpay", logo: "https://www.vectorlogo.zone/logos/razorpay/razorpay-icon.svg" },
                        { name: "Google", logo: "https://www.vectorlogo.zone/logos/google/google-icon.svg" }
                    ]
                }
            },
            {
                type: 'FEATURES',
                order: 3,
                content: {
                    title: "What Grafty <span class='text-gradient'>Actually Does.</span>",
                    subtitle: "Most businesses use WhatsApp manually. Grafty turns WhatsApp into a scalable sales engine.",
                    features: [
                        { title: "1. Flow Builder", desc: "Build intelligent automation with conditions, buttons, payments, tracking, and CRM sync.", image: "https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png" },
                        { title: "2. Broadcast Engine", desc: "Send segmented campaigns with real-time cost estimation and delivery tracking.", image: "https://app.chatbasha.com/assets/docs/images/broadcast/dashborad.png" },
                        { title: "3. Drip Campaigns", desc: "Nurture leads automatically based on time or behavior.", image: "https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/48179224816/original/0s24US3LCvhVYQt3E9XEctFypBiJu_OYag.png?1642190032=" },
                        { title: "4. Template Creator", desc: "Create Meta-approved templates with media, buttons, and dynamic variables.", image: "https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/48179220627/original/r-cGcDfoBT7XnC_abUKNm_Ow2VnD_kVv6A.png?1642188595=" },
                        { title: "5. Wallet & Credits", desc: "Recharge once. Auto-deduct per conversation. GST-ready invoices generated automatically.", image: "https://mintcdn.com/cashfreepayments-d00050e9/WsfwdPcC6FOfYy04/static/payouts/payouts/dashboard/all-funds-dash.png?auto=format" },
                        { title: "6. Analytics & Metrics", desc: "Track conversion rate, revenue, response time, and cost per lead.", image: "https://www.inetsoft.com/images/screenshots/hr_management_dashboard.png" }
                    ]
                }
            },
            {
                type: 'MODULES',
                order: 4,
                content: {}
            },
            {
                type: 'PRICING',
                order: 5,
                content: {
                    title: "Pricing. <span class='text-gradient'>API Connected.</span>",
                    subtitle: "No hidden charges. Credits visible. Billing transparent."
                }
            }
        ];

        // Delete old sections and recreate
        await p.landingSection.deleteMany({ where: { page_id: home.id } });

        for (const s of sections) {
            await p.landingSection.create({
                data: {
                    page_id: home.id,
                    type: s.type,
                    content: s.content,
                    order: s.order
                }
            });
        }

        // Publish it
        const pageWithSections = await p.landingPage.findUnique({
            where: { id: home.id },
            include: { sections: { orderBy: { order: 'asc' } } }
        });

        const snapshot = {
            ...home,
            sections: pageWithSections?.sections,
            published_at: new Date().toISOString()
        };

        await p.landingPage.update({
            where: { id: home.id },
            data: {
                published_data: snapshot as any
            }
        });

        console.log("✅ CMS Seeding Complete.");
    } catch (e: any) {
        console.error("❌ CMS Seeding Failed:", e.message);
    }

    console.log("\n------------------------------------------------");
    console.log("🏁 NUCLEAR FIX COMPLETE");
    console.log("Try logging in with these credentials:");
    console.log(`1. Super Admin (/super-admin/login): ${superAdminEmail} / ${superAdminPass}`);
    console.log(`2. Main Admin (/login): ${adminEmail} / ${adminPass}`);
    console.log("------------------------------------------------\n");
}


runNuclearFix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
