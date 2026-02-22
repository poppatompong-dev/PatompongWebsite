export interface GalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
  category: "CCTV & Security" | "Network & Fiber" | "Software & AI" | "On-site Work" | "Team & Training" | "Uncategorized";
  description?: string;
}

export type CategoryType = GalleryImage["category"];
