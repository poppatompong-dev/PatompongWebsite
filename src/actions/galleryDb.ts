"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"]);

export async function syncGalleryFromDisk() {
  const photosDir = path.join(process.cwd(), "temp_photos");
  let synced = 0;
  let skipped = 0;

  try {
    await fs.access(photosDir);
  } catch {
    return { success: false, error: "temp_photos directory not found", synced: 0, skipped: 0 };
  }

  try {
    const folders = await fs.readdir(photosDir, { withFileTypes: true });

    for (const folder of folders) {
      if (!folder.isDirectory()) continue;
      const category = FOLDER_TO_CATEGORY[folder.name] || "Uncategorized";
      const folderPath = path.join(photosDir, folder.name);
      const files = await fs.readdir(folderPath);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!IMAGE_EXTS.has(ext)) continue;

        const stableId = `local-${folder.name}-${file}`;
        const url = `/api/local-photos/${encodeURIComponent(folder.name)}/${encodeURIComponent(file)}`;

        const existing = await prisma.galleryPhoto.findUnique({ where: { id: stableId } });
        if (existing) { skipped++; continue; }

        await prisma.galleryPhoto.create({
          data: {
            id: stableId,
            url,
            category,
            description: null,
            isHidden: false,
          },
        });
        synced++;
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, synced, skipped };
  } catch (error) {
    console.error("syncGalleryFromDisk error:", error);
    return { success: false, error: String(error), synced, skipped };
  }
}

export async function getSavedPhotos() {
  try {
    return await prisma.galleryPhoto.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching saved photos:", error);
    return [];
  }
}

export async function savePhotoMetadata(data: {
  id: string;
  url: string;
  category: string;
  description?: string;
  isHidden: boolean;
}) {
  try {
    const photo = await prisma.galleryPhoto.upsert({
      where: { id: data.id },
      update: {
        url: data.url,
        category: data.category,
        description: data.description ?? null,
        isHidden: data.isHidden,
      },
      create: {
        id: data.id,
        url: data.url,
        category: data.category,
        description: data.description ?? null,
        isHidden: data.isHidden,
      },
    });

    revalidatePath("/"); revalidatePath("/admin");
    return { success: true, photo };
  } catch (error) {
    console.error("Error saving photo metadata:", error);
    return { success: false, error: "Failed to save photo metadata" };
  }
}

export async function togglePhotoVisibility(id: string, isHidden: boolean) {
  try {
    const photo = await prisma.galleryPhoto.update({
      where: { id },
      data: { isHidden },
    });
    revalidatePath("/"); revalidatePath("/admin");
    return { success: true, photo };
  } catch (error) {
    console.error("Error toggling photo visibility:", error);
    return { success: false, error: "Failed to update photo visibility" };
  }
}

export async function deletePortfolioPhoto(id: string) {
  try {
    await prisma.galleryPhoto.delete({ where: { id } });
    revalidatePath("/"); revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}

export async function updatePhotoDescription(id: string, description: string) {
  try {
    await prisma.galleryPhoto.update({
      where: { id },
      data: { description },
    });
    revalidatePath("/"); revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating description:", error);
    return { success: false };
  }
}
