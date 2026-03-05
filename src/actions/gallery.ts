import { unstable_cache } from "next/cache";
import { GalleryImage, CategoryType } from "@/types/gallery";
import { prisma } from "@/lib/prisma";

// Cache for 5 minutes (local photos don't change unless reseeded)
const getCachedPhotos = unstable_cache(
  async () => _fetchFromDb(),
  ["gallery-photos"],
  { revalidate: 300, tags: ["gallery"] }
);

export async function fetchAndClassifyPhotos(): Promise<GalleryImage[]> {
  try {
    return await getCachedPhotos();
  } catch (error) {
    console.error("fetchAndClassifyPhotos error:", error);
    return [];
  }
}

async function _fetchFromDb(): Promise<GalleryImage[]> {
  try {
    const photos = await prisma.galleryPhoto.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: "asc" },
    });

    return photos.map((p: any) => ({
      id: p.id,
      url: p.url,
      width: 1200,
      height: 800,
      category: (p.category as CategoryType) || "Uncategorized",
      description: p.description || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch gallery photos from DB:", error);
    return [];
  }
}

// Keep for backward compat (used in GalleryManager admin)
export async function getAllRawPhotos(): Promise<{ id: string; url: string }[]> {
  return [];
}
