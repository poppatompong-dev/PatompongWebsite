"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/types/gallery";

interface Props {
    photos: GalleryImage[];
}

export default function HeroCarousel({ photos }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (!photos || photos.length === 0) return;
        const total = photos.length;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex(prev => (prev + 1) % total);
        }, 6000); // 6s per slide
        return () => clearInterval(timer);
    }, [photos]);

    const paginate = (newDirection: number) => {
        if (!photos || photos.length === 0) return;
        setDirection(newDirection);
        setCurrentIndex(prev => {
            const next = prev + newDirection;
            if (next < 0) return photos.length - 1;
            if (next >= photos.length) return 0;
            return next;
        });
    };

    if (!photos || photos.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-ink-900 pointer-events-auto">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 1.5 }, scale: { duration: 8, ease: "easeOut" } }}
                    className="absolute inset-0"
                >
                    <Image
                        src={photos[currentIndex].url}
                        alt={photos[currentIndex].description || "Patompong Tech Consultant Project"}
                        fill
                        className="object-cover"
                        priority={currentIndex === 0}
                        sizes="100vw"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Background gradients to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/40 z-10 pointer-events-none" />

            {/* Manual Controls */}
            <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-30 flex items-center gap-4">
                <button
                    onClick={() => paginate(-1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-cream-200/20 bg-ink-900/50 backdrop-blur flex items-center justify-center text-cream-200 hover:text-gold-400 hover:border-gold-400/50 transition-all pointer-events-auto"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex gap-2">
                    {photos.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={`h-1.5 transition-all pointer-events-auto ${idx === currentIndex ? "w-8 bg-gold-500" : "w-4 bg-cream-200/30 hover:bg-cream-200/60"}`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => paginate(1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-cream-200/20 bg-ink-900/50 backdrop-blur flex items-center justify-center text-cream-200 hover:text-gold-400 hover:border-gold-400/50 transition-all pointer-events-auto"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>
        </div>
    );
}
