import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Bust the Gemini-classified gallery cache so next page load re-runs classification
    revalidateTag("gallery");

    return NextResponse.json({ success: true, message: "Gallery cache cleared. Next visit will re-classify all photos." });
  } catch (error) {
    console.error("revalidate-gallery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
