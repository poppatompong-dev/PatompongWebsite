"use client";

import { useEffect, useState } from "react";

interface CoverSlideshowProps {
  images: string[];
  interval?: number;
}

export default function CoverSlideshow({ images, interval = 4000 }: CoverSlideshowProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ${i === current ? "opacity-20" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}
