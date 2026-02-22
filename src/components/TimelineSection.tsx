"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar } from "lucide-react";

const timeline = [
  {
    period: "ปัจจุบัน",
    title: "นักวิชาการคอมพิวเตอร์ / หัวหน้าทีมผู้เชี่ยวชาญ",
    subtitle: "Computer Technical Officer & Team Lead",
    organization: "องค์กรภาครัฐและเอกชน",
    location: "นครสวรรค์",
    description:
      "ให้คำปรึกษาและออกแบบระบบเน็ตเวิร์ค กล้องวงจรปิด ระบบสารสนเทศ และความปลอดภัยไซเบอร์ระดับองค์กร พร้อมพัฒนาระบบอัตโนมัติเพื่อเพิ่มประสิทธิภาพการทำงาน",
    current: true,
  },
  {
    period: "อดีต",
    title: "เจ้าหน้าที่บริหารงานทั่วไป (ไอที)",
    subtitle: "IT Administration Officer",
    organization: "เทศบาลตำบลนครสวรรค์",
    location: "นครสวรรค์",
    description:
      "ดูแลและวางระบบโครงสร้างพื้นฐานด้านไอทีทั้งหมด รวมถึงเครือข่ายและศูนย์ข้อมูล เพื่อให้บริการประชาชนและเพิ่มศักยภาพการทำงานของเจ้าหน้าที่",
    current: false,
  },
];

export default function TimelineSection() {
  return (
    <section id="experience" className="relative py-24 lg:py-32 bg-cream-100 bg-noise">
      {/* Decorative side line */}
      <div className="absolute top-0 right-8 lg:right-16 w-px h-full bg-cream-300/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            ประสบการณ์การทำงาน (Team Experience)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
            ประสบการณ์ผู้ควบคุมงาน
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-300 text-lg max-w-2xl mx-auto">
            กว่า 13 ปีในการดูแลระบบเทคโนโลยีสารสนเทศขององค์กรภาครัฐ
            เป็นหลักประกันถึงความมั่นคงและมาตรฐานการทำงานของทีมเรา
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-400/60 via-cream-300 to-transparent lg:-translate-x-px" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={item.period}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col lg:flex-row items-start gap-8 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-8 lg:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-cream-100 border-2 border-gold-400 z-10 mt-8 lg:mt-10">
                  {item.current && (
                    <div className="absolute inset-1 rounded-full bg-gold-400" />
                  )}
                </div>

                {/* Content Card */}
                <div className={`ml-16 lg:ml-0 lg:w-[calc(50%-2rem)] ${index % 2 === 0 ? "lg:pr-4" : "lg:pl-4"}`}>
                  <div className={`card-retro rounded-sm p-6 lg:p-8 transition-all duration-300 ${
                    item.current ? "border-gold-400" : ""
                  }`}>
                    {/* Period Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-gold-500" />
                      <span className="font-code text-sm text-gold-500 font-medium">{item.period}</span>
                      {item.current && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-code bg-gold-400/10 text-gold-500 border border-gold-400/30">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-xl font-bold text-ink-700 mb-1">{item.title}</h3>
                    <p className="text-gold-500/70 text-sm italic mb-3">{item.subtitle}</p>

                    <div className="flex items-center gap-4 text-sm text-ink-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{item.organization}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <p className="text-ink-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
