import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function humanName(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/^\d+_/, "")
    .replace(/_\d+$/, "")
    .replace(/_/g, " ");
}

async function scanTempPhotos(): Promise<{ id: string; url: string; name: string; category: string }[]> {
  const FOLDER_TO_CATEGORY: Record<string, string> = {
    "01_CCTV_Surveillance": "CCTV & Security",
    "02_Network_Server": "Network & Server",
    "03_Wireless_Antenna": "Wireless & Antenna",
    "04_Fiber_Optic_Cabling": "Fiber Optic",
    "05_Broadcasting_AV": "Broadcasting & AV",
    "06_Field_Operations": "Field Operations",
    "07_Drone_Survey": "Drone Survey",
  };
  const photos: { id: string; url: string; name: string; category: string }[] = [];
  try {
    const baseDir = path.join(process.cwd(), "temp_photos");
    await fs.access(baseDir);
    const folders = await fs.readdir(baseDir, { withFileTypes: true });
    for (const folder of folders) {
      if (!folder.isDirectory()) continue;
      const category = FOLDER_TO_CATEGORY[folder.name] || "Uncategorized";
      const folderPath = path.join(baseDir, folder.name);
      const files = await fs.readdir(folderPath);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!IMAGE_EXTS.has(ext)) continue;
        photos.push({
          id: `local-${folder.name}-${file}`,
          url: `/api/local-photos/${encodeURIComponent(folder.name)}/${encodeURIComponent(file)}`,
          name: humanName(file),
          category,
        });
      }
    }
  } catch {
    // temp_photos not available — expected on production
  }
  return photos;
}

export async function GET() {
  // Priority 1: DB — contains Supabase CDN URLs on production
  try {
    const dbPhotos = await prisma.galleryPhoto.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: "asc" },
    });

    if (dbPhotos.length > 0) {
      const photos = dbPhotos.map((p) => ({
        id: p.id,
        url: p.url,
        name: p.description || humanName(p.url.split("/").pop() || "photo"),
        category: p.category,
      }));
      return NextResponse.json({ photos, total: photos.length });
    }
  } catch {
    // DB not available — fall through to filesystem
  }

  // Priority 2: temp_photos/ — local dev fallback when DB is empty
  const localPhotos = await scanTempPhotos();
  return NextResponse.json({ photos: localPhotos, total: localPhotos.length });
}
