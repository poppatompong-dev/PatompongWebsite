"use client";

import { motion } from "framer-motion";
import { Search, Calculator, Wrench, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. สำรวจหน้างานฟรี",
    description: "ทีมงานประเมินพื้นที่จริงหรือผ่านภาพถ่าย เพื่อหาวิธีที่คุ้มค่าและตอบโจทย์ที่สุด",
  },
  {
    icon: Calculator,
    title: "2. ประเมินราคาชัดเจน",
    description: "เสนอราคาแบบตรงไปตรงมา ไม่มีค่าใช้จ่ายแอบแฝง อธิบายสเปกของชัดเจนทุกชิ้น",
  },
  {
    icon: Wrench,
    title: "3. ติดตั้งโดยช่างมืออาชีพ",
    description: "ทีมช่างผู้ชำนาญลงพื้นที่ทำงานเอง เก็บงานเรียบร้อยรัดกุมด้วยมาตรฐานระดับองค์กร",
  },
  {
    icon: ShieldCheck,
    title: "4. ดูแลไม่ทิ้งกัน",
    description: "สอนการใช้งานจนคล่อง พร้อมทีมซัพพอร์ตรับประกันผลงานและดูแลหลังการขาย",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function WorkProcessSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-cream-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            ขั้นตอนการทำงาน (Our Process)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-800">
            ขั้นตอนการทำงาน
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-500 text-lg max-w-2xl mx-auto">
            ชัดเจน ตรงไปตรงมา ทำงานด้วยความรับผิดชอบ ไม่ทิ้งงาน 100%
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative group"
            >
              {/* Connector line (hidden on mobile, last item) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-gold-400/50 to-transparent z-0" style={{ width: "calc(100% - 5rem)", left: "calc(50% + 2rem)" }} />
              )}

              <div className="relative z-10 bg-white border border-cream-300 hover:border-gold-400/50 p-6 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-16 h-16 border-2 border-cream-300 group-hover:border-gold-400 flex items-center justify-center mx-auto mb-4 transition-colors bg-cream-50">
                  <step.icon className="w-8 h-8 text-gold-500" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gold-500 flex items-center justify-center">
                  <span className="font-code text-xs font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-heading font-bold text-ink-700 mb-2 text-base">{step.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
