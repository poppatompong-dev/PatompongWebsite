"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "ประกันงานติดตั้งนานแค่ไหน?",
    a: "รับประกันงานติดตั้ง 1 ปีเต็ม ครอบคลุมทั้งอุปกรณ์และค่าแรง หากเกิดปัญหาจากการติดตั้ง ทีมงานเข้าแก้ไขฟรีโดยไม่มีค่าใช้จ่ายเพิ่มเติม",
  },
  {
    q: "ราคาเริ่มต้นเท่าไร?",
    a: "ขึ้นอยู่กับขนาดพื้นที่และจำนวนอุปกรณ์ แต่ระบบ CCTV เริ่มต้นที่ประมาณ 8,000 บาท (4 กล้อง), ระบบเครือข่ายเริ่มต้นที่ 5,000 บาท สามารถขอใบเสนอราคาฟรีได้โดยไม่มีข้อผูกมัด",
  },
  {
    q: "สำรวจหน้างานฟรีไหม?",
    a: "ฟรี! ไม่มีค่าใช้จ่ายในการสำรวจหน้างานและประเมินราคา ทั้งในพื้นที่นครสวรรค์และจังหวัดใกล้เคียง สามารถส่งรูปหน้างานผ่าน LINE เพื่อประเมินเบื้องต้นก่อนได้เลย",
  },
  {
    q: "รับงานนอกพื้นที่ได้ไหม?",
    a: "พื้นที่ให้บริการหลักคือนครสวรรค์ อุทัย และจังหวัดใกล้เคียง สำหรับงานนอกพื้นที่สามารถปรึกษาได้เป็นกรณีไป อาจมีค่าเดินทางเพิ่มเติม",
  },
  {
    q: "ดูกล้องผ่านมือถือได้ไหม?",
    a: "ได้ครับ ทุกระบบ CCTV ที่ติดตั้ง สามารถดูผ่านมือถือ (iOS/Android) ได้ทั้งแบบ Live และย้อนดูย้อนหลัง ทีมงานสอนการใช้งานจนคล่อง พร้อมช่วย Remote Support ผ่าน LINE",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 lg:py-32 bg-cream-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-600 tracking-[0.15em] uppercase bg-gold-500/10 px-3 py-1.5 rounded-full">
            คำถามที่พบบ่อย (FAQ)
          </span>
          <h2 className="mt-6 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-800">
            คำถามที่ลูกค้า<span className="text-gold-600">พบบ่อย</span>
          </h2>
          <p className="mt-4 text-ink-500 text-lg max-w-2xl mx-auto">
            ข้อสงสัยเกี่ยวกับการติดตั้งและบริการ เรารวบรวมคำตอบไว้ให้คุณแล้ว
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`bg-white border transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md ${
                openIndex === i ? "border-gold-400 ring-1 ring-gold-400/20" : "border-cream-300 hover:border-gold-300"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-code text-sm font-bold transition-colors ${openIndex === i ? 'bg-gold-500 text-white' : 'bg-cream-200 text-ink-500 group-hover:bg-gold-100 group-hover:text-gold-600'}`}>
                    Q
                  </span>
                  <span className={`font-heading font-bold text-base sm:text-lg transition-colors pr-4 ${openIndex === i ? 'text-gold-600' : 'text-ink-700 group-hover:text-ink-900'}`}>
                    {faq.q}
                  </span>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${openIndex === i ? 'bg-gold-100' : 'bg-cream-100 group-hover:bg-cream-200'}`}>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openIndex === i ? "rotate-180 text-gold-600" : "text-ink-400 group-hover:text-ink-600"
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 md:px-6 pb-6 pt-2">
                      <div className="pl-12 flex gap-4 text-ink-600 leading-relaxed bg-cream-50/50 p-4 rounded-lg border border-cream-200">
                        {faq.a}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
