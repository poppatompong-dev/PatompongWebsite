"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
