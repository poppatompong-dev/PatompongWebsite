export interface GalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
  category: CategoryType;
  description?: string;
}

export type CategoryType =
  | "CCTV & Security"
  | "Network & Server"
  | "Wireless & Antenna"
  | "Fiber Optic"
  | "Broadcasting & AV"
  | "Field Operations"
  | "Drone Survey"
  | "Uncategorized";
