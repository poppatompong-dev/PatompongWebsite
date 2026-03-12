"use client";

import { ChevronLeft, ChevronRight, ExternalLink, MonitorPlay } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ShowcaseSlide, ShowcaseTheme } from "@/lib/portfolio-showcase";

interface SlideshowViewerProps {
  liveUrl?: string | null;
  projectName: string;
  slideshowUrl?: string | null;
  slides: ShowcaseSlide[];
  theme?: ShowcaseTheme | null;
}

function renderButtonLabel(slide: ShowcaseSlide) {
  if (slide.kind === "cta") return slide.buttonLabel || "Open";
  return null;
}

export default function SlideshowViewer({ liveUrl, projectName, slideshowUrl, slides, theme }: SlideshowViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const safeSlides = useMemo(() => slides.filter((slide) => slide && slide.title), [slides]);
  const activeIndex = safeSlides.length > 0 ? currentIndex % safeSlides.length : 0;
  const activeSlide = safeSlides[activeIndex] || null;

  useEffect(() => {
    if (safeSlides.length === 0) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        setCurrentIndex((value) => (value + 1) % safeSlides.length);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        setCurrentIndex((value) => (value - 1 + safeSlides.length) % safeSlides.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeSlides.length]);

  if (safeSlides.length === 0 || !activeSlide) {
    return (
      <div className="rounded-[28px] border border-ink-800 bg-ink-800/60 p-8 text-cream-100">
        <h2 className="font-heading text-2xl font-bold">Slideshow Viewer</h2>
        <p className="mt-3 text-sm leading-7 text-ink-300">ยังไม่มีข้อมูลสไลด์สำหรับโครงการนี้</p>
      </div>
    );
  }

  const next = () => setCurrentIndex((value) => (value + 1) % safeSlides.length);
  const prev = () => setCurrentIndex((value) => (value - 1 + safeSlides.length) % safeSlides.length);
  const layoutMode = activeSlide.kind === "image" || activeSlide.kind === "cover" || activeSlide.kind === "thanks";

  return (
    <section className="overflow-hidden rounded-[28px] border border-ink-800 bg-ink-900/80 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-ink-800 bg-ink-900/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400">Interactive Slideshow</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-cream-50">{projectName}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {slideshowUrl && (
            <a href={slideshowUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20">
              เปิดไฟล์สไลด์
              <MonitorPlay className="h-4 w-4" />
            </a>
          )}
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-4 py-2 text-sm font-semibold text-cream-100 transition-colors hover:border-gold-500/40 hover:text-gold-300">
              เปิดระบบจริง
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ background: theme?.gradient || "linear-gradient(135deg, #111827 0%, #1f2937 100%)" }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX || 0;
        }}
        onTouchEnd={(event) => {
          const touchEndX = event.changedTouches[0]?.clientX || 0;
          if (touchStartX.current - touchEndX > 40) next();
          if (touchEndX - touchStartX.current > 40) prev();
        }}
      >
        <div className={`relative grid min-h-[540px] ${layoutMode ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-1"}`}>
          {layoutMode && (
            <div className="flex items-center justify-center bg-black/10 p-6 sm:p-8 lg:p-10">
              {activeSlide.image ? (
                <div className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[24px] shadow-xl shadow-black/25">
                  <Image src={activeSlide.image} alt={activeSlide.title} fill unoptimized sizes="(min-width: 1024px) 45vw, 100vw" className="object-contain" />
                </div>
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-sm text-white/70">
                  ไม่มีภาพประกอบ
                </div>
              )}
            </div>
          )}

          <div className={`flex flex-col justify-center bg-ink-900/45 p-6 sm:p-8 lg:p-10 ${layoutMode ? "" : "max-w-4xl"}`}>
            <span className="font-code text-[11px] uppercase tracking-[0.2em] text-gold-300">{activeSlide.subtitle || `Slide ${activeIndex + 1}`}</span>
            <h3 className="mt-4 font-heading text-3xl font-bold leading-tight text-cream-50 sm:text-4xl">{activeSlide.title}</h3>
            {activeSlide.description && (
              <p className="mt-5 text-base leading-8 text-cream-200/85">{activeSlide.description}</p>
            )}
            {Array.isArray(activeSlide.items) && activeSlide.items.length > 0 && (
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-cream-100 sm:text-base">
                {activeSlide.items.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3">{item}</li>
                ))}
              </ul>
            )}
            {activeSlide.href && renderButtonLabel(activeSlide) && (
              <div className="mt-7">
                <a href={activeSlide.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-400">
                  {renderButtonLabel(activeSlide)}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6">
            <button type="button" onClick={prev} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-cream-50 backdrop-blur-sm transition-colors hover:bg-black/50">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-code uppercase tracking-[0.18em] text-cream-50 backdrop-blur-sm">
              Slide {activeIndex + 1} / {safeSlides.length}
            </div>
            <button type="button" onClick={next} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-cream-50 backdrop-blur-sm transition-colors hover:bg-black/50">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/8 bg-ink-950/55 px-5 py-4 sm:px-6">
          {safeSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-code uppercase tracking-[0.16em] transition-colors ${isActive ? "border-gold-400 bg-gold-500/15 text-gold-300" : "border-white/10 bg-white/5 text-cream-200 hover:border-gold-500/30 hover:text-gold-300"}`}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${isActive ? "bg-gold-300" : "bg-cream-200/50"}`} />
                {slide.title}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
