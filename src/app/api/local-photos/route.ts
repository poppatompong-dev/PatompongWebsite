import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Map folder keys to Thai-friendly display names & categories
const CATEGORY_MAP: Record<string, { category: string; prefix: string }> = {
  '01_CCTV_Surveillance':   { category: 'กล้องวงจรปิด',           prefix: 'ติดตั้งกล้องวงจรปิด' },
  '02_Network_Server':      { category: 'ระบบเครือข่าย',          prefix: 'ติดตั้งระบบ Network & Server' },
  '03_Wireless_Antenna':    { category: 'เสาอากาศไร้สาย',        prefix: 'ติดตั้งเสาอากาศไร้สาย' },
  '04_Fiber_Optic_Cabling': { category: 'สายไฟเบอร์ออปติก',      prefix: 'เดินสายไฟเบอร์ออปติก' },
  '05_Broadcasting_AV':     { category: 'ระบบถ่ายทอดสัญญาณ',     prefix: 'ติดตั้งระบบถ่ายทอด AV' },
  '06_Field_Operations':    { category: 'ปฏิบัติงานภาคสนาม',     prefix: 'ปฏิบัติงานภาคสนาม' },
  '07_Drone_Survey':        { category: 'สำรวจด้วยโดรน',         prefix: 'บินสำรวจด้วยโดรน' },
};

// Track sequential numbering per category folder
const counterMap = new Map<string, number>();

function getFriendlyMeta(folderName: string) {
  const entry = CATEGORY_MAP[folderName];
  if (entry) {
    const count = (counterMap.get(folderName) || 0) + 1;
    counterMap.set(folderName, count);
    return { category: entry.category, name: `${entry.prefix} #${count}` };
  }
  // Fallback: clean up folder name
  const clean = folderName.replace(/^\d+_/, '').replace(/_/g, ' ');
  const count = (counterMap.get(folderName) || 0) + 1;
  counterMap.set(folderName, count);
  return { category: clean, name: `${clean} #${count}` };
}

async function getFilesRecursively(dir: string, baseDir: string): Promise<any[]> {
  let results: any[] = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath, baseDir));
      } else {
        const ext = path.extname(item.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'].includes(ext)) {
          const relPath = path.relative(baseDir, fullPath).split(path.sep).map(p => encodeURIComponent(p)).join('/');
          // Derive category from the immediate parent folder name
          const parentFolder = path.basename(path.dirname(fullPath));
          const meta = getFriendlyMeta(parentFolder);
          results.push({
            id: `local-${item.name}-${Math.random().toString(36).substring(7)}`,
            url: `/api/local-photos/${relPath}`,
            width: 1920,
            height: 1080,
            category: meta.category,
            name: meta.name,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', dir, error);
  }
  return results;
}

export async function GET() {
  try {
    const photosDir = path.join(process.cwd(), 'temp_photos');

    try {
      await fs.access(photosDir);
    } catch {
      return NextResponse.json({ photos: [] });
    }

    // Reset counters per request
    counterMap.clear();

    const photos = await getFilesRecursively(photosDir, photosDir);

    // Shuffle for random display
    const shuffled = photos.sort(() => 0.5 - Math.random());

    return NextResponse.json({ photos: shuffled });
  } catch (error) {
    console.error('Error reading local photos:', error);
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 });
  }
}
