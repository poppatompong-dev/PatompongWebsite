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
    
    // Extract base URLs using regex (Google Photos uses lh3.googleusercontent.com/pw/...)
    const urlMatches = [...html.matchAll(/(https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const uniqueBaseUrls = [...new Set(urlMatches)];

    if (uniqueBaseUrls.length === 0) {
      console.log("No photos found in the public album.");
      return getMockData();
    }

    console.log(`Found ${uniqueBaseUrls.length} photos in public album. Processing...`);

    // 2. Process images sequentially with delay to respect Gemini free-tier rate limits
    const classifiedImages: GalleryImage[] = [];
    
    for (let i = 0; i < uniqueBaseUrls.length; i++) {
      const baseUrl = uniqueBaseUrls[i];
      const id = `photo_${i}`;
      try {
        const downloadUrl = `${baseUrl}=w1024-h1024`;
        const displayUrl = `${baseUrl}=w800`;
        
        const category = await classifyImageWithGemini(downloadUrl);
        classifiedImages.push({
          id,
          url: displayUrl,
          width: 1200,
          height: 800,
          category,
          description: `ผลงาน ${i + 1}`,
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

async function classifyImageWithGemini(imageUrl: string, attempt = 1): Promise<CategoryType> {
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this image and classify it into exactly ONE of the following categories:
1. "Network/Infrastructure" (servers, racks, network cables, routers, switches, fiber optic, IT infrastructure setup)
2. "CCTV/Security" (security cameras, CCTV systems, monitoring screens, security camera installations)
3. "Software/Development" (code, software dashboards, web applications, programming, computer screens with software)
4. "Action" (technician working on-site, people installing equipment, field work, team at work, installation process in progress)
5. "Uncategorized" (doesn't clearly fit into any of the above)

Reply ONLY with the exact category name from the list above, nothing else.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    if (responseText.includes("Network/Infrastructure")) return "Network/Infrastructure";
    if (responseText.includes("CCTV/Security")) return "CCTV/Security";
    if (responseText.includes("Software/Development")) return "Software/Development";
    if (responseText.includes("Action")) return "Action";
    
    return "Uncategorized";
  } catch (error: any) {
    // Retry on 429 rate limit with exponential backoff (max 3 attempts)
    if (error?.status === 429 && attempt <= 3) {
      const waitMs = attempt * 15000; // 15s, 30s, 45s
      console.warn(`Gemini 429 rate limit, retry ${attempt}/3 in ${waitMs / 1000}s...`);
      await sleep(waitMs);
      return classifyImageWithGemini(imageUrl, attempt + 1);
    }
    console.error("Gemini classification failed:", error);
    return "Uncategorized";
  }
}

function getMockData(): GalleryImage[] {
  return [
    { id: "1", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network/Infrastructure", description: "เน็ตแรงทุกห้อง ไม่มีสะดุด" },
    { id: "2", url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV/Security", description: "ภาพชัดดูง่าย ทั้งกลางวันและกลางคืน" },
    { id: "3", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software/Development", description: "ระบบจัดการข้อมูลสั่งงานได้จากมือถือ" },
    { id: "4", url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network/Infrastructure", description: "สายสะอาด เป็นระเบียบ คงทนยาวนาน" },
    { id: "5", url: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV/Security", description: "ครอบคลุมทุกจุด ปลอดภัยตลอด 24 ชม." },
    { id: "6", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software/Development", description: "Dashboard รายงานผลแบบ Real-time" },
    { id: "7", url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Network/Infrastructure", description: "ไฟเบอร์ออปติก สัญญาณแรง ไม่หลุด" },
    { id: "8", url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Software/Development", description: "ระบบอัตโนมัติ ลดงานซ้ำซ้อน ประหยัดเวลา" },
    { id: "9", url: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "CCTV/Security", description: "ศูนย์ควบคุมกล้อง ดูแบบ Real-time ได้ทุกที่" },
    { id: "10", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Action", description: "ลงพื้นที่จริง ทำงานละเอียด ไม่ทิ้งงาน" },
    { id: "11", url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1200&auto=format&fit=crop", width: 1200, height: 800, category: "Action", description: "ช่างผู้เชี่ยวชาญ เข้าถึงทุกพื้นที่" },
  ];
}
