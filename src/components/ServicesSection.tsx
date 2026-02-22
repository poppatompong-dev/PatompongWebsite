"use client";

import { motion } from "framer-motion";
import { Camera, Code, Sun, ArrowRight } from "lucide-react";

const mainServices = [
  {
    icon: Camera,
    num: "01",
    title: "ระบบกล้องวงจรปิดและเครือข่าย",
    tagline: "Smart CCTV & Network",
    description:
      "ติดตั้งกล้องมาตรฐานองค์กร เน็ตลื่นไหล ปลอดภัยจากการถูกแฮก พร้อมระบบ AI แยกแยะคน สัตว์ รถ อัตโนมัติ",
    features: ["ภาพคมชัดระดับ 4K", "ระบบ AI Detection", "ป้องกัน Cyber Attack", "บริการหลังการขาย"],
    highlight: true,
  },
  {
    icon: Code,
    num: "02",
    title: "ซอฟต์แวร์ระดับองค์กร",
    tagline: "Enterprise Software & Automation",
    description:
      "พัฒนาโปรแกรมด้วย Python & Google Apps Script ผสาน Next.js และ AI Automation ลดงานซ้ำซ้อน เพิ่มประสิทธิภาพให้องค์กรทำงานฉลาดขึ้น",
    features: ["Python & Google Apps Script", "AI Automation", "Web Application", "ระบบจัดการข้อมูลองค์กร"],
    highlight: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 lg:py-32 bg-cream-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header — editorial left-aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            บริการของเรา (Our Services)
          </span>
          <h2 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-800 leading-tight">
            บริการ
            <span className="text-gold-500 italic"> ครบวงจร</span>
          </h2>
          <div className="divider-gold mt-5" />
          <p className="mt-6 text-ink-400 text-lg leading-relaxed">
            เปลี่ยนบ้านและธุรกิจให้ฉลาด ด้วยเทคโนโลยี AI และระบบความปลอดภัยอัจฉริยะ
          </p>
        </motion.div>

        {/* Main Service Cards — 01 and 02 full-width */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-6"
        >
          {mainServices.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className={`relative group flex flex-col rounded-none p-8 lg:p-10 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                service.highlight
                  ? "bg-ink-800 border-ink-700 hover:border-gold-500/50"
                  : "bg-white border-cream-300 hover:border-gold-400/50"
              }`}
            >
              <span className={`font-code text-8xl font-bold select-none absolute bottom-4 right-5 leading-none ${
                service.highlight ? "text-ink-700/30" : "text-cream-300/70"
              } group-hover:opacity-40 transition-opacity`}>
                {service.num}
              </span>

              <div className={`w-14 h-14 border-2 flex items-center justify-center mb-6 transition-colors ${
                service.highlight ? "border-ink-600 group-hover:border-gold-400" : "border-cream-300 group-hover:border-gold-400"
              }`}>
                <service.icon className="w-7 h-7 text-gold-500" />
              </div>

              <h3 className={`font-heading text-2xl font-bold mb-1 ${service.highlight ? "text-cream-50" : "text-ink-700"}`}>
                {service.title}
              </h3>
              <p className="text-gold-400 text-sm italic mb-4">{service.tagline}</p>
              <p className={`text-base leading-relaxed mb-6 ${service.highlight ? "text-ink-300" : "text-ink-400"}`}>
                {service.description}
              </p>

              <ul className="space-y-2.5 mt-auto">
                {service.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-2 text-sm ${service.highlight ? "text-ink-300" : "text-ink-500"}`}>
                    <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`inline-flex items-center gap-1.5 mt-8 text-sm font-semibold group/link ${
                  service.highlight ? "text-gold-400 hover:text-gold-300" : "text-gold-500 hover:text-gold-600"
                } transition-colors`}
              >
                ขอใบเสนอราคาฟรี
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Service 03 — Future / Coming Soon strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 border border-dashed border-cream-400 bg-cream-100/50 hover:border-gold-400/40 transition-colors"
        >
          <div className="w-10 h-10 border border-cream-300 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-gold-400/60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading font-semibold text-ink-500 text-sm">โซลูชันแห่งอนาคต &middot; Smart Home & Energy</span>
              <span className="font-code text-[10px] px-2 py-0.5 bg-cream-200 text-ink-400 border border-cream-300 uppercase">Coming Soon</span>
            </div>
            <p className="text-xs text-ink-400">บริการนี้อยู่ระหว่างการศึกษาเพิ่มเติม คาดว่าจะเปิดให้บริการในอนาคตอันใกล้</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
