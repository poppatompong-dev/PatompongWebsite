import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ==================== Rate Limiting (In-Memory) ====================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX_LOGIN = 5;
const RATE_LIMIT_MAX_UPLOAD = 20;

function getRateLimit(ip: string, prefix: string, max: number): boolean {
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (entry.count >= max) return false;
    entry.count++;
    return true;
}

// ==================== Session Verification ====================

async function verifyToken(token: string): Promise<boolean> {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) return false;
    try {
        const key = new TextEncoder().encode(secret);
        await jwtVerify(token, key);
        return true;
    } catch {
        return false;
    }
}

// ==================== Proxy (formerly Middleware) ====================

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // --- Block path traversal attempts ---
    if (pathname.includes("..") || pathname.includes("//")) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // --- Rate limit login ---
    if (pathname === "/admin/login" && request.method === "POST") {
        if (!getRateLimit(ip, "login", RATE_LIMIT_MAX_LOGIN)) {
            return NextResponse.json(
                { error: "Too many login attempts. Please wait 1 minute." },
                { status: 429 }
            );
        }
    }

    // --- Protect upload API ---
    if (pathname.startsWith("/api/upload")) {
        const sessionCookie = request.cookies.get("admin_session");
        if (!sessionCookie?.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isValid = await verifyToken(sessionCookie.value);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        if (!getRateLimit(ip, "upload", RATE_LIMIT_MAX_UPLOAD)) {
            return NextResponse.json({ error: "Upload rate limit exceeded" }, { status: 429 });
        }
    }

    // --- Security headers for all responses ---
    const response = NextResponse.next();
    response.headers.set("X-Request-Id", crypto.randomUUID());
    return response;
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/upload",
    ],
};
