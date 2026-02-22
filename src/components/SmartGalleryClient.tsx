"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, Network, Code, Layers, X } from "lucide-react";
import type { GalleryImage, CategoryType } from "@/types/gallery";

const categories: { label: string; value: CategoryType | "all"; icon: React.ElementType }[] = [
  { label: "ทั้งหมด", value: "all", icon: Layers },
  { label: "CCTV & Security", value: "CCTV/Security", icon: Camera },
  { label: "Network & Infra", value: "Network/Infrastructure", icon: Network },
  { label: "Software & Dev", value: "Software/Development", icon: Code },
];

interface Props {
  initialPhotos: GalleryImage[];
}

export default function SmartGalleryClient({ initialPhotos }: Props) {
  const [active, setActive] = useState<CategoryType | "all">("all");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const filtered =
    active === "all"
      ? initialPhotos
      : initialPhotos.filter((p) => p.category === active);

  if (initialPhotos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border border-cream-300 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-ink-300" />
        </div>
        <p className="text-ink-400 text-sm font-code">กำลังรอรูปภาพจาก Google Photos Album...</p>
        <p className="text-ink-500 text-xs mt-2 font-code">ระบบจะโหลดและจัดหมวดหมู่โดยอัตโนมัติ</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActive(cat.value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border ${
              active === cat.value
                ? "bg-gold-500 text-white border-gold-500 shadow-[0_2px_8px_rgba(217,119,6,0.3)]"
                : "bg-white border-cream-300 text-ink-500 hover:border-gold-400 hover:text-gold-500"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <AnimatePresence>
          {filtered.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="relative aspect-square overflow-hidden cursor-pointer group border border-cream-300 hover:border-gold-400 transition-colors"
              onClick={() => setLightbox(photo)}
            >
              <Image
                src={photo.url}
                alt={photo.description || photo.category}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-all duration-300 flex items-end p-2">
                <span className="opacity-0 group-hover:opacity-100 font-code text-[10px] text-cream-100 bg-ink-800/80 px-2 py-1 transition-opacity">
                  {photo.category}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink-900/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-cream-300 hover:text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[85vh] aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.url}
                alt={lightbox.description || lightbox.category}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>
            {lightbox.description && (
              <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-code text-sm text-cream-300 bg-ink-800/80 px-4 py-2">
                {lightbox.description}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
