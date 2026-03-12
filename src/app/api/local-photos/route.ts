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

async function getShowcaseFallbackPhotos(): Promise<
  { id: string; url: string; name: string; category: string }[]
> {
  try {
    const manifestPath = path.join(process.cwd(), "public", "portfolio-showcase", "manifest.json");
    const raw = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw);
    const photos: { id: string; url: string; name: string; category: string }[] = [];

    for (const p of manifest.projects || []) {
      if (p.assets?.cover) {
        photos.push({
          id: `showcase-cover-${p.projectId}`,
          url: p.assets.cover.startsWith("/") ? p.assets.cover : `/${p.assets.cover}`,
          name: p.projectName || p.slug,
          category: p.category || "Project",
        });
      }
      if (p.assets?.screenshots?.hero) {
        photos.push({
          id: `showcase-hero-${p.projectId}`,
          url: p.assets.screenshots.hero.startsWith("/") ? p.assets.screenshots.hero : `/${p.assets.screenshots.hero}`,
          name: `${p.projectName} (Screenshot)`,
          category: p.category || "Project",
        });
      }
    }

    return photos;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const photosDir = path.join(process.cwd(), "temp_photos");
    await fs.access(photosDir);

    const folders = await fs.readdir(photosDir, { withFileTypes: true });
    const photos: {
      id: string;
      url: string;
      name: string;
      category: string;
      description?: string;
    }[] = [];

    for (const folder of folders) {
      if (!folder.isDirectory()) continue;
      const category = FOLDER_TO_CATEGORY[folder.name] || "Uncategorized";
      const folderPath = path.join(photosDir, folder.name);
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

    if (photos.length > 0) {
      return NextResponse.json({ photos, total: photos.length });
    }

    // Fallback: use portfolio showcase images when temp_photos is empty
    const fallback = await getShowcaseFallbackPhotos();
    return NextResponse.json({ photos: fallback, total: fallback.length });
  } catch {
    // temp_photos/ not found — use portfolio showcase images as fallback
    const fallback = await getShowcaseFallbackPhotos();
    return NextResponse.json({ photos: fallback, total: fallback.length });
  }
}
