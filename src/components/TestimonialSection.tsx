"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "คุณสมชาย ร.",
    role: "เจ้าของกิจการ · ร้านอาหาร",
    content:
      "ติดตั้งกล้องวงจรปิดให้ร้านอาหาร 8 จุด ช่างทำงานเรียบร้อยมาก เก็บสายสวยงาม สอนดูผ่านมือถือจนใช้เป็น หลังติดตั้งมีปัญหาโทรปรึกษาได้ตลอด แนะนำเลยครับ",
    rating: 5,
    project: "ระบบ CCTV 8 กล้อง",
  },
  {
    name: "ผอ. นภดล ส.",
    role: "ผู้อำนวยการ · โรงเรียนมัธยม",
    content:
      "วางระบบเน็ตเวิร์คและ WiFi ครอบคลุมทั้งโรงเรียน สัญญาณเสถียรมาก นักเรียนและครูใช้งานได้ไม่มีสะดุด การจัดเก็บสายก็ปลอดภัยได้มาตรฐาน มั่นใจในฝีมือครับ",
    rating: 5,
    project: "ระบบเครือข่ายระดับองค์กร",
  },
  {
    name: "คุณวิทยา จ.",
    role: "ผู้บริหาร · หน่วยงานราชการ",
    content:
      "ดูแลระบบ IT ให้หน่วยงานมาหลายปี ทั้งกล้อง เน็ตเวิร์ค และซอฟต์แวร์ ทำงานจริงจังมืออาชีพ มีปัญหาแก้ไขรวดเร็ว ไว้ใจได้",
    rating: 5,
    project: "ดูแลระบบ IT ครบวงจร",
  },
  {
    name: "เจ๊พร พ.",
    role: "เจ้าของ · หอพักและอพาร์ทเม้นท์",
    content:
      "ติดกล้องวงจรปิดและระบบสแกนนิ้วเข้าออกตึก งานไวและละเอียดมาก สอนลูกบ้านใช้งานได้ง่าย อุ่นใจขึ้นเยอะที่ได้ระบบดีๆ มาดูแลความปลอดภัยให้คนเช่า",
    rating: 5,
    project: "ระบบความปลอดภัยอาคาร",
  },
  {
    name: "คุณอำนาจ ต.",
    role: "เกษตรกร · เจ้าของไร่และฟาร์ม",
    content:
      "ให้ช่างป๊อปมาติดกล้องวงจรปิดไร้สายพลังงานแสงอาทิตย์ที่ไร่ ดูภาพผ่านมือถือได้ตลอด 24 ชม. ไม่ต้องลากสายให้ยุ่งยาก ตอบโจทย์คนทำเกษตรยุคใหม่จริงๆ",
    rating: 5,
    project: "CCTV พลังงานแสงอาทิตย์",
  },
  {
    name: "คุณวิไลวรรณ ม.",
    role: "เจ้าของร้าน · มินิมาร์ท",
    content:
      "เครื่องคิดเงิน POS และระบบกล้องวงจรปิดที่ร้านทำงานร่วมกันได้ดีมาก ช่วยอุดรอยรั่วเรื่องของหายได้เยอะ บริการหลังการขายเยี่ยม เรียกปุ๊บมาปั๊บ",
    rating: 5,
    project: "ระบบ POS และ CCTV",
  },
];

export default function TestimonialSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-cream-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            เสียงจากลูกค้า (Testimonials)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-800">
            ลูกค้าพูดถึงเรา
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-400 text-lg max-w-2xl mx-auto">
            ความไว้วางใจจากลูกค้าจริง คือเครื่องการันตีคุณภาพงานของเรา
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative bg-white border border-cream-300 hover:border-gold-400/50 p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-gold-400/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-4 h-4 fill-gold-400 text-gold-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Project tag */}
              <div className="mb-4">
                <span className="font-code text-[10px] px-2 py-1 bg-gold-500/10 text-gold-600 border border-gold-500/20 uppercase tracking-wider">
                  {t.project}
                </span>
              </div>

              {/* Author */}
              <div className="border-t border-cream-200 pt-4">
                <p className="font-heading font-bold text-ink-700 text-sm">
                  {t.name}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
