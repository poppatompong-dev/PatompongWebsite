"use client";

import dynamic from "next/dynamic";

const CinematicGallery = dynamic(() => import("./CinematicGallery"), { ssr: false });

export default function CinematicGalleryWrapper() {
  return <CinematicGallery />;
}
