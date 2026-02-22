"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, Network, Code, Layers, X, HardDrive, Users, Maximize2 } from "lucide-react";
import type { GalleryImage, CategoryType } from "@/types/gallery";

const CATEGORIES: { label: string; labelEn: string; value: CategoryType | "all"; icon: React.ElementType }[] = [
  { label: "ทั้งหมด",          labelEn: "All",             value: "all",             icon: Layers   },
  { label: "CCTV & Security",  labelEn: "กล้องวงจรปิด",   value: "CCTV & Security", icon: Camera   },
  { label: "Network & Fiber",  labelEn: "เครือข่าย",       value: "Network & Fiber", icon: Network  },
  { label: "Software & AI",    labelEn: "ซอฟต์แวร์ · AI",  value: "Software & AI",   icon: Code     },
  { label: "On-site Work",     labelEn: "ลงพื้นที่",        value: "On-site Work",    icon: HardDrive},
  { label: "Team & Training",  labelEn: "ทีม · อบรม",      value: "Team & Training", icon: Users    },
];

const CATEGORY_COLORS: Record<string, string> = {
  "CCTV & Security":  "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "Network & Fiber":  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "Software & AI":    "bg-purple-500/20 text-purple-300 border-purple-500/40",
  "On-site Work":     "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "Team & Training":  "bg-pink-500/20 text-pink-300 border-pink-500/40",
  "Uncategorized":    "bg-ink-700/40 text-ink-400 border-ink-600/40",
};

interface Props {
  initialPhotos: GalleryImage[];
}

export default function SmartGalleryClient({ initialPhotos }: Props) {
  const [active, setActive] = useState<CategoryType | "all">("all");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const countFor = (val: CategoryType | "all") =>
    val === "all" ? initialPhotos.length : initialPhotos.filter((p) => p.category === val).length;

  const filtered =
    active === "all"
      ? initialPhotos
      : initialPhotos.filter((p) => p.category === active);

  if (initialPhotos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border border-cream-300 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-ink-300" />
        </div>
        <p className="text-ink-400 text-sm font-code">กำลังประมวลผลภาพด้วย Gemini AI...</p>
        <p className="text-ink-500 text-xs mt-2 font-code">ระบบจะจัดหมวดหมู่และสร้างคำบรรยายอัตโนมัติ</p>
      </div>
    );
  }

  return (
    <>
      {/* AI badge */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold-500/30 bg-gold-500/8">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          <span className="font-code text-[11px] text-gold-400 tracking-widest uppercase">
            Classified by Gemini AI · {initialPhotos.length} ภาพ
          </span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => {
          const count = countFor(cat.value);
          if (cat.value !== "all" && count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border ${
                active === cat.value
                  ? "bg-gold-500 text-white border-gold-500 shadow-[0_2px_10px_rgba(217,119,6,0.35)]"
                  : "bg-white border-cream-300 text-ink-500 hover:border-gold-400 hover:text-gold-600"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
              <span className={`font-code text-[10px] px-1.5 py-0.5 rounded-full ${
                active === cat.value
                  ? "bg-white/20 text-white"
                  : "bg-cream-200 text-ink-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photo count label */}
      <p className="text-center font-code text-xs text-ink-400 mb-6 tracking-wider">
        แสดง {filtered.length} จาก {initialPhotos.length} ภาพ
      </p>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, idx) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22, delay: idx < 12 ? idx * 0.03 : 0 }}
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

              {/* Hover overlay with description */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-1.5">
                {photo.description && (
                  <p className="font-sans text-xs text-cream-100 leading-snug line-clamp-2">
                    {photo.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`font-code text-[9px] px-2 py-0.5 border ${CATEGORY_COLORS[photo.category] ?? CATEGORY_COLORS["Uncategorized"]}`}>
                    {photo.category}
                  </span>
                  <Maximize2 className="w-3 h-3 text-cream-300/70" />
                </div>
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-ink-900/97 flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 p-2 text-cream-400 hover:text-white transition-colors z-10"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-4xl max-h-[75vh] aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.url}
                alt={lightbox.description || lightbox.category}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </motion.div>

            {/* Info bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 flex flex-col items-center gap-2 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`font-code text-xs px-3 py-1 border ${CATEGORY_COLORS[lightbox.category] ?? CATEGORY_COLORS["Uncategorized"]}`}>
                {lightbox.category}
              </span>
              {lightbox.description && (
                <p className="font-sans text-sm text-cream-300 max-w-lg">
                  {lightbox.description}
                </p>
              )}
              <p className="font-code text-[10px] text-ink-500 mt-1 tracking-wider">
                วิเคราะห์โดย Gemini AI · คลิกพื้นที่ว่างเพื่อปิด
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
