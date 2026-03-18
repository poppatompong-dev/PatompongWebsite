"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types/gallery";

interface CinematicImage extends GalleryImage {
  name?: string;
}

const IMAGES_PER_COLUMN = 5;

// ─── Dual-Panel Hero Slideshow ────────────────────────────────────
function DualHeroSlideshow({
  photos,
  onClickPhoto,
}: {
  photos: CinematicImage[];
  onClickPhoto: (p: CinematicImage) => void;
}) {
  const half = Math.ceil(photos.length / 2);
  const portraitPool = photos.slice(0, half);
  const landscapePool = photos.slice(half);

  const [pIdx, setPIdx] = useState(0);
  const [lIdx, setLIdx] = useState(0);
  const [pFading, setPFading] = useState(false);
  const [lFading, setLFading] = useState(false);
  const [pKey, setPKey] = useState(0);
  const [lKey, setLKey] = useState(0);

  const advancePortrait = useCallback(() => {
    if (portraitPool.length < 2) return;
    setPFading(true);
    setTimeout(() => {
      setPIdx((prev) => (prev + 1) % portraitPool.length);
      setPFading(false);
      setPKey((k) => k + 1);
    }, 700);
  }, [portraitPool.length]);

  const advanceLandscape = useCallback(() => {
    if (landscapePool.length < 2) return;
    setLFading(true);
    setTimeout(() => {
      setLIdx((prev) => (prev + 1) % landscapePool.length);
      setLFading(false);
      setLKey((k) => k + 1);
    }, 700);
  }, [landscapePool.length]);

  const landscapeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (photos.length < 2) return;
    const t1 = setInterval(advancePortrait, 5000);
    const t2 = setTimeout(() => {
      advanceLandscape();
      landscapeTimerRef.current = setInterval(advanceLandscape, 5000);
    }, 2500);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
      if (landscapeTimerRef.current) clearInterval(landscapeTimerRef.current);
    };
  }, [advancePortrait, advanceLandscape, photos.length]);

  if (photos.length === 0) return null;
  const pPhoto = portraitPool[pIdx] || photos[0];
  const lPhoto = landscapePool[lIdx] || photos[1] || photos[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 opacity-100 transition-opacity duration-500">
      {/* Portrait Panel */}
      <div
        className="md:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl bg-neutral-900 border border-white/5"
        style={{ aspectRatio: "3/4" }}
        onClick={() => onClickPhoto(pPhoto)}
      >
        <Image
          key={`p-${pKey}`}
          src={pPhoto.url}
          alt={pPhoto.name || "Featured"}
          fill
          className="object-cover transition-opacity duration-700"
          style={{ opacity: pFading ? 0 : 1 }}
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          <span className="inline-block px-3 py-1 bg-gold-500 text-cream-50 rounded-md text-[11px] font-semibold mb-2 shadow">
            {pPhoto.category}
          </span>
          <h3 className="text-white text-lg md:text-xl font-light drop-shadow-lg leading-snug">
            {pPhoto.name}
          </h3>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <div className="h-full bg-gold-500" style={{ animation: pFading ? "none" : "progress 5s linear forwards", width: pFading ? "0%" : undefined }} />
        </div>
      </div>

      {/* Landscape Panel */}
      <div
        className="md:col-span-3 relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl bg-neutral-900 border border-white/5"
        style={{ aspectRatio: "16/9" }}
        onClick={() => onClickPhoto(lPhoto)}
      >
        <Image
          key={`l-${lKey}`}
          src={lPhoto.url}
          alt={lPhoto.name || "Featured"}
          fill
          className="object-cover transition-opacity duration-700"
          style={{ opacity: lFading ? 0 : 1 }}
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end justify-between z-10">
          <div>
            <span className="inline-block px-3 py-1 bg-gold-500 text-cream-50 rounded-md text-[11px] font-semibold mb-2 shadow">
              {lPhoto.category}
            </span>
            <h3 className="text-white text-lg md:text-2xl font-light drop-shadow-lg leading-snug">
              {lPhoto.name}
            </h3>
          </div>
          <span className="text-white/60 text-xs font-mono hidden md:block">
            {photos.length} ภาพผลงาน
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <div className="h-full bg-gold-500" style={{ animation: lFading ? "none" : "progress 5s linear forwards", width: lFading ? "0%" : undefined }} />
        </div>
      </div>
    </div>
  );
}

// ─── Auto-scrolling Ticker Column ─────────────────────────────────
function TickerColumn({
  photos,
  speed,
  direction,
  onClickPhoto,
}: {
  photos: CinematicImage[];
  speed: number;
  direction: "up" | "down";
  onClickPhoto: (p: CinematicImage) => void;
}) {
  // Triple items to ensure it never runs out of track space
  const items = [...photos, ...photos, ...photos];
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative overflow-hidden h-[500px] md:h-[600px] rounded-xl bg-neutral-950 border border-neutral-800/30">
      {/* Fade edges */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />

      <div
        className="flex flex-col gap-3 ticker-track"
        style={{
          animationName: direction === "up" ? "tickerUp" : "tickerDown",
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {items.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="relative w-full rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 shadow-md bg-neutral-900 border border-neutral-800/50"
            onClick={() => onClickPhoto(photo)}
          >
            <div className="relative w-full pb-[75%]"> {/* 4:3 Aspect Ratio for thumbnails */}
              <Image
                src={photo.url}
                alt={photo.name || "Portfolio"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <span className="text-white text-xs font-medium truncate block drop-shadow-md">{photo.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Gallery Component ───────────────────────────────────────
export default function CinematicGallery() {
  const [photos, setPhotos] = useState<CinematicImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CinematicImage | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch("/api/local-photos");
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch (err) {
        console.error("Failed to load local photos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] bg-neutral-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh] bg-neutral-950 text-white">
        <p className="text-xl text-neutral-500">กำลังปรับปรุงระบบแกลเลอรี...</p>
      </div>
    );
  }

  // Split photos into 4 columns in one pass (js-combine-iterations rule 7.6)
  const cols = photos.reduce<[CinematicImage[], CinematicImage[], CinematicImage[], CinematicImage[]]>(
    (acc, photo, i) => {
      const col = i % 4;
      if (acc[col].length < IMAGES_PER_COLUMN) acc[col].push(photo);
      return acc;
    },
    [[], [], [], []]
  );
  const [col1, col2, col3, col4] = cols;

  return (
    <div className="bg-neutral-950 text-white py-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dot-grid watermark */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #D97706 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="max-w-[1400px] mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <Image
                src="/logo-new.png"
                alt="Patompong Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">ผลงานของเรา</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            ผลงานติดตั้งและให้บริการที่ผ่านมาของเรา
          </p>
        </div>

        {/* Dual-Panel Hero */}
        <DualHeroSlideshow photos={photos} onClickPhoto={setSelectedPhoto} />

        {/* Auto-scrolling Ticker Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
          <TickerColumn photos={col1} speed={60} direction="up" onClickPhoto={setSelectedPhoto} />
          <TickerColumn photos={col2} speed={85} direction="down" onClickPhoto={setSelectedPhoto} />
          <TickerColumn photos={col3} speed={70} direction="up" onClickPhoto={setSelectedPhoto} />
          <div className="hidden md:block">
            <TickerColumn photos={col4} speed={75} direction="down" onClickPhoto={setSelectedPhoto} />
          </div>
        </div>
      </div>

      {/* ─── Fullscreen Lightbox Modal ─── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 md:p-8"
          style={{ animation: "fadeIn 0.3s ease-out" }}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition-all duration-300 z-50 border border-white/10 hover:border-white/30 hover:scale-110"
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <div
            className="relative w-full max-w-7xl h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative w-full lg:w-2/3 h-[50vh] lg:h-full flex items-center justify-center">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 bg-neutral-900/50">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name || "Full image"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Data Panel */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center text-left bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-md">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="relative w-12 h-12 drop-shadow-[0_0_12px_rgba(217,119,6,0.3)]">
                  <Image src="/logo-new.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">รายละเอียดผลงาน</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-light text-white mb-2 leading-tight">{selectedPhoto.category}</h3>
              <div className="h-px w-full bg-white/10 my-6" />
              <div className="space-y-5">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">ชื่อผลงาน</p>
                  <p className="text-white/90 text-sm break-all bg-black/50 p-3 rounded-lg border border-white/5 font-medium">{selectedPhoto.name}</p>
                </div>
                {selectedPhoto.description && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">รายละเอียด</p>
                    <p className="text-white/80 font-light leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">{selectedPhoto.description}</p>
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                <button
                  className="flex-1 py-3.5 px-4 bg-gold-500 text-cream-50 text-sm font-semibold rounded-lg hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 active:scale-95"
                  onClick={() => window.open(selectedPhoto.url, "_blank")}
                >
                  เปิดรูปภาพเต็มจอ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CSS Animations ─── */}
      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes tickerUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes tickerDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ticker-track {
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
