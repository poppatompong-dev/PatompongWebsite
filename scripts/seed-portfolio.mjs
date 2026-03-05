/**
 * Seed script: reads public/portfolio/ subfolders and upserts into GalleryPhoto table.
 * Run with: node scripts/seed-portfolio.mjs
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Map folder names to display category names (used in SmartGalleryClient)
const FOLDER_TO_CATEGORY = {
  "01_CCTV_Surveillance":  "CCTV & Security",
  "02_Network_Server":     "Network & Server",
  "03_Wireless_Antenna":   "Wireless & Antenna",
  "04_Fiber_Optic_Cabling":"Fiber Optic",
  "05_Broadcasting_AV":    "Broadcasting & AV",
  "06_Field_Operations":   "Field Operations",
  "07_Drone_Survey":       "Drone Survey",
};

async function main() {
  const portfolioDir = path.join(__dirname, "..", "public", "portfolio");
  let total = 0;

  for (const [folder, category] of Object.entries(FOLDER_TO_CATEGORY)) {
    const folderPath = path.join(portfolioDir, folder);
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Folder not found: ${folderPath}`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`📁 ${folder}: ${files.length} files → category "${category}"`);

    for (const file of files) {
      const url = `/portfolio/${folder}/${file}`;
      // Use the file path as deterministic ID
      const id = `portfolio_${folder}_${file.replace(/[^a-zA-Z0-9]/g, "_")}`;

      await prisma.galleryPhoto.upsert({
        where: { id },
        update: { url, category },
        create: {
          id,
          url,
          category,
          isHidden: false,
        },
      });
      total++;
    }
  }

  console.log(`\n✅ Seeded ${total} portfolio photos into GalleryPhoto table.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
