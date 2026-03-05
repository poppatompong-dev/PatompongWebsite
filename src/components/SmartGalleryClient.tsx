"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, Network, Radio, Zap, Mic2, Wrench, Plane, Layers, X, Maximize2 } from "lucide-react";
import type { GalleryImage, CategoryType } from "@/types/gallery";

const CATEGORIES: { label: string; labelTh: string; value: CategoryType | "all"; icon: React.ElementType }[] = [
  { label: "ทั้งหมด", labelTh: "All", value: "all", icon: Layers },
  { label: "CCTV & Security", labelTh: "กล้องวงจรปิด", value: "CCTV & Security", icon: Camera },
  { label: "Network & Server", labelTh: "เครือข่าย/Server", value: "Network & Server", icon: Network },
  { label: "Wireless & Antenna", labelTh: "ไร้สาย/เสาอากาศ", value: "Wireless & Antenna", icon: Radio },
  { label: "Fiber Optic", labelTh: "ไฟเบอร์ออปติก", value: "Fiber Optic", icon: Zap },
  { label: "Broadcasting & AV", labelTh: "AV/Livestream", value: "Broadcasting & AV", icon: Mic2 },
  { label: "Field Operations", labelTh: "งานภาคสนาม", value: "Field Operations", icon: Wrench },
  { label: "Drone Survey", labelTh: "Drone", value: "Drone Survey", icon: Plane },
];

const PAGE_SIZE = 24; // initial + load-more batch

const CATEGORY_COLORS: Record<string, string> = {
  "CCTV & Security": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "Network & Server": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "Wireless & Antenna": "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "Fiber Optic": "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  "Broadcasting & AV": "bg-purple-500/20 text-purple-300 border-purple-500/40",
  "Field Operations": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "Drone Survey": "bg-pink-500/20 text-pink-300 border-pink-500/40",
  "Uncategorized": "bg-ink-700/40 text-ink-400 border-ink-600/40",
};

interface Props {
  initialPhotos: GalleryImage[];
}

export default function SmartGalleryClient({ initialPhotos }: Props) {
  const [active, setActive] = useState<CategoryType | "all">("all");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const countFor = (val: CategoryType | "all") =>
    val === "all" ? initialPhotos.length : initialPhotos.filter((p) => p.category === val).length;

  const filtered =
    active === "all"
      ? initialPhotos
      : initialPhotos.filter((p) => p.category === active);

  // Reset visible count when changing category
  const handleCategoryChange = (cat: CategoryType | "all") => {
    setActive(cat);
    setVisible(PAGE_SIZE);
  };

  const visiblePhotos = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  if (initialPhotos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border border-cream-300 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-ink-300" />
        </div>
        <p className="text-ink-400 text-sm font-code">ยังไม่มีรูปภาพในระบบ</p>
        <p className="text-ink-500 text-xs mt-2 font-code">ผู้ดูแลระบบสามารถอัปโหลดได้ที่หน้า Admin</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const count = countFor(cat.value);
          if (cat.value !== "all" && count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border ${active === cat.value
                  ? "bg-gold-500 text-white border-gold-500 shadow-[0_2px_10px_rgba(217,119,6,0.35)]"
                  : "bg-white border-cream-300 text-ink-500 hover:border-gold-400 hover:text-gold-600"
                }`}
            >
              <cat.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
              <span className={`font-code text-[10px] px-1.5 py-0.5 rounded-full ${active === cat.value ? "bg-white/20 text-white" : "bg-cream-200 text-ink-400"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photo count label */}
      <p className="text-center font-code text-xs text-ink-400 mb-6 tracking-wider">
        แสดง {visiblePhotos.length} จาก {filtered.length} ภาพ{active !== "all" ? ` (${active})` : ""}
      </p>

      {/* Grid */}
      <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {visiblePhotos.map((photo, idx) => {
            const isFeatured = idx % 5 === 0;
            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -20 }}
                transition={{ duration: 0.4, delay: idx < 8 ? idx * 0.04 : 0, ease: [0.23, 1, 0.32, 1] }}
                className={`relative overflow-hidden cursor-pointer group border border-cream-300 hover:border-gold-400 transition-all shadow-sm hover:shadow-xl rounded-lg break-inside-avoid ${isFeatured ? "aspect-square" : "aspect-[3/4]"}`}
                onClick={() => setLightbox(photo)}
              >
                <Image
                  src={photo.url}
                  alt={photo.description || photo.category}
                  fill
                  loading={idx < 6 ? "eager" : "lazy"}
                  className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-code text-[10px] px-2.5 py-1 rounded-full border backdrop-blur-md ${CATEGORY_COLORS[photo.category] ?? CATEGORY_COLORS["Uncategorized"]}`}>
                      {photo.category}
                    </span>
                    <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  {photo.description && (
                    <p className="font-sans text-sm text-white leading-relaxed line-clamp-3 drop-shadow-md">
                      {photo.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-8 py-3 border border-cream-300 bg-white text-ink-600 font-code text-sm hover:border-gold-400 hover:text-gold-600 transition-all shadow-sm hover:shadow-md"
          >
            โหลดเพิ่มอีก {Math.min(PAGE_SIZE, filtered.length - visible)} ภาพ
            <span className="font-code text-xs text-ink-400">({filtered.length - visible} ที่เหลือ)</span>
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-ink-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_55%)]"
            />

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
              initial={{ scale: 0.9, y: 30, rotateX: 6 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 30, rotateX: 6 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative w-full max-w-5xl max-h-[72vh] aspect-video bg-ink-900/40 border border-white/10 shadow-[0_35px_80px_rgba(0,0,0,0.55)]"
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
              className="mt-6 flex flex-col items-center gap-2 text-center px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`font-code text-xs px-3 py-1 border ${CATEGORY_COLORS[lightbox.category] ?? CATEGORY_COLORS["Uncategorized"]}`}>
                {lightbox.category}
              </span>
              {lightbox.description && (
                <p className="font-sans text-sm text-cream-200 max-w-2xl">{lightbox.description}</p>
              )}
              <div className="mt-1 text-[10px] font-code text-ink-400 tracking-wider uppercase">
                คลิกพื้นที่ว่างเพื่อปิดภาพ
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
