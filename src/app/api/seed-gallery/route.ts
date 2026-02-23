import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CURATED_PHOTOS: Record<string, { cat: string; desc: string }> = {
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

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    let seeded = 0;
    let skipped = 0;

    for (const [id, data] of Object.entries(CURATED_PHOTOS)) {
      await prisma.galleryPhoto.upsert({
        where: { id },
        update: {
          category: data.cat,
          description: data.desc,
          isHidden: false,
        },
        create: {
          id,
          category: data.cat,
          description: data.desc,
          isHidden: false,
        },
      });
      seeded++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded} photos, skipped ${skipped}`,
      total: seeded,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.galleryPhoto.count();
    const visible = await prisma.galleryPhoto.count({ where: { isHidden: false } });
    return NextResponse.json({ total: count, visible, hidden: count - visible });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
