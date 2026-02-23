import { unstable_cache } from "next/cache";
import { GalleryImage, CategoryType } from "@/types/gallery";
import { prisma } from "@/lib/prisma";

const PUBLIC_ALBUM_URL = "https://photos.app.goo.gl/ZunewgjtckjmpNXs7";

// Cache the scrape for 1 hour
const getCachedPhotos = unstable_cache(
  async () => _fetchAndCategorize(),
  ["gallery-photos"],
  { revalidate: 3600, tags: ["gallery"] }
);

export async function fetchAndClassifyPhotos(): Promise<GalleryImage[]> {
  try {
    return await getCachedPhotos();
  } catch (error) {
    console.error("fetchAndClassifyPhotos error:", error);
    return [];
  }
}

export async function getAllRawPhotos(): Promise<{ id: string; url: string }[]> {
  try {
    const response = await fetch(PUBLIC_ALBUM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) throw new Error("Failed to fetch");
    
    const html = await response.text();
    const norm = html.replace(/\\\//g, "/");
    const found = new Map<string, string>();

    for (const m of norm.matchAll(/https?:\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
      found.set(m[1].substring(0, 10), `https://lh3.googleusercontent.com/pw/${m[1]}`);
    }
    if (found.size === 0) {
      for (const m of norm.matchAll(/\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
        found.set(m[1].substring(0, 10), `https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }
    if (found.size === 0) {
      for (const m of norm.matchAll(/"(AF1Qip[a-zA-Z0-9_-]{20,})"/g)) {
        found.set(m[1].substring(0, 10), `https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }
    
    return Array.from(found.entries()).map(([id, url]) => {
      // ใช้ Cloudinary Fetch API ตาม Cloud Name จาก Environment Variables
      // ช่วยปรับขนาด, บีบอัดเป็น WebP (f_auto), และปรับคุณภาพ (q_auto) ให้เว็บโหลดเร็วที่สุด
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwrvnlg6e";
      return {
        id,
        url: `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_800/${url}`
      };
    });
  } catch (error) {
    console.error("Error fetching raw photos:", error);
    return [];
  }
}

async function _fetchAndCategorize(): Promise<GalleryImage[]> {
  try {
    // 1. Get raw photos from Google
    const rawPhotos = await getAllRawPhotos();
    if (rawPhotos.length === 0) return [];

    // 2. Get curated metadata from database
    const savedMetadata = await prisma.galleryPhoto.findMany({
      where: { isHidden: false }
    });
    
    // Create a map for quick lookup
    const metadataMap = new Map<string, { id: string; category: string; description: string | null; isHidden: boolean }>(savedMetadata.map((p: any) => [p.id, p]));

    // 3. Combine and filter only visible photos
    const curatedImages: GalleryImage[] = [];
    
    for (const raw of rawPhotos) {
      const meta = metadataMap.get(raw.id);
      if (meta) {
        curatedImages.push({
          id: raw.id,
          url: raw.url,
          width: 1200,
          height: 800,
          category: meta.category as CategoryType,
          description: meta.description || undefined,
        });
      }
    }

    console.log(`[gallery] Built ${curatedImages.length} visible photos from ${rawPhotos.length} total.`);
    return curatedImages;

  } catch (error) {
    console.error("Failed to fetch and categorize photos:", error);
    return [];
  }
}
