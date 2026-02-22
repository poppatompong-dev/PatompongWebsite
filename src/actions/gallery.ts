"use server";

import { unstable_cache } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GalleryImage, CategoryType } from "@/types/gallery";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// The public Google Photos album URL provided by the user
const PUBLIC_ALBUM_URL = "https://photos.app.goo.gl/ZunewgjtckjmpNXs7";

// Cached version — Gemini classification runs at most once per hour
const getCachedPhotos = unstable_cache(
  async () => _fetchAndClassify(),
  ["gallery-photos"],
  { revalidate: 3600, tags: ["gallery"] }
);

export async function fetchAndClassifyPhotos(): Promise<GalleryImage[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Missing GEMINI_API_KEY, returning mock data");
      return getMockData();
    }
    return await getCachedPhotos();
  } catch (error) {
    console.error("fetchAndClassifyPhotos error:", error);
    return getMockData();
  }
}

async function _fetchAndClassify(): Promise<GalleryImage[]> {
  try {

    // 1. Scrape the public Google Photos album for image URLs
    const response = await fetch(PUBLIC_ALBUM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch public album: ${response.status}`);
    }

    const html = await response.text();

    // Google Photos embeds URLs inside JSON script tags with escaped slashes (\/),
    // protocol-relative URLs (//lh3...), and sometimes only AF1Qip photo IDs.
    // Strategy: normalize, then try three patterns in order of specificity.

    // 1. Normalize JSON-escaped forward slashes so regex can match
    const norm = html.replace(/\\\//g, "/");

    const found = new Set<string>();

    // Pattern A: full https URL with /pw/ prefix
    for (const m of norm.matchAll(/https?:\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
      found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
    }

    // Pattern B: protocol-relative URL //lh3...
    if (found.size === 0) {
      for (const m of norm.matchAll(/\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
        found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }

    // Pattern C: bare AF1Qip photo IDs embedded in JSON arrays
    if (found.size === 0) {
      for (const m of norm.matchAll(/"(AF1Qip[a-zA-Z0-9_-]{20,})"/g)) {
        found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }

    const allUrls = [...found];

    if (allUrls.length === 0) {
      console.warn("[gallery] No photos found. Raw HTML preview:", html.slice(0, 800));
      return getMockData();
    }

    // Cap to the most-recent MAX_PHOTOS to keep Gemini classification time reasonable.
    // Google Photos embeds photos in reverse-chronological order (newest first).
    const MAX_PHOTOS = 30;
    const uniqueBaseUrls = allUrls.slice(0, MAX_PHOTOS);

    console.log(`[gallery] Found ${allUrls.length} photos total, classifying newest ${uniqueBaseUrls.length} with Gemini AI...`);

    // 2. Process images sequentially with delay to respect Gemini free-tier rate limits
    const classifiedImages: GalleryImage[] = [];
    
    for (let i = 0; i < uniqueBaseUrls.length; i++) {
      const baseUrl = uniqueBaseUrls[i];
      const id = `photo_${i}`;
      try {
        const downloadUrl = `${baseUrl}=w512-h512`;
        const displayUrl = `${baseUrl}=w800`;
        
        const { category, description } = await classifyImageWithGemini(downloadUrl);
        classifiedImages.push({
          id,
          url: displayUrl,
          width: 1200,
          height: 800,
          category,
          description: description || `ผลงาน ${i + 1}`,
        });
      } catch (e) {
        console.error(`Error classifying image ${id}:`, e);
        classifiedImages.push({
          id,
          url: `${baseUrl}=w800`,
          width: 1200,
          height: 800,
          category: "Uncategorized" as CategoryType,
        });
      }
      
      // Delay between calls to respect Gemini free-tier rate limits (5 RPM = 12s/request)
      if (i < uniqueBaseUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 13000));
      }
    }

    return classifiedImages;
  } catch (error) {
    console.error("Failed to fetch and classify photos:", error);
    return getMockData();
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function classifyImageWithGemini(
  imageUrl: string,
  attempt = 1
): Promise<{ category: CategoryType; description: string }> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch image bytes");

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
      },
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `You are an AI assistant for a Thai IT company portfolio website.
Analyze this image carefully and respond with a JSON object (no markdown, no extra text) with two fields:

1. "category": Pick EXACTLY ONE from this list:
   - "CCTV & Security"       → security cameras, CCTV dome/bullet cameras, DVR/NVR boxes, monitoring rooms, camera brackets, cable conduits for CCTV
   - "Network & Fiber"       → server racks, network switches/routers, fiber optic cables/splicing, patch panels, cable trays, UTP crimping, structured cabling, LAN/WAN equipment, communication towers
   - "Software & AI"         → computer screens showing dashboards, web apps, code editors, data reports, spreadsheets, LINE bots, admin panels, software UIs
   - "On-site Work"          → technician or team actively installing/working hands-on in the field, climbing ladders, drilling, pulling cables, on rooftop/ceiling work
   - "Team & Training"       → group photos of people, team meetings, classroom training, certificates, awards, whiteboard sessions, office environments
   - "Uncategorized"         → cannot clearly identify any of the above

2. "description": Write a SHORT, vivid Thai description (10–20 words) that captures what is happening in the photo and why it shows expertise. Make it confident, professional, and specific. Examples: "ติดตั้งกล้อง 4K มุมสูง ครอบคลุมทุกจุดเสี่ยง", "เดินสายไฟเบอร์ออปติกอย่างเป็นระเบียบ ลดการสูญเสียสัญญาณ", "ห้อง Server ได้มาตรฐาน จัดการสายสวยงาม"

Respond with ONLY valid JSON like: {"category":"CCTV & Security","description":"..."}`;

    const result = await model.generateContent([prompt, imagePart]);
    const raw = result.response.text().trim();

    // Strip possible markdown code fences
    const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);

    const validCategories: CategoryType[] = [
      "CCTV & Security",
      "Network & Fiber",
      "Software & AI",
      "On-site Work",
      "Team & Training",
      "Uncategorized",
    ];

    const category: CategoryType = validCategories.includes(parsed.category)
      ? parsed.category
      : "Uncategorized";

    return {
      category,
      description: typeof parsed.description === "string" ? parsed.description : "",
    };
  } catch (error: any) {
    if (error?.status === 429 && attempt <= 3) {
      const waitMs = attempt * 15000;
      console.warn(`Gemini 429 rate limit, retry ${attempt}/3 in ${waitMs / 1000}s...`);
      await sleep(waitMs);
      return classifyImageWithGemini(imageUrl, attempt + 1);
    }
    console.error("Gemini classification failed:", error);
    return { category: "Uncategorized", description: "" };
  }
}

function getMockData(): GalleryImage[] {
  return [
    { id: "1",  url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network & Fiber",     description: "ห้อง Server ได้มาตรฐาน สายเป็นระเบียบ ค้นหาง่าย" },
    { id: "2",  url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV & Security",    description: "กล้องภาพชัด ดูง่าย ทั้งกลางวันและกลางคืน" },
    { id: "3",  url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software & AI",     description: "Dashboard บริหารข้อมูลองค์กรแบบ Real-time" },
    { id: "4",  url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network & Fiber",     description: "เดินสาย LAN อย่างเป็นระเบียบ คงทนยาวนาน" },
    { id: "5",  url: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV & Security",   description: "ติดตั้งกล้องครอบคลุมทุกจุด ปลอดภัยตลอด 24 ชม." },
    { id: "6",  url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software & AI",     description: "ระบบรายงานผลอัตโนมัติ ลดงานซ้ำซ้อนได้ทันที" },
    { id: "7",  url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network & Fiber",    description: "เดินสายไฟเบอร์ออปติก สัญญาณแรง ไม่หลุดไม่สะดุด" },
    { id: "8",  url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software & AI",     description: "ระบบ AI Automation ลดเวลางานลงกว่า 70%" },
    { id: "9",  url: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV & Security",    description: "ศูนย์ควบคุมกล้องวงจรปิด ดูแลได้จากทุกที่" },
    { id: "10", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "On-site Work",      description: "ลงพื้นที่จริง ทำงานละเอียด ไม่ทิ้งงาน" },
    { id: "11", url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "On-site Work",      description: "ช่างผู้เชี่ยวชาญลงพื้นที่ติดตั้งด้วยตนเอง" },
    { id: "12", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Team & Training",   description: "อบรมทีมงานเพิ่มทักษะใหม่ รองรับเทคโนโลยียุค AI" },
  ];
}
