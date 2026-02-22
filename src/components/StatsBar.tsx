"use client";

import { motion } from "framer-motion";

const stats = [
  { number: "13+", label: "ปีประสบการณ์", sub: "Years Experience" },
  { number: "200+", label: "โปรเจกต์สำเร็จ", sub: "Projects Completed" },
  { number: "50+", label: "ลูกค้าองค์กร", sub: "Enterprise Clients" },
  { number: "100%", label: "ลูกค้าพึงพอใจ", sub: "Client Satisfaction" },
];

export default function StatsBar() {
  return (
    <section id="stats" className="bg-gold-500 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-gold-600">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center lg:px-8"
            >
              <div className="font-heading text-4xl lg:text-5xl font-bold text-ink-900 mb-1">
                {stat.number}
              </div>
              <div className="text-ink-800 font-semibold text-sm">{stat.label}</div>
              <div className="font-code text-[11px] text-ink-700/70 tracking-wider uppercase mt-0.5">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
