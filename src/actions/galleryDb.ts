"use server";

import { prisma } from "@/lib/prisma";

export async function getSavedPhotos() {
  try {
    return await prisma.galleryPhoto.findMany();
  } catch (error) {
    console.error("Error fetching saved photos:", error);
    return [];
  }
}

export async function savePhotoMetadata(data: {
  id: string;
  category: string;
  description?: string;
  isHidden: boolean;
}) {
  try {
    const photo = await prisma.galleryPhoto.upsert({
      where: { id: data.id },
      update: {
        category: data.category,
        description: data.description,
        isHidden: data.isHidden,
      },
      create: {
        id: data.id,
        category: data.category,
        description: data.description,
        isHidden: data.isHidden,
      },
    });
    
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
    return { success: true, photo };
  } catch (error) {
    console.error("Error toggling photo visibility:", error);
    return { success: false, error: "Failed to update photo visibility" };
  }
}
