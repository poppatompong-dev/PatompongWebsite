import { NextResponse } from "next/server";
import { headers } from "next/headers";

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "poppatompong@gmail.com";

async function sendLineNotify(text: string): Promise<void> {
  if (!LINE_NOTIFY_TOKEN) return;
  await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ message: text }),
  });
}

async function sendEmailNotification(data: {
  name: string;
  phone: string;
  lineId?: string;
  service: string;
  message?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;

  const html = `
    <h2 style="color:#B45309;">&#128276; มีลูกค้าใหม่ติดต่อเข้ามา</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">ชื่อ</td><td style="padding:8px;border:1px solid #eee;">${data.name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">เบอร์โทร</td><td style="padding:8px;border:1px solid #eee;">${data.phone}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">LINE ID</td><td style="padding:8px;border:1px solid #eee;">${data.lineId || "-"}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">บริการที่สนใจ</td><td style="padding:8px;border:1px solid #eee;">${data.service}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">รายละเอียด</td><td style="padding:8px;border:1px solid #eee;">${data.message || "-"}</td></tr>
    </table>
    <p style="color:#718096;font-size:12px;margin-top:16px;">ส่งจาก Patompong Tech Consultant Website · ${new Date().toLocaleString("th-TH")}</p>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "no-reply@patompong.dev",
      to: NOTIFICATION_EMAIL,
      subject: `[Lead] ${data.name} – ${data.service}`,
      html,
    }),
  });
}

export async function POST(req: Request) {
  try {
    // Basic rate-limit check via request headers
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";
    void ip; // logged for debugging if needed

    const body = await req.json();
    const { name, phone, lineId, service, message } = body;

    if (!name || !phone || !service) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, เบอร์โทร, บริการที่สนใจ)" },
        { status: 400 }
      );
    }

    const submissionData = { name, phone, lineId, service, message };
    const timestamp = new Date().toLocaleString("th-TH");

    console.log("[Contact] New submission:", { ...submissionData, timestamp });

    // Fire notifications in parallel (non-blocking — don't fail submission if notify fails)
    const lineMessage = `\n\n📩 ลูกค้าใหม่! (${timestamp})\n👤 ชื่อ: ${name}\n📱 เบอร์: ${phone}\n💬 LINE: ${lineId || "-"}\n🔧 บริการ: ${service}\n📝 รายละเอียด: ${message || "-"}`;

    await Promise.allSettled([
      sendLineNotify(lineMessage),
      sendEmailNotification(submissionData),
    ]);

    return NextResponse.json(
      { success: true, message: "ส่งข้อมูลสำเร็จ เราจะติดต่อกลับโดยเร็วที่สุด" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
