import { GalleryImage } from "@/types/gallery";

/**
 * Pre-analyzed, static portfolio data.
 * No live scraping or Gemini API calls are made to avoid rate limits and slow load times.
 * You can add more photos here directly from your Google Photos URLs.
 */
export async function fetchAndClassifyPhotos(): Promise<GalleryImage[]> {
  // Return the photos in a randomized order so the gallery looks natural
  return [...galleryData].sort(() => Math.random() - 0.5);
}

const galleryData: GalleryImage[] = [
    // === CCTV & Security ===
    { id: "cctv_1", url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ติดตั้งกล้องวงจรปิดความละเอียด 4K ภาพคมชัดระบุใบหน้าได้ชัดเจน" },
    { id: "cctv_2", url: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ระบบกล้องจับการเคลื่อนไหวอัตโนมัติ ครอบคลุมพื้นที่โกดังสินค้า" },
    { id: "cctv_3", url: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ห้องศูนย์ควบคุม (Control Room) ตรวจสอบความปลอดภัยแบบเรียลไทม์ 24 ชม." },
    { id: "cctv_4", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "งานติดตั้งระบบกล้องวงจรปิดโดม (Dome Camera) ภายในอาคารสำนักงาน" },
    { id: "cctv_5", url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ระบบรักษาความปลอดภัยพร้อม AI แจ้งเตือนเมื่อมีผู้บุกรุกเข้าพื้นที่หวงห้าม" },
    { id: "cctv_6", url: "https://images.unsplash.com/photo-1563207153-f403bf289096?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ตู้ NVR/DVR จัดเก็บข้อมูลภาพกล้องวงจรปิดระดับองค์กร ปลอดภัยข้อมูลไม่สูญหาย" },
    { id: "cctv_7", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "CCTV & Security", description: "ติดตั้งกล้องภายนอกอาคาร (Bullet Camera) ทนแดดทนฝน กันน้ำมาตรฐาน IP67" },
    
    // === Network & Fiber ===
    { id: "net_1", url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "จัดระเบียบตู้ Rack เซิร์ฟเวอร์ และเดินสาย LAN เป็นระเบียบเรียบร้อย" },
    { id: "net_2", url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "สไปซ์สายไฟเบอร์ออปติก (Fiber Optic Splicing) ลดการสูญเสียสัญญาณ" },
    { id: "net_3", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "ติดตั้งระบบ Network Switch และ Router รองรับผู้ใช้งานหลักร้อยคน" },
    { id: "net_4", url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "งานเดินสายโครงสร้างพื้นฐาน (Structured Cabling) สำหรับอาคาร 5 ชั้น" },
    { id: "net_5", url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "ติดตั้ง Access Point กระจายสัญญาณ Wi-Fi ครอบคลุมทั่วทั้งโรงงาน" },
    { id: "net_6", url: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "แก้ปัญหาเน็ตเวิร์กองค์กร จัดระเบียบห้องเซิร์ฟเวอร์ใหม่ทั้งหมด" },
    { id: "net_7", url: "https://images.unsplash.com/photo-1515600235619-3db9a5bc6512?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Network & Fiber", description: "ทดสอบและวัดสัญญาณสาย LAN ด้วยเครื่องมือมาตรฐาน Fluke Networks" },

    // === Software & AI ===
    { id: "soft_1", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "พัฒนาระบบ Web Application จัดการสต็อกสินค้า ตัดยอดแบบเรียลไทม์" },
    { id: "soft_2", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "ระบบ Dashboard สรุปยอดขายรายวันเชื่อมต่อกับฐานข้อมูลบริษัท" },
    { id: "soft_3", url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "เขียนสคริปต์ Python ทำ Data Automation ลดเวลาทำงานจาก 3 ชม. เหลือ 5 นาที" },
    { id: "soft_4", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "สร้างระบบ LINE OA Chatbot รับออเดอร์อัตโนมัติตลอด 24 ชั่วโมง" },
    { id: "soft_5", url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "Google Apps Script ดึงข้อมูลจากฟอร์มลง Google Sheets และแจ้งเตือนผ่านไลน์" },
    { id: "soft_6", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "พัฒนาระบบ AI ตรวจจับใบหน้าพนักงานเพื่อบันทึกเวลาเข้า-ออกงาน" },
    { id: "soft_7", url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Software & AI", description: "ระบบ Admin Panel จัดการคิวงานช่างและติดตามสถานะงาน" },

    // === On-site Work ===
    { id: "site_1", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "ทีมช่างลงพื้นที่ประเมินหน้างานและวางแผนจุดติดตั้งกล้องก่อนเริ่มงานจริง" },
    { id: "site_2", url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "การทำงานที่สูง ติดตั้งเสาสัญญาณด้วยอุปกรณ์เซฟตี้มาตรฐานความปลอดภัย" },
    { id: "site_3", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "ช่างเทคนิคเจาะผนังและร้อยท่อเก็บสายเน็ตเวิร์กอย่างประณีต" },
    { id: "site_4", url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "ลงพื้นที่ไซต์ก่อสร้าง เดินท่อร้อยสายกล้องวงจรปิดแบบฝังฝ้า" },
    { id: "site_5", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "วิศวกรตรวจสอบและตั้งค่าระบบ (Commissioning) ก่อนส่งมอบงานให้ลูกค้า" },
    { id: "site_6", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "แก้ไขปัญหาระบบไอทีฉุกเฉินนอกสถานที่ บริการรวดเร็วไม่ทิ้งงาน" },
    { id: "site_7", url: "https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "On-site Work", description: "งานติดตั้งแขนกั้นรถอัตโนมัติ (Barrier Gate) พร้อมกล้องอ่านป้ายทะเบียน" },

    // === Team & Training ===
    { id: "team_1", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "การอบรมเพิ่มทักษะช่างไอที อัปเดตเทคโนโลยีระบบกล้องวงจรปิดรุ่นใหม่" },
    { id: "team_2", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "ประชุมทีมงานวางแผนโซลูชันซอฟต์แวร์สำหรับลูกค้าระดับองค์กร" },
    { id: "team_3", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "สอนการใช้งานระบบซอฟต์แวร์ให้พนักงานของลูกค้าจนกว่าจะใช้งานเป็น" },
    { id: "team_4", url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "ทีมผู้เชี่ยวชาญร่วมระดมสมองแก้ปัญหาระบบเซิร์ฟเวอร์แบบเร่งด่วน" },
    { id: "team_5", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "บรรยากาศในออฟฟิศ ทีม Developer กำลังพัฒนา Web Application เดโม" },
    { id: "team_6", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "นำเสนอผลงานและระบบต้นแบบให้ลูกค้าประเมินก่อนลงมือพัฒนาจริง" },
    { id: "team_7", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1024&auto=format&fit=crop", width: 1024, height: 683, category: "Team & Training", description: "ทีมงานช่างภาพและผู้เชี่ยวชาญ เตรียมความพร้อมก่อนออกลุยหน้างาน" },
];
