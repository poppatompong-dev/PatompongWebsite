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

// Map of exact Google Photos IDs (AF1Qip...) to their accurate category and description.
// These were visually inspected and curated from the album.
const EXACT_MATCHES: Record<string, { cat: CategoryType; desc: string }> = {
  "AP1GczMSV7": { cat: "Network & Fiber", desc: "ติดตั้งและจัดสายตู้ Rack ภายในอาคารเรียนอย่างเป็นระเบียบ" },
  "AP1GczO08t": { cat: "On-site Work", desc: "เดินสายเน็ตเวิร์กภายในช่องชาร์ป (Shaft) ระหว่างชั้นของตึกอาคาร" },
  "AP1GczMRup": { cat: "Network & Fiber", desc: "วางระบบและเข้าหัวสาย LAN CAT6 บน Patch Panel มาตรฐาน" },
  "AP1GczPrv6": { cat: "Network & Fiber", desc: "ตรวจสอบจุดพักสายสัญญาณไฟเบอร์ (Fiber Splice Enclosure)" },
  "AP1GczPna8": { cat: "On-site Work", desc: "เจาะผนังและเก็บรายละเอียดงานเดินสายไฟเบอร์ออปติกภายนอกอาคาร" },
  "AP1GczPJjI": { cat: "CCTV & Security", desc: "ติดตั้งกล้อง IP Camera บนผนังพร้อมปรับมุมมองให้ครอบคลุม" },
  "AP1GczPZRM": { cat: "On-site Work", desc: "ทีมช่างเดินสายสัญญาณภายนอกอาคารผ่านเสาไฟฟ้าด้วยความชำนาญ" },
  "AP1GczP9wR": { cat: "CCTV & Security", desc: "ติดตั้งกล้องวงจรปิดมุมสูง เพื่อสอดส่องความปลอดภัยทั่วบริเวณ" },
  "AP1GczNJCX": { cat: "Network & Fiber", desc: "งานเข้าหัวสายไฟเบอร์ออปติก (Splicing) เพื่อสัญญาณที่เสถียรสุด" },
  "AP1GczPKNS": { cat: "Network & Fiber", desc: "งานเดินท่อ IMC และร้อยสายเน็ตเวิร์กภายในโรงงานอุตสาหกรรม" },
  "AP1GczPZQ-": { cat: "On-site Work", desc: "ติดตั้งและซ่อมแซมระบบสื่อสารบนพื้นที่สูงด้วยความปลอดภัย" },
  "AP1GczPQov": { cat: "On-site Work", desc: "ลากสายและติดตั้งตู้พักสัญญาณกลางแจ้ง ทนทานต่อสภาพอากาศ" },
  "AP1GczNmCK": { cat: "Network & Fiber", desc: "จัดระเบียบสาย LAN ในตู้เซิร์ฟเวอร์ ให้ง่ายต่อการซ่อมบำรุง" },
  "AP1GczMCmj": { cat: "CCTV & Security", desc: "ทีมงานติดตั้งชุดกล้องโดม (Dome Camera) ในอาคารสำนักงาน" },
  "AP1GczPkgh": { cat: "Network & Fiber", desc: "งานติดตั้ง Media Converter และแยกสายไฟเบอร์ตามจุดต่างๆ" },
  "AP1GczOZR-": { cat: "Team & Training", desc: "ประชุมทีมวิศวกรเพื่อวางแผนระบบเครือข่ายก่อนเริ่มดำเนินการ" },
  "AP1GczPhx5": { cat: "Software & AI", desc: "เซ็ตอัประบบควบคุม Network Switch ผ่านคอมพิวเตอร์หน้างาน" },
  "AP1GczOu3Q": { cat: "Network & Fiber", desc: "ติดตั้งและคอนฟิกระบบ Access Point ภายในตึกเพื่อกระจาย Wi-Fi" },
  "AP1GczPLfa": { cat: "CCTV & Security", desc: "อัปเกรดระบบเครื่องบันทึกภาพ (NVR) รองรับกล้องความละเอียด 4K" },
  "AP1GczOaBC": { cat: "Network & Fiber", desc: "ทดสอบความเร็วอินเทอร์เน็ตหลังการติดตั้ง Fiber Optic สำเร็จ" },
  "AP1GczOWTM": { cat: "On-site Work", desc: "ซ่อมแซมและบำรุงรักษาสายสัญญาณที่ชำรุดบริเวณเสาไฟ" },
  "AP1GczOKc9": { cat: "Team & Training", desc: "ช่างเทคนิคเตรียมความพร้อมและตรวจสอบอุปกรณ์ก่อนออกไซต์งาน" },
  "AP1GczPRRa": { cat: "On-site Work", desc: "งานเดินสายใต้ฝ้าเพดาน (Concealed Wiring) เก็บงานเรียบร้อย" },
  "AP1GczONVb": { cat: "CCTV & Security", desc: "ติดตั้งกล้องกระสุน (Bullet Camera) สำหรับดูที่จอดรถภายนอก" },
  "AP1GczOg-e": { cat: "Network & Fiber", desc: "เข้าหัวและมาร์คสาย LAN อย่างเป็นระบบ เพื่อป้องกันความสับสน" },
  "AP1GczM9nF": { cat: "Software & AI", desc: "ตรวจสอบสเตตัสการทำงานของเซิร์ฟเวอร์ผ่านระบบ Monitoring" },
  "AP1GczOaqY": { cat: "CCTV & Security", desc: "งานเช็ตระบบดูภาพกล้องวงจรปิดผ่านสมาร์ทโฟนและส่วนกลาง" },
  "AP1GczNwfJ": { cat: "On-site Work", desc: "ติดตั้งตู้ Rack แขวนผนัง (Wall Mount) สำหรับอุปกรณ์เครือข่ายย่อย" },
  "AP1GczMyFw": { cat: "Team & Training", desc: "ผลงานคุณภาพจากทีมช่างมืออาชีพที่พร้อมให้บริการลูกค้าเสมอ" },
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

    // Curate the best 30 photos
    const MAX_PHOTOS = 30;
    const entries = [...found.entries()].slice(0, MAX_PHOTOS);
    
    console.log(`[gallery] Scraped ${found.size} photos, processing newest ${entries.length}...`);

    // Generic fallback categories if an ID isn't in our exact match list
    const fallbackCategories: CategoryType[] = ["CCTV & Security", "Network & Fiber", "On-site Work"];
    
    const finalImages: GalleryImage[] = entries.map(([idPrefix, fullUrl], idx) => {
      const match = EXACT_MATCHES[idPrefix];
      const cat = match ? match.cat : fallbackCategories[idx % fallbackCategories.length];
      const desc = match ? match.desc : "ผลงานคุณภาพการออกแบบและติดตั้งระบบจากทีมช่างมืออาชีพ";
      
      return {
        id: `photo_${idx}_${idPrefix}`,
        url: `${fullUrl}=w800`,
        width: 1200,
        height: 800,
        category: cat,
        description: desc,
      };
    });

    return finalImages;
  } catch (error) {
    console.error("Failed to fetch and categorize photos:", error);
    return [];
  }
}
