/**
 * upload-to-supabase.mjs
 * Uploads all images from public/portfolio/ to Supabase Storage bucket "gallery"
 * then updates GalleryPhoto URLs in dev.db to point to Supabase CDN URLs.
 *
 * Usage: node scripts/upload-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = "gallery";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const prisma = new PrismaClient();

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`✅ Created bucket "${BUCKET}"`);
  } else {
    console.log(`✅ Bucket "${BUCKET}" already exists`);
  }
}

async function uploadAll() {
  const portfolioDir = path.join(ROOT, "public", "portfolio");
  if (!fs.existsSync(portfolioDir)) {
    throw new Error(`public/portfolio/ not found at ${portfolioDir}`);
  }

  const folders = fs.readdirSync(portfolioDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  // Map: local relative path -> Supabase public URL
  const urlMap = new Map();

  for (const folder of folders) {
    const folderPath = path.join(portfolioDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return MIME[ext] !== undefined;
    });

    for (const file of files) {
      const storagePath = `${folder}/${file}`;
      const localPath = path.join(folderPath, file);
      const ext = path.extname(file).toLowerCase();
      const contentType = MIME[ext] || "image/jpeg";

      // Check if already uploaded
      const { data: existing } = await supabase.storage.from(BUCKET).list(folder, {
        search: file,
      });
      if (existing && existing.some((f) => f.name === file)) {
        skipped++;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        urlMap.set(`/portfolio/${storagePath}`, urlData.publicUrl);
        urlMap.set(`/api/local-photos/${folder}/${file}`, urlData.publicUrl);
        continue;
      }

      const fileBuffer = fs.readFileSync(localPath);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, { contentType, upsert: true });

      if (error) {
        console.error(`  ❌ Failed: ${storagePath} — ${error.message}`);
        failed++;
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        urlMap.set(`/portfolio/${storagePath}`, urlData.publicUrl);
        urlMap.set(`/api/local-photos/${folder}/${encodeURIComponent(file)}`, urlData.publicUrl);
        urlMap.set(`/api/local-photos/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`, urlData.publicUrl);
        uploaded++;
        if (uploaded % 20 === 0) console.log(`  📤 Uploaded ${uploaded} files...`);
      }
    }
  }

  console.log(`\n📦 Upload complete: ${uploaded} uploaded, ${skipped} already existed, ${failed} failed`);
  return urlMap;
}

async function updateDbUrls(urlMap) {
  const photos = await prisma.galleryPhoto.findMany();
  let updated = 0;
  let notFound = 0;

  for (const photo of photos) {
    // Try direct match first
    let newUrl = urlMap.get(photo.url);

    // Try decoded URL match
    if (!newUrl) {
      const decoded = decodeURIComponent(photo.url);
      newUrl = urlMap.get(decoded);
    }

    // Try extracting folder/file from the URL path
    if (!newUrl) {
      const match = photo.url.match(/\/(?:portfolio|api\/local-photos)\/([^/]+)\/(.+)$/);
      if (match) {
        const folder = decodeURIComponent(match[1]);
        const file = decodeURIComponent(match[2]);
        const storagePath = `${folder}/${file}`;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        newUrl = urlData.publicUrl;
      }
    }

    if (newUrl) {
      await prisma.galleryPhoto.update({
        where: { id: photo.id },
        data: { url: newUrl },
      });
      updated++;
    } else {
      console.warn(`  ⚠️ No Supabase URL found for: ${photo.url}`);
      notFound++;
    }
  }

  console.log(`\n🗄️  DB updated: ${updated} photos updated, ${notFound} not matched`);
}

async function main() {
  console.log("🚀 Starting Supabase gallery migration...\n");

  await ensureBucket();

  console.log("\n📤 Uploading images...");
  const urlMap = await uploadAll();

  console.log("\n🗄️  Updating database URLs...");
  await updateDbUrls(urlMap);

  await prisma.$disconnect();
  console.log("\n✅ Migration complete!");
  console.log(`\nNext steps:`);
  console.log(`  1. Add NEXT_PUBLIC_SUPABASE_URL to .env.local`);
  console.log(`  2. Add to Netlify environment variables`);
  console.log(`  3. Remove public/portfolio/ from Git`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
