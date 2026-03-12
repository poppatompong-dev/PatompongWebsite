import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FOLDER_TO_CATEGORY: Record<string, string> = {
  "01_CCTV_Surveillance": "CCTV & Security",
  "02_Network_Server": "Network & Server",
  "03_Wireless_Antenna": "Wireless & Antenna",
  "04_Fiber_Optic_Cabling": "Fiber Optic",
  "05_Broadcasting_AV": "Broadcasting & AV",
  "06_Field_Operations": "Field Operations",
  "07_Drone_Survey": "Drone Survey",
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function humanName(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/^\d+_/, "")
    .replace(/_\d+$/, "")
    .replace(/_/g, " ");
}

async function scanPhotosDir(
  baseDir: string,
  urlPrefix: string,
  idPrefix: string,
): Promise<{ id: string; url: string; name: string; category: string }[]> {
  const photos: { id: string; url: string; name: string; category: string }[] = [];
  try {
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
          id: `${idPrefix}-${folder.name}-${file}`,
          url: `${urlPrefix}/${encodeURIComponent(folder.name)}/${encodeURIComponent(file)}`,
          name: humanName(file),
          category,
        });
      }
    }
  } catch {
    // directory not found — return empty
  }
  return photos;
}

export async function GET() {
  // Priority 1: public/portfolio/ — static files served by CDN on production
  const publicPortfolio = path.join(process.cwd(), "public", "portfolio");
  const photos = await scanPhotosDir(publicPortfolio, "/portfolio", "portfolio");

  if (photos.length > 0) {
    return NextResponse.json({ photos, total: photos.length });
  }

  // Priority 2: temp_photos/ — local dev fallback
  const tempPhotos = path.join(process.cwd(), "temp_photos");
  const localPhotos = await scanPhotosDir(tempPhotos, "/api/local-photos", "local");

  return NextResponse.json({ photos: localPhotos, total: localPhotos.length });
}
