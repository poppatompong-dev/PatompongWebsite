import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const debugKey = request.nextUrl.searchParams.get("key");
    const validKey = process.env.DEBUG_KEY && debugKey === process.env.DEBUG_KEY;

    if (!validKey) {
      const cookieStore = await cookies();
      const token = cookieStore.get("admin-session")?.value;
      if (!token || !(await verifySession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    revalidateTag("gallery");

    return NextResponse.json({ success: true, message: "Gallery cache cleared. Next page load will re-classify all photos with Gemini AI." });
  } catch (error) {
    console.error("revalidate-gallery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
