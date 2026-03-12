"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface GalleryPhoto {
  src: string;
  caption: string;
  category: string;
}

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
}

export default function GalleryLightbox({ photos }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length],
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, close, next, prev]);

  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-cream-300 bg-cream-200 transition-all hover:border-gold-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.caption}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <p className="text-xs font-semibold text-cream-50 line-clamp-2">{photo.caption}</p>
              <span className="mt-1 inline-block rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-code uppercase tracking-wider text-gold-300">
                {photo.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activeIndex].src}
              alt={photos[activeIndex].caption}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
              <p className="text-sm font-semibold text-cream-50">{photos[activeIndex].caption}</p>
              <span className="mt-1 inline-block text-xs text-gold-400">{photos[activeIndex].category}</span>
            </div>

            <button
              type="button"
              onClick={close}
              className="absolute -right-3 -top-3 rounded-full bg-ink-800 p-2 text-cream-50 shadow-lg transition-colors hover:bg-gold-600"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink-800/80 p-2 text-cream-50 transition-colors hover:bg-gold-600"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink-800/80 p-2 text-cream-50 transition-colors hover:bg-gold-600"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <p className="absolute bottom-6 font-code text-xs text-cream-200/60">
            {activeIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
