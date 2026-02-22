"use client";

import { motion } from "framer-motion";
import { Wifi, ShieldCheck, Brain, HeadsetIcon } from "lucide-react";

const reasons = [
  {
    icon: Wifi,
    number: "01",
    title: "เน็ตไม่กระตุก",
    subtitle: "Network Optimization",
    description:
      "เราจัดระเบียบเส้นทางอินเทอร์เน็ตใหม่ แยกเลนกล้องกับเลนใช้งานทั่วไปออกจากกัน ทำให้ดูภาพออนไลน์ชัดระดับ 4K โดยที่คนในบ้านยังเล่น Facebook หรือดู YouTube ได้ลื่นไหลเหมือนเดิม",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "ปลอดภัยจากการถูกแฮก",
    subtitle: "Cybersecurity",
    description:
      "เราเซ็ตอัประบบความปลอดภัยขั้นสูงให้กับอุปกรณ์ของคุณ ป้องกันไม่ให้คนแปลกหน้าแอบดูภาพจากกล้องของคุณผ่านอินเทอร์เน็ตได้อย่างมั่นใจ",
  },
  {
    icon: Brain,
    number: "03",
    title: "ระบบอัจฉริยะ",
    subtitle: "AI Detection",
    description:
      'เราเซ็ตระบบให้แยกแยะได้ว่าอันไหน "คน" อันไหน "สัตว์" หรือ "รถ" ลดการแจ้งเตือนไร้สาระที่มือถือ และตั้งค่าให้แจ้งเตือนทันทีเมื่อมีผู้บุกรุกในโซนอันตราย',
  },
  {
    icon: HeadsetIcon,
    number: "04",
    title: "บริการหลังการขายแบบมือโปร",
    subtitle: "Professional After-Sales",
    description:
      "ทีมงานมีตัวตนชัดเจน ตรวจสอบได้ด้วยประสบการณ์การทำงานในองค์กรท้องถิ่นกว่า 13 ปี ไม่ทิ้งงานแน่นอน",
  },
];

export default function CCTVDetailSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-ink-900 overflow-hidden">
      {/* Decorative side line */}
      <div className="absolute top-0 left-8 lg:left-16 w-px h-full bg-ink-700/60" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-400 tracking-[0.15em] uppercase">
            ทำไมต้องเลือกเรา (Why Choose Us)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
            ทำไมติดกล้องกับเรา
          </h2>
          <h3 className="font-heading text-2xl sm:text-3xl text-gold-400 italic mt-2">
            ถึงต่างจากที่อื่น?
          </h3>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-300 text-lg max-w-2xl mx-auto">
            ไม่ใช่แค่ติดกล้อง แต่เราจัดการ &quot;โครงสร้างระบบ&quot; ทั้งหมด สิ่งที่ช่างทั่วไปทำไม่ได้
          </p>
        </motion.div>

        {/* Reason Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-ink-800 border border-ink-700 hover:border-gold-500/40 rounded-sm p-8 transition-all duration-300"
            >
              {/* Number Badge */}
              <div className="absolute top-6 right-6 font-code text-5xl font-bold text-ink-700/60 group-hover:text-gold-400/20 transition-colors select-none">
                {reason.number}
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 border border-ink-600 flex items-center justify-center shrink-0 group-hover:border-gold-400 transition-colors">
                  <reason.icon className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-cream-100 mb-1">{reason.title}</h3>
                  <p className="text-gold-400/70 text-sm italic mb-3">{reason.subtitle}</p>
                  <p className="text-ink-300 leading-relaxed">{reason.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
