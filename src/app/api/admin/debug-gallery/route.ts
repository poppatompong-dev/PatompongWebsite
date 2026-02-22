import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Debug endpoint — fetches the Google Photos album HTML and returns
 * a diagnostic report: which URL patterns matched and a raw HTML excerpt.
 * Only accessible when logged in as admin.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ALBUM_URL = "https://photos.app.goo.gl/ZunewgjtckjmpNXs7";

    const response = await fetch(ALBUM_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8",
      },
    });

    const html = await response.text();
    const norm = html.replace(/\\\//g, "/");

    const patternA = [...norm.matchAll(/https?:\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const patternB = [...norm.matchAll(/\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const patternC = [...norm.matchAll(/"(AF1Qip[a-zA-Z0-9_-]{20,})"/g)].map(m => m[1]);

    // Find any lh3 mention at all
    const lh3Mentions = [...norm.matchAll(/lh3\.googleusercontent/g)].length;

    return NextResponse.json({
      httpStatus: response.status,
      finalUrl: response.url,
      htmlLengthChars: html.length,
      lh3Mentions,
      patternA_count: [...new Set(patternA)].length,
      patternB_count: [...new Set(patternB)].length,
      patternC_count: [...new Set(patternC)].length,
      patternA_sample: [...new Set(patternA)].slice(0, 3),
      patternC_sample: [...new Set(patternC)].slice(0, 3),
      htmlExcerpt_start: html.slice(0, 600),
      htmlExcerpt_lh3_context: (() => {
        const idx = norm.indexOf("lh3.googleusercontent");
        return idx >= 0 ? norm.slice(Math.max(0, idx - 50), idx + 200) : "NOT FOUND";
      })(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
