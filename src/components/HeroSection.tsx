"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, ChevronDown, Shield, Network, Code, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-ink-900"
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #D97706 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Diagonal gold accent block */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-ink-800/60 hidden lg:block" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }} />
      {/* Gold top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-gold-500/30 bg-gold-500/10 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
              <span className="font-sans text-sm text-gold-400 font-medium tracking-wide">ทีมผู้เชี่ยวชาญและช่างไอทีมืออาชีพ (IT Solution Team)</span>
            </motion.div>

            <h1 className="font-heading font-bold leading-[1.1] mb-8 text-cream-50">
              <span className="block text-4xl sm:text-5xl lg:text-6xl mb-2">ยกระดับองค์กร</span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-gold-400 italic mb-2">ด้วยเทคโนโลยี</span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl text-cream-200/80">และทีมงานคุณภาพ</span>
            </h1>

            <p className="text-lg sm:text-xl text-ink-300 mb-10 max-w-xl leading-relaxed border-l-4 border-gold-500 pl-5 font-light">
              <strong className="text-cream-100 font-medium">ทีมผู้เชี่ยวชาญรับออกแบบและติดตั้งระบบไอทีครบวงจร</strong>
              <br />CCTV · Network · Software
              <br className="hidden sm:block" />
              ดูแลควบคุมงานโดยผู้เชี่ยวชาญที่มีประสบการณ์กว่า 13+ ปี
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-white font-bold tracking-wide transition-all text-base rounded-sm shadow-[0_4px_14px_rgba(217,119,6,0.4)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.6)] group"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <MessageCircle className="w-5 h-5 relative z-10" />
                <span className="relative z-10">ปรึกษาและขอใบเสนอราคาฟรี</span>
              </motion.a>
              <motion.a
                href="tel:+66836870393"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-8 py-4 border border-cream-100/30 text-cream-100 font-medium tracking-wide hover:border-gold-400 hover:text-gold-400 hover:bg-gold-500/10 transition-all text-base rounded-sm"
              >
                <Phone className="w-5 h-5" />
                โทรด่วน 083-687-0393
              </motion.a>
            </div>

            <div className="flex flex-wrap gap-5">
              {["ทีมช่างมืออาชีพ", "ผู้เชี่ยวชาญ 13+ ปี", "GovTech Experience"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-sm text-ink-300">
                  <CheckCircle className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side — Service cards on dark panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="lg:col-span-5 space-y-4"
          >
            {[
              { icon: Shield, label: "Smart CCTV & Network", desc: "ระบบกล้องวงจรปิดอัจฉริยะ พร้อม AI Detection มาตรฐานองค์กร", tag: "Most Popular" },
              { icon: Network, label: "Enterprise Network", desc: "โครงสร้างเครือข่ายระดับองค์กร ลื่นไหล ปลอดภัยจากแฮกเกอร์", tag: "" },
              { icon: Code, label: "Custom Software", desc: "พัฒนาระบบตามความต้องการ Python & Web Apps ครบวงจร", tag: "" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.12 }}
                className="relative bg-ink-800 border border-ink-700 hover:border-gold-500/40 transition-all duration-300 p-5 flex items-start gap-4 group"
              >
                {item.tag && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-gold-500 text-ink-900 font-code text-[10px] font-bold uppercase">
                    {item.tag}
                  </div>
                )}
                <div className="w-10 h-10 border border-ink-600 group-hover:border-gold-500 flex items-center justify-center shrink-0 transition-colors">
                  <item.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-cream-100 mb-1 text-base">{item.label}</h3>
                  <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#stats" className="text-ink-500 hover:text-gold-400 transition-colors">
          <ChevronDown className="w-7 h-7" />
        </a>
      </motion.div>
    </section>
  );
}
