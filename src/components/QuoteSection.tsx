"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function QuoteSection() {
  return (
    <section className="relative py-16 lg:py-20 bg-ink-900 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(212,175,55,0.08),transparent_70%)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative shrink-0"
          >
            {/* Glow behind photo */}
            <div className="absolute -inset-4 bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-transparent rounded-full blur-2xl" />

            <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-gold-500/40 shadow-2xl shadow-gold-500/10">
              {/* Vignette overlay for cinematic effect */}
              <div className="absolute inset-0 z-10 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
              <Image
                src="/patompong-quote.jpeg"
                alt="Patompong Lamahasak"
                fill
                unoptimized
                className="object-cover object-center contrast-110 saturate-[1.15] sepia-[0.08]"
                sizes="(max-width: 768px) 160px, 224px"
              />
            </div>

            {/* Decorative ring */}
            <div className="absolute -inset-2 rounded-full border border-gold-500/10" />
            <div className="absolute -inset-4 rounded-full border border-gold-500/5" />
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center lg:text-left flex-1 max-w-2xl"
          >
            {/* Opening quote mark */}
            <span className="text-gold-500/30 text-6xl sm:text-7xl lg:text-8xl font-heading leading-none select-none block -mb-6 sm:-mb-8 lg:-mb-10">
              &ldquo;
            </span>

            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-cream-50 leading-snug tracking-tight">
              <span className="block">ทุกก้าวที่คุณพยายาม</span>
              <span className="block mt-2">กำลังพาคุณเข้าใกล้ความสำเร็จ</span>
              <span className="block mt-2 text-gold-400">มากกว่าที่คิด</span>
            </h2>

            {/* Closing quote mark */}
            <span className="text-gold-500/30 text-6xl sm:text-7xl lg:text-8xl font-heading leading-none select-none block -mt-4 sm:-mt-6 text-right lg:text-left">
              &rdquo;
            </span>

            {/* Author */}
            <div className="mt-4 lg:mt-6">
              <div className="divider-gold w-12 mx-auto lg:mx-0 mb-3" />
              <p className="font-heading text-base sm:text-lg font-semibold text-cream-100">
                — Patompong Lamahasak
              </p>
              <p className="font-code text-[10px] sm:text-xs text-gold-500/70 tracking-wider uppercase mt-1">
                นักวิชาการคอมพิวเตอร์ · หน่วยงานภาคท้องถิ่น
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
