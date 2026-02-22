export interface GalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
  category: "Network/Infrastructure" | "CCTV/Security" | "Software/Development" | "Action" | "Uncategorized";
  description?: string;
}

export type CategoryType = GalleryImage["category"];
