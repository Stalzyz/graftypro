import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent, hashData } from "../../../../lib/meta-capi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, email, phone, customData, sourceUrl } = body;

    // Capture standard headers for better matching (user agent, IP)
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "";

    // Capture browser cookies (important for fbp/fbc matching)
    const fbp = req.cookies.get("_fbp")?.value;
    const fbc = req.cookies.get("_fbc")?.value;

    const userData: any = {
      client_user_agent: userAgent,
      client_ip_address: ipAddress,
      fbp,
      fbc,
    };

    if (email) userData.em = [hashData(email)];
    if (phone) userData.ph = [hashData(phone)];

    const result = await sendMetaEvent(
      eventName || "PageView",
      userData,
      customData || {},
      sourceUrl || req.headers.get("referer") || "https://grafty.pro"
    );

    return NextResponse.json({ success: true, meta_response: result });
  } catch (error: any) {
    console.error("[API_META_EVENT] Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
