import { NextResponse } from "next/server";
import { verifyCredentials, createSession, SESSION_COOKIE, SESSION_DURATION } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const valid = await verifyCredentials(username, password);
    if (!valid) {
      // Small delay to prevent timing attacks
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
