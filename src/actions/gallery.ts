import { unstable_cache } from "next/cache";
import { GalleryImage, CategoryType } from "@/types/gallery";

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

// Map of the top 30 carefully curated photos from the album.
// Keys are the exact Google Photos IDs (AF1Qip...)
const CURATED_PHOTOS: Record<string, { cat: CategoryType; desc: string }> = {
  "AP1GczMRup": { cat: "On-site Work", desc: "ช่างขึ้นรถกระเช้าจัดระเบียบสายสื่อสารหน้าอาคาร" },
  "AP1GczPJjI": { cat: "CCTV & Security", desc: "ติดตั้งกล้องวงจรปิดบนเสา พร้อมเก็บสายเข้ากล่องกันน้ำ" },
  "AP1GczPZRM": { cat: "Team & Training", desc: "ทีมงานทดสอบระบบกล้องและอุปกรณ์ในห้องประชุม" },
  "AP1GczP9wR": { cat: "Team & Training", desc: "ตั้งค่าอุปกรณ์บันทึกภาพและตรวจเช็คกล้องก่อนใช้งาน" },
  "AP1GczNJCX": { cat: "Team & Training", desc: "ประชุมทีมและสาธิตการใช้งานระบบกล้องในห้องควบคุม" },
  "AP1GczNmCK": { cat: "Network & Fiber", desc: "ติดตั้งอุปกรณ์รับสัญญาณไร้สายบนดาดฟ้าพร้อมเดินสาย" },
  "AP1GczMCmj": { cat: "Network & Fiber", desc: "ช่างตั้งค่าตู้ควบคุมภายในอาคารด้วยโน้ตบุ๊ก" },
  "AP1GczPkgh": { cat: "Network & Fiber", desc: "ตรวจสอบชุดอุปกรณ์สื่อสารบนดาดฟ้าและเตรียมเดินสาย" },
  "AP1GczOZR-": { cat: "Network & Fiber", desc: "ติดตั้งเสาสัญญาณและอุปกรณ์สื่อสารบนจุดสูง" },
  "AP1GczPhx5": { cat: "On-site Work", desc: "ทดสอบสัญญาณและเชื่อมต่ออุปกรณ์ภายนอกอาคาร" },
  "AP1GczPLfa": { cat: "Network & Fiber", desc: "ตั้งค่าระบบรับสัญญาณพร้อมจัดการสายบนดาดฟ้า" },
  "AP1GczOWTM": { cat: "Team & Training", desc: "ทีมงานเตรียมอุปกรณ์และทดสอบระบบในห้องปฏิบัติการ" },
  "AP1GczOKc9": { cat: "Network & Fiber", desc: "ตรวจเช็คสวิตช์และอุปกรณ์เครือข่ายในตู้แร็ค" },
  "AP1GczPRRa": { cat: "On-site Work", desc: "ช่างขึ้นบันไดติดตั้งและเดินสายบนเสาไฟ" },
  "AP1GczONVb": { cat: "On-site Work", desc: "งานลงพื้นที่ใช้รถกระเช้าซ่อมบำรุงสายสื่อสาร" },
  "AP1GczOaqY": { cat: "On-site Work", desc: "ทีมช่างจัดระเบียบสายสื่อสารบนเสาในย่านชุมชน" },
  "AP1GczMyFw": { cat: "Network & Fiber", desc: "ทีมงานช่วยกันคลี่สายสื่อสารจากม้วนสายขนาดใหญ่" },
  "AP1GczOCbw": { cat: "Network & Fiber", desc: "ใช้งานเครื่องฟิวชันสไปซ์สำหรับเชื่อมต่อไฟเบอร์ออปติก" },
  "AP1GczMJ-a": { cat: "Network & Fiber", desc: "ติดตั้งตู้ควบคุมพร้อมเดินสายเข้ารางเก็บสายอย่างเรียบร้อย" },
  "AP1GczOTZS": { cat: "Network & Fiber", desc: "ตรวจสอบและเข้าสายอุปกรณ์เครือข่ายในตู้เซิร์ฟเวอร์" },
  "AP1GczOr1f": { cat: "CCTV & Security", desc: "ทดสอบภาพจากกล้องวงจรปิดผ่านจอมอนิเตอร์หน้างาน" },
  "AP1GczPOOG": { cat: "CCTV & Security", desc: "หน้าจอควบคุม NVR แสดงภาพกล้องหลายจุดพร้อมกัน" },
  "AP1GczPun6": { cat: "CCTV & Security", desc: "ติดตั้งและต่อสายกล้องวงจรปิดแบบ IP พร้อมจ่ายไฟ" },
  "AP1GczORWq": { cat: "Team & Training", desc: "ประสานงานทีมช่างและแบ่งหน้าที่ในงานภาคสนาม" },
  "AP1GczPT6W": { cat: "On-site Work", desc: "ช่างทำงานบนบันไดแก้ไขสายสื่อสารริมแม่น้ำ" },
  "AP1GczMyQp": { cat: "On-site Work", desc: "ติดตั้งเสาและอุปกรณ์สื่อสารตลอดแนวทางเดิน" },
  "AP1GczP4lC": { cat: "On-site Work", desc: "ลงพื้นที่ติดตั้งสายสื่อสารและอุปกรณ์บนเสา" },
  "AP1GczONWv": { cat: "On-site Work", desc: "ปรับตำแหน่งโครงเหล็กและเดินสายระบบไฟบนเสาสูง" },
  "AP1GczMjc8": { cat: "On-site Work", desc: "ติดตั้งกล่องควบคุมและตรวจเช็คสายบนเสาไฟ" },
  "AP1GczNj6O": { cat: "CCTV & Security", desc: "ติดตั้งกล้องวงจรปิดเฝ้าระวังริมแม่น้ำ" },
};

async function _fetchAndCategorize(): Promise<GalleryImage[]> {
  try {
    const response = await fetch(PUBLIC_ALBUM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch public album: ${response.status}`);
    }

    const html = await response.text();
    const norm = html.replace(/\\\//g, "/");
    const found = new Map<string, string>(); // id -> fullUrl

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

    if (found.size === 0) {
      console.warn("[gallery] No photos found in album.");
      return [];
    }

    // Match the scraped URLs against our curated list of 30 best photos
    const curatedImages: GalleryImage[] = [];
    
    for (const [idPrefix, fullUrl] of found.entries()) {
      if (CURATED_PHOTOS[idPrefix]) {
        curatedImages.push({
          id: `photo_${idPrefix}`,
          url: `${fullUrl}=w800`,
          width: 1200,
          height: 800,
          category: CURATED_PHOTOS[idPrefix].cat,
          description: CURATED_PHOTOS[idPrefix].desc,
        });
      }
    }

    console.log(`[gallery] Scraped ${found.size} photos, found ${curatedImages.length} curated matches.`);
    return curatedImages;

  } catch (error) {
    console.error("Failed to fetch and categorize photos:", error);
    return [];
  }
}
