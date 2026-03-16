import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Server-side only — never exposed to client
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET = "gallery";

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

function humanName(s: string): string {
  const base = path.basename(s, path.extname(s));
  return base.replace(/^\d+_/, "").replace(/_\d+$/, "").replace(/_/g, " ");
}

async function listSupabaseBucket(): Promise<{ id: string; url: string; name: string; category: string }[]> {
  const photos: { id: string; url: string; name: string; category: string }[] = [];
  const folders = Object.keys(FOLDER_TO_CATEGORY);

  for (const folder of folders) {
    const category = FOLDER_TO_CATEGORY[folder];
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefix: `${folder}/`, limit: 200, offset: 0 }),
        next: { revalidate: 3600 },
      } as RequestInit);
      if (!res.ok) continue;
      const files: { name: string; id: string }[] = await res.json();
      for (const file of files) {
        if (!file.name) continue;
        const ext = path.extname(file.name).toLowerCase();
        if (!IMAGE_EXTS.has(ext)) continue;
        const storagePath = `${folder}/${file.name}`;
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
        photos.push({
          id: file.id || storagePath,
          url: publicUrl,
          name: humanName(file.name),
          category,
        });
      }
    } catch {
      // skip folder on error
    }
  }
  return photos;
}

async function scanTempPhotos(): Promise<{ id: string; url: string; name: string; category: string }[]> {
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
    // temp_photos not available
  }
  return photos;
}

export async function GET() {
  // Priority 1: Supabase Storage — works on any platform, no Prisma needed
  if (SUPABASE_URL && SUPABASE_KEY) {
    const photos = await listSupabaseBucket();
    if (photos.length > 0) {
      return NextResponse.json({ photos, total: photos.length });
    }
  }

  // Priority 2: temp_photos/ — local dev fallback
  const localPhotos = await scanTempPhotos();
  return NextResponse.json({ photos: localPhotos, total: localPhotos.length });
}
