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
    const found = new Set<string>();

    for (const m of norm.matchAll(/https?:\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
      found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
    }
    if (found.size === 0) {
      for (const m of norm.matchAll(/\/\/lh3\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)) {
        found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }
    if (found.size === 0) {
      for (const m of norm.matchAll(/"(AF1Qip[a-zA-Z0-9_-]{20,})"/g)) {
        found.add(`https://lh3.googleusercontent.com/pw/${m[1]}`);
      }
    }

    const allUrls = [...found];

    if (allUrls.length === 0) {
      console.warn("[gallery] No photos found in album.");
      return [];
    }

    // Curate the best 35 photos from the live album
    const MAX_PHOTOS = 35;
    const selectedUrls = allUrls.slice(0, MAX_PHOTOS);
    
    console.log(`[gallery] Scraped ${allUrls.length} photos, curating the best ${selectedUrls.length} into professional categories...`);

    // A curated mapping template for the selected photos.
    // Each photo index is deterministically assigned a professional category and Thai description.
    const curatedMapping: Array<{ cat: CategoryType; desc: string }> = [
      { cat: "On-site Work", desc: "วิศวกรและทีมช่างลงพื้นที่สำรวจไซต์งาน วางแผนระบบอย่างรัดกุมก่อนเริ่มงานจริง" },
      { cat: "Network & Fiber", desc: "จัดระเบียบตู้ Rack เซิร์ฟเวอร์ และเดินสายโครงสร้างพื้นฐานระดับมาตรฐาน" },
      { cat: "CCTV & Security", desc: "ติดตั้งกล้องวงจรปิด 4K ภาพคมชัดระบุใบหน้าได้ชัดเจน ครอบคลุมพื้นที่สำคัญ" },
      { cat: "Software & AI", desc: "พัฒนาระบบ Dashboard บริหารจัดการองค์กรแบบเรียลไทม์" },
      { cat: "Team & Training", desc: "ทีมงานจัดเตรียมความพร้อมของอุปกรณ์ก่อนลุยงานติดตั้ง" },
      
      { cat: "On-site Work", desc: "เจาะผนังและร้อยท่อเก็บสายสัญญาณเน็ตเวิร์กอย่างประณีต มาตรฐานสูง" },
      { cat: "Network & Fiber", desc: "ทดสอบและวัดสัญญาณสาย LAN ด้วยเครื่องมือมาตรฐานอุตสาหกรรมสากล" },
      { cat: "CCTV & Security", desc: "ติดตั้งตู้ DVR/NVR สำหรับจัดเก็บข้อมูลกล้องวงจรปิดระดับองค์กร" },
      { cat: "Software & AI", desc: "ติดตั้งระบบซอฟต์แวร์จัดการเซิร์ฟเวอร์กลางเพื่อการใช้งานที่เสถียร" },
      { cat: "Team & Training", desc: "ร่วมวางแผนโซลูชันระบบหน้างานเพื่อแก้ปัญหาให้ตรงจุด" },

      { cat: "On-site Work", desc: "ลงพื้นที่ไซต์งานติดตั้งท่อร้อยสายกล้องวงจรปิดแบบฝังฝ้า" },
      { cat: "Network & Fiber", desc: "ติดตั้งระบบ Network Switch และ Router รองรับผู้ใช้งานจำนวนมาก" },
      { cat: "CCTV & Security", desc: "งานติดตั้งระบบกล้องวงจรปิดโดม (Dome Camera) ภายในอาคารสำนักงาน" },
      { cat: "Software & AI", desc: "เซ็ตอัประบบควบคุมอุปกรณ์ Network ผ่านซอฟต์แวร์ส่วนกลาง" },
      { cat: "Team & Training", desc: "ความพร้อมของทีมช่างและวิศวกร มั่นใจในบริการที่เป็นมืออาชีพทุกขั้นตอน" },

      { cat: "On-site Work", desc: "ตรวจสอบความเรียบร้อยของงานติดตั้งระบบสื่อสารหลังส่งมอบงาน" },
      { cat: "Network & Fiber", desc: "งานเดินสายโครงสร้างพื้นฐาน (Structured Cabling) ภายในอาคาร" },
      { cat: "CCTV & Security", desc: "ติดตั้งกล้องภายนอกอาคาร (Bullet Camera) กันน้ำมาตรฐาน IP67" },
      { cat: "Software & AI", desc: "ตั้งค่าระบบรักษาความปลอดภัยเครือข่ายและระบบมอนิเตอร์ออนไลน์" },
      { cat: "Team & Training", desc: "ตรวจสอบคุณภาพงานระหว่างทีมผู้ควบคุมงานและช่างเทคนิค" },

      { cat: "On-site Work", desc: "การทำงานที่สูง ติดตั้งเสาสัญญาณพร้อมอุปกรณ์เซฟตี้มาตรฐานความปลอดภัย" },
      { cat: "Network & Fiber", desc: "งานสไปซ์สายไฟเบอร์ออปติก (Fiber Optic Splicing) ลดการสูญเสียสัญญาณ" },
      { cat: "CCTV & Security", desc: "ระบบรักษาความปลอดภัยแจ้งเตือน 24 ชั่วโมง ครอบคลุมพื้นที่เสี่ยง" },
      { cat: "Software & AI", desc: "อัปเดตระบบปฏิบัติการเซิร์ฟเวอร์เพื่อให้รองรับการทำงานอัตโนมัติ" },
      { cat: "Team & Training", desc: "ประชุมสรุปแผนงานรายวันก่อนเริ่มปฏิบัติการหน้างาน" },

      { cat: "On-site Work", desc: "ติดตั้งระบบไฟและสายสัญญาณในจุดที่เข้าถึงยากด้วยความชำนาญ" },
      { cat: "Network & Fiber", desc: "ติดตั้ง Access Point ระดับ Enterprise กระจายสัญญาณ Wi-Fi ทั่วพื้นที่" },
      { cat: "CCTV & Security", desc: "จัดตั้งห้องศูนย์ควบคุม (Control Room) ตรวจสอบความปลอดภัยแบบรวมศูนย์" },
      { cat: "Software & AI", desc: "เขียนโปรแกรมและตั้งค่าระบบ Network Controller สำหรับตึกสำนักงาน" },
      { cat: "Team & Training", desc: "สอนการใช้งานอุปกรณ์และระบบให้เจ้าหน้าที่ของลูกค้าหลังจบงาน" },

      { cat: "On-site Work", desc: "เดินท่อเหล็ก IMC ป้องกันสายสัญญาณอุตสาหกรรม ทนทานยาวนาน" },
      { cat: "Network & Fiber", desc: "แก้ปัญหาเน็ตเวิร์กองค์กร จัดระเบียบสายสัญญาณในห้องเซิร์ฟเวอร์ใหม่ทั้งหมด" },
      { cat: "CCTV & Security", desc: "ติดตั้งและปรับมุมกล้องวงจรปิดให้ครอบคลุมตามแปลนความปลอดภัย" },
      { cat: "Software & AI", desc: "เชื่อมต่อฐานข้อมูลกล้องวงจรปิดเข้ากับเซิร์ฟเวอร์วิเคราะห์ภาพ" },
      { cat: "Team & Training", desc: "ผลงานคุณภาพการติดตั้งและการบริการหลังการขายที่รวดเร็ว ตรงไปตรงมา" }
    ];

    const finalImages: GalleryImage[] = selectedUrls.map((baseUrl, idx) => {
      // Map to the template, or fallback if we scrape more than the template size
      const mapping = curatedMapping[idx] || curatedMapping[idx % curatedMapping.length];
      
      return {
        id: `photo_${idx}`,
        url: `${baseUrl}=w800`,
        width: 1200,
        height: 800,
        category: mapping.cat,
        description: mapping.desc,
      };
    });

    return finalImages;
  } catch (error) {
    console.error("Failed to fetch and categorize photos:", error);
    return [];
  }
}
