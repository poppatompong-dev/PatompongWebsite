"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { end: 13, suffix: "+", label: "ปีประสบการณ์", sub: "Years of Experience" },
  { end: 50, suffix: "+", label: "โปรเจกต์สำเร็จ", sub: "Projects Completed" },
  { end: 15, suffix: "+", label: "ลูกค้าองค์กร", sub: "Enterprise Clients" },
  { end: 100, suffix: "%", label: "ลูกค้าพึงพอใจ", sub: "Client Satisfaction" },
];

function AnimatedCounter({ end, suffix, delay = 0 }: { end: number; suffix: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1400;
      const step = 16;
      const increment = end / (duration / step);
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, step);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [inView, end, delay]);

  return (
    <div ref={ref} className="font-heading text-4xl lg:text-5xl font-bold text-ink-900 mb-1 tabular-nums">
      {count}{suffix}
    </div>
  );
}

export default function StatsBar() {
  return (
    <section id="stats" className="relative bg-gold-500 py-14 overflow-hidden">
      {/* Subtle diagonal texture */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-gold-600">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center lg:px-8"
            >
              <AnimatedCounter end={stat.end} suffix={stat.suffix} delay={i * 100} />
              <div className="text-ink-900 font-semibold text-sm">{stat.label}</div>
              <div className="font-code text-[11px] text-ink-800/60 tracking-wider uppercase mt-0.5">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
