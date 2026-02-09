
const BASE_URL = "https://app.grekam.in";
const ADMIN_EMAIL = "admin@wabot.com";
const ADMIN_PASS = "AdminPassword@123";

async function runAudit() {
    console.log("Starting Platform Audit...");

    // 1. Auth Test
    console.log("\n[Auth] Testing Super Admin Login...");
    try {
        const loginRes = await fetch(`${BASE_URL}/api/super-admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
        });
        console.log(`Login Status: ${loginRes.status}`);
        const data = await loginRes.json();
        if (!loginRes.ok) {
            console.log(`Login Failed: ${JSON.stringify(data)}`);
        } else {
            console.log("Login Success!");
        }
    } catch (err) {
        console.error("Login Fetch Error:", err);
    }

    // 2. Route Check (Unauthorized Check)
    const routesToTest = [
        "/api/super-admin/vendors",
        "/api/super-admin/finance",
        "/api/super-admin/stats",
        "/api/flows",
        "/api/drips",
        "/api/templates",
        "/api/whatsapp/status"
    ];

    console.log("\n[Protection] Checking RBAC on APIs...");
    for (const route of routesToTest) {
        try {
            const res = await fetch(`${BASE_URL}${route}`);
            console.log(`${route} -> ${res.status} (Expected 401)`);
        } catch (err) {
            console.log(`${route} -> Failed to fetch`);
        }
    }

    console.log("\nAudit Script Finished.");
}

runAudit();
