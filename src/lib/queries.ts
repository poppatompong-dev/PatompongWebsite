import { cache } from "react";
import { prisma } from "./prisma";

// server-cache-react (rule 3.7): React.cache() deduplicates identical DB calls
// within a single request — multiple RSC components can call these without extra queries.

export const getProjects = cache(async () => {
  return prisma.project.findMany({
    include: { client: true, category: true },
    orderBy: { projectNumber: "asc" },
  });
});

export const getGalleryPhotos = cache(async () => {
  return prisma.galleryPhoto.findMany({
    where: { isHidden: false },
    orderBy: { createdAt: "desc" },
  });
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({
    where: { slug },
    include: { client: true, category: true },
  });
});
