import axios from "axios";

async function testRegistration() {
    console.log("Testing Reseller Registration Flow...");

    // Use a unique email
    const email = `partner_${Date.now()}@example.com`;

    try {
        console.log(`1. Registering with email: ${email}`);
        const regResponse = await axios.post("http://localhost:3000/api/reseller/auth/register", {
            email: email,
            password: "Password123!",
            confirmPassword: "Password123!",
            name: "Test Partner",
            businessName: "Test Business"
        });

        console.log("Registration Response:", regResponse.data);

        if (regResponse.data.otpError) {
            console.log("⚠️ Account created but OTP failed (expected if SMTP not configured in container yet)");
        } else {
            console.log("✅ OTP sent successfully!");
        }

    } catch (e: any) {
        console.error("Registration failed:", e.response?.data || e.message);
    }
}

testRegistration();
